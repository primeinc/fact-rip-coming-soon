#!/bin/bash

echo "🔍 Checking deployment status..."
echo ""

# Check GitHub Actions status
echo "📦 GitHub Actions Status:"
gh run list --limit 1

echo ""
echo "🌐 Netlify Site:"
echo "URL: https://sparkly-bombolone-c419df.netlify.app/"
echo ""

# Check if the site is accessible
echo "🔗 Testing site availability..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://sparkly-bombolone-c419df.netlify.app/)

if [ "$STATUS_CODE" -eq 200 ]; then
    echo "✅ Site is live and accessible!"
else
    echo "❌ Site returned status code: $STATUS_CODE"
fi

echo ""
echo "📊 For detailed deployment logs:"
echo "- GitHub: https://github.com/primeinc/fact-rip-coming-soon/actions"
echo "- Netlify: Log in to Netlify dashboard to view deployment logs"