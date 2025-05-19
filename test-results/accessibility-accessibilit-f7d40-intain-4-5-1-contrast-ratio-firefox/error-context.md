# Test info

- Name: accessibility >> should maintain 4.5:1 contrast ratio
- Location: /Users/will/Dev/fact-rip-coming-soon/e2e/accessibility.spec.ts:87:3

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 0
Received length: 1
Received array:  [{"description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds", "help": "Elements must meet minimum color contrast ratio thresholds", "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/color-contrast?application=playwright", "id": "color-contrast", "impact": "serious", "nodes": [{"all": [], "any": [{"data": {"bgColor": "#000000", "contrastRatio": 1.25, "expectedContrastRatio": "3:1", "fgColor": "#1e1e1e", "fontSize": "42.0pt (56px)", "fontWeight": "bold", "messageKey": null}, "id": "color-contrast", "impact": "serious", "message": "Element has insufficient color contrast of 1.25 (foreground color: #1e1e1e, background color: #000000, font size: 42.0pt (56px), font weight: bold). Expected contrast ratio of 3:1", "relatedNodes": [{"html": "<main class=\"relative flex flex-col items-center justify-between min-h-[100vh] bg-black text-white\" style=\"min-height: calc(var(--vh, 1vh) * 100);\">", "target": ["main"]}]}], "failureSummary": "Fix any of the following:
  Element has insufficient color contrast of 1.25 (foreground color: #1e1e1e, background color: #000000, font size: 42.0pt (56px), font weight: bold). Expected contrast ratio of 3:1", "html": "<h1 class=\"text-center text-[28px] sm:text-[36px] md:text-[48px] lg:text-[56px]·
                 leading-[1.1] font-bold tracking-tight\" style=\"opacity: 0; transform: translateY(35.343px);\">The Loop Persists.</h1>", "impact": "serious", "none": [], "target": ["h1"]}], "tags": ["cat.color", "wcag2aa", "wcag143", "TTv5", "TT13.c", "EN-301-549", "EN-9.1.4.3", "ACT"]}]
    at /Users/will/Dev/fact-rip-coming-soon/e2e/accessibility.spec.ts:99:32
```

# Page snapshot

```yaml
- main:
  - heading "The Loop Persists." [level=1]
  - img "Custodes Engine Verified Seal"
  - button "Join the Watchtower"
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
   21 |     expect(activeElement).toBe('DIV'); // Modal container
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
>  99 |     expect(contrastViolations).toHaveLength(0);
      |                                ^ Error: expect(received).toHaveLength(expected)
  100 |   });
  101 | });
```