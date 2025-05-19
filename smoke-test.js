#!/usr/bin/env node

import { chromium } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

const VIEWPORT_SIZES = [
  { name: 'iPhone-SE', width: 375, height: 667 },
  { name: 'iPhone-12', width: 390, height: 844 },
  { name: 'Desktop', width: 1920, height: 1080 }
];

async function runSmokeTest() {
  console.log('🔥 Running smoke tests...');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Create screenshots directory
  await fs.mkdir('screenshots', { recursive: true });

  try {
    // Test each viewport
    for (const viewport of VIEWPORT_SIZES) {
      console.log(`📱 Testing ${viewport.name}...`);

      await page.setViewportSize(viewport);
      await page.goto('http://localhost:5173');

      // Wait for animations to start
      await page.waitForTimeout(1000);

      // Check if title is visible
      const titleVisible = await page.isVisible('h1');
      if (!titleVisible) {
        throw new Error(`Title not visible on ${viewport.name}`);
      }

      // Check if button exists and is clickable
      const button = await page.locator('button');
      if (!await button.isVisible()) {
        throw new Error(`Button not visible on ${viewport.name}`);
      }

      // Take screenshot
      const screenshotPath = path.join('screenshots', `${viewport.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Test button click
      await button.click();
      await page.waitForTimeout(500);

      // Check localStorage
      const joined = await page.evaluate(() => localStorage.getItem('fact.rip.joined'));
      if (!joined) {
        throw new Error(`Button click not recorded on ${viewport.name}`);
      }

      console.log(`✅ ${viewport.name} passed`);
    }

    console.log('🎉 All smoke tests passed!');

  } catch (error) {
    console.error('❌ Smoke test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Only run if dev server is running
fetch('http://localhost:5173')
  .then(() => runSmokeTest())
  .catch(() => {
    console.error('❌ Dev server not running. Start it with: pnpm run dev');
    process.exit(1);
  });