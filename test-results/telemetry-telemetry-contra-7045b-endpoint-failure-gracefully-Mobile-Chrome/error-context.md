# Test info

- Name: telemetry contract >> should handle telemetry endpoint failure gracefully
- Location: /Users/will/Dev/fact-rip-coming-soon/e2e/telemetry.spec.ts:46:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
    at /Users/will/Dev/fact-rip-coming-soon/e2e/telemetry.spec.ts:63:25
```

# Page snapshot

```yaml
- main:
  - heading "The Loop Persists." [level=1]
  - img "Custodes Engine Verified Seal"
  - button "Join the Watchtower"
  - dialog "Already Watching":
    - heading "Already Watching" [level=2]
    - paragraph: Your vigilance continues. The loop persists through observation.
    - button "Continue"
    - button "Reset"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | const TELEMETRY_SCHEMA = {
   4 |   action: 'string',
   5 |   timestamp: 'string',
   6 |   returning: 'boolean',
   7 |   user_agent: 'string',
   8 |   viewport: {
   9 |     width: 'number',
   10 |     height: 'number'
   11 |   }
   12 | };
   13 |
   14 | test.describe('telemetry contract', () => {
   15 |   test('should send correct event schema', async ({ page }) => {
   16 |     let telemetryPayload: any = null;
   17 |     
   18 |     // Intercept telemetry requests
   19 |     await page.route('**/api/events', async route => {
   20 |       const request = route.request();
   21 |       telemetryPayload = await request.postDataJSON();
   22 |       await route.fulfill({ status: 200, body: 'ok' });
   23 |     });
   24 |     
   25 |     // Set mock endpoint
   26 |     await page.addInitScript(() => {
   27 |       (window as any).__VITE_TELEMETRY_ENDPOINT__ = 'http://localhost:5173/api/events';
   28 |     });
   29 |     
   30 |     await page.goto('/');
   31 |     await page.click('button:has-text("Join the Watchtower")');
   32 |     
   33 |     // Wait for telemetry to be sent
   34 |     await page.waitForTimeout(1000);
   35 |     
   36 |     // Validate schema
   37 |     expect(telemetryPayload).toBeTruthy();
   38 |     expect(telemetryPayload.action).toBe('watchtower_join');
   39 |     expect(telemetryPayload.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
   40 |     expect(typeof telemetryPayload.returning).toBe('boolean');
   41 |     expect(telemetryPayload.user_agent).toContain('Mozilla');
   42 |     expect(telemetryPayload.viewport.width).toBeGreaterThan(0);
   43 |     expect(telemetryPayload.viewport.height).toBeGreaterThan(0);
   44 |   });
   45 |
   46 |   test('should handle telemetry endpoint failure gracefully', async ({ page }) => {
   47 |     // Mock endpoint failure
   48 |     await page.route('**/api/events', route => route.abort());
   49 |     
   50 |     await page.goto('/');
   51 |     
   52 |     let errorLogged = false;
   53 |     page.on('console', msg => {
   54 |       if (msg.text().includes('Telemetry') && msg.text().includes('Failed')) {
   55 |         errorLogged = true;
   56 |       }
   57 |     });
   58 |     
   59 |     await page.click('button:has-text("Join the Watchtower")');
   60 |     await page.waitForTimeout(1000);
   61 |     
   62 |     // Should log error but not crash
>  63 |     expect(errorLogged).toBeTruthy();
      |                         ^ Error: expect(received).toBeTruthy()
   64 |     
   65 |     // Modal should still work
   66 |     await expect(page.locator('[role="dialog"]')).toBeVisible();
   67 |   });
   68 |
   69 |   test('should handle CORS errors', async ({ page }) => {
   70 |     // Mock CORS error
   71 |     await page.route('**/api/events', route => {
   72 |       route.fulfill({
   73 |         status: 0,
   74 |         headers: {
   75 |           'Access-Control-Allow-Origin': 'https://different-origin.com'
   76 |         }
   77 |       });
   78 |     });
   79 |     
   80 |     await page.goto('/');
   81 |     await page.click('button:has-text("Join the Watchtower")');
   82 |     
   83 |     // Should not crash, modal should appear
   84 |     await expect(page.locator('[role="dialog"]')).toBeVisible();
   85 |   });
   86 |
   87 |   test('should include correct headers', async ({ page }) => {
   88 |     let requestHeaders: Record<string, string> = {};
   89 |     
   90 |     await page.route('**/api/events', async route => {
   91 |       requestHeaders = await route.request().allHeaders();
   92 |       await route.fulfill({ status: 200 });
   93 |     });
   94 |     
   95 |     await page.addInitScript(() => {
   96 |       (window as any).__VITE_TELEMETRY_ENDPOINT__ = 'http://localhost:5173/api/events';
   97 |     });
   98 |     
   99 |     await page.goto('/');
  100 |     await page.click('button:has-text("Join the Watchtower")');
  101 |     
  102 |     await page.waitForTimeout(1000);
  103 |     
  104 |     expect(requestHeaders['content-type']).toBe('application/json');
  105 |   });
  106 | });
```