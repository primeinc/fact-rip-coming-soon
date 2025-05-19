# ADR-001: Use pnpm as the Package Manager

**Status**: Accepted  
**Date**: 2025-01-15  
**Deciders**: Development Team

## Context

We need to choose a package manager for this project. The main options are:
- npm (default Node.js package manager)
- yarn (Facebook's alternative)
- pnpm (performant npm)

## Decision

We will use pnpm exclusively for this project.

## Consequences

### Positive
- Faster installations due to efficient linking
- Smaller disk footprint with content-addressable storage
- Strict dependency resolution prevents phantom dependencies
- Better monorepo support if we expand
- Automatic enforcement via CI/CD

### Negative
- Developers must install pnpm
- Some tools may have compatibility issues
- Cannot use npm/npx commands directly

## Implementation

1. All developers must use pnpm
2. CI/CD enforces pnpm-only policy
3. Scripts detect and reject npm/npx usage
4. package.json engines field blocks npm/yarn