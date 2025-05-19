#!/usr/bin/env bash

set -euo pipefail

# Test all enforcement scripts to prevent script rot
echo "🧪 Testing enforcement scripts..."

FAILED_TESTS=0

# Test check-npm-usage.sh
echo "Testing check-npm-usage.sh..."
# Create a test file with npm usage
mkdir -p test-tmp || true
echo ' npm install something' > test-tmp/bad-npm.js
# Temporarily disable ci-guard for this test
export ALLOW_LOCAL_TEST=true
if ! ./scripts/check-npm-usage.sh 2>&1 | grep -q "No npm/npx usage found"; then
    echo "✅ check-npm-usage.sh correctly detected npm usage"
else
    echo "❌ check-npm-usage.sh failed to detect npm usage"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
rm -rf test-tmp || true

# Test detect-config-drift.sh
echo ""
echo "Testing detect-config-drift.sh..."
# Test that it runs without error with local test flag
if ! ALLOW_LOCAL_TEST=true ./scripts/detect-config-drift.sh 2>/dev/null; then
    echo "❌ detect-config-drift.sh failed with error"
    FAILED_TESTS=$((FAILED_TESTS + 1))
else
    echo "✅ detect-config-drift.sh runs without error"
fi

# Test enforce-shell-standards.sh syntax
echo ""
echo "Testing enforce-shell-standards.sh syntax..."
if ! bash -n ./scripts/enforce-shell-standards.sh; then
    echo "❌ enforce-shell-standards.sh has syntax errors"
    FAILED_TESTS=$((FAILED_TESTS + 1))
else
    echo "✅ enforce-shell-standards.sh syntax is valid"
fi

# Test that all scripts are executable
echo ""
echo "Testing script permissions..."
for script in scripts/*.sh; do
    if [ ! -x "$script" ]; then
        echo "❌ $script is not executable"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
done

# Test that all scripts have proper error handling
echo ""
echo "Testing error handling..."
for script in scripts/*.sh; do
    if ! grep -q "set -euo pipefail" "$script"; then
        echo "❌ $script missing 'set -euo pipefail'"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
done

# Test OS compatibility checks
echo ""
echo "Testing OS compatibility..."
OS_SPECIFIC_SCRIPTS=("scripts/scan-secret-history.sh")
for script in "${OS_SPECIFIC_SCRIPTS[@]}"; do
    if grep -q "OSTYPE" "$script" || grep -q "command -v" "$script"; then
        echo "✅ $script has OS compatibility checks"
    else
        echo "❌ $script missing OS compatibility checks"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
done

# Summary
echo ""
if [ "$FAILED_TESTS" -eq 0 ]; then
    echo "✅ All enforcement script tests passed"
else
    echo "❌ $FAILED_TESTS enforcement script tests failed"
    exit 1
fi