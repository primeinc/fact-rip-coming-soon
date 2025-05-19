# fact.rip "Coming Soon" — Zero-Drift Production Infrastructure

Live surveillance interface with brutal production-grade testing, zero-drift enforcement, and automated CI/CD guardrails.

## ⚠️ CRITICAL: pnpm-Only Repository (Zero npm/npx Tolerance)

**DO NOT use npm or npx** - This repository enforces strict pnpm-only policy with CI/CD enforcement. Any npm/npx usage will fail the build.

## Zero-Drift Enforcement

This codebase implements **zero-drift production standards**:

1. **No Manual Deployment** - Only CI/CD can deploy to production
2. **Test Enforcement** - Every push runs unit, E2E, and accessibility tests
3. **Configuration Extraction** - All text/config in centralized branding.ts
4. **Post-Deploy Validation** - Smoke tests run against deployed URL
5. **Error Resilience** - Error boundaries with telemetry fallbacks
6. **State Management** - Bulletproof localStorage with fallbacks
7. **Mobile First** - Every feature tested across viewports
8. **Accessibility** - WCAG AA compliance enforced via axe-core

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0 (install from https://pnpm.io)

## Quick Start

```bash
git clone https://github.com/yourusername/fact-rip-coming-soon.git
cd fact-rip-coming-soon
./scripts/pnpm-setup.sh   # One-time setup
pnpm run dev
```

### Manual Setup (if not using setup script)
```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps
pnpm run check:pnpm       # Verify no npm/npx usage
```

## Features

- **State Persistence**: Tracks visits and joins via localStorage
- **Dynamic Animations**: Different behaviors for returning visitors  
- **Mobile Optimized**: 360px+ responsive with safe area support
- **Error Resilient**: Error boundaries with telemetry integration
- **Backend Ready**: Optional telemetry endpoint for real tracking

## Configuration

```bash
cp .env.example .env
```

Optional environment variables:
- `VITE_TELEMETRY_ENDPOINT`: POST endpoint for event tracking
- `VITE_SENTRY_DSN`: Error tracking integration

## Architecture

```
src/
├── components/      # UI components
│   ├── CTAButton.tsx
│   ├── ErrorBoundary.tsx
│   ├── Modal.tsx
│   ├── ProgressBar.tsx
│   ├── Pulse.tsx
│   ├── Seal.tsx
│   └── Title.tsx
├── hooks/          # Custom React hooks
│   ├── useLocalStorage.ts
│   ├── useTelemetry.ts
│   └── useViewportHeight.ts
├── constants/      # Configuration
│   └── animations.ts
├── utils/         # Utility functions
│   └── storage.ts
├── test/          # Test setup
│   └── setup.ts
├── App.tsx        # Main component
└── index.css      # Tailwind + mobile optimizations
```

### Key Interactions

1. **First Visit**: Shows "The Loop Closes" with upward animation
2. **Return Visit**: Shows "The Loop Persists" with downward animation
3. **Join Action**: Opens modal, sends telemetry, stores timestamp
4. **Reset Option**: Available in modal for returning users

## Development

```bash
pnpm run dev          # Start dev server
pnpm run build        # Build for production
pnpm run test         # Run unit tests (watch mode)
pnpm run test:run     # Run unit tests (single run)
pnpm run test:coverage # Run tests with coverage
pnpm run test:e2e     # Run E2E tests (Playwright)
pnpm run typecheck    # Type check + lint
pnpm run test:all     # Full test suite (required before commit)
pnpm run ci           # Full CI pipeline
```

## Testing Infrastructure (Zero-Drift Enforcement)

All tests MUST pass before merge/deploy:

### Unit Tests (Vitest)
- Component logic and hooks
- Mock external dependencies
- Coverage requirements enforced

### E2E Tests (Playwright)
- User journeys (first visit, returning visitor)
- Mobile viewports (iOS/Android)
- Error boundary recovery
- Network failure handling
- Keyboard navigation
- Accessibility compliance (axe-core)
- Telemetry API contracts

### Smoke Tests (Production)
- Post-deploy validation against live URL
- Critical element presence
- Performance benchmarks
- Security header verification
- Functional interaction tests

### CI/CD Pipeline
1. **Pre-commit**: TypeScript + ESLint check
2. **On Push**: Full test suite across browsers
3. **On Deploy**: Build artifacts + Netlify deploy
4. **Post-Deploy**: Production smoke tests

No manual deploys allowed - only CI can push to production.

## Deployment

```bash
pnpm run build
# Deploy dist/ to any static host
```

### Telemetry Events

Events sent to `VITE_TELEMETRY_ENDPOINT`:

```json
{
  "action": "watchtower_join",
  "timestamp": "2024-01-01T00:00:00Z",
  "returning": false,
  "user_agent": "...",
  "viewport": { "width": 390, "height": 844 }
}
```

## Mobile Optimizations

- Dynamic viewport height (--vh custom property)
- Safe area insets for notch devices
- Touch targets minimum 48px
- Disabled iOS tap highlights
- Prevented overscroll bounce

## License

© 2024 fact.rip