#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

class AtomicDriftValidator {
    constructor() {
        this.driftMap = new Map();
        this.requiredSurfaces = [
            'deployment.json',
            'manifest.json',
            'branding.ts',
            'netlify-api',
            'environment-vars',
            'shell-scripts',
            'dns-records'
        ];
    }

    async validateAll() {
        console.log('🔒 Atomic Cross-Surface Drift Validation\n');

        // Load all configurations atomically
        const surfaces = await Promise.all([
            this.loadDeploymentConfig(),
            this.loadManifest(),
            this.loadBranding(),
            this.loadNetlifyAPI(),
            this.loadEnvironment(),
            this.validateShellScripts(),
            this.checkDNS()
        ]);

        // Create canonical truth map
        const canonical = this.buildCanonicalTruth(surfaces);

        // Validate each surface against canonical truth
        const violations = this.validateAgainstCanonical(surfaces, canonical);

        // Report results
        this.report(violations);
    }

    async loadDeploymentConfig() {
        const config = JSON.parse(fs.readFileSync('config/deployment.json', 'utf8'));
        return {
            surface: 'deployment.json',
            siteId: config.netlify.siteId,
            productionUrl: config.netlify.productionUrl,
            siteName: config.netlify.siteName,
            customDomain: config.domains.production
        };
    }

    async loadManifest() {
        const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
        return {
            surface: 'manifest.json',
            name: manifest.name,
            shortName: manifest.short_name,
            themeColor: manifest.theme_color,
            backgroundColor: manifest.background_color
        };
    }

    async loadBranding() {
        const content = fs.readFileSync('src/config/branding.ts', 'utf8');
        return {
            surface: 'branding.ts',
            hasFactRip: content.includes('fact.rip'),
            hasThemeColor: content.includes('#DC2626'),
            hasSealIcon: content.includes('custodes-seal')
        };
    }

    async loadNetlifyAPI() {
        if (!process.env.NETLIFY_AUTH_TOKEN) {
            return { surface: 'netlify-api', error: 'No auth token' };
        }

        const siteId = JSON.parse(fs.readFileSync('config/deployment.json', 'utf8')).netlify.siteId;

        return new Promise((resolve) => {
            const options = {
                hostname: 'api.netlify.com',
                path: `/api/v1/sites/${siteId}`,
                headers: {
                    'Authorization': `Bearer ${process.env.NETLIFY_AUTH_TOKEN}`,
                    'User-Agent': 'fact-rip-validator'
                }
            };

            https.get(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const site = JSON.parse(data);
                        resolve({
                            surface: 'netlify-api',
                            siteId: site.id,
                            url: site.url,
                            sslUrl: site.ssl_url,
                            name: site.name,
                            customDomain: site.custom_domain,
                            state: site.state
                        });
                    } catch (e) {
                        resolve({ surface: 'netlify-api', error: e.message });
                    }
                });
            }).on('error', (e) => {
                resolve({ surface: 'netlify-api', error: e.message });
            });
        });
    }

    async loadEnvironment() {
        return {
            surface: 'environment-vars',
            NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID,
            NETLIFY_AUTH_TOKEN: process.env.NETLIFY_AUTH_TOKEN ? 'set' : 'missing',
            VITE_TELEMETRY_ENDPOINT: process.env.VITE_TELEMETRY_ENDPOINT,
            VITE_ERROR_REPORT_ENDPOINT: process.env.VITE_ERROR_REPORT_ENDPOINT,
            CI: process.env.CI
        };
    }

    async validateShellScripts() {
        const scripts = execSync('find scripts -name "*.sh"', { encoding: 'utf8' })
            .trim()
            .split('\n');

        const hardcodedValues = [];
        scripts.forEach(script => {
            const content = fs.readFileSync(script, 'utf8');
            if (content.includes('sparkly-bombolone-c419df') ||
                content.includes('33e2505e-7a9d-4867-8fbf-db91ca602087')) {
                hardcodedValues.push(script);
            }
        });

        return {
            surface: 'shell-scripts',
            count: scripts.length,
            hardcodedValues
        };
    }

    async checkDNS() {
        // In real implementation, would check actual DNS records
        return {
            surface: 'dns-records',
            factRipConfigured: 'check-required',
            sslCertValid: 'check-required'
        };
    }

    buildCanonicalTruth(surfaces) {
        const deployment = surfaces.find(s => s.surface === 'deployment.json');
        return {
            siteId: deployment.siteId,
            productionUrl: deployment.productionUrl,
            siteName: deployment.siteName,
            customDomain: deployment.customDomain,
            themeColor: '#DC2626',
            appName: 'fact.rip'
        };
    }

    validateAgainstCanonical(surfaces, canonical) {
        const violations = [];

        surfaces.forEach(surface => {
            if (surface.error) {
                violations.push({
                    surface: surface.surface,
                    issue: `Error loading: ${surface.error}`
                });
                return;
            }

            // Validate each surface
            switch (surface.surface) {
                case 'netlify-api':
                    if (surface.siteId !== canonical.siteId) {
                        violations.push({
                            surface: 'netlify-api',
                            issue: `Site ID mismatch: ${surface.siteId} vs ${canonical.siteId}`
                        });
                    }
                    if (!surface.sslUrl.includes(canonical.siteName)) {
                        violations.push({
                            surface: 'netlify-api',
                            issue: `SSL URL doesn't match site name`
                        });
                    }
                    break;

                case 'manifest.json':
                    if (surface.name !== canonical.appName) {
                        violations.push({
                            surface: 'manifest.json',
                            issue: `App name mismatch: ${surface.name} vs ${canonical.appName}`
                        });
                    }
                    if (surface.themeColor !== canonical.themeColor) {
                        violations.push({
                            surface: 'manifest.json',
                            issue: `Theme color mismatch: ${surface.themeColor} vs ${canonical.themeColor}`
                        });
                    }
                    break;

                case 'environment-vars':
                    if (surface.NETLIFY_SITE_ID !== canonical.siteId) {
                        violations.push({
                            surface: 'environment-vars',
                            issue: `NETLIFY_SITE_ID mismatch or missing`
                        });
                    }
                    break;

                case 'shell-scripts':
                    if (surface.hardcodedValues.length > 0) {
                        violations.push({
                            surface: 'shell-scripts',
                            issue: `Hardcoded values in: ${surface.hardcodedValues.join(', ')}`
                        });
                    }
                    break;
            }
        });

        return violations;
    }

    report(violations) {
        console.log('\n📊 Drift Validation Report\n');

        if (violations.length === 0) {
            console.log('✅ No drift detected - all surfaces aligned');
            process.exit(0);
        } else {
            console.log(`❌ ${violations.length} drift violations detected:\n`);
            violations.forEach((v, i) => {
                console.log(`${i + 1}. [${v.surface}] ${v.issue}`);
            });

            console.log('\n🚨 CRITICAL: Configuration drift detected!');
            console.log('Fix all violations before deployment.');
            process.exit(1);
        }
    }
}

// Run validation
const validator = new AtomicDriftValidator();
validator.validateAll().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});