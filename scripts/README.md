# Scripts Directory

This directory contains enforcement and validation scripts for the fact.rip project.

## 🏃 Quick Local Testing

Use these pnpm scripts for easy local testing:

```bash
# Test individual enforcement scripts locally
pnpm run test:local:npm       # Check for npm/npx usage
pnpm run test:local:config    # Check configuration drift
pnpm run test:local:shell     # Check shell script standards
pnpm run test:local:all       # Run all local tests

# Run the full enforcement test suite locally
pnpm run test:local:ci        # Test enforcement scripts themselves

# Helper script for local testing
./scripts/test-local.sh       # Run all scripts that work without credentials
```

## 🔐 Scripts Requiring Credentials

Some scripts require environment variables to run:

### Netlify Scripts
- `detect-netlify-drift.sh`
- Requires: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`

### GitHub Scripts  
- `check-deployment.sh`
- Requires: `GH_TOKEN`

To run these locally:
```bash
export NETLIFY_AUTH_TOKEN=your_token
export NETLIFY_SITE_ID=your_site_id
export GH_TOKEN=your_github_token

ALLOW_LOCAL_TEST=true ./scripts/detect-netlify-drift.sh
ALLOW_LOCAL_TEST=true ./scripts/check-deployment.sh
```

## 📝 Script Categories

### CI/CD Enforcement
- `check-npm-usage.sh` - Enforces pnpm-only policy
- `enforce-shell-standards.sh` - Validates shell script quality
- `enforce-storage-pattern.sh` - Checks LocalStorage usage patterns
- `enforce-no-timeouts.sh` - Prevents timing-based patterns

### Configuration Validation
- `detect-config-drift.sh` - Detects configuration inconsistencies
- `detect-netlify-drift.sh` - Checks Netlify deployment settings
- `validate-lockfile.sh` - Ensures lockfile format is correct

### Security & Quality
- `check-no-secrets.sh` - Scans for exposed secrets
- `scan-secret-history.sh` - Checks git history for secrets
- `validate-playwright-projects.sh` - Validates test configurations

### Testing & Validation
- `test-enforcement-scripts.sh` - Tests the enforcement scripts themselves
- `check-deployment.sh` - Validates deployment status
- `verify-deployment.sh` - Verifies production deployment

## 🚨 Important Notes

1. **CI-Only Scripts**: Most scripts require CI environment by default
2. **Local Testing**: Use `ALLOW_LOCAL_TEST=true` for local execution
3. **Exit Codes**: Scripts exit with 1 on failure, 0 on success
4. **Dependencies**: All scripts use bash and standard Unix tools