# Project Overview: fact.rip

## What is fact.rip?

fact.rip is a civic memory utility that serves as a recruitment interface for the "Watchtower" surveillance network. It's a single-page React application designed to capture and persist collective memory.

## Core Concept

The application centers around a mysterious surveillance theme:
- "The Loop Closes" - First-time visitors
- "The Memory Persists" - Returning visitors
- "Join the Watchtower" - Call to action
- "Custodes" - The watchers/guardians

## Technical Architecture

### Frontend Stack
- **React 19**: Latest React features
- **TypeScript**: Type safety throughout
- **Vite**: Fast build tooling
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations

### State Management
- **React Context**: Dependency injection
- **XState**: Complex state machines
- **LocalStorage**: Persistence layer
- **Memory fallback**: When storage unavailable

### Infrastructure
- **GitHub Actions**: CI/CD pipeline
- **Netlify**: Hosting and deployment
- **Teams Webhooks**: Notifications
- **Zero-drift**: Automated enforcement

## Key Features

### User Experience
1. **Progressive Enhancement**: Works without JavaScript
2. **Responsive Design**: Mobile-first approach
3. **Accessibility**: WCAG 2.1 AA compliant
4. **Performance**: Sub-3s load times
5. **Error Resilience**: Graceful degradation

### Technical Features
1. **StorageContext**: Centralized storage access
2. **Error Boundaries**: Crash protection
3. **Telemetry**: Usage tracking (when configured)
4. **Health Monitoring**: Automated checks
5. **Drift Detection**: Configuration validation

## User Journey

### First Time Visitor
1. Sees "The Loop Closes" message
2. Red pulsing animation draws attention
3. "Join the Watchtower" button appears
4. Clicking opens modal with mysterious content
5. LocalStorage marks them as "joined"

### Returning Visitor
1. Sees "The Memory Persists" message
2. Different visual treatment
3. Progress bar shows engagement
4. Additional content unlocked
5. Visit count tracked

## Security Model

### Principle of Least Privilege
- No manual deployment access
- Secrets only in GitHub
- Automated security scanning
- Runtime validation

### Defense in Depth
1. **Build time**: Dependency scanning
2. **Deploy time**: Configuration validation  
3. **Runtime**: CSP headers, monitoring
4. **Post-deploy**: Health checks

## Monitoring & Observability

### Real-time Monitoring
- Health checks every 15 minutes
- Error tracking and alerting
- Performance monitoring
- User journey analytics

### Alerting Strategy
1. **Immediate**: Deploy failures, errors
2. **Scheduled**: Health checks, drift
3. **Threshold**: High error rates
4. **Escalation**: Team notifications

## Development Philosophy

### Zero-Drift Architecture
No manual interventions allowed. Everything automated:
- Deployments via CI/CD only
- Configuration in code
- Secrets in GitHub
- Monitoring automated

### Test-Driven Development
- Write tests first
- 90%+ coverage requirement
- E2E for all user flows
- Accessibility always tested

### Performance Budget
- Bundle size < 350KB
- FCP < 1.5s
- TTI < 3.5s
- CLS < 0.1

## Future Roadmap

### Phase 1 (Current)
- ✅ Core interface
- ✅ Deployment pipeline
- ✅ Monitoring system
- ✅ Documentation

### Phase 2 (Planned)
- [ ] Enhanced animations
- [ ] Additional content
- [ ] A/B testing
- [ ] Analytics dashboard

### Phase 3 (Future)
- [ ] API integration
- [ ] User accounts
- [ ] Social features
- [ ] Mobile app

## Success Metrics

### Technical Metrics
- 99.9% uptime
- < 1% error rate
- 90%+ test coverage
- Zero security incidents

### User Metrics
- Page load < 3s
- Bounce rate < 40%
- Conversion > 20%
- Engagement time > 2min

## Team & Roles

### Development
- Frontend engineers
- DevOps engineers
- QA engineers
- Security team

### Operations
- 24/7 monitoring
- Incident response
- Performance optimization
- Security audits

---

**Project Status**: Production  
**Version**: 2.0.0  
**Last Updated**: 2025-05-19