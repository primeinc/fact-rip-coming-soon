# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL: pnpm-Only Repository

**THIS REPOSITORY USES pnpm EXCLUSIVELY**
- DO NOT use npm or npx under any circumstances
- All dependencies must be installed with pnpm
- All scripts must be run with pnpm or pnpm exec 
- Any use of npm/npx is a blocking architectural defect
- CI/CD will fail if npm/npx is detected

## Repository Overview

Single-page React app for fact.rip - a civic memory utility. The page serves as a recruitment interface for the "Watchtower" surveillance network. Fully production-ready with comprehensive testing and deployment automation.

## Project Evolution

1. **Initial Phase**: Basic coming soon page with animations
2. **Refactor Phase**: Modularized architecture with custom hooks  
3. **Hardening Phase**: Added E2E tests, telemetry, error reporting
4. **Architecture Fix**: Major refactor to fix global state leaks and race conditions
5. **Enforcement Phase**: Added architectural invariant checks and runtime guards
6. **CI/CD Fix**: Fixed deployment pipeline, centralized config, strict validation
7. **Current State**: Production-ready with enforced patterns and validated deployments

## Recent Critical Fixes

### CI/CD Pipeline Issues Resolved
1. **Broken Smoke Tests**: Fixed missing Playwright browsers in deployment jobs
2. **Hardcoded URLs**: Centralized all deployment config in `config/deployment.json`
3. **Secret Handling**: No local env files allowed - only GitHub Secrets
4. **False Success Signals**: Added separate validation job that must pass
5. **Deployment Truth**: Deployments only valid if ALL CI checks pass

### Architectural Enforcement
1. **Storage Pattern**: All storage access MUST go through StorageContext
2. **No Direct Storage**: CI fails on any direct localStorage/sessionStorage access
3. **No Timeouts**: setTimeout/setInterval banned except for animations
4. **Runtime Guards**: Development throws errors on architectural violations
5. **Pre-commit Enforcement**: All patterns checked before commit

## Architecture

```
src/
├── components/      # UI components (all tested)
│   ├── CTAButton.tsx
│   ├── ErrorBoundary.tsx  # Uses emergency-storage only
│   ├── Modal.tsx         # Accessible with focus trap
│   ├── ProgressBar.tsx
│   ├── Pulse.tsx         # ARIA-compliant
│   ├── Seal.tsx
│   └── Title.tsx
├── contexts/       # React contexts for DI
│   ├── StorageContext.tsx # Storage adapter injection
│   └── UserJourneyContext.tsx # Centralized state management
├── hooks/          # Custom React hooks (unit tested)
│   ├── useLocalStorage.ts # Updated to use context
│   ├── useTelemetry.ts
│   └── useViewportHeight.ts
├── constants/      # Configuration
│   ├── animations.ts
│   └── timings.ts    # Animation timing constants
├── config/         # Application configuration
│   ├── branding.ts   # All text/assets
│   └── deployment.json # Deployment URLs and config
├── utils/         # Utility functions
│   ├── storage.ts        # Storage factory function
│   ├── storage-adapter.ts # Storage adapter interfaces
│   ├── emergency-storage.ts # Only for ErrorBoundary
│   └── runtime-guards.ts    # Dev-only enforcement
├── test/          # Test setup
│   └── setup.ts
├── App.tsx        # Main component (event-driven state)
└── index.css      # Tailwind + mobile optimizations

e2e/               # Playwright E2E tests
├── test-utils.ts  # Test storage injection helpers
├── test-hooks.ts  # Playwright fixtures
├── accessibility.spec.ts  # WCAG compliance tests
├── telemetry.spec.ts     # API contract tests
└── user-journey.spec.ts  # Full user flows

scripts/          # Build and enforcement scripts
├── check-npm-usage.sh      # Enforce pnpm only
├── check-no-secrets.sh     # Prevent secret leakage
├── enforce-storage-pattern.sh  # Check storage access
├── enforce-no-timeouts.sh      # Check timing patterns
├── validate-lockfile.sh        # Lockfile integrity
└── smoke-test-production.js    # Post-deploy validation
```

## Enforcement Mechanisms

