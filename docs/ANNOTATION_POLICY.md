# Annotation Policy for Documentation

This document explains how to properly annotate code examples that must show forbidden patterns for educational or comparison purposes.

## Background

Our codebase enforces strict policies (pnpm-only, no hardcoded values, etc.) but documentation sometimes needs to show what NOT to do. Rather than obfuscating or hiding these examples, we use explicit annotations that are auditable and reviewable.

## The Annotation System

### For pnpm-only violations

When documentation needs to show npm/npx usage (e.g., for comparison or migration guides):

```markdown
<!-- pnpm-lint-disable -->
```bash
# This example shows what NOT to do
npm install package-name  # ❌ WRONG
npx some-command         # ❌ WRONG

# Use these instead:
pnpm add package-name    # ✅ CORRECT
pnpm exec some-command   # ✅ CORRECT
```
```

### Enforcement

1. All code is scanned for forbidden patterns
2. Unannotated violations fail CI immediately
3. Annotated exceptions are logged and reported in CI output
4. PR reviewers see all exceptions listed

### When to Use Annotations

Use annotations when:
- Showing migration examples (old way vs. new way)
- Demonstrating what NOT to do
- Documenting historical patterns for reference
- Explaining why certain patterns are forbidden

Do NOT use annotations for:
- Actual working code examples
- Installation instructions
- Development workflows
- Test code

### Review Process

1. All annotated exceptions appear in CI logs
2. PR reviewers must verify each exception is justified
3. Excessive or unjustified annotations should be questioned
4. Annotations must include context (why this exception exists)

### Best Practices

1. Keep exceptions minimal
2. Always provide context
3. Use clear before/after examples
4. Consider if the example is truly necessary
5. Update when patterns change

### Example CI Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 pnpm Enforcement Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Documented Exceptions Found: 2
These npm/npx uses are properly annotated and allowed:
   - docs/QUICKSTART.md:126 - Annotated exception: npm install package-name
   - docs/QUICKSTART.md:127 - Annotated exception: npx some-command

✅ PASSED: All npm/npx usage is either converted or properly annotated
```

## Adding New Policies

To add annotation support for new policies:

1. Create a new enforcement script that parses annotations
2. Define the annotation format (e.g., `<!-- policy-name-disable -->`)
3. Update CI to use the annotation-aware script
4. Document the new annotation in this file
5. Audit existing code and add annotations where needed

## Philosophy

We believe in:
- Explicit over implicit
- Auditable exceptions over hidden workarounds
- Reviewable policies over blind enforcement
- Teaching through clear examples, even negative ones

This system ensures our documentation can be educational while maintaining strict enforcement on actual code.