#!/usr/bin/env bash

set -euo pipefail

# Enforce shell script standards - no hardcoding, proper error handling
echo "🔍 Enforcing shell script standards..."

VIOLATIONS=0

# Find all shell scripts
SHELL_SCRIPTS=$(find . -name "*.sh" -not -path "./node_modules/*" -not -path "./.git/*" | tr '\n' ' ')

for script in $SHELL_SCRIPTS; do
    echo "Checking: $script"

    # Check for hardcoded values (skip checking for patterns that are used as defaults)
    if [ "$script" != "./scripts/enforce-shell-standards.sh" ] && [ "$script" != "./scripts/detect-config-drift.sh" ]; then
        # Generic patterns that indicate hardcoded values
        PATTERNS="${ENFORCE_STANDARDS_PATTERNS:-[a-f0-9]+-[a-f0-9]+-[a-f0-9]+-[a-f0-9]+-[a-f0-9]+}"
        HARDCODED=$(grep -E "$PATTERNS" "$script" | grep -v "CONFIG_DRIFT_PATTERNS" | grep -v "ENFORCE_STANDARDS_PATTERNS" || true)
        if [ ! -z "$HARDCODED" ]; then
            echo "❌ Hardcoded values in $script:"
            echo "$HARDCODED"
            VIOLATIONS=$((VIOLATIONS + 1))
        fi
    fi

    # Check for proper error handling
    if ! grep -q "set -euo pipefail" "$script"; then
        echo "❌ Missing 'set -euo pipefail' in $script"
        VIOLATIONS=$((VIOLATIONS + 1))
    fi

    # Check for OS-specific commands without checks
    OS_SPECIFIC=("brew" "apt-get" "yum")
    for cmd in "${OS_SPECIFIC[@]}"; do
        if grep -q "$cmd" "$script"; then
            # Check if there's OS detection or command availability check
            if ! grep -B5 "$cmd" "$script" | grep -qE "(if.*which|command -v|OSTYPE|uname|CI|GITHUB_ACTIONS)"; then
                echo "❌ OS-specific command '$cmd' without proper checks in $script"
                VIOLATIONS=$((VIOLATIONS + 1))
            fi
        fi
    done

    # Check for direct file operations without checks
    UNSAFE_OPS=$(grep -E "^[[:space:]]*(cat|jq|mkdir|rm|cp|mv)\s" "$script" | 
                 grep -v "|| true" | 
                 grep -v "|| exit" | 
                 grep -v "2>/dev/null" | 
                 grep -v "<<" || true)
    if [ ! -z "$UNSAFE_OPS" ]; then
        echo "⚠️  File operations without error handling in $script:"
        echo "$UNSAFE_OPS"
        VIOLATIONS=$((VIOLATIONS + 1))
    fi

    # Check for environment variable usage without defaults
    ENV_USAGE=$(grep -oE '\$\{[A-Z_]+[A-Z0-9_]*\}' "$script" | sort -u || true)
    for env in $ENV_USAGE; do
        # Remove the ${} wrapper to get the variable name
        var_name=$(echo "$env" | sed 's/\${\(.*\)}/\1/')
        if ! grep -q "\${${var_name}:-\|${var_name}:?" "$script"; then
            echo "⚠️  Environment variable $env used without default in $script"
        fi
    done
done

# Check for consistent shebang
echo ""
echo "🔍 Checking shebang consistency..."
for script in $SHELL_SCRIPTS; do
    SHEBANG=$(head -1 "$script")
    if [ "$SHEBANG" != "#!/bin/bash" ] && [ "$SHEBANG" != "#!/usr/bin/env bash" ]; then
        echo "❌ Non-standard shebang in $script: $SHEBANG"
        VIOLATIONS=$((VIOLATIONS + 1))
    fi
done

# Check for executable permissions
echo ""
echo "🔍 Checking executable permissions..."
for script in $SHELL_SCRIPTS; do
    if [ ! -x "$script" ]; then
        echo "❌ Script not executable: $script"
        VIOLATIONS=$((VIOLATIONS + 1))
    fi
done

# Summary
echo ""
if [ "$VIOLATIONS" -eq 0 ]; then
    echo "✅ All shell scripts meet standards"
else
    echo "❌ Found $VIOLATIONS violations in shell scripts"
    exit 1
fi