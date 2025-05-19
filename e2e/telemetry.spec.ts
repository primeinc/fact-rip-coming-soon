import { test, expect } from '@playwright/test';

test.describe('telemetry contract', () => {
  test('should send correct event schema', async ({ page }) => {
    let telemetryPayload: Record<string, unknown> | null = null;
    
    // Intercept telemetry requests
    await page.route('**/api/events', async route => {
      const request = route.request();
      telemetryPayload = await request.postDataJSON();
      await route.fulfill({ status: 200, body: 'ok' });
    });
    
    // Set mock endpoint
    await page.addInitScript(() => {
      // @ts-expect-error - Mock environment variable
      window.__VITE_TELEMETRY_ENDPOINT__ = 'http://localhost:5173/api/events';
    });
    
    await page.goto('/');
    await page.click('button:has-text("Join the Watchtower")');
    
    // Wait for telemetry to be sent
    await page.waitForTimeout(1000);
    
    // Validate schema
    expect(telemetryPayload).toBeTruthy();
    expect(telemetryPayload?.action).toBe('watchtower_join');
    expect(telemetryPayload?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(typeof telemetryPayload?.returning).toBe('boolean');
    expect(telemetryPayload?.user_agent).toContain('Mozilla');
    expect((telemetryPayload?.viewport as Record<string, number>).width).toBeGreaterThan(0);
    expect((telemetryPayload?.viewport as Record<string, number>).height).toBeGreaterThan(0);
  });

  test('should handle telemetry endpoint failure gracefully', async ({ page }) => {
    // Set mock endpoint
    await page.addInitScript(() => {
      // @ts-expect-error - Mock environment variable
      window.__VITE_TELEMETRY_ENDPOINT__ = 'http://localhost:5173/api/events';
    });
    
    // Mock endpoint failure
    await page.route('**/api/events', route => route.abort());
    
    let errorLogged = false;
    page.on('console', msg => {
      if (msg.text().includes('[Telemetry] Failed')) {
        errorLogged = true;
      }
    });
    
    await page.goto('/');
    await page.click('button:has-text("Join the Watchtower")');
    await page.waitForTimeout(1000);
    
    // Should log error but not crash
    expect(errorLogged).toBeTruthy();
    
    // Modal should still work
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('should handle CORS errors', async ({ page }) => {
    // Mock CORS error
    await page.route('**/api/events', route => {
      route.fulfill({
        status: 0,
        headers: {
          'Access-Control-Allow-Origin': 'https://different-origin.com'
        }
      });
    });
    
    await page.goto('/');
    await page.click('button:has-text("Join the Watchtower")');
    
    // Should not crash, modal should appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('should include correct headers', async ({ page }) => {
    let requestHeaders: Record<string, string> = {};
    
    await page.route('**/api/events', async route => {
      requestHeaders = await route.request().allHeaders();
      await route.fulfill({ status: 200 });
    });
    
    await page.addInitScript(() => {
      // @ts-expect-error - Mock environment variable
      window.__VITE_TELEMETRY_ENDPOINT__ = 'http://localhost:5173/api/events';
    });
    
    await page.goto('/');
    await page.click('button:has-text("Join the Watchtower")');
    
    await page.waitForTimeout(1000);
    
    expect(requestHeaders['content-type']).toBe('application/json');
  });
});