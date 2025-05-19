# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL: GitHub Secrets Management

**MANDATORY: ALL SECRETS MUST BE IN GITHUB SECRETS**
- NEVER store secrets in code, .env files, or config files
- ALWAYS use GitHub Secrets via `gh secret set` command
- ALWAYS verify secrets exist with `gh secret list`
- If user provides a secret/webhook URL, IMMEDIATELY add it to GitHub Secrets
- CI/CD will fail if secrets are not properly configured

## CRITICAL: pnpm-Only Repository

**THIS REPOSITORY USES pnpm EXCLUSIVELY**
- DO NOT use npm or npx under any circumstances
- All dependencies must be installed with pnpm
- All scripts must be run with pnpm or pnpm exec
- Any use of npm/npx is a blocking architectural defect
- CI/CD will fail if npm/npx is detected

## Repository Overview

Single-page React app for fact.rip - a civic memory utility. The page serves as a recruitment interface for the "Watchtower" surveillance network.

**Current State: CI Theater with Critical Gaps**
- CI/CD enforces many checks but manual bypass remains possible
- Comprehensive testing suite exists but doesn't cover real integrations
- Alert infrastructure built but not properly routed/deduplicated

## Secret Management Protocol

1. **When User Provides a Secret/URL**:
   ```bash
   # FIRST: Add to GitHub Secrets immediately
   echo "SECRET_VALUE" | gh secret set SECRET_NAME --repo primeinc/fact-rip-coming-soon

   # VERIFY: Always confirm it was added
   gh secret list --repo primeinc/fact-rip-coming-soon
   ```

2. **Required Secrets**:
   - `NETLIFY_AUTH_TOKEN` - Netlify deployment authentication
   - `NETLIFY_SITE_ID` - Netlify site identifier
   - `TEAMS_WEBHOOK_URL` - Microsoft Teams webhook for notifications

3. **Security Protocol**:
   - NEVER echo secrets to console
   - NEVER save secrets in files
   - ALWAYS use GitHub Secrets API
   - CI/CD enforces secret usage

## Actual vs Claimed Enforcement

### What's Actually Working:
1. **pnpm-only in CI** - npm/npx blocked in automated pipelines
2. **PR secret scanning** - Blocks PRs with exposed credentials
3. **UI smoke tests** - Validates basic page elements load
4. **Build/deploy automation** - CI does deploy to Netlify
5. **Basic drift detection** - Checks for config inconsistencies
6. **GitHub Secrets** - All secrets properly managed via GitHub

### Critical Gaps (Not Actually Enforced):
1. **Manual CLI deploys still possible** - Human operators retain Netlify access
2. **No real integration testing** - Only UI elements checked, not APIs/data
3. **No continuous secret scanning** - Only scans PRs, not full history
4. **Rollback testing is simulated** - Not proven on live production traffic
5. **No privilege restrictions** - Full admin access remains
6. **Alert noise problem** - No deduplication or smart routing

## Known Security Vulnerabilities

1. **Direct Netlify Access**: Project Maintainer (user@example.com) has CLI access
2. **Manual Deploy Vector**: Can bypass all CI checks via `netlify deploy`
3. **Historical Secrets**: No periodic scanning of git history
4. **Incomplete E2E**: Smoke tests don't validate actual functionality

## Architecture

```
src/
├── components/      # UI components (all tested at unit level)
├── contexts/       # React contexts for DI
├── hooks/          # Custom React hooks (unit tested)
├── constants/      # Configuration
├── config/         # Application configuration
├── utils/          # Utility functions
├── test/          # Test setup
└── App.tsx        # Main component

e2e/               # Playwright E2E tests (UI-only)
scripts/          # Enforcement scripts (some broken)
```

## False Claims to Avoid

DO NOT claim the following without verification:
- "Zero-drift enforcement" - Manual deploys still possible
- "Bulletproof production" - Many gaps remain
- "No manual overrides" - CLI access exists
- "Comprehensive alerting" - Noise and routing issues
- "Proven rollbacks" - Only simulated, not real

## Required Fixes for True Zero-Drift

1. **Revoke all human Netlify access** - Only CI should deploy
2. **Implement real integration tests** - APIs, data, external services
3. **Continuous secret scanning** - Full history, automated rotation
4. **Production chaos testing** - Real traffic, real rollbacks
5. **Alert governance** - Deduplication, routing, escalation

## Current Deployment State

- Production URL: https://sparkly-bombolone-c419df.netlify.app/
- Site ID: 33e2505e-7a9d-4867-8fbf-db91ca602087
- Last deployment: Via CI (but manual still possible)
- Smoke tests: Pass (but only check UI elements)

## Development Workflow

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Run tests
pnpm test:all  # Runs all tests (unit, E2E, etc)

# Local development
pnpm dev

# Build
pnpm build

# Deploy (DON'T DO THIS - should only happen via CI)
# pnpm exec netlify deploy --prod --dir=dist
```

## Security Considerations

- Secrets MUST be in GitHub Secrets (enforced)
- Secrets CAN still be in git history (not continuously scanned)
- Manual deploys CAN bypass all CI checks
- Rollbacks are NOT proven on production traffic
- Alerts are NOT properly deduplicated

## The Truth About This Codebase

This is a well-architected React app with good CI/CD practices, but:
1. It's not "zero-drift" - manual overrides exist
2. It's not "bulletproof" - critical gaps remain
3. It's not fully tested - only UI, not integrations
4. It's not secure - privilege escalation possible

Use this codebase as a good starting point, but don't trust the "production-ready" claims without closing all identified gaps.

---
Last Updated: 2025-05-19
Status: CI Theater - Looks good but has critical bypass vectors