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
5. **Current State**: Production-ready with proper test isolation and deterministic state management

## Recent Architecture Refactor

### Problems Fixed
1. **Global Storage Adapter**: Replaced singleton with context-injected adapters to prevent test state leakage
2. **Race Conditions**: Removed useEffect that automatically set `hasVisited` - now only set on user action
3. **Test Isolation**: Each test now gets a fresh storage adapter instance
4. **Window Globals**: Replaced brittle `window.__PLAYWRIGHT_TEST__` checks with proper dependency injection

### Key Changes
1. Created `StorageContext` provider for dependency injection
2. Added `test-utils.ts` to inject test storage adapters
3. Updated `App.tsx` to remove automatic state mutations
4. Fixed modal logic to show correct content based on actual state
5. Added proper timing to state transitions

## Architecture

```
src/
├── components/      # UI components (all tested)
│   ├── CTAButton.tsx
│   ├── ErrorBoundary.tsx  # Enhanced with error reporting
│   ├── Modal.tsx         # Accessible with focus trap
│   ├── ProgressBar.tsx
│   ├── Pulse.tsx         # ARIA-compliant
│   ├── Seal.tsx
│   └── Title.tsx
├── contexts/       # React contexts for DI
│   └── StorageContext.tsx # Storage adapter injection
├── hooks/          # Custom React hooks (unit tested)
│   ├── useLocalStorage.ts # Updated to use context
│   ├── useTelemetry.ts
│   └── useViewportHeight.ts
├── constants/      # Configuration
│   └── animations.ts
├── config/         # Branding and text
│   └── branding.ts
├── utils/         # Utility functions
│   ├── storage.ts  # Storage factory function
│   └── storage-adapter.ts # Storage adapter interfaces
├── test/          # Test setup
│   └── setup.ts
├── App.tsx        # Main component (no more auto-mutations)
└── index.css      # Tailwind + mobile optimizations

e2e/               # Playwright E2E tests
├── test-utils.ts  # Test storage injection helpers
├── accessibility.spec.ts  # WCAG compliance tests
├── telemetry.spec.ts     # API contract tests
└── user-journey.spec.ts  # Full user flows (updated)
```

## Testing Infrastructure

### Unit Tests (Vitest)
- Components: Modal, etc.
- Hooks: useLocalStorage (now with context)
- Coverage for all critical paths

### E2E Tests (Playwright)
- User journeys (first visit, returning) - now with proper isolation
- Mobile viewports
- Keyboard navigation
- Network failure scenarios
- LocalStorage disabled
- Error boundary recovery
- Accessibility (axe-core)
- Telemetry contract validation

### Test Isolation Strategy
- Each test gets a fresh storage adapter via `injectTestStorageAdapter`
- No global state persists between tests
- Proper timing for state transitions
- Deterministic test outcomes

## CI/CD Pipeline

### GitHub Actions Workflow
1. Type checking + linting
2. Unit tests
3. E2E tests (multiple browsers)
4. Build artifacts
5. Auto-deploy to Netlify (main branch)

### Pre-commit Hooks (Husky)
- TypeScript compilation
- ESLint checks

## Environment Variables

```bash
VITE_TELEMETRY_ENDPOINT      # Analytics endpoint
VITE_ERROR_REPORT_ENDPOINT   # Error reporting
VITE_SENTRY_DSN             # Optional Sentry
VITE_ENABLE_TELEMETRY       # Feature flag
VITE_ENABLE_ERROR_REPORTING # Feature flag
```

## Package Management (Strictly pnpm)

### pnpm-Only Policy
- This repository requires pnpm v8+  
- npm and npx are **not allowed**
- CI/CD enforces pnpm-only usage
- All developers must use pnpm exclusively

### Common Commands
```bash
# Install dependencies (lockfile enforced)
pnpm install --frozen-lockfile

# Add new dependency
pnpm add <package>
pnpm add -D <dev-package>

# Run any CLI tool
pnpm exec <tool> <args>      # Instead of npx
pnpm exec tailwindcss init   # Example
pnpm exec playwright install # Example

# Run scripts
pnpm run <script>           # Instead of npm run
pnpm dev                    # Shorthand works

# Clean install
rm -rf node_modules
pnpm install
```

### CI/CD Enforcement  
The GitHub Actions workflow:
1. Uses pnpm/action-setup
2. Caches pnpm dependencies
3. Runs all commands with pnpm
4. Fails on any npm/npx usage

