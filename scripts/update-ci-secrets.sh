#!/usr/bin/env bash
# Update GitHub secrets from deployment config

set -euo pipefail

if [ -z "${GITHUB_TOKEN:-}" ]; then
    echo "❌ GITHUB_TOKEN environment variable required"
    exit 1
fi

# Load deployment config
DEPLOYMENT_CONFIG=$(cat config/deployment.json)
SITE_ID=$(echo $DEPLOYMENT_CONFIG | jq -r '.netlify.siteId')
PROD_URL=$(echo $DEPLOYMENT_CONFIG | jq -r '.netlify.productionUrl')

echo "📦 Updating GitHub secrets from deployment config..."

# Update NETLIFY_URL secret
echo "$PROD_URL" | gh secret set NETLIFY_URL

echo "✅ Secrets updated"
echo "   NETLIFY_URL: $PROD_URL"