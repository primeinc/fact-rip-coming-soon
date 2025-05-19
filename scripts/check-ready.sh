#!/usr/bin/env bash
# Simple check if code is ready for CI

set -euo pipefail

echo "🔍 Checking if code is ready for CI..."
echo

# Run unit tests
echo "Running unit tests..."
pnpm test > /dev/null 2>&1 && echo "✅ Unit tests pass" || echo "❌ Unit tests failed"

# Run enforcement tests
echo "Running enforcement tests..."  
ALLOW_LOCAL_TEST=true ./scripts/test-enforcement-scripts.sh > /dev/null 2>&1 && echo "✅ Enforcement tests pass" || echo "❌ Enforcement tests failed"

# Run drift tests
echo "Running drift detection tests..."
./scripts/test-drift-detection.sh > /dev/null 2>&1 && echo "✅ Drift tests pass" || echo "❌ Drift tests failed"

echo
echo "Push to CI for full validation"