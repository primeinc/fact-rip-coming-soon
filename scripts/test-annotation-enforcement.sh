#!/usr/bin/env bash
set -euo pipefail

# Test that the annotation enforcement script works correctly
# This script EXPECTS failures on test cases and treats them as success

echo "🧪 Testing pnpm annotation enforcement..."
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# Function to safely increment counters
increment_passed() {
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

increment_failed() {
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

# Test 1: File with violations should fail
echo "Test 1: Checking that violations are detected..."
echo "DEBUG: Looking for test/test-annotation-system.md"
ls -la test/test-annotation-system.md || echo "File not found"
if ALLOW_LOCAL_TEST=true VERBOSE=true ./scripts/enforce-pnpm-with-annotations.sh test/test-annotation-system.md 2>&1; then
    echo "❌ FAILED: Script did not detect violations in test file"
    increment_failed
else
    echo "✅ PASSED: Script correctly detected violations"
    increment_passed
fi

# Test 2: File with only annotated exceptions should pass
echo ""
echo "Test 2: Checking that annotated exceptions are allowed..."
mkdir -p test || true
echo "DEBUG: Creating test/temp-annotated.md"
cat > test/temp-annotated.md << 'EOF'
# Test Annotated Only

<!-- pnpm-lint-disable -->
```bash
npm install
npx test
```
EOF

echo "DEBUG: Running script on test/temp-annotated.md"
if ALLOW_LOCAL_TEST=true VERBOSE=true ./scripts/enforce-pnpm-with-annotations.sh test/temp-annotated.md; then
    echo "✅ PASSED: Script correctly allows annotated exceptions"
    increment_passed
else
    echo "❌ FAILED: Script rejected properly annotated exceptions"
    increment_failed
fi
rm -f test/temp-annotated.md || true

# Test 3: File with no npm/npx should pass
echo ""
echo "Test 3: Checking that pnpm-only files pass..."
cat > test/temp-clean.md << 'EOF'
# Test Clean File

```bash
pnpm install
pnpm test
pnpm run build
```
EOF

echo "DEBUG: Running script on test/temp-clean.md"
if ALLOW_LOCAL_TEST=true VERBOSE=true ./scripts/enforce-pnpm-with-annotations.sh test/temp-clean.md; then
    echo "✅ PASSED: Script correctly passes clean files"
    increment_passed
else
    echo "❌ FAILED: Script rejected clean pnpm-only file"
    increment_failed
fi
rm -f test/temp-clean.md || true

# Test 4: Mixed file should report only unannotated violations
echo ""
echo "Test 4: Checking mixed file handling..."
cat > test/temp-mixed.md << 'EOF'
# Test Mixed File

<!-- pnpm-lint-disable -->
```bash
npm install  # This is allowed
```

```bash
npm test  # This should fail
```
EOF

echo "DEBUG: Running script on test/temp-mixed.md"
OUTPUT=$(ALLOW_LOCAL_TEST=true VERBOSE=true ./scripts/enforce-pnpm-with-annotations.sh test/temp-mixed.md 2>&1 || true)
echo "DEBUG: Output was: $OUTPUT"
if echo "$OUTPUT" | grep -q "Found 1 unannotated npm/npx usage"; then
    echo "✅ PASSED: Script correctly found 1 violation in mixed file"
    increment_passed
else
    echo "❌ FAILED: Script did not correctly handle mixed file"
    echo "Output was: $OUTPUT"
    increment_failed
fi
rm -f test/temp-mixed.md || true

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Passed: $TESTS_PASSED"
echo "❌ Failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo "🎉 All tests passed! Annotation enforcement is working correctly."
    exit 0
else
    echo "💥 Some tests failed. Annotation enforcement needs fixing."
    exit 1
fi