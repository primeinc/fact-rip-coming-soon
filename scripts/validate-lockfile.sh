#!/bin/bash
set -euo pipefail

# Get pnpm version
PNPM_VERSION=$(pnpm --version)
echo "Current pnpm version: $PNPM_VERSION"

# Extract major version
PNPM_MAJOR=$(echo $PNPM_VERSION | cut -d. -f1)

# Get lockfile version
LOCKFILE_VERSION=$(head -1 pnpm-lock.yaml | grep -o "[0-9]\+\.[0-9]\+" | cut -d. -f1)
echo "Lockfile version: $LOCKFILE_VERSION"

# Check if versions match
if [ "$PNPM_MAJOR" != "$LOCKFILE_VERSION" ]; then
  echo "❌ ERROR: pnpm version ($PNPM_MAJOR) doesn't match lockfile version ($LOCKFILE_VERSION)"
  echo "This will cause installation failures in CI"
  echo "Please update pnpm or regenerate the lockfile"
  exit 1
fi

echo "✅ pnpm and lockfile versions are compatible"
exit 0