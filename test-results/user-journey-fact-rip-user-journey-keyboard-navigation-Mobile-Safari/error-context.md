# Test info

- Name: fact.rip user journey >> keyboard navigation
- Location: /Users/will/Dev/fact-rip-coming-soon/e2e/user-journey.spec.ts:113:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeFocused()

Locator: locator('button:has-text("Join the Watchtower")')
Expected: focused
Received: inactive
Call log:
  - expect.toBeFocused with timeout 5000ms
  - waiting for locator('button:has-text("Join the Watchtower")')
    9 × locator resolved to <button tabindex="0" class="w-full sm:w-auto sm:min-w-[280px] ↵                     flex items-center justify-center mx-auto↵                     px-6 py-4 sm:px-8 sm:py-4↵                     bg-white ↵                     text-black ↵                     font-bold rounded-full tracking-wide uppercase ↵                     text-[14px] sm:text-[16px]↵                     disabled:cursor-not-allowed transition-all↵                     shadow-lg shadow-white/20">Join the Watchtower</button>
      - unexpected value "inactive"

    at /Users/will/Dev/fact-rip-coming-soon/e2e/user-journey.spec.ts:119:82
```

# Page snapshot

```yaml
- main:
  - heading "The Loop Closes." [level=1]
  - status "Actor monitoring in progress"
  - img "Custodes Engine Verified Seal"
  - button "Join the Watchtower"
