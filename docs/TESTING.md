# Testing Strategy

Comprehensive testing approach for the fact.rip project.

## Testing Philosophy

1. **Test Everything**: Every feature must have tests
2. **Fast Feedback**: Tests must run quickly
3. **Real Scenarios**: Test actual user behavior
4. **Adversarial Testing**: Test failure modes
5. **Accessibility First**: All features must be accessible

## Test Layers

### 1. Unit Tests (Vitest)

**Coverage**: Components, hooks, utilities  
**Location**: Adjacent to source files (`*.test.ts`, `*.test.tsx`)

```typescript
// Example: useLocalStorage.test.tsx
describe('useLocalStorage', () => {
  it('should persist values', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );
    
    act(() => {
      result.current[1]('updated');
    });
    
    expect(result.current[0]).toBe('updated');
  });
});
```

**Run**: `pnpm test`

### 2. E2E Tests (Playwright)

**Coverage**: User journeys, integrations  
**Location**: `/e2e` directory

```typescript
// Example: user-journey.spec.ts
test('first time visitor flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('The Loop Closes');
  
  await page.click('button:has-text("Join the Watchtower")');
  await expect(page.locator('[role="dialog"]')).toBeVisible();
});
```

**Run**: `pnpm test:e2e`

### 3. Accessibility Tests

**Coverage**: WCAG 2.1 AA compliance  
**Tools**: axe-core, Playwright

```typescript
// Example: accessibility.spec.ts
test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
    
  expect(results.violations).toEqual([]);
});
```

### 4. Adversarial Tests

**Coverage**: Error boundaries, network failures  
**Focus**: What happens when things go wrong

```typescript
// Example: adversarial-endpoints.spec.ts
test('handles network failure gracefully', async ({ page }) => {
  await page.route('**/api/**', route => route.abort());
  await page.goto('/');
  
  // Should show error UI, not crash
  await expect(page.locator('.error-message')).toBeVisible();
});
```

### 5. Visual Regression Tests

**Status**: Planned  
**Tools**: Playwright screenshots, Percy.io

```typescript
// Example: visual.spec.ts
test('homepage visual regression', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

## Test Organization

### File Structure
```
src/
  components/
    Modal.tsx
    Modal.test.tsx      # Unit tests
e2e/
  user-journey.spec.ts  # E2E tests
  accessibility.spec.ts # A11y tests
  adversarial.spec.ts   # Error tests
```

### Naming Conventions
- Unit tests: `*.test.ts(x)`
- E2E tests: `*.spec.ts`
- Test utilities: `test-utils.ts`
- Test fixtures: `fixtures/`

## Testing Patterns

### 1. Component Testing

```typescript
// Setup
const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
};

// Test
it('renders with props', () => {
  render(<Modal {...defaultProps} />);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
```

### 2. Hook Testing

```typescript
// Setup
const wrapper = ({ children }) => (
  <StorageContextProvider>
    {children}
  </StorageContextProvider>
);

// Test
const { result } = renderHook(
  () => useStorageAdapter(),
  { wrapper }
);
```

### 3. E2E Page Objects

```typescript
class HomePage {
  constructor(private page: Page) {}
  
  async navigate() {
    await this.page.goto('/');
  }
  
  async clickJoinButton() {
    await this.page.click('button:has-text("Join")');
  }
}
```

### 4. Test Data Management

```typescript
// fixtures/users.ts
export const testUsers = {
  firstTime: {
    localStorage: {},
  },
  returning: {
    localStorage: {
      'fact.rip.joined': 'true',
      'fact.rip.visits': '5',
    },
  },
};
```

## CI/CD Integration

### Test Stages

1. **Pre-commit**
   - Linting
   - Type checking
   - Unit tests for changed files

2. **Pull Request**
   - Full unit test suite
   - E2E tests on multiple browsers
   - Accessibility tests
   - Build verification

3. **Post-merge**
   - Full test suite
   - Performance tests
   - Visual regression
   - Deployment verification

### Browser Matrix

```yaml
projects:
  - name: 'chromium'
  - name: 'firefox'
  - name: 'webkit'
  - name: 'Mobile Chrome'
  - name: 'Mobile Safari'
```

## Performance Testing

### Metrics to Track

1. **Core Web Vitals**
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

2. **Custom Metrics**
   - Time to Interactive
   - Bundle size
   - Memory usage

### Implementation

```typescript
test('meets performance budget', async ({ page }) => {
  await page.goto('/');
  
  const metrics = await page.evaluate(() => 
    JSON.stringify(performance.getEntriesByType('navigation'))
  );
  
  const navigation = JSON.parse(metrics)[0];
  expect(navigation.loadEventEnd).toBeLessThan(3000);
});
```

## Test Coverage

### Current Coverage
- Unit Tests: 85%+
- E2E Tests: Core user journeys
- Accessibility: WCAG 2.1 AA
- Browser Support: Modern browsers + Mobile

### Coverage Goals
- Unit Tests: 90%+
- E2E Tests: All critical paths
- Visual Tests: Key pages
- Performance: Budget enforcement

## Local Testing

### Quick Commands

```bash
# Run all tests
pnpm run validate

# Run specific test suite
pnpm test -- Modal.test.tsx
pnpm test:e2e -- user-journey

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test --watch

# Debug E2E tests
pnpm test:e2e --debug
```

### Debugging Tips

1. **Headed mode**: `pnpm test:e2e --headed`
2. **Slow motion**: `pnpm test:e2e --slow-mo=500`
3. **Single test**: `pnpm test:e2e -g "test name"`
4. **Console logs**: `page.on('console', console.log)`

## Best Practices

### Do's
- Write tests first (TDD when possible)
- Test behavior, not implementation
- Use descriptive test names
- Keep tests isolated and independent
- Mock external dependencies

### Don'ts
- Don't test implementation details
- Don't share state between tests
- Don't test third-party libraries
- Don't skip flaky tests (fix them)
- Don't hardcode test data

## Troubleshooting

### Common Issues

**Flaky Tests**
- Add explicit waits: `await page.waitForSelector()`
- Check for race conditions
- Ensure proper test isolation
- Use data-testid for stability

**Timeout Errors**
- Increase timeout: `test.setTimeout(30000)`
- Check for network issues
- Verify element selectors
- Review async operations

**CI vs Local Differences**
- Match Node versions
- Clear browser cache
- Install same browser versions
- Check environment variables

## Future Improvements

1. **Contract Testing**: API contract validation
2. **Load Testing**: Performance under load
3. **Security Testing**: Automated penetration tests
4. **Chaos Testing**: Failure injection
5. **Synthetic Monitoring**: Production testing

---

Last Updated: 2025-05-19
Test Coverage: High
Status: Comprehensive testing in place