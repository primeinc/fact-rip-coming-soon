#!/bin/bash

# Setup script for fact.rip coming soon page
# This enforces pnpm-only development

set -euo pipefail

echo "🔍 Checking for pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed!"
    echo "Please install pnpm first: https://pnpm.io/installation"
    exit 1
fi

echo "✅ pnpm found: $(pnpm --version)"

echo "🧹 Cleaning up any existing node_modules..."
rm -rf node_modules
rm -rf dist
rm -rf coverage
rm -rf playwright-report

echo "📦 Installing dependencies with pnpm..."
pnpm install --frozen-lockfile

echo "🎭 Installing Playwright browsers..."
pnpm exec playwright install --with-deps

echo "🔍 Running pnpm-only policy check..."
pnpm run check:pnpm

echo "✅ Setup complete! You can now run:"
echo "  pnpm run dev    - Start development server"
echo "  pnpm run test   - Run tests"
echo "  pnpm run build  - Build for production"
echo ""
echo "⚠️  Remember: This project uses pnpm ONLY. Never use npm or npx!"