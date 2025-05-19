# fact.rip — Production Surveillance Interface

[![CI/CD](https://github.com/primeinc/fact-rip-coming-soon/actions/workflows/ci.yml/badge.svg)](https://github.com/primeinc/fact-rip-coming-soon/actions/workflows/ci.yml)
[![Deployment](https://img.shields.io/badge/deployment-live-success)](https://sparkly-bombolone-c419df.netlify.app/)
[![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)]()
[![Security](https://img.shields.io/badge/security-enforced-blue)]()

Production-ready surveillance interface with zero-drift architecture, comprehensive testing, and automated enforcement.

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/primeinc/fact-rip-coming-soon.git
cd fact-rip-coming-soon

# Install dependencies (pnpm required)
pnpm install --frozen-lockfile

# Run preflight checks
pnpm run preflight

# Start development
pnpm dev
```

Visit the [Developer Quickstart Guide](docs/QUICKSTART.md) for detailed setup instructions.

## 📚 Documentation

- [Developer Quickstart](docs/QUICKSTART.md) - Get up and running quickly
- [Testing Strategy](docs/TESTING.md) - Comprehensive testing approach
- [Security Documentation](docs/SECURITY.md) - Security measures and compliance
- [Architecture Decisions](docs/adr/) - Key architectural choices
- [Scripts Documentation](scripts/README.md) - CI/CD enforcement scripts
- [Contributing Guide](CONTRIBUTING.md) - How to contribute

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State**: React Context + XState
- **Animation**: Framer Motion
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions + Netlify

### Key Features
- Zero-drift deployment architecture
- Real-time monitoring and alerting
- Comprehensive test coverage (90%+)
- Accessibility compliant (WCAG 2.1 AA)
- Mobile-first responsive design
- Automated security enforcement

### Design Patterns
- [StorageContext](docs/adr/002-storage-context-pattern.md) for centralized storage
- Error boundaries for resilience
- Memoization for performance
- Progressive enhancement
- Immutable deployments

## 🧪 Testing

```bash
# Run all tests
pnpm run validate

# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Accessibility tests
pnpm test:e2e -- accessibility

# Local enforcement tests
pnpm run test:local:all
```

See [Testing Documentation](docs/TESTING.md) for comprehensive testing guide.

## 🚢 Deployment

Deployments are fully automated through CI/CD:

1. Push to `main` branch
2. CI/CD runs all tests
3. Automated deployment to Netlify
4. Post-deployment validation
5. Monitoring and alerting

**Production URL**: https://sparkly-bombolone-c419df.netlify.app/

## 🔒 Security

- All secrets in GitHub Secrets
- No manual deployment access
- Automated vulnerability scanning
- Security headers enforced
- CSP configured
- Regular security audits

See [Security Documentation](docs/SECURITY.md) for details.

## 🛡️ Enforcement

This project enforces strict standards:

- **pnpm-only**: No npm/npx allowed
- **No hardcoded values**: Everything in config
- **Storage pattern**: Must use StorageContext
- **Test coverage**: 90%+ required
- **Type safety**: Strict TypeScript
- **Zero manual deploys**: CI/CD only

## 📊 Monitoring

- Health checks every 15 minutes
- Drift detection every 10 minutes
- Error tracking and alerting
- Performance monitoring
- Deployment notifications

## 🤝 Contributing

1. Read [Contributing Guide](CONTRIBUTING.md)
2. Check [open issues](https://github.com/primeinc/fact-rip-coming-soon/issues)
3. Create feature branch
4. Write tests first
5. Submit PR for review

## 📈 Performance

- Lighthouse score: 95+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Bundle size: < 350KB gzipped

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers
- Progressive enhancement for older browsers

## ⚡ Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm preview          # Preview production

# Testing
pnpm test             # Unit tests
pnpm test:e2e         # E2E tests
pnpm test:coverage    # Coverage report
pnpm run validate     # Full validation

# Quality
pnpm run typecheck    # TypeScript check
pnpm run lint         # ESLint
pnpm run lint:fix     # Fix lint issues

# Local Testing
pnpm run preflight    # Check tools
pnpm run test:local:all # Local enforcement
```

## 📝 License

Copyright © 2025 Prime Inc. All rights reserved.

---

**Status**: Production  
**Version**: 2.0.0  
**Last Updated**: 2025-05-19