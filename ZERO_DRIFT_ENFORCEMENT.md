# Zero-Drift Enforcement Architecture

This document details the comprehensive enforcement mechanisms that prevent configuration drift, secret exposure, and deployment failures in the fact.rip codebase.

## 🛡️ Multi-Layer Defense

### 1. Pre-Commit Enforcement
- `check-npm-usage.sh` - Blocks npm/npx usage
- `check-no-secrets.sh` - Prevents secret commits
- `enforce-storage-pattern.sh` - Ensures storage access through context
- `enforce-no-timeouts.sh` - Validates animation timing patterns

### 2. CI/CD Pipeline Enforcement
- **Configuration Drift Detection**
  - `detect-config-drift.sh` - Checks for hardcoded values and config consistency
  - `detect-netlify-drift.sh` - Compares local config with Netlify API
  - `enforce-shell-standards.sh` - Validates shell script compliance

- **Security Scanning**
  - `scan-secret-history.sh` - Scans entire git history for exposed secrets
  - Automated gitleaks integration for comprehensive secret detection

- **Adversarial Testing**
  - `e2e/adversarial-endpoints.spec.ts` - Tests error reporting endpoints exist and function
  - Validates endpoints handle failures gracefully
  - Ensures observability is real, not mocked

### 3. Scheduled Chaos Engineering
- Daily chaos deployment tests
- Automatic rollback validation
- Production health checks after chaos
- Operator alerting on failures

### 4. Real-Time Monitoring
- Netlify API drift detection on every main branch push
- Slack notifications for configuration drift
- Deployment validation with actual production smoke tests

## 🔒 What's Protected

### Configuration Integrity
- All deployment URLs must come from `config/deployment.json`
- No hardcoded site IDs, URLs, or secrets anywhere
- Manifest and branding must stay in sync
- Environment variables must map to config values

### Secret Management
- No secrets in code, ever
- Git history regularly scanned
- Environment variables validated against config
- CI blocks on any secret detection

### Shell Script Quality
- All scripts must use `set -euo pipefail`
- OS-specific commands must have compatibility checks
- Environment variables must have defaults
- No hardcoded values allowed

### Deployment Safety
- Chaos tests verify rollback capability
- Smoke tests run against actual deployments
- Drift detection prevents silent failures
- Multiple validation layers before "success"

## 🚨 Failure Modes

### What Triggers Pipeline Failure
1. Any npm/npx usage detected
2. Secrets found in code or history
3. Direct localStorage/sessionStorage access
4. Hardcoded URLs or IDs in scripts
5. Configuration drift between sources
6. Netlify API mismatch with local config
7. Failed endpoint availability tests
8. Chaos deployment test failures

### Alert Channels
- CI/CD pipeline failures block deployment
- Slack webhooks for drift detection
- Chaos test failures alert operators
- All failures logged with remediation steps

## 🔧 Maintenance

### Adding New Config Values
1. Add to `config/deployment.json`
2. Update drift detection scripts
3. Add to CI environment mapping
4. Update enforcement scripts

### Adding New Scripts
1. Must start with `#!/bin/bash`
2. Must include `set -euo pipefail`
3. Must use config values, not hardcoded
4. Must handle errors gracefully
5. Must be executable (`chmod +x`)

### Adding New Endpoints
1. Add to environment configuration
2. Create adversarial tests
3. Validate in production deployment
4. Add to drift detection

## 🎯 Zero-Drift Guarantee

This architecture ensures:
- **No silent failures** - Everything is tested adversarially
- **No configuration drift** - Multiple detection layers
- **No secret exposure** - Historical and current scanning
- **No broken deployments** - Chaos testing and rollback validation
- **No manual checks** - Everything is automated

If CI is green, production is truly safe. No exceptions.

---

Last Updated: ${new Date().toISOString()}
Version: 1.0