#!/bin/bash
set -euo pipefail

# Validate that the Playwright project exists before running tests
PROJECT_NAME="$1"

echo "🔍 Validating Playwright project: $PROJECT_NAME"

# List available projects
AVAILABLE_PROJECTS=$(pnpm exec playwright test --list 2>&1 | grep "project:" | sed 's/.*project: //')

echo "Available projects:"
echo "$AVAILABLE_PROJECTS"

# Check if project exists
if ! echo "$AVAILABLE_PROJECTS" | grep -q "^$PROJECT_NAME$"; then
  echo "❌ Project '$PROJECT_NAME' not found!"
  echo "Available projects are:"
  echo "$AVAILABLE_PROJECTS"
  exit 1
fi

echo "✅ Project '$PROJECT_NAME' exists"