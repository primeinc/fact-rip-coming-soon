#!/usr/bin/env bash
set -euo pipefail

# Validate that the Playwright project exists before running tests
PROJECT_NAME="$1"

echo "🔍 Validating Playwright project: $PROJECT_NAME"

# Try to run with the project - Playwright will error if it doesn't exist
if pnpm exec playwright test --project="$PROJECT_NAME" --list-files >/dev/null 2>&1; then
  echo "✅ Project '$PROJECT_NAME' exists"
  exit 0
fi

# If that fails, check if it's in the config
echo "Project validation failed. Checking config..."

# Just check if the project name exists in the config file
if grep -q "name: '$PROJECT_NAME'" playwright.config.ts; then
  echo "✅ Project '$PROJECT_NAME' found in config"
  exit 0
fi

echo "❌ Project '$PROJECT_NAME' not found!"
echo "Available projects in config:"
grep "name:" playwright.config.ts | sed 's/.*name: //'
exit 1