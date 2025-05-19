/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';

// Extend the base test with setup and cleanup
export const test = base.extend({
  page: async ({ page }, use) => {
    // Don't automatically clear localStorage - let tests manage this
    // Tests can use initializeTestAdapter to set up their desired state
    
    // Run the test
    await use(page);
    
    // Post-test cleanup (only if page is still open)
    try {
      await page.evaluate(() => {
        try {
          localStorage.clear();
        } catch {
          // Ignore errors
        }
      });
    } catch {
      // Page might be closed already
    }
  }
});

export { expect } from '@playwright/test';