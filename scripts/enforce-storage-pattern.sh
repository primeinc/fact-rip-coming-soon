#!/bin/bash
set -euo pipefail

# Enforce storage access pattern
# This script fails if any direct localStorage/sessionStorage access is found
# outside of allowed files

# Files allowed to access storage directly
ALLOWED_FILES="storage-adapter|storage\.ts|test-utils|StorageContext|emergency-storage"

# E2E tests can use localStorage for assertions
EXCLUDE_PATTERNS="e2e/.*\.spec\.ts|test-hooks\.ts|debug-test\.spec\.ts"

# Find violations (excluding allowed files and E2E tests)
VIOLATIONS=$(find src -name "*.ts*" -type f | \
  grep -v -E "$ALLOWED_FILES" | \
  xargs grep -l -E "(localStorage|sessionStorage)\." 2>/dev/null || true)

if [ ! -z "$VIOLATIONS" ]; then
  echo "❌ Direct storage access found in non-allowed files:"
  echo "$VIOLATIONS"
  echo ""
  echo "All storage access must go through StorageContext."
  echo "If this is a false positive, add the file to ALLOWED_FILES."
  exit 1
fi

echo "✅ Storage access pattern enforced correctly."