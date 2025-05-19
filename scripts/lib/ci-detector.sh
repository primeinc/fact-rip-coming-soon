#!/usr/bin/env bash
# Centralized CI detection logic

set -euo pipefail

detect_ci_environment() {
    # Single source of truth for CI detection
    CI_ENV="${CI_NAME:-${CI:-}}"
    
    if [ -n "${GITHUB_ACTIONS:-}" ]; then
        echo "github-actions"
        return 0
    elif [ -n "${GITLAB_CI:-}" ]; then
        echo "gitlab"
        return 0
    elif [ -n "${CIRCLECI:-}" ]; then
        echo "circleci"
        return 0
    elif [ "${ALLOW_LOCAL_TEST:-}" = "true" ]; then
        echo "local-test"
        return 0
    elif [ -n "$CI_ENV" ]; then
        echo "generic-ci"
        return 0
    else
        return 1
    fi
}

require_ci_environment() {
    CI_TYPE=$(detect_ci_environment || true)
    
    if [ -z "$CI_TYPE" ]; then
        echo "❌ CI environment required" >&2
        echo "" >&2
        echo "This script requires CI environment. For local testing:" >&2
        echo "  ALLOW_LOCAL_TEST=true $0" >&2
        echo "" >&2
        echo "WARNING: Local testing may differ from CI behavior." >&2
        return 1
    fi
    
    echo "✅ Running in: $CI_TYPE"
    return 0
}