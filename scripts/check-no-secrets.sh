#!/bin/bash
set -euo pipefail

# Check for any files that might contain secrets
FORBIDDEN_FILES=".env .env.local .env.production"
FOUND_SECRETS=false

for file in $FORBIDDEN_FILES; do
  if [ -f "$file" ]; then
    echo "❌ Found forbidden file: $file"
    echo "Secrets must only be stored in GitHub Secrets, never in files!"
    FOUND_SECRETS=true
  fi
done

# Check for hardcoded tokens in code
BLACKLIST_PATTERNS="nfp_|ghp_|netlify.*token.*=|api.*key.*=|secret.*=|password.*="
EXCLUDE_PATTERNS="secrets\.NETLIFY_AUTH_TOKEN|\$NETLIFY_AUTH_TOKEN|\$GITHUB_TOKEN|check-no-secrets\.sh"

if grep -r -i "$BLACKLIST_PATTERNS" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="*.md" \
  --exclude="check-no-secrets.sh" \
  . 2>/dev/null | \
  grep -v -E "$EXCLUDE_PATTERNS" | \
  grep -v "^#"; then
  echo "❌ Found hardcoded tokens in code!"
  FOUND_SECRETS=true
fi

if [ "$FOUND_SECRETS" = true ]; then
  echo ""
  echo "CI/CD FAILED: Secrets found in repository"
  echo "Remove all secret files and use GitHub Secrets instead"
  exit 1
fi

echo "✅ No secrets found in repository"