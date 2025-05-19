#!/usr/bin/env node
import puppeteer from 'puppeteer';

const viewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'Desktop', width: 1920, height: 1080 }
];

async function testViewports() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5173');

    for (const viewport of viewports) {
      await page.setViewport(viewport);

      // Wait for animations to start
      await page.waitForTimeout(1000);

      // Take screenshot
      await page.screenshot({
        path: `screenshots/${viewport.name.toLowerCase().replace(' ', '-')}.png`
      });

      // Check if title is visible
      const titleVisible = await page.evaluate(() => {
        const title = document.querySelector('h1');
        return title && window.getComputedStyle(title).opacity !== '0';
      });

      console.log(`${viewport.name}: Title visible: ${titleVisible}`);

      // Check button functionality
      await page.click('button');
      await page.waitForTimeout(500);

      const alertShown = await page.evaluate(() => {
        return window.localStorage.getItem('fact.rip.joined') !== null;
      });

      console.log(`${viewport.name}: Button works: ${alertShown}`);
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testViewports();