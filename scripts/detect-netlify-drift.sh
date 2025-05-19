#!/bin/bash

set -euo pipefail

# Detect drift between local config and actual Netlify deployment
echo "🔍 Detecting Netlify deployment drift..."

# Check for required environment variables
if [ -z "${NETLIFY_AUTH_TOKEN:-}" ]; then
    echo "❌ NETLIFY_AUTH_TOKEN not set. Cannot check Netlify API."
    exit 1
fi

DRIFT_DETECTED=0

# Load local config
LOCAL_CONFIG=$(cat config/deployment.json)
LOCAL_SITE_ID=$(echo $LOCAL_CONFIG | jq -r '.netlify.siteId')
LOCAL_PROD_URL=$(echo $LOCAL_CONFIG | jq -r '.netlify.productionUrl')
LOCAL_SITE_NAME=$(echo $LOCAL_CONFIG | jq -r '.netlify.siteName')

echo "📋 Local config:"
echo "  Site ID: $LOCAL_SITE_ID"
echo "  Production URL: $LOCAL_PROD_URL"
echo "  Site Name: $LOCAL_SITE_NAME"

# Fetch site info from Netlify API
echo "🌐 Fetching Netlify site info..."

NETLIFY_RESPONSE=$(curl -s -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
    "https://api.netlify.com/api/v1/sites/$LOCAL_SITE_ID")

if [ -z "$NETLIFY_RESPONSE" ] || [ "$NETLIFY_RESPONSE" == "null" ]; then
    echo "❌ Failed to fetch site info from Netlify API"
    exit 1
fi

# Extract values from Netlify API response
NETLIFY_SITE_ID=$(echo $NETLIFY_RESPONSE | jq -r '.id')
NETLIFY_URL=$(echo $NETLIFY_RESPONSE | jq -r '.url')
NETLIFY_SSL_URL=$(echo $NETLIFY_RESPONSE | jq -r '.ssl_url')
NETLIFY_NAME=$(echo $NETLIFY_RESPONSE | jq -r '.name')
NETLIFY_CUSTOM_DOMAIN=$(echo $NETLIFY_RESPONSE | jq -r '.custom_domain // empty')

echo ""
echo "🌐 Netlify API values:"
echo "  Site ID: $NETLIFY_SITE_ID"
echo "  URL: $NETLIFY_URL"
echo "  SSL URL: $NETLIFY_SSL_URL"
echo "  Name: $NETLIFY_NAME"
echo "  Custom Domain: $NETLIFY_CUSTOM_DOMAIN"

# Compare values
echo ""
echo "🔍 Comparing values..."

# Check Site ID
if [ "$LOCAL_SITE_ID" != "$NETLIFY_SITE_ID" ]; then
    echo "❌ Site ID mismatch!"
    echo "   Local: $LOCAL_SITE_ID"
    echo "   Netlify: $NETLIFY_SITE_ID"
    DRIFT_DETECTED=1
fi

# Check Production URL (prefer SSL URL from Netlify)
if [ "$LOCAL_PROD_URL" != "$NETLIFY_SSL_URL" ] && [ "$LOCAL_PROD_URL" != "$NETLIFY_URL" ]; then
    echo "❌ Production URL mismatch!"
    echo "   Local: $LOCAL_PROD_URL"
    echo "   Netlify SSL: $NETLIFY_SSL_URL"
    echo "   Netlify: $NETLIFY_URL"
    DRIFT_DETECTED=1
fi

# Check Site Name
if [ "$LOCAL_SITE_NAME" != "$NETLIFY_NAME" ]; then
    echo "❌ Site name mismatch!"
    echo "   Local: $LOCAL_SITE_NAME"
    echo "   Netlify: $NETLIFY_NAME"
    DRIFT_DETECTED=1
fi

# Check deployment status
echo ""
echo "🚀 Checking latest deployment..."

DEPLOYS_RESPONSE=$(curl -s -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
    "https://api.netlify.com/api/v1/sites/$LOCAL_SITE_ID/deploys?per_page=1")

LATEST_DEPLOY_STATE=$(echo $DEPLOYS_RESPONSE | jq -r '.[0].state')
LATEST_DEPLOY_URL=$(echo $DEPLOYS_RESPONSE | jq -r '.[0].ssl_url // .[0].url')
LATEST_DEPLOY_CREATED=$(echo $DEPLOYS_RESPONSE | jq -r '.[0].created_at')

echo "  State: $LATEST_DEPLOY_STATE"
echo "  URL: $LATEST_DEPLOY_URL"
echo "  Created: $LATEST_DEPLOY_CREATED"

if [ "$LATEST_DEPLOY_STATE" != "ready" ]; then
    echo "⚠️  Warning: Latest deployment is not in 'ready' state"
fi

# Check environment variables
echo ""
echo "🔐 Checking environment variables..."

ENV_VARS_RESPONSE=$(curl -s -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
    "https://api.netlify.com/api/v1/accounts/site/$LOCAL_SITE_ID/env")

NETLIFY_ENV_COUNT=$(echo $ENV_VARS_RESPONSE | jq '. | length')
echo "  Found $NETLIFY_ENV_COUNT environment variables configured"

# Summary
echo ""
if [ "$DRIFT_DETECTED" -eq 0 ]; then
    echo "✅ No drift detected between local config and Netlify"
else
    echo "❌ Drift detected! Update local config to match Netlify deployment."
    exit 1
fi