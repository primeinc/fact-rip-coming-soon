#!/bin/bash

echo "Running test..."
trap 'echo "Error on line $LINENO, exit code $?"' ERR
set -euo pipefail

echo "Step 1"
false || echo "False failed but caught"
echo "Step 2"
find . -name "*.md" > /tmp/test-find.out
echo "Step 3"
count=$(wc -l < /tmp/test-find.out)
echo "Found $count files"
echo "Step 4"
rm -f /tmp/test-find.out
echo "Done"