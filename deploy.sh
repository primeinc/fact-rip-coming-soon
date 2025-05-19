#!/bin/bash

echo "Deploying fact.rip to Vercel..."

# Build the project
pnpm run build

# Deploy to Vercel (requires authentication)
# Use: vercel deploy --prod --yes
echo "To deploy, run:"
echo "  vercel login"
echo "  vercel deploy --prod --yes"
echo ""
echo "Or for automated deployment:"
echo "  vercel deploy --prod --yes --token=YOUR_TOKEN"