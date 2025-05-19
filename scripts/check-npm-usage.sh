#!/bin/bash

# Check for any npm/npx usage in the codebase
# Exit with error if found

echo "Checking for npm/npx usage..."

# Check in all files except node_modules and generated files
# Look specifically for npm/npx commands, not pnpm commands
FOUND_NPM=$(grep -riE "(^|[[:space:]]|[\"\'])npx[[:space:]]|[^p]npm[[:space:]](run|install|ci|start|test|build)" . \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=coverage \
  --exclude-dir=.git \
  --exclude-dir=playwright-report \
  --exclude="*.log" \
  --exclude="pnpm-lock.yaml" \
  --exclude="check-npm-usage.sh" \
  --exclude="CLAUDE.md" \
  --exclude="README.md" \
  --exclude="test-enforcement-scripts.sh")

if [ ! -z "$FOUND_NPM" ]; then
  echo "❌ ERROR: Found npm/npx usage in the following files:"
  echo "$FOUND_NPM"
  echo ""
  echo "This repository uses pnpm exclusively. Replace all npm/npx commands with pnpm equivalents:"
  echo "  - npm install → pnpm install"
  echo "  - npm run → pnpm run"
  echo "  - npx → pnpm exec"
  exit 1
else
  echo "✅ No npm/npx usage found. pnpm-only policy enforced."
  exit 0
fi