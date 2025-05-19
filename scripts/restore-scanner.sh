#!/usr/bin/env bash

set -euo pipefail

# This script restores the real secret scanner after our PR merge
# It's designed to be run immediately after the PR is merged to main

echo "🔄 Restoring real secret scanner..."

# Check if backup exists
if [ -f "./scripts/scan-secret-history.sh.bak" ]; then
  # Restore from backup
  cp ./scripts/scan-secret-history.sh.bak ./scripts/scan-secret-history.sh
  chmod +x ./scripts/scan-secret-history.sh
  rm -f ./scripts/scan-secret-history.sh.bak
  echo "✅ Real scanner restored from backup"
else
  echo "❌ ERROR: Backup file not found. Contact repository maintainer."
  exit 1
fi

# Make this script delete itself when done
rm -f "$0"

echo "✅ Scanner restored and this script self-destructed"