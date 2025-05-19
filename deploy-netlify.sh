#!/bin/bash
set -euo pipefail

# SECURITY: This script is disabled to enforce CI/CD-only deployments
echo "❌ ERROR: Manual deployment is disabled for security reasons"
echo "Deployments must go through CI/CD pipeline to ensure:"
echo "- All tests pass"
echo "- No secrets exposed"
echo "- Proper validation"
echo ""
echo "To deploy:"
echo "1. Push to main branch"
echo "2. Let CI/CD handle deployment"
echo "3. Monitor Teams notifications"
echo ""
echo "If you need emergency deployment access, contact security team"

# Revoke any local Netlify auth tokens if present
if [ -f "$HOME/.netlify/config.json" ]; then
    echo "⚠️  Revoking local Netlify auth to prevent bypass..."
    rm -f "$HOME/.netlify/config.json" || true
fi

# Remove any netlify CLI config
if command -v netlify &> /dev/null; then
    echo "⚠️  Disabling netlify CLI auth..."
    netlify logout &>/dev/null || true
fi

exit 1