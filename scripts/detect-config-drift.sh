#!/bin/bash

set -euo pipefail

# Block manual execution
source "$(dirname "$0")/ci-guard.sh"

# Detect any configuration drift between multiple sources
echo "🔍 Detecting configuration drift..."

DRIFT_DETECTED=0

# Load deployment config
DEPLOYMENT_CONFIG=$(cat config/deployment.json)
SITE_ID=$(echo $DEPLOYMENT_CONFIG | jq -r '.netlify.siteId')
PROD_URL=$(echo $DEPLOYMENT_CONFIG | jq -r '.netlify.productionUrl')
SITE_NAME=$(echo $DEPLOYMENT_CONFIG | jq -r '.netlify.siteName')

# Check environment variable mapping
echo "📋 Checking environment variable mapping..."

# Map expected env vars to config values
declare -A ENV_MAP=(
    ["NETLIFY_SITE_ID"]="$SITE_ID"
)

# Skip if running locally without env vars
if [ -n "${CI:-}" ]; then
    # Verify each environment variable matches config
    for ENV_VAR in "${!ENV_MAP[@]}"; do
        CONFIG_VALUE="${ENV_MAP[$ENV_VAR]}"
        if [ -z "${!ENV_VAR:-}" ]; then
        echo "❌ Missing environment variable: $ENV_VAR"
        echo "   Expected value from config: $CONFIG_VALUE"
        DRIFT_DETECTED=1
    elif [ "${!ENV_VAR}" != "$CONFIG_VALUE" ]; then
        echo "❌ Environment variable mismatch: $ENV_VAR"
        echo "   Config value: $CONFIG_VALUE"
        echo "   Env value: ${!ENV_VAR}"
        DRIFT_DETECTED=1
    fi
done
fi

# Check for hardcoded values in shell scripts
echo "🔍 Checking for hardcoded values in shell scripts..."

# Use deployment config values to build pattern dynamically
if [ ! -z "$SITE_NAME" ] && [ ! -z "$PROD_URL" ]; then
    # Extract domain from production URL
    DOMAIN=$(echo "$PROD_URL" | sed 's|https://||' | sed 's|/.*||')
    PATTERNS="${CONFIG_DRIFT_PATTERNS:-$SITE_NAME|$DOMAIN}"
else
    # Fallback to generic patterns if config not available
    PATTERNS="${CONFIG_DRIFT_PATTERNS:-netlify\.app}"
fi
HARDCODED_URLS=$(grep -r "$PATTERNS" scripts/ --exclude="detect-config-drift.sh" || true)
if [ ! -z "$HARDCODED_URLS" ]; then
    echo "❌ Found hardcoded URLs in scripts:"
    echo "$HARDCODED_URLS"
    DRIFT_DETECTED=1
fi

# Check manifest.json against branding config
echo "📱 Checking manifest.json against branding config..."

MANIFEST_NAME=$(jq -r '.name' public/manifest.json)
MANIFEST_SHORT_NAME=$(jq -r '.short_name' public/manifest.json)
MANIFEST_THEME=$(jq -r '.theme_color' public/manifest.json)

# Read branding values (simplified check)
BRANDING_CHECK=$(grep -E "fact\.rip|#DC2626" src/config/branding.ts || true)
if [ -z "$BRANDING_CHECK" ]; then
    echo "❌ Potential drift between manifest.json and branding.ts"
    DRIFT_DETECTED=1
fi

# Check for config file consistency
echo "📁 Checking config file consistency..."

# Verify all config files are in sync
CONFIG_REFS=$(grep -r "$SITE_ID\|$PROD_URL\|$SITE_NAME" . \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=dist \
    --exclude-dir=playwright-report \
    --exclude="*.lock" \
    --exclude="detect-config-drift.sh" | wc -l)

if [ "$CONFIG_REFS" -eq 0 ]; then
    echo "❌ No references to config values found - possible drift"
    DRIFT_DETECTED=1
fi

# Check .netlify directory for stale state
if [ -d ".netlify" ]; then
    echo "⚠️  Warning: .netlify directory exists - checking for stale state..."
    NETLIFY_STATE=$(find .netlify -name "*.json" -mtime +7)
    if [ ! -z "$NETLIFY_STATE" ]; then
        echo "❌ Found stale .netlify state files older than 7 days:"
        echo "$NETLIFY_STATE"
        DRIFT_DETECTED=1
    fi
fi

# Verify no duplicate config definitions
echo "🔍 Checking for duplicate config definitions..."

SITE_ID_COUNT=$(grep -r "$SITE_ID" . \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=dist \
    --exclude="*.lock" | wc -l)

if [ "$SITE_ID_COUNT" -gt 5 ]; then
    echo "⚠️  Warning: Site ID appears in $SITE_ID_COUNT places - possible duplication"
fi

# Summary
if [ "$DRIFT_DETECTED" -eq 0 ]; then
    echo "✅ No configuration drift detected"
else
    echo "❌ Configuration drift detected! Fix issues above."
    exit 1
fi