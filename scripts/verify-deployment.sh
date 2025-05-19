#!/bin/bash

set -euo pipefail

# Only runs in CI, verifies actual deployment
if [ -z "${CI:-}" ] || [ -z "${GITHUB_ACTIONS:-}" ]; then
    echo "❌ This script must run in GitHub Actions CI"
    exit 1
fi

# Check required secrets
if [ -z "${NETLIFY_SITE_ID:-}" ] || [ -z "${NETLIFY_AUTH_TOKEN:-}" ]; then
    echo "❌ Missing required Netlify secrets"
    echo "Required: NETLIFY_SITE_ID, NETLIFY_AUTH_TOKEN"
    exit 1
fi

echo "🔍 Verifying deployment configuration..."

# Load config
DEPLOYMENT_CONFIG=$(cat config/deployment.json)
EXPECTED_SITE_ID=$(echo $DEPLOYMENT_CONFIG | jq -r '.netlify.siteId')
EXPECTED_URL=$(echo $DEPLOYMENT_CONFIG | jq -r '.netlify.productionUrl')

# Verify environment matches config
if [ "$NETLIFY_SITE_ID" != "$EXPECTED_SITE_ID" ]; then
    echo "❌ Site ID mismatch!"
    echo "   Expected: $EXPECTED_SITE_ID"
    echo "   Got: $NETLIFY_SITE_ID"
    exit 1
fi

echo "✅ Environment variables match config"

# Get latest deployment info from Netlify
echo "🚀 Checking latest deployment..."
DEPLOY_INFO=$(pnpm exec netlify api listSiteDeploys --data "{\"site_id\": \"$NETLIFY_SITE_ID\"}" | jq -r '.[0]')
DEPLOY_ID=$(echo $DEPLOY_INFO | jq -r '.id')
DEPLOY_STATE=$(echo $DEPLOY_INFO | jq -r '.state')
DEPLOY_URL=$(echo $DEPLOY_INFO | jq -r '.deploy_url')

echo "Latest deploy: $DEPLOY_ID (state: $DEPLOY_STATE)"

# Run smoke test on production URL
echo "🔍 Running production smoke test..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$EXPECTED_URL")

if [ "$HTTP_STATUS" -ne 200 ]; then
    echo "❌ Production site not responding correctly (status: $HTTP_STATUS)"
    exit 1
fi

echo "✅ Production site responding"

# Check if latest deploy matches expected patterns
if [ "$DEPLOY_STATE" != "ready" ]; then
    echo "❌ Latest deploy not ready (state: $DEPLOY_STATE)"
    exit 1
fi

# Verify content on production
echo "🔍 Verifying production content..."
CONTENT=$(curl -s "$EXPECTED_URL")

if ! echo "$CONTENT" | grep -q "fact.rip"; then
    echo "❌ Production content missing expected elements"
    exit 1
fi

if ! echo "$CONTENT" | grep -q "Join the Watchtower"; then
    echo "❌ Production content missing CTA"
    exit 1
fi

echo "✅ Production content verified"

# Check API endpoints if configured
if [ -n "${VITE_TELEMETRY_ENDPOINT:-}" ]; then
    echo "🔍 Testing telemetry endpoint..."
    TELEMETRY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$VITE_TELEMETRY_ENDPOINT")
    echo "Telemetry endpoint OPTIONS: $TELEMETRY_STATUS"
fi

if [ -n "${VITE_ERROR_REPORT_ENDPOINT:-}" ]; then
    echo "🔍 Testing error report endpoint..."
    ERROR_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$VITE_ERROR_REPORT_ENDPOINT")
    echo "Error endpoint OPTIONS: $ERROR_STATUS"
fi

echo "🎉 Deployment verification complete!"
echo "Site ID: $NETLIFY_SITE_ID"
echo "Production URL: $EXPECTED_URL"
echo "Latest Deploy: $DEPLOY_ID"
echo "Status: READY ✅"