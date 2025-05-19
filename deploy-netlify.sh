#!/bin/bash

# SECURITY: This script is disabled to enforce CI/CD-only deployments
echo "❌ ERROR: Manual deployment is disabled for security reasons"
echo "Deployments must go through CI/CD pipeline to ensure:"
echo "- All tests pass"
echo "- No secrets exposed"
echo "- Proper validation"
echo ""
echo "To deploy:"
echo "1. Push to main branch"
echo "2. Let CI/CD handle deployment"
echo "3. Monitor Teams notifications"
echo ""
echo "If you need emergency deployment access, contact security team"
exit 1