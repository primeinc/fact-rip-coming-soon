#!/bin/bash
set -euo pipefail

# Enforce pnpm-only usage with explicit annotation exceptions
# Documentation can show npm/npx examples only with proper annotations

ALLOW_LOCAL_TEST="${ALLOW_LOCAL_TEST:-false}"
VERBOSE="${VERBOSE:-false}"
TARGET_FILE="${1:-}"

# Check if running in CI
if [ "$ALLOW_LOCAL_TEST" != "true" ] && [ -z "${GITHUB_ACTIONS:-}" ]; then
    echo "⚠️  This script should run in CI. Use ALLOW_LOCAL_TEST=true for local testing."
    exit 1
fi

FOUND_VIOLATIONS=0
DOCUMENTED_EXCEPTIONS=()
TEMP_FILE=$(mktemp)

# Function to check a file for npm/npx usage
check_file() {
    local file="$1"
    local in_code_block=false
    local annotation_active=false
    local line_number=0
    local file_violations=0
    
    [ "$VERBOSE" = "true" ] && echo "DEBUG: Starting to read file: $file"
    [ "$VERBOSE" = "true" ] && echo "DEBUG: File content preview: $(head -5 "$file" | cat -n)"
    
    # Read file using a different approach that works in CI
    while IFS= read -r line; do
        line_number=$((line_number + 1))
        [ "$VERBOSE" = "true" ] && [ $line_number -le 5 ] && echo "DEBUG: Processing line $line_number: $line"
        
        # Detect code block boundaries
        if echo "$line" | grep -qE '^```'; then
            if [ "$in_code_block" = false ]; then
                in_code_block=true
                [ "$VERBOSE" = "true" ] && echo "DEBUG: Entering code block at $file:$line_number"
            else
                in_code_block=false
                annotation_active=false
                [ "$VERBOSE" = "true" ] && echo "DEBUG: Exiting code block at $file:$line_number"
            fi
            continue
        fi
        
        # Check for annotation
        if echo "$line" | grep -qE '<!--\s*pnpm-lint-disable\s*-->'; then
            annotation_active=true
            [ "$VERBOSE" = "true" ] && echo "DEBUG: Found annotation at $file:$line_number"
            continue
        fi
        
        # Check for npm/npx usage in code blocks
        if [ "$in_code_block" = true ]; then
            # Look for npm/npx commands at the start of lines or after spaces
            # But NOT: pnpm commands
            if echo "$line" | grep -qE '^[[:space:]]*(npm|npx)[[:space:]]' && \
               ! echo "$line" | grep -qE 'pnpm'; then
                [ "$VERBOSE" = "true" ] && echo "DEBUG: Potential npm/npx at $file:$line_number: $line"
                if [ "$annotation_active" = true ]; then
                    echo "EXCEPTION:$file:$line_number - Annotated exception: $line" >> "$TEMP_FILE"
                else
                    echo "❌ Found unannotated npm/npx usage:"
                    echo "   File: $file:$line_number"
                    echo "   Line: $line"
                    echo "   Fix: Add <!-- pnpm-lint-disable --> before the code block or convert to pnpm"
                    echo ""
                    echo "VIOLATION" >> "$TEMP_FILE"
                fi
            fi
        fi
    done < "$file"
    [ "$VERBOSE" = "true" ] && echo "DEBUG: Finished reading file: $file (line_number=$line_number)"
}

echo "🔍 Checking for npm/npx usage with annotation support..."
echo ""

[ "$VERBOSE" = "true" ] && echo "DEBUG: Entering file check section"

# If a specific file is provided, only check that file
if [ -n "$TARGET_FILE" ]; then
    [ "$VERBOSE" = "true" ] && echo "DEBUG: TARGET_FILE is set to: $TARGET_FILE"
    if [ -f "$TARGET_FILE" ]; then
        [ "$VERBOSE" = "true" ] && echo "Checking single file: $TARGET_FILE"
        [ "$VERBOSE" = "true" ] && echo "DEBUG: File exists, checking if readable: $(stat -f '%A' "$TARGET_FILE" 2>/dev/null || stat -c '%a' "$TARGET_FILE" 2>/dev/null || echo 'stat failed')"
        [ "$VERBOSE" = "true" ] && echo "DEBUG: File size: $(wc -c < "$TARGET_FILE" || echo 'wc failed')"
        [ "$VERBOSE" = "true" ] && echo "DEBUG: First line: $(head -1 "$TARGET_FILE" || echo 'head failed')"
        check_file "$TARGET_FILE"
    else
        echo "Error: File not found: $TARGET_FILE"
        exit 1
    fi
else
    [ "$VERBOSE" = "true" ] && echo "DEBUG: TARGET_FILE is empty, checking all files"
    # Check all files (excluding node_modules and hidden directories)
    # Using a temporary file to avoid subshell issues
    FIND_TEMP=$(mktemp)
    find . -type f \( -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.sh" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/.*" \
        -not -path "./.git/*" \
        -not -path "./test-results/*" \
        -not -path "./playwright-report/*" \
        -not -path "./test/test-annotation-system.md" \
        -not -path "./test/temp-*.md" \
        -not -path "./scripts/test-annotation-enforcement.sh" > "$FIND_TEMP"
    
    while IFS= read -r file; do
        # Skip binary files
        if file "$file" | grep -q "binary"; then
            continue
        fi
        
        # Check the file
        [ "$VERBOSE" = "true" ] && echo "Checking: $file"
        check_file "$file"
    done < "$FIND_TEMP"
    rm -f "$FIND_TEMP"
    [ "$VERBOSE" = "true" ] && echo "DEBUG: Done scanning files"
fi

[ "$VERBOSE" = "true" ] && echo "DEBUG: About to count violations"

# Count violations and exceptions from temp file
if [ -f "$TEMP_FILE" ]; then
    [ "$VERBOSE" = "true" ] && echo "DEBUG: TEMP_FILE exists at $TEMP_FILE"
    FOUND_VIOLATIONS=$(grep -c "^VIOLATION$" "$TEMP_FILE" || true)
    [ "$VERBOSE" = "true" ] && echo "DEBUG: FOUND_VIOLATIONS=$FOUND_VIOLATIONS"
    while IFS= read -r line; do
        if [[ "$line" == EXCEPTION:* ]]; then
            DOCUMENTED_EXCEPTIONS+=("${line#EXCEPTION:}")
        fi
    done < "$TEMP_FILE"
    rm -f "$TEMP_FILE"
else
    [ "$VERBOSE" = "true" ] && echo "DEBUG: TEMP_FILE does not exist"
fi

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
if [ $FOUND_VIOLATIONS -gt 0 ]; then
    echo "❌ FAILED: Found $FOUND_VIOLATIONS unannotated npm/npx usage(s)"
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
    exit 0
fi