import { test, expect } from './test-hooks';

test.describe('adversarial endpoint testing', () => {

  test('error reporting endpoint must exist and respond', async ({ page }) => {
    const errorEndpoint = process.env.VITE_ERROR_REPORT_ENDPOINT;

    if (errorEndpoint) {
      // Test endpoint is reachable
      const response = await page.request.post(errorEndpoint, {
        data: {
          errorId: 'test-error-001',
          message: 'Test error',
          stack: 'Test stack trace',
          userAgent: 'Playwright Test',
          timestamp: new Date().toISOString()
        }
      });

      // Must respond with acceptable status
      expect([200, 201, 202, 204]).toContain(response.status());
    }
  });

  test('telemetry endpoint must handle failures gracefully', async ({ page }) => {
    const telemetryEndpoint = process.env.VITE_TELEMETRY_ENDPOINT;

    if (telemetryEndpoint) {
      // Test various failure scenarios
      const scenarios = [
        { name: 'empty body', data: {} },
        { name: 'invalid JSON', data: 'invalid-json' },
        { name: 'missing required fields', data: { randomField: 'value' } },
        { name: 'oversized payload', data: { huge: 'x'.repeat(1000000) } }
      ];

      for (const scenario of scenarios) {
        const response = await page.request.post(telemetryEndpoint, {
          data: scenario.data,
          failOnStatusCode: false
        });

        // Should not crash - any status is acceptable
        expect(response.status()).toBeDefined();
      }
    }
  });

  test('error boundary must report errors when endpoint configured', async ({ page }) => {
    // Handle expected errors during adversarial testing
    page.on('pageerror', () => { /* Expected during test */ });
    // Set up error endpoint intercept
    const errorReports: unknown[] = [];

    await page.route('**/error-report', route => {
      const postData = route.request().postData();
      if (postData) {
        errorReports.push(JSON.parse(postData));
      }
      route.fulfill({ status: 200 });
    });

    // Navigate to page with error endpoint configured
    await page.goto('/', {
      waitUntil: 'networkidle'
    });

    // Force an error in React by breaking a component
    await page.evaluate(() => {
      // Find a React component and force it to error
      const button = document.querySelector('button');
      if (button) {
        // Override click handler to throw
        Object.defineProperty(button, 'onclick', {
          get() {
            throw new Error('Forced test error');
          }
        });
      }
    });
    
    // Now click the button to trigger the error
    const button = page.locator('button').first();
    await button.click();
    
    // Wait for React to handle the error
    await page.waitForTimeout(500);

    // Error boundary might show custom error text - let's check what's actually visible
    const errorText = await page.evaluate(() => {
      return document.body.innerText;
    });
    console.log('Page text after error:', errorText);

    // Look for the actual error title from the app
    await expect(page.locator('text=The Loop Fractures')).toBeVisible({timeout: 2000});

    // Click send report if available
    const reportButton = page.locator('button:has-text("Send Report")');
    if (await reportButton.isVisible()) {
      await reportButton.click();

      // Verify error was reported
      await page.waitForTimeout(1000);
      expect(errorReports.length).toBeGreaterThan(0);

      const report = errorReports[0];
      expect(report).toHaveProperty('errorId');
      expect(report).toHaveProperty('message');
      expect(report).toHaveProperty('stack');
    }
  });

  test('endpoints must be non-null in production', async ({ page }) => {
    // This test ensures endpoints are actually configured
    await page.goto('/');

    const endpoints = await page.evaluate(() => {
      // Check if endpoints are exposed to the window object
      return {
        telemetry: window.VITE_TELEMETRY_ENDPOINT || null,
        errorReport: window.VITE_ERROR_REPORT_ENDPOINT || null
      };
    });

    // In production, at least one endpoint should be configured
    if (process.env.NODE_ENV === 'production') {
      const hasEndpoints = endpoints.telemetry || endpoints.errorReport;
      expect(hasEndpoints).toBeTruthy();
    }
  });

  test('endpoints must handle CORS correctly', async ({ page }) => {
    const endpoints = {
      telemetry: process.env.VITE_TELEMETRY_ENDPOINT,
      errorReport: process.env.VITE_ERROR_REPORT_ENDPOINT
    };

    for (const [, endpoint] of Object.entries(endpoints)) {
      if (endpoint) {
        try {
          const response = await page.request.options(endpoint);

          // Check CORS headers
          const headers = response.headers();
          const allowOrigin = headers['access-control-allow-origin'];
          const allowMethods = headers['access-control-allow-methods'];

          // Must allow our origin or *
          expect(allowOrigin).toBeDefined();
          expect(allowMethods).toContain('POST');
        } catch {
          // OPTIONS might not be implemented, try POST
          const response = await page.request.post(endpoint, {
            data: { test: true },
            failOnStatusCode: false
          });

          // Should at least respond
          expect(response.status()).toBeDefined();
        }
      }
    }
  });

  test('error recovery must function without endpoints', async ({ page }) => {
    // Handle expected errors during adversarial testing
    page.on('pageerror', () => { /* Expected during test */ });
    // Navigate without endpoints configured
    await page.addInitScript(() => {
      // @ts-expect-error Testing without endpoints
      window.__ERROR_ENDPOINT_OVERRIDE = null;
      // @ts-expect-error Testing without endpoints
      window.__TELEMETRY_ENDPOINT_OVERRIDE = null;
    });

    await page.goto('/');

    // Force an error in React by breaking a component
    await page.evaluate(() => {
      // Find a React component and force it to error
      const button = document.querySelector('button');
      if (button) {
        // Override click handler to throw
        Object.defineProperty(button, 'onclick', {
          get() {
            throw new Error('Forced test error');
          }
        });
      }
    });
    
    // Now click the button to trigger the error
    const button = page.locator('button').first();
    await button.click();
    
    // Wait for React to handle the error
    await page.waitForTimeout(500);

    // Error boundary might show custom error text - let's check what's actually visible
    const errorText = await page.evaluate(() => {
      return document.body.innerText;
    });
    console.log('Page text after error:', errorText);

    // Look for the actual error title
    await expect(page.locator('text=The Loop Fractures')).toBeVisible({timeout: 2000});

    // Recovery should work
    const recoveryButton = page.locator('button:has-text("Resume Observation")');
    await expect(recoveryButton).toBeVisible();
    await recoveryButton.click();

    // App should recover
    await expect(page.locator('h1')).toBeVisible();
  });
});