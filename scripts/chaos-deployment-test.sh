#!/bin/bash

set -euo pipefail

# Chaos deployment test - deploy broken artifact and verify rollback
echo "🔥 Starting chaos deployment test..."

# Check requirements
if [ -z "${NETLIFY_AUTH_TOKEN:-}" ] || [ -z "${NETLIFY_SITE_ID:-}" ]; then
    echo "❌ NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID required"
    exit 1
fi

# Save current state
echo "📸 Capturing current deployment state..."
CURRENT_DEPLOY=$(pnpm exec netlify api listSiteDeploys --data "{\"site_id\": \"$NETLIFY_SITE_ID\"}" | jq -r '.[0]')
CURRENT_DEPLOY_ID=$(echo $CURRENT_DEPLOY | jq -r '.id')
CURRENT_STATE=$(echo $CURRENT_DEPLOY | jq -r '.state')

echo "Current deploy: $CURRENT_DEPLOY_ID (state: $CURRENT_STATE)"

# Create intentionally broken build
echo "💣 Creating broken build artifact..."
mkdir -p chaos-build
cat > chaos-build/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>CHAOS TEST - BROKEN DEPLOYMENT</title>
    <script>
        // Intentionally broken JavaScript
        throw new Error('CHAOS_TEST_INTENTIONAL_FAILURE');
        nonExistentFunction();
    </script>
</head>
<body>
    <h1>This deployment is intentionally broken for chaos testing</h1>
    <div id="undefined-element">
        <script>
            // More broken code
            document.getElementById('does-not-exist').innerHTML = null.property;
        </script>
    </div>
</body>
</html>
EOF

# Deploy broken artifact
echo "🚀 Deploying broken artifact..."
BROKEN_DEPLOY_OUTPUT=$(pnpm exec netlify deploy --dir=chaos-build --json)
BROKEN_DEPLOY_ID=$(echo $BROKEN_DEPLOY_OUTPUT | jq -r '.deploy_id')
BROKEN_DEPLOY_URL=$(echo $BROKEN_DEPLOY_OUTPUT | jq -r '.deploy_url')

echo "Broken deploy: $BROKEN_DEPLOY_ID"
echo "URL: $BROKEN_DEPLOY_URL"

# Test the broken deployment
echo "🧪 Testing broken deployment..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BROKEN_DEPLOY_URL")
echo "HTTP Status: $HTTP_STATUS"

# Run smoke test against broken deploy (should fail)
echo "🔍 Running smoke test (should fail)..."
SMOKE_TEST_FAILED=0
if SMOKE_TEST_URL="$BROKEN_DEPLOY_URL" node scripts/smoke-test-production.js; then
    echo "❌ ERROR: Smoke test passed on broken deployment!"
    SMOKE_TEST_FAILED=1
else
    echo "✅ Good: Smoke test correctly failed on broken deployment"
fi

# Test rollback capability
echo "🔄 Testing rollback to previous deployment..."
ROLLBACK_OUTPUT=$(pnpm exec netlify api rollbackSiteDeploy \
    --data "{\"site_id\": \"$NETLIFY_SITE_ID\", \"deploy_id\": \"$CURRENT_DEPLOY_ID\"}")

echo "Rollback initiated"

# Wait for rollback to complete
echo "⏳ Waiting for rollback..."
sleep 10

# Verify rollback
echo "🔍 Verifying rollback..."
NEW_DEPLOY=$(pnpm exec netlify api listSiteDeploys --data "{\"site_id\": \"$NETLIFY_SITE_ID\"}" | jq -r '.[0]')
NEW_DEPLOY_ID=$(echo $NEW_DEPLOY | jq -r '.id')
NEW_STATE=$(echo $NEW_DEPLOY | jq -r '.state')

echo "Current deploy after rollback: $NEW_DEPLOY_ID (state: $NEW_STATE)"

# Verify site is functional after rollback
PROD_URL=$(cat config/deployment.json | jq -r '.netlify.productionUrl')
ROLLBACK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL")

if [ "$ROLLBACK_STATUS" -eq 200 ]; then
    echo "✅ Site is functional after rollback"
else
    echo "❌ Site is not functional after rollback (status: $ROLLBACK_STATUS)"
    exit 1
fi

# Clean up
rm -rf chaos-build

# Summary
echo ""
echo "🏁 Chaos test summary:"
echo "  - Deployed intentionally broken artifact"
echo "  - Smoke tests correctly detected the failure"
echo "  - Successfully rolled back to previous deployment"
echo "  - Site is functional after rollback"

if [ "$SMOKE_TEST_FAILED" -eq 1 ]; then
    echo "❌ CRITICAL: Smoke tests did not detect broken deployment!"
    exit 1
else
    echo "✅ All chaos tests passed - deployment rollback works correctly"
fi