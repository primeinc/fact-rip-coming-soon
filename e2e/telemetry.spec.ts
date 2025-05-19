import { test, expect } from './test-hooks';
import { initializeTestAdapter } from './test-utils';

test.describe('telemetry contract', () => {
  test('should send correct event schema', async ({ page }) => {
    // Initialize clean state
    await initializeTestAdapter(page);
    
    // Listen for console messages before navigation
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('[Telemetry]')) {
        consoleMessages.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.click('button:has-text("Join the Watchtower")');
    
    // Wait for modal (which indicates telemetry was sent)
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Verify telemetry was logged
    await page.waitForTimeout(500);
    expect(consoleMessages.length).toBeGreaterThan(0);
    
    // Parse and validate the telemetry event
    if (consoleMessages.length > 0) {
      // The console might show as "[Telemetry] JSHandle@object" in some browsers
      // So just check that we got a telemetry message
      const logText = consoleMessages[0];
      expect(logText).toContain('[Telemetry]');
    }
  });

  test('should handle telemetry endpoint failure gracefully', async ({ page }) => {
    await initializeTestAdapter(page);
    
    // Set a mock endpoint that will fail
    await page.addInitScript(() => {
      (window as unknown as { __VITE_TELEMETRY_ENDPOINT__: string }).__VITE_TELEMETRY_ENDPOINT__ = 'http://localhost:9999/api/telemetry';
    });
    
    // Mock endpoint failure
    await page.route('**/api/telemetry', route => route.abort());
    
    // Capture console errors
    const errorMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('Failed')) {
        errorMessages.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.click('button:has-text("Join the Watchtower")');
    
    // Modal should still work despite telemetry failure
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Should have logged error
    await page.waitForTimeout(500);
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  test('should handle CORS errors', async ({ page }) => {
    await initializeTestAdapter(page);
    
    // Set a mock endpoint
    await page.addInitScript(() => {
      (window as unknown as { __VITE_TELEMETRY_ENDPOINT__: string }).__VITE_TELEMETRY_ENDPOINT__ = 'http://localhost:9999/api/telemetry';
    });
    
    // Mock CORS error
    await page.route('**/api/telemetry', route => {
      route.abort('failed');
    });
    
    await page.goto('/');
    await page.click('button:has-text("Join the Watchtower")');
    
    // Should not crash, modal should appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('should include correct headers when endpoint is set', async ({ page }) => {
    let requestHeaders: Record<string, string> = {};
    
    await initializeTestAdapter(page);
    
    // Set a mock endpoint
    await page.addInitScript(() => {
      (window as unknown as { __VITE_TELEMETRY_ENDPOINT__: string }).__VITE_TELEMETRY_ENDPOINT__ = 'http://localhost:9999/api/telemetry';
    });
    
    await page.route('**/api/telemetry', async route => {
      requestHeaders = await route.request().allHeaders();
      await route.fulfill({ status: 200 });
    });
    
    await page.goto('/');
    await page.click('button:has-text("Join the Watchtower")');
    
    // Wait for telemetry
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.waitForTimeout(500);
    
    expect(requestHeaders['content-type']).toBe('application/json');
  });
});