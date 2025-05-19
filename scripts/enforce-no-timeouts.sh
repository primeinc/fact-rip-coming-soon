#!/bin/bash
set -euo pipefail

# Enforce no setTimeout/setInterval pattern
# This script fails if any timing-based code is found outside animations

# Files allowed to use timing functions
ALLOWED_FILES="animations\.ts|timings\.ts|test-utils|e2e"

# Find files with timing functions
FILES_WITH_TIMING=$(find src -name "*.ts*" -type f | \
  grep -v -E "$ALLOWED_FILES" | \
  xargs grep -l -E "(setTimeout|setInterval)" || true)

# Check for animation annotations
VIOLATIONS=""
for file in $FILES_WITH_TIMING; do
  # Check if file has @animation-timeout annotation
  if ! grep -q "@animation-timeout" "$file"; then
    VIOLATIONS="$VIOLATIONS$file\n"
  fi
done

# Remove trailing newline
VIOLATIONS=$(echo -n "$VIOLATIONS" | sed '/^$/d')

if [ ! -z "$VIOLATIONS" ]; then
  echo "❌ Timing-based code (setTimeout/setInterval) found:"
  echo "$VIOLATIONS"
  echo ""
  echo "Use event-driven patterns instead of timeouts."
  echo "If this is animation code, move it to animations.ts."
  exit 1
fi

echo "✅ No timing-based patterns found in application code."