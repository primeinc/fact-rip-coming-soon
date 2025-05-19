import { test, expect } from './test-hooks';
// @ts-expect-error - Import branding config for test assertions
import { BRANDING } from '../src/config/branding';
import {
  initializeTestAdapter,
  waitForStorageState,
  getStorageState
} from './test-utils';

test.describe('fact.rip user journey', () => {

  test('first time visitor flow', async ({ page }) => {
    // Initialize with empty storage
    await initializeTestAdapter(page);
    await page.goto('/');

    // Check initial state - first time visitor should see "The Loop Closes"
    await expect(page.locator('h1')).toHaveText(BRANDING.copy.title.firstVisit);

    // CTA should be visible
    const ctaButton = page.locator(`button:has-text("${BRANDING.copy.button.cta}")`);
    await expect(ctaButton).toBeVisible();

    // Check storage before clicking
    const preClickStorage = await getStorageState(page);
    expect(preClickStorage['fact.rip.visited']).toBeUndefined();
    expect(preClickStorage['fact.rip.joined']).toBeUndefined();

    // Click CTA
    await ctaButton.click();

    // Wait for modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Modal should show first-time message
    await expect(page.locator('[role="dialog"] h2')).toHaveText(BRANDING.copy.modal.title.new);

    // Check storage after modal appears
    await waitForStorageState(page, 'fact.rip.visited', 'true');

    // Wait for joined timestamp to be set
    await page.waitForFunction(() => {
      const joined = localStorage.getItem('fact.rip.joined');
      return joined !== null && joined !== '';
    });

    // Verify final storage state
    const postModalStorage = await getStorageState(page);
    expect(postModalStorage['fact.rip.visited']).toBe('true');
    expect(postModalStorage['fact.rip.joined']).toBeTruthy();
  });

  test('returning visitor flow', async ({ page }) => {
    // Initialize with existing visitor data
    const joinTimestamp = new Date().toISOString();
    await initializeTestAdapter(page, {
      'fact.rip.visited': 'true',
      'fact.rip.joined': joinTimestamp
    });

    await page.goto('/');

    // Wait for state to initialize from storage
    await page.waitForTimeout(500);

    // Check returning visitor state - should see "The Loop Persists"
    await expect(page.locator('h1')).toHaveText(BRANDING.copy.title.returning);

    // Click CTA
    const ctaButton = page.locator(`button:has-text("${BRANDING.copy.button.cta}")`);
    await ctaButton.click();

    // Modal should show returning message
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[role="dialog"] h2')).toHaveText(BRANDING.copy.modal.title.returning);

    // Check for reset button (only shown to returning visitors)
    const resetButton = page.locator(`button:has-text("${BRANDING.copy.button.reset}")`);
    await expect(resetButton).toBeVisible();
  });

  test('reset flow', async ({ page }) => {
    // Start as returning visitor
    const joinTimestamp = new Date().toISOString();
    await initializeTestAdapter(page, {
      'fact.rip.visited': 'true',
      'fact.rip.joined': joinTimestamp
    });

    await page.goto('/');

    // Open modal
    const ctaButton = page.locator(`button:has-text("${BRANDING.copy.button.cta}")`);
    await ctaButton.click();

    // Click reset button
    const resetButton = page.locator(`button:has-text("${BRANDING.copy.button.reset}")`);
    await resetButton.click();

    // Wait for storage to be cleared
    await waitForStorageState(page, 'fact.rip.visited', null);
    await waitForStorageState(page, 'fact.rip.joined', null);

    // Verify storage was cleared
    const clearedStorage = await getStorageState(page);
    expect(clearedStorage['fact.rip.visited']).toBeUndefined();
    expect(clearedStorage['fact.rip.joined']).toBeUndefined();

    // Title should go back to first visit
    await expect(page.locator('h1')).toHaveText(BRANDING.copy.title.firstVisit);
  });

  test('keyboard navigation', async ({ page }) => {
    await initializeTestAdapter(page);
    await page.goto('/');

    // Tab to CTA button
    await page.keyboard.press('Tab');
    await expect(page.locator(`button:has-text("${BRANDING.copy.button.cta}")`)).toBeFocused();

    // Press Enter to activate
    await page.keyboard.press('Enter');

    // Modal should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Press Escape to close modal
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('network failure handling', async ({ page }) => {
    await initializeTestAdapter(page);

    // Block telemetry requests
    await page.route('**/api/telemetry', route => route.abort());

    await page.goto('/');

    // Click CTA - should still work despite network failure
    const ctaButton = page.locator(`button:has-text("${BRANDING.copy.button.cta}")`);
    await ctaButton.click();

    // Modal should still appear (graceful degradation)
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Storage should still be updated locally
    await waitForStorageState(page, 'fact.rip.visited', 'true');
  });

  test('error boundary recovery', async ({ page }) => {
    await initializeTestAdapter(page);

    // Navigate to app
    await page.goto('/');

    // Verify app is working normally first
    await expect(page.locator('h1')).toBeVisible();

    // Navigate to a non-existent route which should show 404 or error
    await page.goto('/this-route-does-not-exist-404');

    // The app should still be functional (either showing error boundary or normal content)
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();

    // Check if we can still navigate back
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});