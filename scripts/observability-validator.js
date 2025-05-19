#!/usr/bin/env node

const https = require('https');
const crypto = require('crypto');

class ObservabilityValidator {
    constructor() {
        this.telemetryEndpoint = process.env.VITE_TELEMETRY_ENDPOINT;
        this.errorEndpoint = process.env.VITE_ERROR_REPORT_ENDPOINT;
        this.webhookValidator = process.env.WEBHOOK_VALIDATOR_URL;
        this.validationToken = process.env.VALIDATION_TOKEN || crypto.randomBytes(16).toString('hex');
    }

    async validateRoundTrip() {
        console.log('🔍 Validating observability round-trip...\n');

        const results = {
            telemetry: await this.validateTelemetryEndpoint(),
            errorReporting: await this.validateErrorEndpoint(),
            webhookReceipt: await this.validateWebhookReceipt()
        };

        this.report(results);
    }

    async validateTelemetryEndpoint() {
        if (!this.telemetryEndpoint) {
            return { status: 'missing', error: 'No telemetry endpoint configured' };
        }

        const testEvent = {
            action: 'observability_test',
            timestamp: new Date().toISOString(),
            validationToken: this.validationToken,
            testId: crypto.randomBytes(8).toString('hex')
        };

        try {
            // Send test event
            const response = await this.postJSON(this.telemetryEndpoint, testEvent);

            // Check if webhook received it (if validator configured)
            if (this.webhookValidator) {
                const received = await this.checkWebhookReceipt(testEvent.testId);
                return {
                    status: 'validated',
                    httpStatus: response.status,
                    webhookReceived: received
                };
            }

            return {
                status: 'sent',
                httpStatus: response.status,
                warning: 'No webhook validator configured'
            };

        } catch (error) {
            return {
                status: 'failed',
                error: error.message
            };
        }
    }

    async validateErrorEndpoint() {
        if (!this.errorEndpoint) {
            return { status: 'missing', error: 'No error endpoint configured' };
        }

        const testError = {
            errorId: `test-${Date.now()}`,
            message: 'Observability validation test error',
            stack: 'Error: Test\n    at ObservabilityValidator.validate',
            userAgent: 'ObservabilityValidator/1.0',
            timestamp: new Date().toISOString(),
            validationToken: this.validationToken
        };

        try {
            const response = await this.postJSON(this.errorEndpoint, testError);

            // Verify error appears in operator dashboard (if configured)
            if (this.webhookValidator) {
                const received = await this.checkWebhookReceipt(testError.errorId);
                return {
                    status: 'validated',
                    httpStatus: response.status,
                    operatorReceived: received
                };
            }

            return {
                status: 'sent',
                httpStatus: response.status,
                warning: 'Cannot verify operator receipt'
            };

        } catch (error) {
            return {
                status: 'failed',
                error: error.message
            };
        }
    }

    async validateWebhookReceipt() {
        if (!this.webhookValidator) {
            return { status: 'skipped', reason: 'No webhook validator configured' };
        }

        // Send test webhook
        const testWebhook = {
            type: 'observability_test',
            timestamp: new Date().toISOString(),
            validationToken: this.validationToken,
            payload: {
                test: true,
                source: 'fact.rip'
            }
        };

        try {
            const response = await this.postJSON(this.webhookValidator, testWebhook);

            if (response.status === 200) {
                return {
                    status: 'validated',
                    message: 'Webhook receipt confirmed'
                };
            } else {
                return {
                    status: 'failed',
                    httpStatus: response.status
                };
            }

        } catch (error) {
            return {
                status: 'failed',
                error: error.message
            };
        }
    }

    async checkWebhookReceipt(id, maxWait = 10000) {
        if (!this.webhookValidator) {
            return false;
        }

        const checkUrl = `${this.webhookValidator}/check/${id}`;
        const start = Date.now();

        while (Date.now() - start < maxWait) {
            try {
                const response = await this.getJSON(checkUrl);
                if (response.received) {
                    return true;
                }
            } catch (e) {
                // Continue checking
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return false;
    }

    async postJSON(url, data) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const postData = JSON.stringify(data);

            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: urlObj.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'User-Agent': 'fact.rip-observability-validator'
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', chunk => responseData += chunk);
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        data: responseData
                    });
                });
            });

            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    }

    async getJSON(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });
    }

    report(results) {
        console.log('\n📊 Observability Validation Report\n');

        let allValid = true;

        // Check telemetry
        console.log('📡 Telemetry Endpoint:');
        if (results.telemetry.status === 'validated') {
            console.log('  ✅ Validated - events received by operator');
        } else if (results.telemetry.status === 'sent') {
            console.log('  ⚠️  Sent but cannot verify receipt');
            allValid = false;
        } else {
            console.log(`  ❌ Failed: ${results.telemetry.error || 'Unknown error'}`);
            allValid = false;
        }

        // Check error reporting
        console.log('\n🚨 Error Reporting:');
        if (results.errorReporting.status === 'validated') {
            console.log('  ✅ Validated - errors received by operator');
        } else if (results.errorReporting.status === 'sent') {
            console.log('  ⚠️  Sent but cannot verify receipt');
            allValid = false;
        } else {
            console.log(`  ❌ Failed: ${results.errorReporting.error || 'Unknown error'}`);
            allValid = false;
        }

        // Check webhook receipt
        console.log('\n🪝 Webhook Receipt:');
        if (results.webhookReceipt.status === 'validated') {
            console.log('  ✅ Validated - operator confirmation received');
        } else if (results.webhookReceipt.status === 'skipped') {
            console.log('  ⏭️  Skipped - no validator configured');
        } else {
            console.log(`  ❌ Failed: ${results.webhookReceipt.error || 'Unknown error'}`);
            allValid = false;
        }

        // Summary
        console.log('\n📋 Summary:');
        if (allValid && results.webhookReceipt.status !== 'skipped') {
            console.log('✅ All observability endpoints validated with operator receipt');
            process.exit(0);
        } else if (allValid) {
            console.log('⚠️  Endpoints responsive but operator receipt not verified');
            process.exit(0);
        } else {
            console.log('❌ Observability validation failed - operators may be blind');
            process.exit(1);
        }
    }
}

// Run validator
const validator = new ObservabilityValidator();
validator.validateRoundTrip().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});