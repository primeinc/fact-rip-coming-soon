#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cross-platform enforcement that replaces all bash scripts
class ZeroDriftEnforcer {
    constructor() {
        this.violations = [];
        this.isCI = process.env.CI === 'true';
        this.deploymentConfig = this.loadConfig();
        this.allowlist = this.loadAllowlist();
    }

    loadConfig() {
        try {
            return JSON.parse(fs.readFileSync('config/deployment.json', 'utf8'));
        } catch (e) {
            this.fail('Failed to load deployment config: ' + e.message);
        }
    }
    
    loadAllowlist() {
        try {
            return JSON.parse(fs.readFileSync('.enforcement-allowlist.json', 'utf8'));
        } catch (e) {
            console.warn('No allowlist found, using defaults');
            return { allowlists: {} };
        }
    }

    fail(message) {
        console.error(`❌ ${message}`);
        process.exit(1);
    }

    check(condition, message) {
        if (!condition) {
            this.violations.push(message);
            console.error(`❌ ${message}`);
        }
    }

    // Check for npm/npx usage
    checkPnpmOnly() {
        console.log('🔍 Checking pnpm-only compliance...');
        const files = this.findFiles(['**/*.{js,ts,tsx,json,sh,yml}'], ['node_modules', '.git']);

        files.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const npmMatch = content.match(/\b(npm|npx)\s+(install|run|exec)/g);
            const isAllowed = this.isFileAllowed(file, 'npm_usage');
            if (npmMatch && !isAllowed) {
                this.check(false, `Found npm/npx usage in ${file}: ${npmMatch[0]}`);
            }
        });
    }

    // Check for hardcoded values
    checkHardcodedValues() {
        console.log('🔍 Checking for hardcoded values...');
        const { siteId, productionUrl, siteName } = this.deploymentConfig.netlify;
        const patterns = [
            siteId,
            productionUrl?.replace('https://', ''),
            siteName
        ].filter(Boolean);

        const files = this.findFiles(['**/*.{js,ts,tsx,sh}'], ['node_modules', '.git', 'config']);

        files.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            patterns.forEach(pattern => {
                const isAllowed = this.isFileAllowed(file, 'hardcoded_values');
                if (content.includes(pattern) && !isAllowed) {
                    this.check(false, `Hardcoded value "${pattern}" in ${file}`);
                }
            });
        });
    }

    // Check storage patterns
    checkStoragePatterns() {
        console.log('🔍 Checking storage access patterns...');
        const files = this.findFiles(['src/**/*.{ts,tsx}'], ['*.test.*', '*.spec.*']);

        files.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const directStorage = content.match(/\b(localStorage|sessionStorage)\.(getItem|setItem|removeItem|clear)/g);

            const isAllowed = this.isFileAllowed(file, 'direct_storage');
            if (directStorage && !isAllowed) {
                this.check(false, `Direct storage access in ${file}: ${directStorage[0]}`);
            }
        });
    }

    // Check environment variable mapping
    checkEnvMapping() {
        console.log('🔍 Checking environment variable mapping...');
        const requiredEnvVars = {
            'NETLIFY_SITE_ID': this.deploymentConfig.netlify.siteId,
            'NETLIFY_AUTH_TOKEN': 'required',
            'VITE_TELEMETRY_ENDPOINT': 'optional',
            'VITE_ERROR_REPORT_ENDPOINT': 'optional'
        };

        if (this.isCI) {
            Object.entries(requiredEnvVars).forEach(([envVar, expected]) => {
                const actual = process.env[envVar];
                if (expected === 'required' && !actual) {
                    this.check(false, `Missing required environment variable: ${envVar}`);
                } else if (expected !== 'required' && expected !== 'optional' && actual !== expected) {
                    this.check(false, `Environment variable mismatch: ${envVar} (expected: ${expected}, got: ${actual})`);
                }
            });
        }
    }

    // Check config consistency
    checkConfigConsistency() {
        console.log('🔍 Checking config consistency...');

        // Check manifest.json
        const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
        this.check(manifest.name === 'fact.rip', 'Manifest name mismatch');

        // Check branding config
        const brandingContent = fs.readFileSync('src/config/branding.ts', 'utf8');
        this.check(brandingContent.includes('fact.rip'), 'Branding missing fact.rip reference');
        this.check(brandingContent.includes('#DC2626'), 'Branding missing theme color');

        // Check for config duplication
        const configRefs = this.findConfigReferences();
        this.check(configRefs < 10, `Site ID appears in ${configRefs} places - possible duplication`);
    }

    // Check shell script quality
    checkShellScripts() {
        console.log('🔍 Checking shell script standards...');
        const scripts = this.findFiles(['scripts/*.sh']);

        scripts.forEach(script => {
            const content = fs.readFileSync(script, 'utf8');

            // Check shebang
            this.check(
                content.startsWith('#!/bin/bash') || content.startsWith('#!/usr/bin/env bash'),
                `Non-standard shebang in ${script}`
            );

            // Check error handling
            this.check(content.includes('set -euo pipefail'), `Missing error handling in ${script}`);

            // Check executable permissions
            const stats = fs.statSync(script);
            this.check((stats.mode & 0o111) !== 0, `Script not executable: ${script}`);
        });
    }

    // Check secret exposure
    async checkSecrets() {
        console.log('🔍 Checking for secrets...');

        // Run gitleaks if available
        if (this.commandExists('gitleaks')) {
            try {
                execSync('gitleaks detect --source . --verbose', { stdio: 'pipe' });
                console.log('✅ No secrets found by gitleaks');
            } catch (e) {
                this.check(false, 'Secrets detected by gitleaks!');
            }
        }

        // Manual pattern check
        const secretPatterns = [
            /NETLIFY_AUTH_TOKEN\s*=\s*["'][^"']+["']/,
            /API_KEY\s*=\s*["'][^"']+["']/,
            /SECRET\s*=\s*["'][^"']+["']/,
            /TOKEN\s*=\s*["'][^"']+["']/
        ];

        const files = this.findFiles(['**/*'], ['node_modules', '.git']);
        files.forEach(file => {
            if (!fs.lstatSync(file).isDirectory()) {
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    secretPatterns.forEach(pattern => {
                        if (pattern.test(content)) {
                            this.check(false, `Potential secret in ${file}`);
                        }
                    });
                } catch (e) {
                    // Binary or unreadable file, skip
                }
            }
        });
    }

    // Helper methods
    findFiles(patterns, excludes = []) {
        const allFiles = [];

        patterns.forEach(pattern => {
            const files = glob.sync(pattern, {
                ignore: excludes.map(e => `**/${e}/**`)
            });
            allFiles.push(...files);
        });

        return [...new Set(allFiles)];
    }

    findConfigReferences() {
        const siteId = this.deploymentConfig.netlify.siteId;
        let count = 0;

        const files = this.findFiles(['**/*'], ['node_modules', '.git', '*.lock']);
        files.forEach(file => {
            if (!fs.lstatSync(file).isDirectory()) {
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    if (content.includes(siteId)) count++;
                } catch (e) {
                    // Binary file, skip
                }
            }
        });

        return count;
    }

    commandExists(cmd) {
        try {
            execSync(`which ${cmd}`, { stdio: 'pipe' });
            return true;
        } catch (e) {
            return false;
        }
    }
    
    isFileAllowed(file, category) {
        const allowedPatterns = this.allowlist.allowlists[category] || [];
        return allowedPatterns.some(pattern => {
            // Handle glob patterns
            if (pattern.includes('**')) {
                const regex = pattern
                    .replace(/\*\*/g, '.*')
                    .replace(/\*/g, '[^/]*')
                    .replace(/\./g, '\\.');
                return new RegExp(regex).test(file);
            }
            return file.includes(pattern);
        });
    }

    // Block manual execution
    enforceCI() {
        if (!this.isCI || !process.env.GITHUB_ACTIONS) {
            console.error('❌ This script MUST run in GitHub Actions CI');
            console.error('Missing CI=true or GITHUB_ACTIONS=true');
            process.exit(1);
        }
        
        // Verify required secrets exist
        if (!process.env.NETLIFY_SITE_ID || !process.env.NETLIFY_AUTH_TOKEN) {
            console.error('❌ Missing required Netlify secrets in CI');
            console.error('NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN must be set');
            process.exit(1);
        }
    }

    // Main enforcement
    async run() {
        console.log('🚀 Zero-Drift Enforcement Starting...\n');

        // ALWAYS enforce CI-only execution
        this.enforceCI();

        this.checkPnpmOnly();
        this.checkHardcodedValues();
        this.checkStoragePatterns();
        this.checkEnvMapping();
        this.checkConfigConsistency();
        this.checkShellScripts();
        await this.checkSecrets();

        // Report results
        console.log('\n📊 Enforcement Summary:');
        if (this.violations.length === 0) {
            console.log('✅ All checks passed - zero drift maintained');
        } else {
            console.log(`❌ ${this.violations.length} violations found`);
            console.log('\nViolations:');
            this.violations.forEach((v, i) => console.log(`${i + 1}. ${v}`));
            process.exit(1);
        }
    }
}

// Run enforcement
const enforcer = new ZeroDriftEnforcer();
enforcer.run().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});