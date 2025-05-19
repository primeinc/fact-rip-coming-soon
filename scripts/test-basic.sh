#!/bin/bash
set -euo pipefail

echo "Test script"

if [ "true" = "true" ]; then
    echo "Success"
    exit 0
fi

echo "Should not reach here"