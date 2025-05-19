# Test info

- Name: fact.rip user journey >> network failure handling
- Location: /Users/will/Dev/fact-rip-coming-soon/e2e/user-journey.spec.ts:113:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
    at /Users/will/Dev/fact-rip-coming-soon/e2e/user-journey.spec.ts:128:68
```

# Page snapshot

```yaml
- main:
  - heading "The Loop Persists." [level=1]
  - status "Actor monitoring in progress"
  - img "Custodes Engine Verified Seal"
  - button "Join the Watchtower"
```

# Test source

```ts
   28 |     await expect(page.locator('h2')).toHaveText('Watchtower Activated');
   29 |     
   30 |     // Check localStorage
   31 |     const joined = await page.evaluate(() => localStorage.getItem('fact.rip.joined'));
   32 |     expect(joined).toBeTruthy();
   33 |     
   34 |     // Close modal
   35 |     await page.locator('button:has-text("Continue")').click();
   36 |     await expect(page.locator('[role="dialog"]')).not.toBeVisible();
   37 |   });
   38 |
   39 |   test('returning visitor flow', async ({ page }) => {
   40 |     // Set up as returning visitor
   41 |     await page.evaluate(() => {
   42 |       localStorage.setItem('fact.rip.visited', 'true');
   43 |       localStorage.setItem('fact.rip.joined', new Date().toISOString());
   44 |     });
   45 |     
   46 |     await page.goto('/');
   47 |     
   48 |     // Should show different message
   49 |     await expect(page.locator('h1')).toHaveText('The Loop Persists.');
   50 |     
   51 |     // Click CTA again
   52 |     await page.locator('button:has-text("Join the Watchtower")').click();
   53 |     
   54 |     // Modal should show different content
   55 |     await expect(page.locator('h2')).toHaveText('Already Watching');
   56 |     
   57 |     // Reset button should be visible
   58 |     const resetButton = page.locator('button:has-text("Reset")');
   59 |     await expect(resetButton).toBeVisible();
   60 |     
   61 |     // Test reset
   62 |     await resetButton.click();
   63 |     await page.waitForURL('/'); // Wait for reload
   64 |     
   65 |     // Should reload and clear storage
   66 |     // Wait a bit for the state to settle and page to reload
   67 |     await page.waitForTimeout(500);
   68 |     
   69 |     const visited = await page.evaluate(() => localStorage.getItem('fact.rip.visited'));
   70 |     const joined = await page.evaluate(() => localStorage.getItem('fact.rip.joined'));
   71 |     
   72 |     // After reset, joined should be cleared and visited should be false
   73 |     expect(joined).toBeNull();
   74 |     // visited might be stored as 'false' string or null
   75 |     expect(!visited || visited === 'false').toBeTruthy();
   76 |   });
   77 |
   78 |   test('keyboard navigation', async ({ page }) => {
   79 |     await page.goto('/');
   80 |     
   81 |     // Tab to button
   82 |     await page.keyboard.press('Tab');
   83 |     await page.keyboard.press('Tab');
   84 |     await page.keyboard.press('Tab');
   85 |     
   86 |     // Enter to click
   87 |     await page.keyboard.press('Enter');
   88 |     
   89 |     // Modal should open
   90 |     await expect(page.locator('[role="dialog"]')).toBeVisible();
   91 |     
   92 |     // Escape to close
   93 |     await page.keyboard.press('Escape');
   94 |     await expect(page.locator('[role="dialog"]')).not.toBeVisible();
   95 |   });
   96 |
   97 |   test('mobile viewport', async ({ page }) => {
   98 |     await page.setViewportSize({ width: 375, height: 667 });
   99 |     await page.goto('/');
  100 |     
  101 |     // Elements should be visible
  102 |     await expect(page.locator('h1')).toBeVisible();
  103 |     await expect(page.locator('button')).toBeVisible();
  104 |     
  105 |     // Button should be full width on mobile
  106 |     const button = page.locator('button:has-text("Join the Watchtower")');
  107 |     const buttonWidth = await button.evaluate(el => el.offsetWidth);
  108 |     const viewportWidth = await page.evaluate(() => window.innerWidth);
  109 |     
  110 |     expect(buttonWidth).toBeGreaterThan(viewportWidth * 0.8);
  111 |   });
  112 |
  113 |   test('network failure handling', async ({ page }) => {
  114 |     // Mock telemetry endpoint failure
  115 |     await page.route('**/api/events', route => route.abort());
  116 |     
  117 |     await page.goto('/');
  118 |     await page.locator('button:has-text("Join the Watchtower")').click();
  119 |     
  120 |     // Should still work without telemetry
  121 |     await expect(page.locator('[role="dialog"]')).toBeVisible();
  122 |     
  123 |     // Check console for fallback
  124 |     const consoleMessages: string[] = [];
  125 |     page.on('console', msg => consoleMessages.push(msg.text()));
  126 |     
  127 |     await page.reload();
> 128 |     expect(consoleMessages.some(msg => msg.includes('Telemetry'))).toBeTruthy();
      |                                                                    ^ Error: expect(received).toBeTruthy()
  129 |   });
  130 |
  131 |   test('localStorage disabled', async ({ browser }) => {
  132 |     // Create context with storage disabled
  133 |     const restrictedContext = await browser.newContext({
  134 |       permissions: []
  135 |     });
  136 |     const page = await restrictedContext.newPage();
  137 |     
  138 |     // Inject error for localStorage
  139 |     await page.addInitScript(() => {
  140 |       Object.defineProperty(window, 'localStorage', {
  141 |         get: () => {
  142 |           throw new Error('localStorage is disabled');
  143 |         }
  144 |       });
  145 |     });
  146 |     
  147 |     await page.goto('/');
  148 |     
  149 |     // App should still render
  150 |     await expect(page.locator('h1')).toBeVisible();
  151 |     
  152 |     await restrictedContext.close();
  153 |   });
  154 |
  155 |   test.skip('error boundary recovery', async ({ page }) => {
  156 |     // Add test param to URL that will trigger error
  157 |     await page.goto('/?test-error=true');
  158 |     
  159 |     // Add test logic to throw error on mount
  160 |     await page.addInitScript(() => {
  161 |       const url = new URL(window.location.href);
  162 |       if (url.searchParams.get('test-error') === 'true') {
  163 |         // Override setTimeout to throw error when app tries to set any timeout
  164 |         const originalSetTimeout = window.setTimeout;
  165 |         let errorThrown = false;
  166 |         window.setTimeout = (...args) => {
  167 |           if (!errorThrown) {
  168 |             errorThrown = true;
  169 |             throw new Error('Test error triggered');
  170 |           }
  171 |           return originalSetTimeout(...args);
  172 |         };
  173 |       }
  174 |     });
  175 |     
  176 |     // Wait for error boundary to catch the error
  177 |     await page.waitForTimeout(1000);
  178 |     
  179 |     // Error boundary should catch it
  180 |     await expect(page.locator('h1:has-text("The Loop Fractures")')).toBeVisible();
  181 |     await expect(page.locator('button:has-text("Resume Observation")')).toBeVisible();
  182 |   });
  183 | });
```