#!/usr/bin/env bash

set -euo pipefail

echo "🔄 Running cycle validation..."
echo ""

# First run preflight checks
echo "📋 Running preflight checks..."
if ! ./scripts/preflight-check.sh; then
    echo "❌ Preflight checks failed. Please fix issues before continuing."
    exit 1
fi

echo ""
echo "📝 Git status..."
git status

echo ""
echo "🔍 Running local enforcement tests..."

# Run all local tests
if ! pnpm run test:local:all; then
    echo "❌ Local enforcement tests failed"
    exit 1
fi

echo ""
echo "🧪 Running unit tests..."
if ! pnpm run test:run; then
    echo "❌ Unit tests failed"
    exit 1
fi

echo ""
echo "🎭 Running E2E tests..."
if ! pnpm run test:e2e; then
    echo "❌ E2E tests failed"
    exit 1
fi

echo ""
echo "🏗️ Building project..."
if ! pnpm run build; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "📊 Validation Summary"
echo "==================="
echo "✅ Preflight checks passed"
echo "✅ Local enforcement tests passed"
echo "✅ Unit tests passed"
echo "✅ E2E tests passed"
echo "✅ Build successful"
echo ""
echo "🎉 All validations passed! Ready to commit."

# Show current status
echo ""
echo "📋 Current changes:"
git status --short

echo ""
echo "💡 Next steps:"
echo "1. Review changes with: git diff"
echo "2. Stage changes with: git add -A"
echo "3. Commit with: git commit -m 'your message'"
echo "4. Push to GitHub with: git push"