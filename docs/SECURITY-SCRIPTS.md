# Security Scripts Documentation

This document provides detailed information about the security scripts used in the fact.rip project for detecting secrets, validating security measures, and ensuring compliance with security best practices.

## Secret Detection Scripts

### scan-secret-history.sh

A robust script for scanning git history to detect accidentally committed secrets.

**Features:**
- Comprehensive git history scanning using gitleaks
- Pattern-based detection for common secrets (API keys, tokens, passwords)
- Base64-encoded secret detection
- Detection of deleted sensitive files
- CI-specific optimizations for faster builds

**Usage:**
```bash
# Basic usage - scans entire history
./scripts/scan-secret-history.sh

# CI usage - automatically detects CI environment and optimizes
# The script uses GIT_COMMIT to scan only the current commit in CI

# Scan specific commit
SCAN_COMMIT=abcd1234 ./scripts/scan-secret-history.sh
```

**Key Improvements:**
- Robust error handling with `set -euo pipefail`
- Portable CI detection across multiple CI providers
- Automatic temporary file cleanup to prevent data leakage
- Enhanced pattern exclusions to reduce false positives
- Specific commit targeting for faster CI execution
- Proper allowlisting in the enforcement system

**Implementation Details:**
- Uses gitleaks for comprehensive secret detection
- Falls back to pattern-based matching if gitleaks isn't available
- Creates `.ci-secret-scan-record` file to track scans
- Uses temp files with proper cleanup via trap handlers
- Handles OS-specific differences (macOS vs Linux)
- Includes specific exclusions for legitimate token-related text

### check-no-secrets.sh

A simpler script focused on detecting secrets in the current codebase (not history).

**Usage:**
```bash
./scripts/check-no-secrets.sh
```

**Features:**
- Scans current files for secret patterns
- Quick execution for pre-commit checks
- Minimal configuration required

## Security Enforcement Scripts

### enforce-all.js

The primary security enforcement script that runs all security validations.

**Features:**
- Completely cross-platform (Node.js)
- Detects hardcoded secrets
- Validates storage access patterns
- Ensures environment variables are correctly set
- Validates shell script quality
- Prevents execution outside CI environment

**Manual Testing:**
```bash
# Script requires CI environment variables
CI=true GITHUB_ACTIONS=true \
NETLIFY_SITE_ID=33e2505e-7a9d-4867-8fbf-db91ca602087 \
NETLIFY_AUTH_TOKEN=test \
node scripts/enforce-all.js
```

## Allowlisting System

To bypass certain security controls for legitimate use cases (like the security scripts themselves), the project uses an allowlist system:

```json
{
  "allowlists": {
    "secret_patterns": [
      "scripts/scan-secret-history.sh",
      "scripts/check-no-secrets.sh"
    ]
  }
}
```

### Allowlist Categories

- `npm_usage`: Files allowed to use npm/npx terms
- `hardcoded_values`: Files allowed to contain site ID and other config values
- `direct_storage`: Files allowed to access localStorage directly
- `secret_patterns`: Files allowed to contain patterns that match secrets

## Best Practices

1. **Always use GitHub Secrets** for storing sensitive values
2. **Never commit secrets** to the repository
3. **Run `scan-secret-history.sh`** before merging sensitive code changes
4. **Add scripts to allowlist** if they need to handle secret patterns
5. **Use portable error handling** in all security scripts
6. **Clean up temporary files** to prevent information leakage

## Incident Response

If a secret is accidentally committed:

1. **Remove it immediately** from the repository
2. **Rotate the credential** (change the password, generate new token, etc.)
3. **Run BFG Repo Cleaner** to purge from git history if needed
4. **Document the incident** for future reference

---

Last Updated: 2025-05-19