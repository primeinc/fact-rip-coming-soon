# Test info

- Name: fact.rip user journey >> first time visitor flow
- Location: /Users/will/Dev/fact-rip-coming-soon/e2e/user-journey.spec.ts:10:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveText(expected)

Locator: locator('h1')
Expected string: "The Loop Closes."
Received string: "The Loop Persists."
Call log:
  - expect.toHaveText with timeout 5000ms
  - waiting for locator('h1')
    9 × locator resolved to <h1 class="text-center text-[28px] sm:text-[36px] md:text-[48px] lg:text-[56px] ↵                 leading-[1.1] font-bold tracking-tight text-white">The Loop Persists.</h1>
      - unexpected value "The Loop Persists."

    at /Users/will/Dev/fact-rip-coming-soon/e2e/user-journey.spec.ts:14:38
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
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('fact.rip user journey', () => {
   4 |   test.beforeEach(async ({ page, context }) => {
   5 |     // Clear storage state
   6 |     await context.clearCookies();
   7 |     await page.evaluate(() => localStorage.clear()).catch(() => {});
   8 |   });
   9 |
   10 |   test('first time visitor flow', async ({ page }) => {
   11 |     await page.goto('/');
   12 |     
   13 |     // Check initial state
>  14 |     await expect(page.locator('h1')).toHaveText('The Loop Closes.');
      |                                      ^ Error: Timed out 5000ms waiting for expect(locator).toHaveText(expected)
   15 |     
   16 |     // Animation should complete
   17 |     await page.waitForTimeout(2000);
   18 |     
   19 |     // CTA should be visible
   20 |     const ctaButton = page.locator('button:has-text("Join the Watchtower")');
   21 |     await expect(ctaButton).toBeVisible();
   22 |     
   23 |     // Click CTA
   24 |     await ctaButton.click();
   25 |     
   26 |     // Modal should appear
   27 |     await expect(page.locator('[role="dialog"]')).toBeVisible();
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
```