# ADR-002: Storage Context Pattern

**Status**: Accepted  
**Date**: 2025-01-20  
**Deciders**: Development Team

## Context

We need a consistent way to handle browser storage (localStorage/sessionStorage) that:
- Provides fallback for unsupported environments
- Enables testing without real browser storage
- Centralizes storage access for security auditing
- Prevents direct localStorage access

## Decision

Implement a StorageContext that wraps all storage operations.

## Consequences

### Positive
- Single point of control for storage access
- Easy to mock in tests
- Fallback to memory storage when localStorage unavailable
- Security auditing simplified
- Runtime guards can detect violations

### Negative
- Additional abstraction layer
- Developers must remember to use context
- Slight performance overhead

## Implementation

```typescript
// Context provides adapter
const adapter = useStorageAdapter();

// Never direct access
localStorage.setItem(); // FORBIDDEN

// Always through adapter
adapter.setItem('key', 'value');
```

Enforced via:
1. ESLint rules
2. Runtime guards in development
3. CI/CD script validation