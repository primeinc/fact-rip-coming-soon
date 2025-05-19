import { test } from '@playwright/test';

test('debug what is on page', async ({ page }) => {
  // Listen for console messages before navigation
  page.on('console', msg => {
    console.log(`[${msg.type()}]`, msg.text());
  });

  page.on('pageerror', err => {
    console.log('Page error:', err.message);
  });

  // Clear localStorage before navigation
  await page.addInitScript(() => {
    localStorage.clear();
  });

  // Go to page
  await page.goto('/');

  // Wait a bit for app to load
  await page.waitForTimeout(3000);

  // Get page content
  const html = await page.content();
  console.log('Page HTML (trimmed):', html.substring(0, 500));

  // Check if app rendered
  const hasMain = await page.locator('main').count();
  console.log('Has main element:', hasMain);

  // Check for any h1 elements
  const h1Count = await page.locator('h1').count();
  console.log('H1 count:', h1Count);

  // Get any text content
  const bodyText = await page.locator('body').textContent();
  console.log('Body text:', bodyText);

  await page.screenshot({ path: 'debug-screenshot.png' });
});