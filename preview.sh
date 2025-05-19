#!/bin/bash
set -euo pipefail

echo "Building fact.rip coming soon page..."
pnpm run build

echo "Starting preview server..."
pnpm run preview