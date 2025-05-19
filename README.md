# fact.rip "Coming Soon" — Production Infrastructure

Live surveillance interface with comprehensive testing, CI/CD automation, and security controls.

## ⚠️ CRITICAL: pnpm-Only Repository (Zero npm/npx Tolerance)

**DO NOT use npm or npx** - This repository enforces strict pnpm-only policy with CI/CD enforcement. Any npm/npx usage will fail the build.

## 🚀 Quick Start

```bash
# Install dependencies (pnpm only!)
pnpm install --frozen-lockfile

# Development
pnpm dev                    # Start local dev server
pnpm build                  # Production build
pnpm preview                # Preview production build

# Testing
pnpm test                   # Unit tests (watch mode)
pnpm test:run              # Unit tests (single run)
pnpm test:e2e              # E2E tests
pnpm test:all              # All tests (CI mode)

# Local Enforcement Testing
pnpm run test:local:all    # Run all local enforcement checks
pnpm run test:local:npm    # Check npm/npx usage
pnpm run test:local:config # Check configuration drift
pnpm run test:local:shell  # Check shell standards
```

## 🏗️ Architecture

### Core Stack
- **Framework**: React 19 + TypeScript
- **Build**: Vite
- **Testing**: Vitest (unit), Playwright (E2E)
- **State**: xstate + React Context
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **CI/CD**: GitHub Actions → Netlify

### Security & CI/CD Standards

1. **CI/CD Deployment** - Automated deployment through GitHub Actions
2. **Test Enforcement** - Every push runs unit, E2E, and accessibility tests
3. **Configuration Management** - Text/config centralized in branding.ts
4. **Post-Deploy Validation** - Comprehensive E2E tests validate deployments
5. **Error Resilience** - Error boundaries with telemetry fallbacks
6. **State Management** - LocalStorage with fallback patterns
7. **Mobile First** - Features tested across viewports
8. **Accessibility** - WCAG AA compliance via axe-core

### Zero-Drift Enforcement

**Multi-Layer Defense:**

1. **Pre-Commit Enforcement**
   - `check-npm-usage.sh` - Blocks npm/npx usage
   - `check-no-secrets.sh` - Prevents secret commits
   - `enforce-storage-pattern.sh` - Ensures storage access through context
   - `enforce-no-timeouts.sh` - Validates animation timing patterns

2. **CI/CD Pipeline Enforcement**
   - Configuration drift detection
   - Security scanning (entire git history)
   - Adversarial testing
   - Automated rollback validation

3. **Scheduled Monitoring**
   - Health checks every 15 minutes
   - Drift detection every 10 minutes
   - High failure rate alerting
   - Teams/Slack notifications

## 🛡️ Critical Architecture Rules

### Storage Access Pattern (MANDATORY)

**ALL storage access MUST go through StorageContext. Direct localStorage/sessionStorage access is FORBIDDEN.**

```typescript
// ❌ NEVER DO THIS
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');

// ✅ ALWAYS DO THIS
import { useStorageAdapter } from './contexts/StorageContext';

function MyComponent() {
  const adapter = useStorageAdapter();
  adapter.setItem('key', 'value');
  const value = adapter.getItem('key');
}
```

**Enforcement:**
- CI will fail if direct storage access is detected
- Runtime guards log violations in development
- ESLint rule prevents direct access

**Exceptions:**
- Only `storage-adapter.ts` and `storage.ts` can access storage directly
- Test utilities in `test/` may mock storage

### Deployment Configuration

All deployment URLs and IDs are in `config/deployment.json`:
- NO hardcoded URLs in code
- NO environment-specific values in components
- Changes require PR review + CI validation

**Deployments ONLY happen through CI/CD** - Manual deploys are blocked

## 📁 Project Structure

```
src/
├── components/     # UI components (unit tested)
├── contexts/       # React contexts (DI pattern)
├── hooks/          # Custom React hooks
├── constants/      # App constants
├── config/         # Configuration files
├── utils/          # Utility functions
└── App.tsx         # Main component

e2e/               # Playwright E2E tests
scripts/           # CI/CD enforcement scripts
config/            # Deployment configuration
```

## 🧪 Testing Strategy

### Test Types
- **Unit Tests**: Component logic, hooks, utilities
- **E2E Tests**: User journeys, error scenarios
- **Accessibility Tests**: WCAG compliance
- **Adversarial Tests**: Error boundaries, endpoints

### Running Tests Locally

```bash
# Unit tests
pnpm test              # Watch mode
pnpm test:run          # Single run
pnpm test:coverage     # With coverage

# E2E tests
pnpm test:e2e          # All browsers
pnpm test:e2e:mobile   # Mobile viewports
pnpm test:e2e:ui       # Interactive UI

# Everything
pnpm test:all          # Full CI test suite
```

### Local Script Testing

For testing enforcement scripts without CI:

```bash
# Test individual scripts
pnpm run test:local:npm       # Check npm/npx usage
pnpm run test:local:config    # Check config drift
pnpm run test:local:shell     # Check shell standards

# Test everything locally
pnpm run test:local:all       # All local tests
pnpm run test:local:ci        # Test enforcement scripts

# Scripts requiring credentials
export NETLIFY_AUTH_TOKEN=your_token
export NETLIFY_SITE_ID=your_site_id
export GH_TOKEN=your_github_token

ALLOW_LOCAL_TEST=true ./scripts/detect-netlify-drift.sh
ALLOW_LOCAL_TEST=true ./scripts/check-deployment.sh
```

## 🚀 Deployment

### Prerequisites
- GitHub Secrets configured:
  - `NETLIFY_AUTH_TOKEN`
  - `NETLIFY_SITE_ID`
  - `TEAMS_WEBHOOK_URL`

### Process
1. Push to `main` branch
2. CI/CD runs all tests
3. Builds production bundle
4. Deploys to Netlify
5. Runs post-deploy validation
6. Sends Teams notification

### URLs
- Production: `https://sparkly-bombolone-c419df.netlify.app/`
- All URLs configured in `config/deployment.json`

## 📊 Current TODO Items

### Open Issues
- [ ] PREFLIGHT-001: Install and validate all required CLI/tools
- [ ] CYCLE-001: Stage all current changes and run preflight validation
- [ ] DRIFT-001: Fix Netlify API environment variable parsing issue
- [ ] YAML-001: Fix YAML lint errors in GitHub workflows
- [ ] SHELL-002: Fix shell script standards violations

### Expected Test Failures
- [ ] E2E-001: Adversarial endpoints tests (designed to fail)
- [ ] E2E-002: Error text mismatch ('System malfunction' vs 'The Loop Fractures')

## ⚠️ Known Limitations

- **Manual Override Access**: Netlify CLI access still exists for emergency deployment
- **Integration Testing Gap**: Tests focus on UI, not full API integrations
- **Secret Scanning**: Only scans PRs, not historical commits
- **Alert Management**: Teams notifications deployed but lacks deduplication

## 🤝 Contributing

See the [Scripts README](scripts/README.md) for details on enforcement scripts.

### Key Guidelines
1. All changes require tests
2. Use StorageContext for storage access
3. Follow pnpm-only policy
4. No hardcoded values
5. E2E tests must pass
6. Accessibility tests must pass

### Development Workflow
1. Create feature branch
2. Write tests first
3. Implement feature
4. Run `pnpm test:all` locally
5. Submit PR
6. Wait for CI approval
7. Merge after review

---

**Status**: Production-ready with enforcement enabled  
**Last Updated**: 2025-05-19  
**Maintained By**: Prime Inc.