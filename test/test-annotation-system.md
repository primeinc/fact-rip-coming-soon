# Test Annotation System

This file tests that the annotation system correctly identifies violations and exceptions.

## Should PASS: Annotated npm usage

<!-- pnpm-lint-disable -->
```bash
npm install express  # This is allowed with annotation
npx create-react-app my-app  # Also allowed with annotation
```

## Should FAIL: Unannotated npm usage

```bash
npm test  # This should be caught as violation
npx jest  # This should also fail
```

## Should PASS: pnpm commands

```bash
pnpm install
pnpm test
pnpm run test:local:pnpm  # This should not trigger despite having a task that checks npm usage
```