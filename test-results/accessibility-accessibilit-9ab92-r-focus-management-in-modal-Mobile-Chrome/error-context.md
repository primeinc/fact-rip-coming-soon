# Test info

- Name: accessibility >> should have proper focus management in modal
- Location: /Users/will/Dev/fact-rip-coming-soon/e2e/accessibility.spec.ts:13:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "DIV"
Received: "BODY"
    at /Users/will/Dev/fact-rip-coming-soon/e2e/accessibility.spec.ts:21:27
```

# Page snapshot

```yaml
- main:
  - heading "The Loop Persists." [level=1]
  - img "Custodes Engine Verified Seal"
  - button "Registering..." [disabled]
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import AxeBuilder from '@axe-core/playwright';
   3 |
   4 | test.describe('accessibility', () => {
   5 |   test('should not have any automatically detectable accessibility issues', async ({ page }) => {
   6 |     await page.goto('/');
   7 |     
   8 |     const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
   9 |     
   10 |     expect(accessibilityScanResults.violations).toEqual([]);
   11 |   });
   12 |
   13 |   test('should have proper focus management in modal', async ({ page }) => {
   14 |     await page.goto('/');
   15 |     
   16 |     // Open modal
   17 |     await page.click('button:has-text("Join the Watchtower")');
   18 |     
   19 |     // Focus should be trapped in modal
   20 |     const activeElement = await page.evaluate(() => document.activeElement?.tagName);
>  21 |     expect(activeElement).toBe('DIV'); // Modal container
      |                           ^ Error: expect(received).toBe(expected) // Object.is equality
   22 |     
   23 |     // Tab should cycle within modal
   24 |     await page.keyboard.press('Tab');
   25 |     const firstButton = await page.evaluate(() => document.activeElement?.textContent);
   26 |     expect(firstButton).toBe('Continue');
   27 |     
   28 |     await page.keyboard.press('Tab');
   29 |     const secondElement = await page.evaluate(() => document.activeElement?.tagName);
   30 |     expect(['BUTTON', 'DIV']).toContain(secondElement);
   31 |   });
   32 |
   33 |   test('should be navigable with keyboard only', async ({ page }) => {
   34 |     await page.goto('/');
   35 |     
   36 |     // Tab through all interactive elements
   37 |     const interactiveElements = [];
   38 |     
   39 |     for (let i = 0; i < 10; i++) {
   40 |       await page.keyboard.press('Tab');
   41 |       const element = await page.evaluate(() => {
   42 |         const el = document.activeElement;
   43 |         return {
   44 |           tag: el?.tagName,
   45 |           text: el?.textContent,
   46 |           role: el?.getAttribute('role')
   47 |         };
   48 |       });
   49 |       if (element.tag) {
   50 |         interactiveElements.push(element);
   51 |       }
   52 |     }
   53 |     
   54 |     // Should have at least the CTA button
   55 |     expect(interactiveElements.some(el => el.text?.includes('Join the Watchtower'))).toBeTruthy();
   56 |   });
   57 |
   58 |   test('should work with reduced motion', async ({ page }) => {
   59 |     // Enable prefers-reduced-motion
   60 |     await page.emulateMedia({ reducedMotion: 'reduce' });
   61 |     
   62 |     await page.goto('/');
   63 |     
   64 |     // Animations should still complete (but instantly)
   65 |     await expect(page.locator('h1')).toBeVisible();
   66 |     
   67 |     // All elements should be immediately visible
   68 |     await expect(page.locator('button')).toBeVisible();
   69 |     await expect(page.locator('img[alt="Custodes Engine Verified Seal"]')).toBeVisible();
   70 |   });
   71 |
   72 |   test('should have proper ARIA labels', async ({ page }) => {
   73 |     await page.goto('/');
   74 |     
   75 |     // Check ARIA labels exist
   76 |     const pulseLabel = await page.locator('[aria-label="Actor monitoring in progress"]');
   77 |     await expect(pulseLabel).toBeVisible();
   78 |     
   79 |     // Modal should have proper ARIA attributes
   80 |     await page.click('button:has-text("Join the Watchtower")');
   81 |     
   82 |     const modal = page.locator('[role="dialog"]');
   83 |     await expect(modal).toHaveAttribute('aria-modal', 'true');
   84 |     await expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
   85 |   });
   86 |
   87 |   test('should maintain 4.5:1 contrast ratio', async ({ page }) => {
   88 |     await page.goto('/');
   89 |     
   90 |     // This is a placeholder - in production you'd use axe-core contrast checks
   91 |     const contrastResults = await new AxeBuilder({ page })
   92 |       .withTags(['wcag2aa'])
   93 |       .analyze();
   94 |     
   95 |     const contrastViolations = contrastResults.violations.filter(v => 
   96 |       v.id.includes('contrast')
   97 |     );
   98 |     
   99 |     expect(contrastViolations).toHaveLength(0);
  100 |   });
  101 | });
```