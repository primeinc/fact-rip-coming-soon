#!/usr/bin/env bash

set -euo pipefail

# Helper script for local testing of enforcement scripts
echo "🧪 Running local enforcement tests..."
echo "Note: Some tests require environment variables to be set"
echo ""

# Scripts that work without credentials
echo "Running scripts that don't require credentials..."
ALLOW_LOCAL_TEST=true ./scripts/check-npm-usage.sh
ALLOW_LOCAL_TEST=true ./scripts/detect-config-drift.sh
ALLOW_LOCAL_TEST=true ./scripts/enforce-shell-standards.sh
./scripts/enforce-storage-pattern.sh
./scripts/enforce-no-timeouts.sh

echo ""
echo "✅ Local tests completed"
echo ""

# Scripts that need credentials
echo "The following scripts require environment variables:"
echo "  - detect-netlify-drift.sh (needs NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID)"
echo "  - check-deployment.sh (needs GH_TOKEN)"
echo ""
echo "To run these, set the environment variables first:"
echo "  export NETLIFY_AUTH_TOKEN=your_token"
echo "  export NETLIFY_SITE_ID=your_site_id"
echo "  export GH_TOKEN=your_github_token"
echo ""
echo "Then run:"
echo "  ALLOW_LOCAL_TEST=true ./scripts/detect-netlify-drift.sh"
echo "  ALLOW_LOCAL_TEST=true ./scripts/check-deployment.sh"