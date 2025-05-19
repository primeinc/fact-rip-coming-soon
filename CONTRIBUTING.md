# Contributing Guidelines

## Critical Architecture Rules

### 1. Storage Access Pattern (MANDATORY)

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
- E2E tests can use localStorage for assertions only

### 2. No Timing-Based Patterns

**setTimeout/setInterval are BANNED in application code.**

```typescript
// ❌ NEVER DO THIS
setTimeout(() => {
  setState(newValue);
}, 1000);

// ✅ ALWAYS DO THIS
// Use event-driven patterns
element.addEventListener('transitionend', () => {
  setState(newValue);
});
```

**Exceptions:**
- Animation utilities in `animations.ts`
- E2E test utilities

### 3. Context-Based Dependency Injection

All cross-cutting concerns must use React Context for dependency injection:
- Storage (StorageContext)
- User state (UserJourneyContext)
- Future: Analytics, Feature flags, etc.

### 4. Test Isolation

Every test MUST:
1. Use a fresh storage adapter instance
2. Clean up after itself
3. Never rely on global state

```typescript
// Always inject test adapter
await initializeTestAdapter(page, { 
  'key': 'initial-value' 
});
```

## Pre-commit Checklist

Before committing:
1. Run `pnpm run check:all` - Enforces all patterns
2. Run `pnpm run test:all` - All tests must pass
3. Run `pnpm run typecheck` - No TypeScript errors

## Adding New Features

1. **Storage Access**: Must use StorageContext
2. **Async Operations**: Must be event-driven
3. **State Management**: Must be deterministic
4. **Tests**: Must include unit and E2E tests
5. **Documentation**: Update this file if adding patterns

## CI Will Fail If:

1. Direct localStorage/sessionStorage access detected
2. setTimeout/setInterval in app code
3. Tests don't pass
4. TypeScript errors exist
5. pnpm lockfile is invalid
6. npm/npx usage detected

## Emergency Fixes

If you absolutely must bypass these rules:
1. Document WHY in code comments
2. Add to allowed files in enforcement scripts
3. Create a plan to refactor properly
4. Get team consensus first

These patterns exist to prevent:
- Race conditions
- Test flakiness
- State leakage
- Non-deterministic behavior

Breaking them will cause pain. Don't do it.