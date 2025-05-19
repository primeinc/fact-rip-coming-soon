#!/bin/bash

# This script must be sourced at the start of every enforcement script
# It blocks manual execution outside CI

set -euo pipefail

# Check if running in CI
if [ "${CI:-false}" != "true" ]; then
    echo "❌ SECURITY VIOLATION: Script execution outside CI is forbidden"
    echo ""
    echo "This script can only be run in CI/CD pipeline."
    echo "Manual execution is blocked to prevent:"
    echo "  - Configuration drift"
    echo "  - Unauthorized deployments"
    echo "  - Security policy bypass"
    echo ""
    echo "If you need to test locally, use:"
    echo "  CI=true $0"
    echo ""
    echo "WARNING: Local testing does not guarantee CI behavior."
    exit 1
fi

# Check for required CI environment
if [ -z "${GITHUB_ACTIONS:-}" ] && [ -z "${GITLAB_CI:-}" ] && [ -z "${CIRCLECI:-}" ]; then
    echo "⚠️  WARNING: Unrecognized CI environment"
    echo "Supported CI systems: GitHub Actions, GitLab CI, CircleCI"
fi

# Verify git hooks are enabled
if [ -d ".git" ] && [ ! -f ".git/hooks/pre-commit" ]; then
    echo "❌ Git hooks not installed - security bypass possible"
    exit 1
fi

# Log execution for audit
echo "✅ CI execution verified: ${CI_NAME:-$CI} at $(date -u +%Y-%m-%dT%H:%M:%SZ)"