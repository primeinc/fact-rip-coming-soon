#!/bin/bash

# Netlify deployment script
echo "🚀 Deploying to Netlify..."

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    pnpm add -g netlify-cli
fi

# Build the project
echo "📦 Building project..."
pnpm run build

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
NETLIFY_AUTH_TOKEN=$NETLIFY_AUTH_TOKEN netlify deploy --prod --dir=dist --site=$NETLIFY_SITE_ID

echo "✅ Deployment complete!"
echo "🔗 Site URL: https://sparkly-bombolone-c419df.netlify.app/"