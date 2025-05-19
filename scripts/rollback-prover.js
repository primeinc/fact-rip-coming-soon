#!/usr/bin/env node

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');

class RollbackProver {
    constructor() {
        this.netlifyToken = process.env.NETLIFY_AUTH_TOKEN;
        this.siteId = process.env.NETLIFY_SITE_ID;
        this.killSwitch = process.env.KILL_SWITCH_ENABLED === 'true';

        if (!this.netlifyToken || !this.siteId) {
            throw new Error('NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID required');
        }
    }

    async prove() {
        console.log('🔄 Production Rollback Prover Starting...\n');

        try {
            // 1. Capture current state
            const currentState = await this.getCurrentDeployment();
            console.log(`Current deployment: ${currentState.id}`);

            // 2. Deploy intentionally broken build
            const brokenDeploy = await this.deployBrokenBuild();
            console.log(`Broken deployment: ${brokenDeploy.id}`);

            // 3. Verify broken state
            const isBroken = await this.verifyBrokenState(brokenDeploy.ssl_url);
            if (!isBroken) {
                throw new Error('Failed to verify broken deployment state');
            }

            // 4. Activate kill switch if enabled
            if (this.killSwitch) {
                await this.activateKillSwitch();
            }

            // 5. Execute rollback
            const rollbackResult = await this.executeRollback(currentState.id);
            console.log(`Rollback initiated: ${rollbackResult.id}`);

            // 6. Verify rollback success
            await this.waitForDeployment(rollbackResult.id);
            const isRestored = await this.verifyRestoredState();

            if (!isRestored) {
                throw new Error('Rollback verification failed');
            }

            // 7. Deactivate kill switch
            if (this.killSwitch) {
                await this.deactivateKillSwitch();
            }

            console.log('\n✅ Rollback proven successful');
            return true;

        } catch (error) {
            console.error(`\n❌ Rollback proof failed: ${error.message}`);

            // Emergency recovery
            if (this.killSwitch) {
                await this.deactivateKillSwitch();
            }

            throw error;
        }
    }

    async getCurrentDeployment() {
        return this.netlifyAPI(`/sites/${this.siteId}/deploys?per_page=1&state=ready`).then(deploys => deploys[0]);
    }

    async deployBrokenBuild() {
        // Create intentionally broken build
        const brokenHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>BROKEN BUILD - ROLLBACK TEST</title>
    <script>
        throw new Error('INTENTIONAL_ROLLBACK_TEST_ERROR');
    </script>
</head>
<body>
    <h1>This is an intentionally broken deployment for rollback testing</h1>
</body>
</html>`;

        // Deploy using Netlify CLI
        fs.mkdirSync('rollback-test-build', { recursive: true });
        fs.writeFileSync('rollback-test-build/index.html', brokenHtml);

        const output = execSync(`pnpm exec netlify deploy --dir=rollback-test-build --json`, {
            encoding: 'utf8',
            env: { ...process.env, NETLIFY_AUTH_TOKEN: this.netlifyToken, NETLIFY_SITE_ID: this.siteId }
        });

        const deploy = JSON.parse(output);

        // Clean up
        fs.rmSync('rollback-test-build', { recursive: true });

        return deploy;
    }

    async verifyBrokenState(url) {
        return new Promise((resolve) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const isBroken = data.includes('INTENTIONAL_ROLLBACK_TEST_ERROR') ||
                                   data.includes('BROKEN BUILD');
                    resolve(isBroken);
                });
            }).on('error', () => resolve(false));
        });
    }

    async activateKillSwitch() {
        console.log('🔴 Activating kill switch...');

        // In production, this would:
        // 1. Update CDN to serve maintenance page
        // 2. Disable auto-deploys
        // 3. Lock deployment pipeline

        // For now, update site to locked state
        await this.netlifyAPI(`/sites/${this.siteId}`, 'PATCH', {
            body: JSON.stringify({
                processing_config: {
                    skip: true
                }
            })
        });
    }

    async executeRollback(deployId) {
        console.log(`🔄 Rolling back to ${deployId}...`);

        return this.netlifyAPI(`/sites/${this.siteId}/deploys/${deployId}/restore`, 'POST');
    }

    async waitForDeployment(deployId, maxWait = 60000) {
        const start = Date.now();

        while (Date.now() - start < maxWait) {
            const deploy = await this.netlifyAPI(`/deploys/${deployId}`);

            if (deploy.state === 'ready') {
                return deploy;
            }

            if (deploy.state === 'error') {
                throw new Error(`Deploy failed: ${deploy.error_message}`);
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        throw new Error('Deploy timeout');
    }

    async verifyRestoredState() {
        const config = JSON.parse(fs.readFileSync('config/deployment.json', 'utf8'));
        const prodUrl = config.netlify.productionUrl;

        return new Promise((resolve) => {
            https.get(prodUrl, (res) => {
                if (res.statusCode === 200) {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        // Verify it's not the broken build
                        const isRestored = !data.includes('INTENTIONAL_ROLLBACK_TEST_ERROR') &&
                                         !data.includes('BROKEN BUILD');
                        resolve(isRestored);
                    });
                } else {
                    resolve(false);
                }
            }).on('error', () => resolve(false));
        });
    }

    async deactivateKillSwitch() {
        console.log('🟢 Deactivating kill switch...');

        // Restore normal operations
        await this.netlifyAPI(`/sites/${this.siteId}`, 'PATCH', {
            body: JSON.stringify({
                processing_config: {
                    skip: false
                }
            })
        });
    }

    async netlifyAPI(path, method = 'GET', options = {}) {
        return new Promise((resolve, reject) => {
            const url = `https://api.netlify.com/api/v1${path}`;
            const urlObj = new URL(url);

            const requestOptions = {
                hostname: urlObj.hostname,
                path: urlObj.pathname + urlObj.search,
                method,
                headers: {
                    'Authorization': `Bearer ${this.netlifyToken}`,
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            };

            const req = https.request(requestOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(json);
                        } else {
                            reject(new Error(`API error ${res.statusCode}: ${json.message || data}`));
                        }
                    } catch (e) {
                        reject(new Error(`Parse error: ${e.message}`));
                    }
                });
            });

            req.on('error', reject);

            if (options.body) {
                req.write(options.body);
            }

            req.end();
        });
    }
}

// Run if called directly
if (require.main === module) {
    const prover = new RollbackProver();
    prover.prove()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = RollbackProver;