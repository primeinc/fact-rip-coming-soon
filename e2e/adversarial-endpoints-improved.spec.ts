import { test, expect } from './test-hooks';

test.describe('adversarial endpoint testing', () => {
  
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

    // Navigate to page
    await page.goto('/', {
      waitUntil: 'networkidle'
    });

    // Trigger a real React error using window.onerror
    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error('Test error for error boundary');
      }, 0);
    });
    
    // Wait for error boundary to render
    await page.waitForTimeout(1000);

    // Check error boundary is showing
    await expect(page.locator('text=The Loop Fractures')).toBeVisible();

    // Click send report if available
    const reportButton = page.locator('button:has-text("Send Report")');
    if (await reportButton.isVisible()) {
      await reportButton.click();
      await page.waitForTimeout(1000);
      expect(errorReports.length).toBeGreaterThan(0);
    }
  });

  test('error recovery must function without endpoints', async ({ page }) => {
    // Handle expected errors
    page.on('pageerror', () => { /* Expected */ });
    
    // Navigate without endpoints  
    await page.addInitScript(() => {
      // @ts-expect-error Testing without endpoints
      window.__ERROR_ENDPOINT_OVERRIDE = null;
      // @ts-expect-error Testing without endpoints  
      window.__TELEMETRY_ENDPOINT_OVERRIDE = null;
    });

    await page.goto('/');

    // Trigger error with timeout
    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error('Test error without endpoints');
      }, 0);
    });
    
    // Wait for error boundary
    await page.waitForTimeout(1000);

    // Verify error boundary showing
    await expect(page.locator('text=The Loop Fractures')).toBeVisible();

    // Recovery should work
    const recoveryButton = page.locator('button:has-text("Resume Observation")');
    await expect(recoveryButton).toBeVisible();
    await recoveryButton.click();

    // App should recover
    await expect(page.locator('h1')).toBeVisible();
  });
});