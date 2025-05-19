#!/bin/bash
# Simple test to debug CI behavior
set -euo pipefail

# Initialize count outside subshell to avoid undefined variable
count=0

echo "Testing file reading in CI..."

# Create a test file
cat > /tmp/test.txt << EOF
line1
line2  
line3
EOF

echo "=== Method 1: standard while read ==="
count=0
while IFS= read -r line; do
    count=$((count + 1))
    echo "Method 1 read line $count: '$line'"
done < /tmp/test.txt
echo "Method 1 total lines: $count"

echo ""
echo "=== Method 2: cat with pipe ==="
count=0
cat /tmp/test.txt | while IFS= read -r line; do
    count=$((count + 1))
    echo "Method 2 read line $count: '$line'"
done
echo "Method 2 total lines: $count (note: this is wrong due to subshell)"

echo ""
echo "=== Method 3: process substitution ==="
count=0
while IFS= read -r line; do
    count=$((count + 1))
    echo "Method 3 read line $count: '$line'"
done < <(cat /tmp/test.txt)
echo "Method 3 total lines: $count"

echo ""
echo "=== Method 4: file descriptor ==="
count=0
exec 3< /tmp/test.txt
while IFS= read -r line <&3; do
    count=$((count + 1))
    echo "Method 4 read line $count: '$line'"
done
exec 3<&-
echo "Method 4 total lines: $count"

echo ""
echo "=== Test content is: ==="
cat /tmp/test.txt
echo "=== end of test content ==="

rm -f /tmp/test.txt
echo "Test complete"