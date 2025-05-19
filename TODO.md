# TODO Tracker

## Open TODOs
- [ ] PREFLIGHT-001: Install and validate all required CLI/tools for lint, YAML, CI/CD audit
- [ ] CYCLE-001: Stage all current changes and run preflight validation
- [ ] DRIFT-001: Fix Netlify API environment variable parsing issue
- [ ] YAML-001: Fix YAML lint errors in GitHub workflows (indentation, line length, syntax)
- [ ] SHELL-002: Fix shell script standards violations (18 violations found) - missing set -euo pipefail and hardcoded values

## Closed TODOs
- [x] SHELL-001: Fix shell script EOF error in enforce-shell-standards.sh (line 81) - Fixed quote pattern in line 49
- [x] CI-001: Fix broken shell script error in enforce-shell-standards.sh (line 81 EOF) - Same fix as SHELL-001

## Expected/Adversarial TODOs
- [ ] E2E-001: Adversarial endpoints tests failing (8 failures) - These tests are designed to fail when checking error boundaries with wrong text
- [ ] E2E-002: Test expects 'System malfunction detected' but app shows 'The Loop Fractures' - Mismatch in error text

---
Last Updated: 2025-05-19T12:25:00Z