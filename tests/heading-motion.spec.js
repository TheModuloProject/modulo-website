import { test, expect } from '@playwright/test';

test('home headings type before their markers draw, without moving the layout or replaying', async ({ page }) => {
  await page.goto('/');
  const heading = page.locator('#services-title');
  await expect(heading).toHaveAttribute('data-type-state', 'ready');
  const before = await heading.boundingBox();
  const label = await heading.getAttribute('aria-label');
  expect(label).toBe('What we build.');
  await expect(page.getByRole('heading', { name: label, exact: true })).toHaveCount(1);
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute('data-type-state', 'typing');
  const stages = await heading.evaluate(element => {
    const animations = element.getAnimations({ subtree: true });
    function sample(time) {
      for (const animation of animations) { animation.pause(); animation.currentTime = time; }
      return {
        letters: [...element.querySelectorAll('.typing-character')].map(letter => getComputedStyle(letter).opacity),
        marker: parseFloat(getComputedStyle(element.querySelector('.headline-scribble path')).strokeDashoffset)
      };
    }
    const typing = sample(200);
    const drawing = sample(Number(element.dataset.typingDuration) + 300);
    animations.forEach(animation => animation.play());
    return { typing, drawing };
  });
  expect(stages.typing.letters).toContain('1');
  expect(stages.typing.letters).toContain('0');
  expect(stages.typing.marker).toBe(1);
  expect(stages.drawing.letters.every(opacity => opacity === '1')).toBe(true);
  expect(stages.drawing.marker).toBeGreaterThan(0);
  expect(stages.drawing.marker).toBeLessThan(1);
  await expect(heading).toHaveAttribute('data-type-state', 'complete');
  const after = await heading.boundingBox();
  expect(after.width).toBeCloseTo(before.width, 1);
  expect(after.height).toBeCloseTo(before.height, 1);
  await page.evaluate(() => scrollTo(0, 0));
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute('data-type-state', 'complete');
  expect(await heading.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('reduced motion keeps headings visible and cancels an in-progress typing sequence', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.typing-character')).toHaveCount(0);
  await expect(page.locator('.typing-ready')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  const heading = page.locator('#services-title');
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute('data-type-state', 'typing');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.typing-ready')).toHaveCount(0);
  expect(await page.locator('.typing-character').evaluateAll(letters => letters.every(letter => getComputedStyle(letter).opacity === '1'))).toBe(true);
  expect(await heading.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
});

test('navbar project scribble responds to focus and hover, matches the theme, and preserves navigation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The project link is displayed in the desktop navbar.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const link = page.locator('.header-cta');
  const path = link.locator('path');
  await expect(path).toHaveCSS('opacity', '0');
  await page.keyboard.press('Tab');
  await link.focus();
  await expect.poll(() => path.evaluate(element => parseFloat(getComputedStyle(element).strokeDashoffset))).toBe(0);
  await expect(path).toHaveCSS('opacity', '1');
  const light = await path.evaluate(element => getComputedStyle(element).stroke);
  await page.locator('.theme-toggle').click();
  await link.hover();
  await expect(path).toHaveCSS('opacity', '1');
  const dark = await path.evaluate(element => getComputedStyle(element).stroke);
  expect(dark).not.toBe(light);
  const marker = await page.locator('.headline-scribble path').first().evaluate(element => getComputedStyle(element).stroke);
  expect(dark).toBe(marker);
  await link.click();
  await expect(page).toHaveURL(/\/contact\/$/);
  await expect(link).toHaveAttribute('aria-current', 'page');
  await expect(path).toHaveCSS('opacity', '1');
});
