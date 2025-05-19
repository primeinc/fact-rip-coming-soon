#!/bin/bash
set -euo pipefail

# Enforce pnpm-only usage with explicit annotation exceptions
# Documentation can show npm/npx examples only with proper annotations

ALLOW_LOCAL_TEST="${ALLOW_LOCAL_TEST:-false}"

# Check if running in CI
if [ "$ALLOW_LOCAL_TEST" != "true" ] && [ -z "${GITHUB_ACTIONS:-}" ]; then
    echo "⚠️  This script should run in CI. Use ALLOW_LOCAL_TEST=true for local testing."
    exit 1
fi

FOUND_VIOLATIONS=0
DOCUMENTED_EXCEPTIONS=()

# Function to check a file for npm/npx usage
check_file() {
    local file="$1"
    local in_code_block=false
    local annotation_active=false
    local line_number=0
    
    while IFS= read -r line; do
        ((line_number++))
        
        # Detect code block boundaries
        if echo "$line" | grep -qE '^```'; then
            if [ "$in_code_block" = false ]; then
                in_code_block=true
            else
                in_code_block=false
                annotation_active=false
            fi
            continue
        fi
        
        # Check for annotation
        if echo "$line" | grep -qE '<!--\s*pnpm-lint-disable\s*-->'; then
            annotation_active=true
            continue
        fi
        
        # Check for npm/npx usage in code blocks
        if [ "$in_code_block" = true ]; then
            if echo "$line" | grep -qE '(npm[[:space:]]|npx[[:space:]])'; then
                if [ "$annotation_active" = true ]; then
                    DOCUMENTED_EXCEPTIONS+=("$file:$line_number - Annotated exception: $line")
                else
                    echo "❌ Found unannotated npm/npx usage:"
                    echo "   File: $file:$line_number"
                    echo "   Line: $line"
                    echo "   Fix: Add <!-- pnpm-lint-disable --> before the code block or convert to pnpm"
                    echo ""
                    FOUND_VIOLATIONS=1
                fi
            fi
        fi
    done < "$file"
}

echo "🔍 Checking for npm/npx usage with annotation support..."

# Check all files (excluding node_modules and hidden directories)
find . -type f \( -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.sh" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.*" \
    -not -path "./.git/*" \
    -not -path "./test-results/*" \
    -not -path "./playwright-report/*" | while read -r file; do
    
    # Skip binary files
    if file "$file" | grep -q "binary"; then
        continue
    fi
    
    # Check the file
    check_file "$file"
done

# Report results
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 pnpm Enforcement Report"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ${#DOCUMENTED_EXCEPTIONS[@]} -gt 0 ]; then
    echo ""
    echo "📋 Documented Exceptions Found: ${#DOCUMENTED_EXCEPTIONS[@]}"
    echo "These npm/npx uses are properly annotated and allowed:"
    for exception in "${DOCUMENTED_EXCEPTIONS[@]}"; do
        echo "   - $exception"
    done
fi

echo ""
if [ $FOUND_VIOLATIONS -eq 1 ]; then
    echo "❌ FAILED: Found unannotated npm/npx usage"
    echo ""
    echo "This repository enforces pnpm-only usage. To fix:"
    echo "1. Convert to pnpm (npm → pnpm, npx → pnpm exec), OR"
    echo "2. Add <!-- pnpm-lint-disable --> annotation before code blocks that must show npm/npx"
    echo ""
    echo "Example of annotated exception:"
    echo "  <!-- pnpm-lint-disable -->"
    echo "  \`\`\`bash"
    echo "  npm install  # This is shown for comparison only"
    echo "  \`\`\`"
    exit 1
else
    echo "✅ PASSED: All npm/npx usage is either converted or properly annotated"
fi