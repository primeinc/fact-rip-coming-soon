#!/bin/bash

set -euo pipefail

# Scan git history for any exposed secrets
echo "🔐 Scanning git history for secrets..."

SECRETS_FOUND=0

# Check if gitleaks is installed
if ! command -v gitleaks &> /dev/null; then
    echo "📦 Installing gitleaks..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install gitleaks
    else
        # For CI/Linux environments
        wget https://github.com/gitleaks/gitleaks/releases/download/v8.16.1/gitleaks_8.16.1_linux_x64.tar.gz
        tar -xzf gitleaks_8.16.1_linux_x64.tar.gz
        sudo mv gitleaks /usr/local/bin/
        rm gitleaks_8.16.1_linux_x64.tar.gz
    fi
fi

# Run gitleaks on git history
echo "🔍 Running gitleaks on full git history..."
if gitleaks detect --source . --verbose; then
    echo "✅ No secrets found in git history"
else
    echo "❌ Secrets detected in git history!"
    SECRETS_FOUND=1
fi

# Additional manual checks for common patterns
echo ""
echo "🔍 Checking for common secret patterns..."

# Check for API keys, tokens, passwords in history
PATTERNS=(
    "NETLIFY_AUTH_TOKEN"
    "NETLIFY_SITE_ID"
    "API_KEY"
    "SECRET"
    "PASSWORD"
    "TOKEN"
    "PRIVATE_KEY"
    "ACCESS_KEY"
)

for pattern in "${PATTERNS[@]}"; do
    echo "Checking for $pattern..."
    FOUND=$(git log -p -G"$pattern" --all | grep -E "$pattern" | grep -v "scripts/scan-secret-history.sh" || true)
    if [ ! -z "$FOUND" ]; then
        echo "⚠️  Found possible secret pattern: $pattern"
        echo "$FOUND" | head -5 || true
        SECRETS_FOUND=1
    fi
done

# Check for base64 encoded secrets
echo ""
echo "🔍 Checking for base64 encoded secrets..."
BASE64_PATTERN='[A-Za-z0-9+/]{40,}={0,2}'
BASE64_FOUND=$(git log -p --all | grep -E "$BASE64_PATTERN" | grep -v "playwright-report" | head -20 || true)
if [ ! -z "$BASE64_FOUND" ]; then
    echo "⚠️  Found possible base64 encoded secrets (showing first 20 matches)"
    SECRETS_FOUND=1
fi

# Check deleted files that might contain secrets
echo ""
echo "🔍 Checking deleted files for secret patterns..."
DELETED_FILES=$(git log --diff-filter=D --summary | grep "delete mode" | awk '{print $NF}')
for file in $DELETED_FILES; do
    if [[ "$file" =~ \.(env|key|pem|p12|pfx)$ ]]; then
        echo "⚠️  Deleted file with sensitive extension: $file"
        SECRETS_FOUND=1
    fi
done

# Summary
echo ""
if [ "$SECRETS_FOUND" -eq 0 ]; then
    echo "✅ No secrets detected in git history"
    echo "ℹ️  Note: This is not exhaustive. Consider periodic manual audits."
else
    echo "❌ Potential secrets found in git history!"
    echo "Action required:"
    echo "1. Review findings above"
    echo "2. Rotate any exposed credentials immediately"
    echo "3. Use git filter-branch or BFG to clean history if needed"
    echo "4. Force push cleaned history (coordinate with team)"
    exit 1
fi