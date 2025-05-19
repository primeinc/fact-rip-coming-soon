# fact.rip "Coming Soon" — Production Infrastructure

Live surveillance interface with comprehensive testing, CI/CD automation, and security controls.

## ⚠️ CRITICAL: pnpm-Only Repository (Zero npm/npx Tolerance)

**DO NOT use npm or npx** - This repository enforces strict pnpm-only policy with CI/CD enforcement. Any npm/npx usage will fail the build.

## Security & CI/CD

This codebase enforces the following standards:

1. **CI/CD Deployment** - Automated deployment through GitHub Actions
2. **Test Enforcement** - Every push runs unit, E2E, and accessibility tests
3. **Configuration Management** - Text/config centralized in branding.ts
4. **Post-Deploy Validation** - Smoke tests validate deployed URLs
5. **Error Resilience** - Error boundaries with telemetry fallbacks
6. **State Management** - LocalStorage with fallback patterns
7. **Mobile First** - Features tested across viewports
8. **Accessibility** - WCAG AA compliance via axe-core

### Known Limitations

- **Manual Override Access**: Netlify CLI access still exists for emergency deployment
- **Integration Testing Gap**: Tests focus on UI, not full API integrations
- **Secret Scanning**: Only scans PRs, not historical commits
- **Alert Management**: Teams notifications deployed but lacks deduplication

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
4. **Post-Deploy**: Production verification

No manual deploys allowed - only CI can push to production.

## Deployment

### Netlify Production Deployment

⚠️ **CRITICAL**: Deployments are only valid if ALL CI/CD checks pass.

#### Configuration
- All deployment URLs and IDs are in `config/deployment.json`
- Secrets are managed exclusively through GitHub Secrets
- NO local .env files are allowed (CI will fail)

#### Deployment Process

1. Push to main branch
2. CI/CD runs full test suite
3. If ALL tests pass, deploys to Netlify
4. Smoke tests validate the deployment
5. Only after ALL validation passes is the deployment considered successful

#### URLs
- See `config/deployment.json` for all deployment URLs
- Production deployments require passing all E2E tests
- Failed deployments should trigger immediate rollback

### Manual Build

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