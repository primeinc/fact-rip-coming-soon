#!/usr/bin/env bash

set -euo pipefail

echo "🚀 Running preflight checks..."
echo ""

# Track validation results
PASSED=0
FAILED=0

# Function to check tool availability
check_tool() {
    local tool=$1
    local version_cmd=$2
    local min_version=$3
    
    if which "$tool" >/dev/null 2>&1; then
        local version=$($version_cmd)
        echo "✅ $tool: $version"
        PASSED=$((PASSED + 1))
    else
        echo "❌ $tool: NOT FOUND (required)"
        FAILED=$((FAILED + 1))
    fi
}

# System tools
echo "📋 Checking system tools..."
check_tool "git" "git --version" "2.0"
check_tool "node" "node --version" "18.0.0"
check_tool "pnpm" "pnpm --version" "8.0.0"
check_tool "gh" "gh --version" "2.0"
check_tool "jq" "jq --version" "1.6"
check_tool "curl" "curl --version | head -1" "7.0"

echo ""
echo "📦 Checking project dependencies..."

# Install deps if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install --frozen-lockfile
fi

# Check project tools through pnpm
if pnpm exec tsc --version >/dev/null 2>&1; then
    echo "✅ TypeScript: $(pnpm exec tsc --version)"
    PASSED=$((PASSED + 1))
else
    echo "❌ TypeScript: NOT AVAILABLE"
    FAILED=$((FAILED + 1))
fi

if pnpm exec eslint --version >/dev/null 2>&1; then
    echo "✅ ESLint: $(pnpm exec eslint --version)"
    PASSED=$((PASSED + 1))
else
    echo "❌ ESLint: NOT AVAILABLE"
    FAILED=$((FAILED + 1))
fi

if pnpm exec playwright --version >/dev/null 2>&1; then
    echo "✅ Playwright: $(pnpm exec playwright --version)"
    PASSED=$((PASSED + 1))
else
    echo "❌ Playwright: NOT AVAILABLE"
    FAILED=$((FAILED + 1))
fi

if pnpm exec vitest --version >/dev/null 2>&1; then
    echo "✅ Vitest: $(pnpm exec vitest --version)"
    PASSED=$((PASSED + 1))
else
    echo "❌ Vitest: NOT AVAILABLE"
    FAILED=$((FAILED + 1))
fi

# Check environment
echo ""
echo "🔐 Checking environment..."

if [ -n "${CI:-}" ]; then
    echo "✅ Running in CI environment"
    PASSED=$((PASSED + 1))
else
    echo "ℹ️  Running locally (CI tools may have limited functionality)"
fi

# Check GitHub authentication
if gh auth status >/dev/null 2>&1; then
    echo "✅ GitHub CLI authenticated"
    PASSED=$((PASSED + 1))
else
    echo "⚠️  GitHub CLI not authenticated (run 'gh auth login')"
fi

# Summary
echo ""
echo "📊 Preflight Check Summary"
echo "========================="
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "🎉 All preflight checks passed!"
    exit 0
else
    echo ""
    echo "⚠️  Some preflight checks failed. Please install missing tools."
    exit 1
fi