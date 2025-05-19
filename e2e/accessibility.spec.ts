import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    
    // Wait for animations to complete
    await page.waitForTimeout(3000);
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper focus management in modal', async ({ page }) => {
    await page.goto('/');
    
    // Open modal
    await page.click('button:has-text("Join the Watchtower")');
    
    // Wait for modal to appear and focus to be set
    await page.waitForSelector('[role="dialog"]');
    await page.waitForTimeout(100); // Allow focus to settle
    
    // Focus should be trapped in modal
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBe('DIV'); // Modal container
    
    // Tab should cycle within modal
    await page.keyboard.press('Tab');
    const firstButton = await page.evaluate(() => document.activeElement?.textContent);
    expect(firstButton).toBe('Continue');
    
    await page.keyboard.press('Tab');
    const secondElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'DIV']).toContain(secondElement);
  });

  test('should be navigable with keyboard only', async ({ page }) => {
    await page.goto('/');
    
    // Tab through all interactive elements
    const interactiveElements = [];
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const element = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el?.tagName,
          text: el?.textContent,
          role: el?.getAttribute('role')
        };
      });
      if (element.tag) {
        interactiveElements.push(element);
      }
    }
    
    // Should have at least the CTA button
    expect(interactiveElements.some(el => el.text?.includes('Join the Watchtower'))).toBeTruthy();
  });

  test('should work with reduced motion', async ({ page }) => {
    // Enable prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    
    // Animations should still complete (but instantly)
    await expect(page.locator('h1')).toBeVisible();
    
    // All elements should be immediately visible
    await expect(page.locator('button')).toBeVisible();
    await expect(page.locator('img[alt="Custodes Engine Verified Seal"]')).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check ARIA labels exist
    const pulseLabel = await page.locator('[aria-label="Actor monitoring in progress"]');
    await expect(pulseLabel).toBeVisible();
    
    // Modal should have proper ARIA attributes
    await page.click('button:has-text("Join the Watchtower")');
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  test('should maintain 4.5:1 contrast ratio', async ({ page }) => {
    await page.goto('/');
    
    // Wait for animations to complete
    await page.waitForTimeout(3000);
    
    // This is a placeholder - in production you'd use axe-core contrast checks
    const contrastResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();
    
    const contrastViolations = contrastResults.violations.filter(v => 
      v.id.includes('contrast')
    );
    
    expect(contrastViolations).toHaveLength(0);
  });
});