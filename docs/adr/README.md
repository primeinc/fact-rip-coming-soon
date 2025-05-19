# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) that document key architectural decisions made in the fact.rip project.

## What is an ADR?

An Architecture Decision Record captures:
- Context of the decision
- Decision made
- Consequences (positive and negative)
- Implementation details

## ADR Index

1. [ADR-001: Use pnpm as Package Manager](001-use-pnpm.md)
2. [ADR-002: Storage Context Pattern](002-storage-context-pattern.md)
3. [ADR-003: Zero-Drift Enforcement Architecture](003-zero-drift-enforcement.md)
4. [ADR-004: Testing Strategy](004-testing-strategy.md)

## Creating New ADRs

Use this template:

```markdown
# ADR-XXX: Title

**Status**: Proposed | Accepted | Deprecated  
**Date**: YYYY-MM-DD  
**Deciders**: Team/Person

## Context
What is the issue we're addressing?

## Decision
What have we decided to do?

## Consequences
### Positive
- What benefits will we see?

### Negative
- What downsides are there?

## Implementation
How will we implement this decision?
```

## ADR Status

- **Proposed**: Under discussion
- **Accepted**: Approved and implemented
- **Deprecated**: No longer valid, see superseding ADR