```

# Test source

```ts
   19 |
   20 |     // CTA should be visible
   21 |     const ctaButton = page.locator(`button:has-text("${BRANDING.copy.button.cta}")`);
   22 |     await expect(ctaButton).toBeVisible();
   23 |
   24 |     // Check storage before clicking
   25 |     const preClickStorage = await getStorageState(page);
   26 |     expect(preClickStorage['fact.rip.visited']).toBeUndefined();
   27 |     expect(preClickStorage['fact.rip.joined']).toBeUndefined();
   28 |
   29 |     // Click CTA
   30 |     await ctaButton.click();
   31 |
   32 |     // Wait for modal
   33 |     await expect(page.locator('[role="dialog"]')).toBeVisible();
   34 |
   35 |     // Modal should show first-time message
   36 |     await expect(page.locator('[role="dialog"] h2')).toHaveText(BRANDING.copy.modal.title.new);
   37 |
   38 |     // Check storage after modal appears
   39 |     await waitForStorageState(page, 'fact.rip.visited', 'true');
   40 |
   41 |     // Wait for joined timestamp to be set
   42 |     await page.waitForFunction(() => {
   43 |       const joined = localStorage.getItem('fact.rip.joined');
   44 |       return joined !== null && joined !== '';
   45 |     });
   46 |
   47 |     // Verify final storage state
   48 |     const postModalStorage = await getStorageState(page);
   49 |     expect(postModalStorage['fact.rip.visited']).toBe('true');
   50 |     expect(postModalStorage['fact.rip.joined']).toBeTruthy();
   51 |   });
   52 |
   53 |   test('returning visitor flow', async ({ page }) => {
   54 |     // Initialize with existing visitor data
   55 |     const joinTimestamp = new Date().toISOString();
   56 |     await initializeTestAdapter(page, {
   57 |       'fact.rip.visited': 'true',
   58 |       'fact.rip.joined': joinTimestamp
   59 |     });
   60 |
   61 |     await page.goto('/');
   62 |
   63 |     // Wait for state to initialize from storage
   64 |     await page.waitForTimeout(500);
   65 |
   66 |     // Check returning visitor state - should see "The Loop Persists"
   67 |     await expect(page.locator('h1')).toHaveText(BRANDING.copy.title.returning);
   68 |
   69 |     // Click CTA
   70 |     const ctaButton = page.locator(`button:has-text("${BRANDING.copy.button.cta}")`);
   71 |     await ctaButton.click();
   72 |
   73 |     // Modal should show returning message
   74 |     await expect(page.locator('[role="dialog"]')).toBeVisible();
   75 |     await expect(page.locator('[role="dialog"] h2')).toHaveText(BRANDING.copy.modal.title.returning);
   76 |
   77 |     // Check for reset button (only shown to returning visitors)
   78 |     const resetButton = page.locator(`button:has-text("${BRANDING.copy.button.reset}")`);
   79 |     await expect(resetButton).toBeVisible();
   80 |   });
   81 |
   82 |   test('reset flow', async ({ page }) => {
   83 |     // Start as returning visitor
   84 |     const joinTimestamp = new Date().toISOString();
   85 |     await initializeTestAdapter(page, {
   86 |       'fact.rip.visited': 'true',
   87 |       'fact.rip.joined': joinTimestamp
   88 |     });
   89 |
   90 |     await page.goto('/');
   91 |
   92 |     // Open modal
   93 |     const ctaButton = page.locator(`button:has-text("${BRANDING.copy.button.cta}")`);
   94 |     await ctaButton.click();
   95 |
   96 |     // Click reset button
   97 |     const resetButton = page.locator(`button:has-text("${BRANDING.copy.button.reset}")`);
   98 |     await resetButton.click();
   99 |
  100 |     // Wait for storage to be cleared
  101 |     await waitForStorageState(page, 'fact.rip.visited', null);
  102 |     await waitForStorageState(page, 'fact.rip.joined', null);
  103 |
  104 |     // Verify storage was cleared
  105 |     const clearedStorage = await getStorageState(page);
  106 |     expect(clearedStorage['fact.rip.visited']).toBeUndefined();
  107 |     expect(clearedStorage['fact.rip.joined']).toBeUndefined();
  108 |
  109 |     // Title should go back to first visit
  110 |     await expect(page.locator('h1')).toHaveText(BRANDING.copy.title.firstVisit);
  111 |   });
  112 |
  113 |   test('keyboard navigation', async ({ page }) => {
  114 |     await initializeTestAdapter(page);
  115 |     await page.goto('/');
  116 |
  117 |     // Tab to CTA button
  118 |     await page.keyboard.press('Tab');
> 119 |     await expect(page.locator(`button:has-text("${BRANDING.copy.button.cta}")`)).toBeFocused();
      |                                                                                  ^ Error: Timed out 5000ms waiting for expect(locator).toBeFocused()
  120 |
  121 |     // Press Enter to activate
  122 |     await page.keyboard.press('Enter');
  123 |
  124 |     // Modal should open
  125 |     await expect(page.locator('[role="dialog"]')).toBeVisible();
  126 |
  127 |     // Press Escape to close modal
  128 |     await page.keyboard.press('Escape');
  129 |
  130 |     // Modal should close
  131 |     await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  132 |   });
  133 |
  134 |   test('network failure handling', async ({ page }) => {
  135 |     await initializeTestAdapter(page);
  136 |
  137 |     // Block telemetry requests
  138 |     await page.route('**/api/telemetry', route => route.abort());
  139 |
  140 |     await page.goto('/');
  141 |
  142 |     // Click CTA - should still work despite network failure
  143 |     const ctaButton = page.locator(`button:has-text("${BRANDING.copy.button.cta}")`);
  144 |     await ctaButton.click();
  145 |
  146 |     // Modal should still appear (graceful degradation)
  147 |     await expect(page.locator('[role="dialog"]')).toBeVisible();
  148 |
  149 |     // Storage should still be updated locally
  150 |     await waitForStorageState(page, 'fact.rip.visited', 'true');
  151 |   });
  152 |
  153 |   test('error boundary recovery', async ({ page }) => {
  154 |     await initializeTestAdapter(page);
  155 |
  156 |     // Navigate to app
  157 |     await page.goto('/');
  158 |
  159 |     // Verify app is working normally first
  160 |     await expect(page.locator('h1')).toBeVisible();
  161 |
  162 |     // Navigate to a non-existent route which should show 404 or error
  163 |     await page.goto('/this-route-does-not-exist-404');
  164 |
  165 |     // The app should still be functional (either showing error boundary or normal content)
  166 |     const hasContent = await page.locator('body').textContent();
  167 |     expect(hasContent).toBeTruthy();
  168 |
  169 |     // Check if we can still navigate back
  170 |     await page.goto('/');
  171 |     await expect(page.locator('h1')).toBeVisible();
  172 |   });
  173 | });
```