### CI/CD Pipeline
1. **Pre-flight Checks**: pnpm-only, no secrets, lockfile valid
2. **Pattern Enforcement**: Storage access, timeout usage
3. **Test Suite**: Unit, E2E, accessibility must all pass
4. **Build & Deploy**: Only on main, only if tests pass
5. **Validation**: Separate job for smoke tests
6. **Truth**: Deployment only valid if ALL checks pass

### Runtime Guards (Development)
- Direct storage access throws errors
- Context usage enforced
- Architectural violations fail fast
- Disabled during tests to prevent false positives

### Pre-commit Hooks
1. pnpm-only check
2. No secrets check
3. Storage pattern enforcement  
4. Timeout pattern enforcement
5. TypeScript compilation

## Critical Design Patterns

### Storage Access
```typescript
// ❌ NEVER DO THIS
localStorage.setItem('key', 'value');

// ✅ ALWAYS DO THIS
const adapter = useStorageAdapter();
adapter.setItem('key', 'value');
```

### Animation Timing
```typescript
// ❌ NEVER DO THIS
setTimeout(() => setState(val), 300);

// ✅ ALWAYS DO THIS (with annotation)
// @animation-timeout: modal fade
setTimeout(() => setState(val), TIMINGS.modalFade);
```

### Secret Management
- NO .env files in repository
- NO hardcoded tokens/keys
- ONLY use GitHub Secrets
- CI will fail on any secret files

## Testing Infrastructure

### Unit Tests (Vitest)
- Components with proper context wrapping
- Hooks with storage adapter injection
- All tests isolated with fresh adapters

### E2E Tests (Playwright)
- Test adapter injection for isolation
- No global state between tests
- Deterministic assertions
- Multiple browser/viewport testing

### Smoke Tests
- Run against deployed URL
- Part of CI/CD validation
- Must pass for valid deployment

## Deployment

### Configuration
All deployment config in `config/deployment.json`:
- Site IDs
- Production URLs  
- Domain mappings

### Process
1. Push to main branch
2. CI runs all enforcement checks
3. Tests must pass (unit, E2E, accessibility)
4. Deploy to Netlify
5. Validation job runs smoke tests
6. Only if ALL pass is deployment valid

### URLs
- Production: https://sparkly-bombolone-c419df.netlify.app/
- All URLs centralized in config/deployment.json

## Environment Variables

```bash
# GitHub Secrets only - no local env files
NETLIFY_AUTH_TOKEN   # Netlify deployment
NETLIFY_SITE_ID      # Netlify site identifier

# Application variables
VITE_TELEMETRY_ENDPOINT      # Analytics endpoint
VITE_ERROR_REPORT_ENDPOINT   # Error reporting
VITE_SENTRY_DSN             # Optional Sentry
```

## Package Management (Strictly pnpm)

### pnpm-Only Policy
- This repository requires pnpm v8+  
- npm and npx are **not allowed**
- CI/CD enforces pnpm-only usage
- Pre-commit hooks check for violations

### Common Commands
```bash
# Install dependencies (lockfile enforced)
pnpm install --frozen-lockfile

# Add new dependency
pnpm add <package>
pnpm add -D <dev-package>

# Run any CLI tool
pnpm exec <tool> <args>      # Instead of npx
pnpm exec playwright install # Example

# Run scripts
pnpm run <script>           # Instead of npm run
pnpm dev                    # Shorthand works
```

## Security Considerations

- No secrets in code (enforced by CI)
- Emergency storage only for ErrorBoundary
- All other storage through context
- Environment variables for endpoints
- CORS-aware telemetry

## Monitoring and Validation

- Runtime guards in development
- Pre-commit enforcement
- CI/CD pattern checking
- Post-deploy smoke tests
- Separate validation job

## Contributing Guidelines

See CONTRIBUTING.md for detailed rules:
1. All storage through context
2. No setTimeout/setInterval without annotation
3. No local env files
4. All patterns enforced by CI
5. Deployment only valid if pipeline passes

## Production Readiness Checklist

✅ Architectural patterns enforced at multiple levels
✅ CI/CD pipeline with strict validation
✅ No secret leakage possible
✅ Centralized deployment configuration
✅ Smoke tests validate every deployment
✅ Runtime guards catch violations in dev
✅ Pre-commit hooks prevent bad patterns
✅ All tests must pass for valid deployment

This is now production infrastructure with enforced patterns, validated deployments, and no possibility of architectural drift.