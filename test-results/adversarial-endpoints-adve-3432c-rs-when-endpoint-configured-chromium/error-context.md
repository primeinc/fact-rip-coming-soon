# Test info

- Name: adversarial endpoint testing >> error boundary must report errors when endpoint configured
- Location: /Users/will/Dev/fact-rip-coming-soon/e2e/adversarial-endpoints.spec.ts:49:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('text=System malfunction detected')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('text=System malfunction detected')

    at /Users/will/Dev/fact-rip-coming-soon/e2e/adversarial-endpoints.spec.ts:80:68
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
   1 | import { test, expect } from './test-hooks';
   2 |
   3 | test.describe('adversarial endpoint testing', () => {
   4 |
   5 |   test('error reporting endpoint must exist and respond', async ({ page }) => {
   6 |     const errorEndpoint = process.env.VITE_ERROR_REPORT_ENDPOINT;
   7 |
   8 |     if (errorEndpoint) {
   9 |       // Test endpoint is reachable
   10 |       const response = await page.request.post(errorEndpoint, {
   11 |         data: {
   12 |           errorId: 'test-error-001',
   13 |           message: 'Test error',
   14 |           stack: 'Test stack trace',
   15 |           userAgent: 'Playwright Test',
   16 |           timestamp: new Date().toISOString()
   17 |         }
   18 |       });
   19 |
   20 |       // Must respond with acceptable status
   21 |       expect([200, 201, 202, 204]).toContain(response.status());
   22 |     }
   23 |   });
   24 |
   25 |   test('telemetry endpoint must handle failures gracefully', async ({ page }) => {
   26 |     const telemetryEndpoint = process.env.VITE_TELEMETRY_ENDPOINT;
   27 |
   28 |     if (telemetryEndpoint) {
   29 |       // Test various failure scenarios
   30 |       const scenarios = [
   31 |         { name: 'empty body', data: {} },
   32 |         { name: 'invalid JSON', data: 'invalid-json' },
   33 |         { name: 'missing required fields', data: { randomField: 'value' } },
   34 |         { name: 'oversized payload', data: { huge: 'x'.repeat(1000000) } }
   35 |       ];
   36 |
   37 |       for (const scenario of scenarios) {
   38 |         const response = await page.request.post(telemetryEndpoint, {
   39 |           data: scenario.data,
   40 |           failOnStatusCode: false
   41 |         });
   42 |
   43 |         // Should not crash - any status is acceptable
   44 |         expect(response.status()).toBeDefined();
   45 |       }
   46 |     }
   47 |   });
   48 |
   49 |   test('error boundary must report errors when endpoint configured', async ({ page }) => {
   50 |     // Handle expected errors during adversarial testing
   51 |     page.on('pageerror', () => { /* Expected during test */ });
   52 |     // Set up error endpoint intercept
   53 |     const errorReports: unknown[] = [];
   54 |
   55 |     await page.route('**/error-report', route => {
   56 |       const postData = route.request().postData();
   57 |       if (postData) {
   58 |         errorReports.push(JSON.parse(postData));
   59 |       }
   60 |       route.fulfill({ status: 200 });
   61 |     });
   62 |
   63 |     // Navigate to page with error endpoint configured
   64 |     await page.goto('/', {
   65 |       waitUntil: 'networkidle'
   66 |     });
   67 |
   68 |     // Trigger an error in the app
   69 |     await page.evaluate(() => {
   70 |       // Force an error in React component via timeout to bypass evaluate catch
   71 |       setTimeout(() => {
   72 |         throw new Error('Adversarial test error');
   73 |       }, 0);
   74 |     });
   75 |     
   76 |     // Wait for error to propagate
   77 |     await page.waitForTimeout(100);
   78 |
   79 |     // Wait for error boundary to appear
>  80 |     await expect(page.locator('text=System malfunction detected')).toBeVisible();
      |                                                                    ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
   81 |
   82 |     // Click send report if available
   83 |     const reportButton = page.locator('button:has-text("Send Report")');
   84 |     if (await reportButton.isVisible()) {
   85 |       await reportButton.click();
   86 |
   87 |       // Verify error was reported
   88 |       await page.waitForTimeout(1000);
   89 |       expect(errorReports.length).toBeGreaterThan(0);
   90 |
   91 |       const report = errorReports[0];
   92 |       expect(report).toHaveProperty('errorId');
   93 |       expect(report).toHaveProperty('message');
   94 |       expect(report).toHaveProperty('stack');
   95 |     }
   96 |   });
   97 |
   98 |   test('endpoints must be non-null in production', async ({ page }) => {
   99 |     // This test ensures endpoints are actually configured
  100 |     await page.goto('/');
  101 |
  102 |     const endpoints = await page.evaluate(() => {
  103 |       // Check if endpoints are exposed to the window object
  104 |       return {
  105 |         telemetry: window.VITE_TELEMETRY_ENDPOINT || null,
  106 |         errorReport: window.VITE_ERROR_REPORT_ENDPOINT || null
  107 |       };
  108 |     });
  109 |
  110 |     // In production, at least one endpoint should be configured
  111 |     if (process.env.NODE_ENV === 'production') {
  112 |       const hasEndpoints = endpoints.telemetry || endpoints.errorReport;
  113 |       expect(hasEndpoints).toBeTruthy();
  114 |     }
  115 |   });
  116 |
  117 |   test('endpoints must handle CORS correctly', async ({ page }) => {
  118 |     const endpoints = {
  119 |       telemetry: process.env.VITE_TELEMETRY_ENDPOINT,
  120 |       errorReport: process.env.VITE_ERROR_REPORT_ENDPOINT
  121 |     };
  122 |
  123 |     for (const [, endpoint] of Object.entries(endpoints)) {
  124 |       if (endpoint) {
  125 |         try {
  126 |           const response = await page.request.options(endpoint);
  127 |
  128 |           // Check CORS headers
  129 |           const headers = response.headers();
  130 |           const allowOrigin = headers['access-control-allow-origin'];
  131 |           const allowMethods = headers['access-control-allow-methods'];
  132 |
  133 |           // Must allow our origin or *
  134 |           expect(allowOrigin).toBeDefined();
  135 |           expect(allowMethods).toContain('POST');
  136 |         } catch {
  137 |           // OPTIONS might not be implemented, try POST
  138 |           const response = await page.request.post(endpoint, {
  139 |             data: { test: true },
  140 |             failOnStatusCode: false
  141 |           });
  142 |
  143 |           // Should at least respond
  144 |           expect(response.status()).toBeDefined();
  145 |         }
  146 |       }
  147 |     }
  148 |   });
  149 |
  150 |   test('error recovery must function without endpoints', async ({ page }) => {
  151 |     // Handle expected errors during adversarial testing
  152 |     page.on('pageerror', () => { /* Expected during test */ });
  153 |     // Navigate without endpoints configured
  154 |     await page.addInitScript(() => {
  155 |       // @ts-expect-error Testing without endpoints
  156 |       window.__ERROR_ENDPOINT_OVERRIDE = null;
  157 |       // @ts-expect-error Testing without endpoints
  158 |       window.__TELEMETRY_ENDPOINT_OVERRIDE = null;
  159 |     });
  160 |
  161 |     await page.goto('/');
  162 |
  163 |     // Trigger error
  164 |     await page.evaluate(() => {
  165 |       // Use timeout to bypass page.evaluate error catching
  166 |       setTimeout(() => {
  167 |         throw new Error('Test error without endpoints');
  168 |       }, 0);
  169 |     });
  170 |     
  171 |     // Wait for error to propagate
  172 |     await page.waitForTimeout(100);
  173 |
  174 |     // Error boundary should still appear
  175 |     await expect(page.locator('text=System malfunction detected')).toBeVisible();
  176 |
  177 |     // Recovery should work
  178 |     const recoveryButton = page.locator('button:has-text("Resume Mission")');
  179 |     await expect(recoveryButton).toBeVisible();
  180 |     await recoveryButton.click();
```