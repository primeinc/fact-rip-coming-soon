#!/usr/bin/env bash
# Negative path tests for drift detection

set -euo pipefail

echo "🧪 Testing drift detection negative paths..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FAILED_TESTS=0

# Test 1: Verify drift is detected when config mismatch exists
echo "Test 1: Config mismatch detection"
(
    export ALLOW_LOCAL_TEST=true
    export CI=true
    export NETLIFY_SITE_ID="wrong-site-id"
    export EXPECTED_NETLIFY_SITE_ID="correct-site-id"
    
    if "$SCRIPT_DIR/detect-config-drift.sh" >/dev/null 2>&1; then
        echo "❌ Failed to detect config mismatch"
        exit 1
    else
        echo "✅ Correctly detected config mismatch"
    fi
) || FAILED_TESTS=$((FAILED_TESTS + 1))

# Test 2: Verify hardcoded values are detected
echo -e "\nTest 2: Hardcoded value detection"
(
    export ALLOW_LOCAL_TEST=true
    
    # Create test file with hardcoded value  
    TEST_FILE="$SCRIPT_DIR/test-hardcoded.sh"
    echo '#!/usr/bin/env bash' > "$TEST_FILE"
    # Use the actual production domain from config
    if [ -f "config/deployment.json" ]; then
        PROD_URL=$(jq -r '.netlify.productionUrl' config/deployment.json)
        echo "SITE_URL=\"$PROD_URL\"" >> "$TEST_FILE"
    else
        echo 'SITE_URL="example.netlify.app"' >> "$TEST_FILE"
    fi
    
    # Run drift detection
    if "$SCRIPT_DIR/detect-config-drift.sh" >/dev/null 2>&1; then
        echo "❌ Failed to detect hardcoded values"
        rm -f "$TEST_FILE" || true
        exit 1
    else
        echo "✅ Correctly detected hardcoded values"
        rm -f "$TEST_FILE" || true
    fi
) || FAILED_TESTS=$((FAILED_TESTS + 1))

# Test 3: Verify missing environment variables are caught
echo -e "\nTest 3: Missing environment variable detection"
(
    export ALLOW_LOCAL_TEST=true
    export CI=true
    unset NETLIFY_SITE_ID
    export EXPECTED_NETLIFY_SITE_ID="some-site-id"
    
    # Temporarily modify the script to set SITE_ID
    cp "$SCRIPT_DIR/detect-config-drift.sh" "$SCRIPT_DIR/detect-config-drift.sh.bak" || exit 1
    sed -i '' '15a\
SITE_ID="test-site-id"' "$SCRIPT_DIR/detect-config-drift.sh"
    
    if "$SCRIPT_DIR/detect-config-drift.sh" >/dev/null 2>&1; then
        echo "❌ Failed to detect missing environment variable"
        mv "$SCRIPT_DIR/detect-config-drift.sh.bak" "$SCRIPT_DIR/detect-config-drift.sh" || true
        exit 1
    else
        echo "✅ Correctly detected missing environment variable"
        mv "$SCRIPT_DIR/detect-config-drift.sh.bak" "$SCRIPT_DIR/detect-config-drift.sh" || true
    fi
) || FAILED_TESTS=$((FAILED_TESTS + 1))

# Test 4: Verify drift detection fails without CI flag
echo -e "\nTest 4: CI enforcement"
(
    unset CI
    unset ALLOW_LOCAL_TEST
    
    if "$SCRIPT_DIR/detect-config-drift.sh" >/dev/null 2>&1; then
        echo "❌ Script ran without CI flag"
        exit 1
    else
        echo "✅ Correctly blocked execution without CI flag"
    fi
) || FAILED_TESTS=$((FAILED_TESTS + 1))

# Summary
echo -e "\n📊 Test Summary"
if [ "$FAILED_TESTS" -eq 0 ]; then
    echo "✅ All negative path tests passed"
else
    echo "❌ $FAILED_TESTS negative path tests failed"
    exit 1
fi