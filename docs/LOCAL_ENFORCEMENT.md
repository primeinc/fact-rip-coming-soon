# Local Enforcement System

This repository implements **real zero-drift enforcement** at the local level, preventing policy violations before they even reach CI.

## Architecture

1. **Pre-commit Hook**: Runs all enforcement checks before allowing commits
2. **Commit-msg Hook**: Validates commit message format
3. **Annotation System**: Allows documented exceptions in documentation
4. **Instant Feedback**: Developers get immediate feedback on violations

## Pre-commit Enforcement

The pre-commit hook runs these checks:
- ✅ pnpm-only usage (with annotation support)
- ✅ Storage pattern compliance
- ✅ No timeout patterns
- ✅ Shell script standards
- ✅ Secret scanning

### Example Output

```
🔍 Running local enforcement checks...

✅ pnpm-only enforcement PASSED
✅ Storage pattern enforcement PASSED
✅ No timeouts enforcement PASSED
✅ Shell script standards PASSED
✅ No secrets detected in staged files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Local Enforcement Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ All enforcement checks PASSED - ready to commit!
```

### When Violations Are Found

```
❌ COMMIT BLOCKED - Fix these issues:
   1. pnpm-only violations found
   2. Direct storage access found

💡 Tips:
   - Run "pnpm test:local:all" to check all patterns
   - Use annotations for documentation examples
   - See CONTRIBUTING.md for guidelines
   - Ask for help if you need exceptions
```

## Commit Message Validation

All commits must follow the conventional commit format:
```
<type>(<scope>): <subject>
```

Types: feat, fix, docs, style, refactor, test, chore, revert

## Setup

The system auto-installs with:
```bash
pnpm install
```

Husky hooks are configured in `.husky/` and execute automatically.

## Testing Locally

Run enforcement checks without committing:
```bash
pnpm run enforce:local
pnpm test:local:all
```

## Philosophy

- **Fail Fast**: Catch violations immediately
- **Developer Experience**: Clear error messages and fix suggestions
- **Zero Theater**: Real enforcement, not CI-only checks
- **Auditable Exceptions**: All exceptions documented and visible

## Annotation Support

Documentation can include forbidden patterns with proper annotation:

```markdown
<!-- pnpm-lint-disable -->
\`\`\`bash
npm install  # Example of what NOT to do
\`\`\`
```

This ensures educational content can exist while maintaining strict enforcement on actual code.

## Benefits

1. **No Wasted PRs**: Violations caught before push
2. **Faster Feedback**: Instant validation
3. **Cultural Enforcement**: Everyone experiences the rules
4. **True Zero-Drift**: Policy enforced at the source

This system makes it physically impossible to commit policy violations without explicit, documented exceptions.