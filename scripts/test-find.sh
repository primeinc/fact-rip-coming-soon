#!/bin/bash
set -euo pipefail

echo "Testing find..."
count=0
while IFS= read -r file; do
    count=$((count + 1))
    echo "Found: $file"
done < <(find . -name "*.sh" | head -5)
echo "Count: $count"

echo "Alternative method..."
count2=0
find . -name "*.sh" | head -5 | while IFS= read -r file; do
    count2=$((count2 + 1))
    echo "Found: $file"
done
echo "Count2: $count2"

echo "Done"