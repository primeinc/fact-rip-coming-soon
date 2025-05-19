#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Checking deployment status..."
echo ""

# Check GitHub Actions status
echo "📦 GitHub Actions Status:"
gh run list --limit 1

echo ""
echo "🌐 Netlify Site:"
PROD_URL=$(cat config/deployment.json | jq -r '.netlify.productionUrl')
echo "URL: $PROD_URL"
echo ""

# Check if the site is accessible
echo "🔗 Testing site availability..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL")

if [ "$STATUS_CODE" -eq 200 ]; then
    echo "✅ Site is live and accessible!"
else
    echo "❌ Site returned status code: $STATUS_CODE"
fi

echo ""
echo "📊 For detailed deployment logs:"
echo "- GitHub: https://github.com/primeinc/fact-rip-coming-soon/actions"
echo "- Netlify: Log in to Netlify dashboard to view deployment logs"