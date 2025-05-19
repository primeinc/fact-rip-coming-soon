# Developer Quickstart Guide

Welcome to the fact.rip project! This guide will get you up and running in minutes.

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git
- GitHub CLI (`gh`)

## Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/primeinc/fact-rip-coming-soon.git
   cd fact-rip-coming-soon
   ```

2. **Install pnpm (if needed)**
   ```bash
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   # Note: If pnpm is not installed, use the installer above
   ```

3. **Run preflight checks**
   ```bash
   pnpm run preflight
   ```
   This validates all required tools are installed.

4. **Install dependencies**
   ```bash
   pnpm install --frozen-lockfile
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```
   Visit http://localhost:5173

## Common Development Tasks

### Running Tests

```bash
# All tests (recommended before committing)
pnpm run validate

# Unit tests only
pnpm test

# E2E tests only
pnpm test:e2e

# Specific browser
pnpm test:e2e -- --project=chromium
```

### Code Quality

```bash
# TypeScript checking
pnpm run typecheck

# Linting
pnpm run lint

# Format check (if configured)
pnpm run format:check
```

### Local Enforcement Testing

Test CI/CD scripts locally without CI environment:

```bash
# Test all enforcement scripts
pnpm run test:local:all

# Test specific checks
pnpm run test:local:npm     # pnpm-only check
pnpm run test:local:config  # configuration drift
pnpm run test:local:shell   # shell script standards
```

## Project Structure

```
src/
├── components/     # React components
├── contexts/       # React contexts (including StorageContext)
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── constants/      # App constants
└── App.tsx         # Main component

e2e/               # Playwright E2E tests
scripts/           # CI/CD enforcement scripts
docs/              # Documentation
  └── adr/         # Architecture Decision Records
```

## Important Rules

### 1. Storage Access

**NEVER** access localStorage directly:
```typescript
// ❌ WRONG
localStorage.setItem('key', 'value');

// ✅ CORRECT
const adapter = useStorageAdapter();
adapter.setItem('key', 'value');
```

### 2. Package Manager

**ALWAYS** use pnpm:

<!-- pnpm-lint-disable -->
```bash
# ❌ WRONG - DO NOT USE
npm install package-name  # Shown for contrast only
npx some-command         # Will fail CI if used in actual code

# ✅ CORRECT
pnpm add package-name
pnpm exec some-command
```

### 3. Configuration

**NEVER** hardcode values:
```typescript
// ❌ WRONG
const API_URL = 'https://api.example.com';

// ✅ CORRECT
import { config } from '@/config';
const API_URL = config.apiUrl;
```

## Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test**
   ```bash
   # Make your changes
   pnpm run validate  # Run all tests
   ```

3. **Commit with conventional commits**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve issue with..."
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   gh pr create
   ```

## Troubleshooting

### Tests fail locally but pass in CI?

1. Check Node version: `node --version` (must be >= 18)
2. Clear and reinstall: 
   ```bash
   rm -rf node_modules
   pnpm install --frozen-lockfile
   ```
3. Update Playwright browsers:
   ```bash
   pnpm exec playwright install --force
   ```

### Can't run enforcement scripts?

Add the local test flag:
```bash
ALLOW_LOCAL_TEST=true ./scripts/check-npm-usage.sh
# OR use the npm script
pnpm run test:local:npm
```

### TypeScript errors?

1. Check types are installed:
   ```bash
   pnpm run typecheck
   ```
2. Restart TypeScript server in your editor
3. Clear TypeScript cache:
   ```bash
   rm -rf node_modules/.cache
   pnpm run typecheck
   ```

## Getting Help

- Check existing issues: https://github.com/primeinc/fact-rip-coming-soon/issues
- Read the documentation in `/docs`
- Ask in team chat
- Review ADRs in `/docs/adr` for architectural decisions

## Next Steps

1. Read the [Contributing Guide](../CONTRIBUTING.md)
2. Review the [Architecture Decision Records](./adr/)
3. Familiarize yourself with the [Scripts Documentation](../scripts/README.md)
4. Check the [TODO list](../TODO.md) for open tasks

Happy coding! 🚀