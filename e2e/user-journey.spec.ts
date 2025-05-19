import { test, expect } from '@playwright/test';

test.describe('fact.rip user journey', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear storage state
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear()).catch(() => {});
  });

  test('first time visitor flow', async ({ page }) => {
    await page.goto('/');
    
    // Check initial state
    await expect(page.locator('h1')).toHaveText('The Loop Closes.');
    
    // Animation should complete
    await page.waitForTimeout(2000);
    
    // CTA should be visible
    const ctaButton = page.locator('button:has-text("Join the Watchtower")');
    await expect(ctaButton).toBeVisible();
    
    // Click CTA
    await ctaButton.click();
    
    // Modal should appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('h2')).toHaveText('Watchtower Activated');
    
    // Check localStorage
    const joined = await page.evaluate(() => localStorage.getItem('fact.rip.joined'));
    expect(joined).toBeTruthy();
    
    // Close modal
    await page.locator('button:has-text("Continue")').click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('returning visitor flow', async ({ page }) => {
    // Set up as returning visitor
    await page.evaluate(() => {
      localStorage.setItem('fact.rip.visited', 'true');
      localStorage.setItem('fact.rip.joined', new Date().toISOString());
    });
    
    await page.goto('/');
    
    // Should show different message
    await expect(page.locator('h1')).toHaveText('The Loop Persists.');
    
    // Click CTA again
    await page.locator('button:has-text("Join the Watchtower")').click();
    
    // Modal should show different content
    await expect(page.locator('h2')).toHaveText('Already Watching');
    
    // Reset button should be visible
    const resetButton = page.locator('button:has-text("Reset")');
    await expect(resetButton).toBeVisible();
    
    // Test reset
    await resetButton.click();
    await page.waitForURL('/'); // Wait for reload
    
    // Should reload and clear storage
    // Wait a bit for the state to settle and page to reload
    await page.waitForTimeout(500);
    
    const visited = await page.evaluate(() => localStorage.getItem('fact.rip.visited'));
    const joined = await page.evaluate(() => localStorage.getItem('fact.rip.joined'));
    
    // After reset, joined should be cleared and visited should be false
    expect(joined).toBeNull();
    // visited might be stored as 'false' string or null
    expect(!visited || visited === 'false').toBeTruthy();
  });

  test('keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab to button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Enter to click
    await page.keyboard.press('Enter');
    
    // Modal should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Escape to close
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Elements should be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button')).toBeVisible();
    
    // Button should be full width on mobile
    const button = page.locator('button:has-text("Join the Watchtower")');
    const buttonWidth = await button.evaluate(el => el.offsetWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    expect(buttonWidth).toBeGreaterThan(viewportWidth * 0.8);
  });

  test('network failure handling', async ({ page }) => {
    // Mock telemetry endpoint failure
    await page.route('**/api/events', route => route.abort());
    
    await page.goto('/');
    await page.locator('button:has-text("Join the Watchtower")').click();
    
    // Should still work without telemetry
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Check console for fallback
    const consoleMessages: string[] = [];
    page.on('console', msg => consoleMessages.push(msg.text()));
    
    await page.reload();
    expect(consoleMessages.some(msg => msg.includes('Telemetry'))).toBeTruthy();
  });

  test('localStorage disabled', async ({ browser }) => {
    // Create context with storage disabled
    const restrictedContext = await browser.newContext({
      permissions: []
    });
    const page = await restrictedContext.newPage();
    
    // Inject error for localStorage
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get: () => {
          throw new Error('localStorage is disabled');
        }
      });
    });
    
    await page.goto('/');
    
    // App should still render
    await expect(page.locator('h1')).toBeVisible();
    
    await restrictedContext.close();
  });

  test.skip('error boundary recovery', async ({ page }) => {
    // Add test param to URL that will trigger error
    await page.goto('/?test-error=true');
    
    // Add test logic to throw error on mount
    await page.addInitScript(() => {
      const url = new URL(window.location.href);
      if (url.searchParams.get('test-error') === 'true') {
        // Override setTimeout to throw error when app tries to set any timeout
        const originalSetTimeout = window.setTimeout;
        let errorThrown = false;
        window.setTimeout = (...args) => {
          if (!errorThrown) {
            errorThrown = true;
            throw new Error('Test error triggered');
          }
          return originalSetTimeout(...args);
        };
      }
    });
    
    // Wait for error boundary to catch the error
    await page.waitForTimeout(1000);
    
    // Error boundary should catch it
    await expect(page.locator('h1:has-text("The Loop Fractures")')).toBeVisible();
    await expect(page.locator('button:has-text("Resume Observation")')).toBeVisible();
  });
});