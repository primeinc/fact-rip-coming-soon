import { Page } from '@playwright/test';

export interface TestStorageData {
  'fact.rip.visited'?: string;
  'fact.rip.joined'?: string;
}

interface WindowWithTestData {
  __JOURNEY_EVENTS__: Array<{ type: string; timestamp: number }>;
  __JOURNEY_EVENT_LISTENERS__: Set<unknown>;
}

export async function initializeTestAdapter(page: Page, data: TestStorageData = {}) {
  // Add initialization script that runs before page load
  await page.addInitScript((testData) => {
    // Mark as playwright test to disable runtime guards
    (window as unknown as { __playwright_test__: boolean }).__playwright_test__ = true;
    
    // The script will run when the page loads
    try {
      // Clear any existing storage
      localStorage.clear();
      
      // Set the initial data if provided
      Object.entries(testData).forEach(([key, value]) => {
        if (value) {
          localStorage.setItem(key, value);
        }
      });
      
      // Ensure events are tracked
      const win = window as unknown as WindowWithTestData;
      win.__JOURNEY_EVENTS__ = [];
      win.__JOURNEY_EVENT_LISTENERS__ = new Set();
    } catch (e) {
      console.error('Failed to initialize test adapter:', e);
    }
  }, data);
}

// Wait for a specific storage state
export async function waitForStorageState(
  page: Page,
  key: string,
  expectedValue: string | null,
  timeout = 5000
) {
  return page.waitForFunction(
    ({ key, value }) => {
      const actualValue = localStorage.getItem(key);
      return actualValue === value;
    },
    { key, value: expectedValue },
    { timeout }
  );
}

// Track journey events
export async function trackJourneyEvents(page: Page) {
  await page.addInitScript(() => {
    // Track events directly from app state changes
    const originalDispatchEvent = window.dispatchEvent;
    window.dispatchEvent = function(event: Event) {
      if (event.type.startsWith('journey:')) {
        console.log(`[Journey Event] ${event.type}`);
        const win = window as unknown as WindowWithTestData;
        win.__JOURNEY_EVENTS__ = [
          ...(win.__JOURNEY_EVENTS__ || []),
          { type: event.type, timestamp: Date.now() }
        ];
      }
      return originalDispatchEvent.call(window, event);
    };
  });
}

// Wait for journey event
export async function waitForJourneyEvent(page: Page, eventType: string, timeout = 5000) {
  return page.waitForFunction(
    (type) => {
      const win = window as unknown as WindowWithTestData;
      const events = win.__JOURNEY_EVENTS__ || [];
      return events.some((e) => e.type === type);
    },
    eventType,
    { timeout }
  );
}

// Get current storage state
export async function getStorageState(page: Page): Promise<TestStorageData> {
  return page.evaluate(() => {
    const state: TestStorageData = {
      'fact.rip.visited': localStorage.getItem('fact.rip.visited') || undefined,
      'fact.rip.joined': localStorage.getItem('fact.rip.joined') || undefined,
    };
    // Remove undefined values
    return Object.fromEntries(
      Object.entries(state).filter(([, v]) => v !== undefined)
    ) as TestStorageData;
  });
}

// Clear all test state
export async function clearTestState(page: Page) {
  // Use addInitScript to clear state on next navigation
  await page.addInitScript(() => {
    localStorage.clear();
    const win = window as unknown as WindowWithTestData;
    win.__JOURNEY_EVENTS__ = [];
  });
}