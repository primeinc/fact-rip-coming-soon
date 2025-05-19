#!/bin/bash
set -euo pipefail

my_function() {
    local file="$1"
    echo "Processing: $file"
    # Simulate processing
    return 0
}

echo "Test 1: Simple file list"
while IFS= read -r file; do
    echo "Found: $file"
    my_function "$file"
done < <(echo -e "file1.txt\nfile2.txt\nfile3.txt")

echo "Test 2: From find"
find . -name "*.md" | head -5 | while IFS= read -r file; do
    echo "Found: $file"
    my_function "$file"
done

echo "Done"