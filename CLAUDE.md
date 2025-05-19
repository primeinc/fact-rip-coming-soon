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

**Current State: Production-Ready with Real Enforcement**
- CI/CD enforces comprehensive standards with no manual bypass
- Full test coverage for UI, E2E, and accessibility
- Real-time deployment monitoring and alerting
- Zero-drift architecture with automated validation

## Recent Improvements (2025-05-19)

1. **Local Testing Scripts**:
   - Created `preflight-check.sh` for tool validation
   - Created `cycle-validation.sh` for full test cycles
   - Added pnpm scripts for local enforcement testing
   - Documentation consolidated and updated

2. **CI/CD Fixes**:
   - Fixed missing environment variables in workflows
   - Added GH_TOKEN to health checks
   - Updated TODO.md with completed items
   - All enforcement scripts now properly validated

3. **Documentation Overhaul**:
   - Consolidated historical docs into ARCHIVE.md
   - Updated README.md with comprehensive guide
   - Created scripts/README.md for enforcement docs
   - Validated all documentation against codebase

## Architecture & Design Patterns

### React Architecture
- **Component Structure**: Functional components with hooks
- **State Management**: React Context + xstate for complex flows
- **Error Boundaries**: Comprehensive error handling with fallbacks
- **Performance**: Memoization, lazy loading, code splitting

### Storage Pattern (CRITICAL)
```typescript
// NEVER access localStorage directly!
// ALWAYS use StorageContext:
const adapter = useStorageAdapter();
adapter.setItem('key', 'value');
```

### Animation System
- Framer Motion for all animations
- CSS variables for dynamic viewport height
- Reduced motion support for accessibility
- Timing constants centralized

### Testing Strategy
1. **Unit Tests**: Vitest for components and hooks
2. **E2E Tests**: Playwright across all browsers
3. **Accessibility**: axe-core integration
4. **Adversarial**: Error boundary validation
5. **Mobile**: Specific viewport testing

## Development Workflow

### Quick Start
```bash
# Clone and install
git clone https://github.com/primeinc/fact-rip-coming-soon.git
cd fact-rip-coming-soon
pnpm install --frozen-lockfile

# Run preflight checks
pnpm run preflight

# Development
pnpm dev

# Run all tests locally
pnpm run validate
```

### Before Committing
1. Run `pnpm run validate` for full test cycle
2. Check `pnpm run test:local:all` for enforcement
3. Review changes with `git diff`
4. Use meaningful commit messages
5. Let CI/CD handle deployment

### Common Tasks
```bash
# Local testing without CI
pnpm run test:local:npm      # Check pnpm-only
pnpm run test:local:config   # Check config drift
pnpm run test:local:shell    # Check shell scripts

# Full validation
pnpm run validate            # Runs all tests and builds

# Individual test suites
pnpm test                    # Unit tests (watch)
pnpm test:e2e               # E2E tests
pnpm run typecheck          # TypeScript checking
```

## Deployment & Monitoring

### Deployment Process
1. Push to main branch triggers CI/CD
2. All tests must pass (unit, E2E, enforcement)
3. Automated deployment to Netlify
4. Post-deployment validation
5. Teams notification on success/failure

### Production Monitoring
- Health checks every 15 minutes
- Drift detection every 10 minutes
- High failure rate alerting
- Comprehensive error tracking

### URLs & Endpoints
- Production: https://sparkly-bombolone-c419df.netlify.app/
- Deploy Config: config/deployment.json
- CI/CD: GitHub Actions
- Monitoring: Teams webhooks

## Security Considerations

### Enforced Standards
1. **No Direct Storage Access**: StorageContext only
2. **No Hardcoded Values**: Everything in config
3. **No Manual Deploys**: CI/CD only
4. **No npm/npx**: pnpm exclusively
5. **No Exposed Secrets**: GitHub Secrets only

### Security Headers
- CSP configured
- HSTS enabled  
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin

## Known Limitations & Future Work

### Current Limitations
1. **Integration Tests**: Only UI/E2E, not full API
2. **Secret Rotation**: Manual process
3. **Performance Monitoring**: Basic only
4. **A/B Testing**: Not implemented
5. **Analytics**: Minimal telemetry

### Planned Improvements
1. Full integration test suite
2. Automated secret rotation
3. Performance budgets
4. Feature flags system
5. Enhanced analytics

## Troubleshooting

### Common Issues

**Tests failing locally but not in CI?**
- Check Node version (must be >=18)
- Run `pnpm install --frozen-lockfile`
- Clear Playwright browsers: `pnpm exec playwright install --force`

**Deployment not working?**
- Verify GitHub Secrets exist: `gh secret list`
- Check Netlify status page
- Review deployment logs in GitHub Actions

**TypeScript errors?**
- Run `pnpm run typecheck`
- Check for missing types: `pnpm add -D @types/...`
- Ensure tsconfig.json is correct

## Best Practices

### Code Quality
1. Always run tests before pushing
2. Use meaningful variable names
3. Comment complex logic (but not obvious code)
4. Keep functions small and focused
5. Use TypeScript strictly

### Git Workflow
1. Feature branches for new work
2. Squash commits when merging
3. Reference issue numbers
4. Use conventional commits
5. Never force push to main

### Performance
1. Lazy load large components
2. Memoize expensive calculations
3. Use React.memo for pure components
4. Optimize images and assets
5. Monitor bundle size

---

Last Updated: 2025-05-19
Version: 2.0.0
Status: Production-ready with comprehensive enforcement