## Key Features Implemented

1. **State Persistence**: localStorage with context-based adapters
2. **Telemetry**: Optional backend integration  
3. **Error Boundaries**: With user reporting
4. **Accessibility**: WCAG AA compliant
5. **Mobile Optimization**: Safe areas, dynamic viewport
6. **Animation System**: Symbolic timing in constants
7. **Branding Config**: All text/assets centralized
8. **Test Isolation**: Fresh adapter per test context

## Critical Design Decisions

### Storage Adapter Pattern
- Interfaces allow swapping localStorage/memory storage
- Context injection prevents global state
- Test isolation via fresh instances

### State Management
- No automatic mutations in effects
- User actions drive all state changes
- Modal state determined by actual data, not timing

### Why Tailwind v3 (not v4)
- v4 has PostCSS plugin incompatibility
- v3 is production stable

### Why Custom Hooks
- Abstraction for storage failures
- Testable telemetry logic
- Reusable viewport handling

### Why Playwright
- Real browser testing
- Mobile viewport validation
- Network condition simulation

## Known Edge Cases Handled

1. **localStorage disabled**: Graceful degradation to memory storage
2. **Network failures**: Telemetry fallback to console
3. **CORS errors**: Modal still functions
4. **Reduced motion**: Instant animations
5. **Mobile keyboards**: Viewport adjustment
6. **Focus management**: Trap in modal
7. **Test state leaks**: Prevented via context isolation

## Performance Optimizations

- Hardware-accelerated animations only
- Lazy modal mounting
- Minimal re-renders
- <100KB JS bundle (gzipped)

## Accessibility Features

- ARIA labels and roles
- Keyboard navigation
- Focus trapping in modal
- Escape key handling
- Screen reader tested
- 4.5:1 contrast ratios

## Deployment

### Automated via CI/CD
- Push to main → Deploy to Netlify
- PR → Preview deployment
- All tests must pass

### Manual Deployment
```bash
pnpm run build
# Deploy dist/ folder to any static host
```

## Future Considerations

### State Management
- Currently using hooks + props + context
- Consider Redux/Zustand if complexity grows

### Internationalization
- Text in branding.ts ready for i18n
- No i18n library yet implemented

### Analytics
- Telemetry endpoint ready
- No specific analytics provider

## Development Workflow

```bash
# START: Install dependencies (never use npm install)
pnpm install

# Start dev server
pnpm run dev

# Run all tests
pnpm run test:all

# E2E tests with UI  
pnpm run test:e2e:ui

# Type check and lint
pnpm run typecheck

# Install Playwright (never use npx playwright)
pnpm exec playwright install --with-deps

# Any CLI tool must use pnpm exec, never npx
pnpm exec <cli-tool> <args>
```

## Testing Best Practices

### E2E Test Pattern
```typescript
// Always inject fresh storage adapter
await injectTestStorageAdapter(page, {
  'fact.rip.visited': 'true', // Optional initial state
});

// Check state transitions, not just UI
const storageState = await page.evaluate(() => {
  const adapter = (window as any).__TEST_STORAGE_ADAPTER__;
  return adapter.getItem('fact.rip.visited');
});
```

## Security Considerations

- No secrets in code
- Environment variables for endpoints
- CORS-aware telemetry
- Error messages sanitized

## Monitoring

- Console logging for development
- Telemetry for production metrics
- Error boundary for crash reporting
- Performance timing via animations

## Symbolic Design Language

1. **"The Loop Closes"**: First visit
2. **"The Loop Persists"**: Return visit
3. **Red pulse**: Active monitoring
4. **Delayed seal**: Trust verification
5. **Animation timing**: Epistemic weight

## Bundle Size Targets

- JS: <100KB gzipped ✓
- CSS: <10KB gzipped ✓
- Initial paint: <1s ✓
- TTI: <2s ✓

## Browser Support

- Chrome/Edge: Full
- Firefox: Full
- Safari: Full
- Mobile: iOS 13+, Android 8+

## Production Readiness Checklist

✅ Error boundaries with reporting
✅ Telemetry with fallbacks
✅ Accessibility tested
✅ Mobile optimized
✅ E2E test coverage
✅ CI/CD pipeline
✅ Deployment automation
✅ Performance budgets
✅ Security headers configured
✅ Monitoring in place
✅ Test isolation architecture
✅ Deterministic state management

This is now production infrastructure with proper architecture for testability and maintainability.