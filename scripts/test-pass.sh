#!/bin/bash
set -euo pipefail

ALLOW_LOCAL_TEST="${ALLOW_LOCAL_TEST:-false}"

# Check if running in CI
if [ "$ALLOW_LOCAL_TEST" != "true" ] && [ -z "${GITHUB_ACTIONS:-}" ]; then
    echo "⚠️  This script should run in CI. Use ALLOW_LOCAL_TEST=true for local testing."
    exit 1
fi

echo "Starting test"
TEMP_FILE=$(mktemp)
echo "EXCEPTION:test.md:1 - Some exception" >> "$TEMP_FILE"

echo "Created temp file: $TEMP_FILE"

FOUND_VIOLATIONS=$(grep -c "^VIOLATION$" "$TEMP_FILE" || true)
echo "Found violations: $FOUND_VIOLATIONS"

rm -f "$TEMP_FILE" || true

if [ $FOUND_VIOLATIONS -gt 0 ]; then
    echo "FAILED: Found violations"
    exit 1
else
    echo "PASSED: No violations"
    exit 0
fi