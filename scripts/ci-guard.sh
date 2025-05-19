#!/usr/bin/env bash

# This script must be sourced at the start of every enforcement script
# It blocks manual execution outside CI

set -euo pipefail

# Source centralized CI detection
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/ci-detector.sh"

# Require CI environment
if ! require_ci_environment; then
    exit 1
fi

# Verify git hooks are enabled (check both old and new locations)
if [ -d ".git" ]; then
    if [ ! -f ".git/hooks/pre-commit" ] && [ ! -f ".githooks/pre-commit" ]; then
        echo "❌ Git hooks not installed - security bypass possible"
        exit 1
    fi
fi

# Log execution for audit
echo "✅ CI execution verified: ${CI_NAME:-${CI:-local}} at $(date -u +%Y-%m-%dT%H:%M:%SZ)"