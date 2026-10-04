import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const settle = page => expect(page.locator('html')).not.toHaveClass(/theme-changing|motion-ready/);

async function watchLayoutShifts(page) {
  await page.addInitScript(() => {
    window.__layoutShift = 0;
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__layoutShift += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
}

test('hero loads without errors, horizontal overflow or layout shifts', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await watchLayoutShifts(page);
  await page.goto('/');
  await settle(page);
  await expect(page.getByRole('heading', { name: 'TheModuloProject', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Digital products people remember.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => window.__layoutShift)).toBeLessThan(.1);
  expect(errors).toEqual([]);
});

test('light and dark themes have no WCAG A/AA violations', async ({ page }) => {
  await page.goto('/');
  await settle(page);
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') {
      await page.getByRole('button', { name: 'Switch to dark mode' }).click();
      await settle(page);
    }
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(result.violations).toEqual([]);
  }
});

test('theme reveal runs, blocks repeated toggles, and persists after reload', async ({ page }) => {
  await watchLayoutShifts(page);
  await page.goto('/');
  await settle(page);
  // Observe the transient reveal in the page's own frame loop so that a busy
  // test runner cannot miss the entire 760ms animation between protocol calls.
  const observation = await page.evaluate(async () => {
    const button = document.querySelector('.theme-toggle');
    button.click();
    const busy = document.documentElement.classList.contains('theme-changing');
    button.click();
    const animation = await new Promise(resolve => {
      function inspect() {
        const active = document.getAnimations().find(item => item.effect.getKeyframes().some(key => String(key.clipPath).includes('circle(')));
        if (active) resolve({ duration: active.effect.getTiming().duration, keys: active.effect.getKeyframes() });
        else if (!document.documentElement.classList.contains('theme-changing')) resolve(null);
        else requestAnimationFrame(inspect);
      }
      requestAnimationFrame(inspect);
    });
    return { busy, animation };
  });
  expect(observation.busy).toBe(true);
  expect(observation.animation.duration).toBe(760);
  expect(observation.animation.keys.some(key => String(key.clipPath).includes('circle('))).toBe(true);
  await settle(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => window.__layoutShift)).toBeLessThan(.1);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => localStorage.getItem('modulo-theme'))).toBe('dark');
});

test('system preference is honored until the visitor selects a theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await settle(page);
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await settle(page);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('reduced motion removes entrance, reveal and menu animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' || a.pending).length)).toBe(0);
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).not.toHaveClass(/theme-changing/);
  expect(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' || a.pending).length)).toBe(0);
  if (await page.getByRole('button', { name: 'Menu', exact: true }).isVisible()) {
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    expect(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' || a.pending).length)).toBe(0);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  }
});

test('fallback smoothly interpolates without the View Transitions API', async ({ page }) => {
  await page.addInitScript(() => { document.startViewTransition = undefined; });
  await page.goto('/');
  await settle(page);
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveClass(/theme-fallback/);
  expect(await page.evaluate(() => document.getAnimations().some(a => a.effect.getTiming().duration === 760))).toBe(true);
  await settle(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).not.toHaveClass(/theme-fallback/);
});

test('mobile menu traps focus, closes with Escape and restores its trigger', async ({ page }) => {
  await page.goto('/');
  await settle(page);
  const toggle = page.getByRole('button', { name: 'Menu', exact: true });
  test.skip(!(await toggle.isVisible()), 'Desktop shows the full navigation.');
  await toggle.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('dialog').getByRole('link', { name: 'Start a project' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close' })).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' || a.pending).length)).toBe(0);
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(result.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('body')).not.toHaveClass(/menu-open/);
  // Repeated opening and close-button use must remain reliable.
  await toggle.click();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('controls have 44px touch targets; all contact links use the existing email', async ({ page }) => {
  await page.goto('/');
  await settle(page);
  for (const selector of ['.theme-toggle', '.menu-toggle', '.brand', '.text-link', '.header-cta']) {
    for (const control of await page.locator(selector).all()) {
      if (await control.isVisible()) expect((await control.boundingBox()).height).toBeGreaterThanOrEqual(44);
    }
  }
  for (const link of await page.locator('a[href^="mailto:"]').all()) expect(await link.getAttribute('href')).toContain('hello@themoduloproject.com');
  await expect(page.getByRole('link', { name: 'View our work' })).toHaveAttribute('href', '/work/');
});

test('semantic content and SEO metadata are valid', async ({ page, request }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Websites, Web Apps & Custom Software in the UAE/);
  expect(await page.locator('h1').count()).toBe(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://themoduloproject.com/');
  const data = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(data.name).toBe('TheModuloProject');
  expect(data.areaServed.name).toBe('United Arab Emirates');
  expect((await request.get('/robots.txt')).status()).toBe(200);
  expect((await request.get('/sitemap.xml')).status()).toBe(200);
  expect((await request.get('/assets/social-preview.png')).status()).toBe(200);
});

test('server supplies security headers and does not expose private project files', async ({ request }) => {
  const response = await request.get('/');
  const headers = response.headers();
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['content-security-policy']).not.toContain("script-src 'self' 'unsafe-inline'");
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  for (const path of ['/package.json', '/.env', '/scripts/server.mjs', '/docs/PHASE-1.md', '/assets/%2e%2e/package.json']) {
    expect((await request.get(path)).status()).toBe(404);
  }
  expect((await request.post('/')).status()).toBe(405);
});


test('composition remains inside the viewport at every breakpoint', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The sweep uses one browser across all sizes.');
  await page.goto('/');
  await settle(page);
  for (const width of [320, 360, 390, 480, 600, 767, 768, 834, 1000, 1001, 1280, 1440, 1920, 2560, 2816]) {
    await page.setViewportSize({ width, height: 900 });
    const result = await page.evaluate(() => {
      const bounds = ['.hero-title', '.hero-proposition', '.modulo-object'].map(selector => document.querySelector(selector).getBoundingClientRect());
      const [title, proposition, object] = bounds;
      const firstLine = document.querySelector('.title-line-one').getBoundingClientRect();
      const projectRange = document.createRange();
      projectRange.selectNodeContents(document.querySelector('.title-line-two'));
      const projectText = projectRange.getBoundingClientRect();
      const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        propositionOverlapsTitle: !(proposition.top >= title.bottom || proposition.bottom <= title.top || proposition.left >= title.right || proposition.right <= title.left),
        markOverlapsProposition: !(proposition.top >= object.bottom || proposition.bottom <= object.top || proposition.left >= object.right || proposition.right <= object.left),
        desktopMarkOverlapsTitle: innerWidth > 1000 && (overlaps(object, firstLine) || overlaps(object, projectText))
      };
    });
    expect(result.overflow, `overflow at ${width}px`).toBe(false);
    expect(result.propositionOverlapsTitle, `proposition over title at ${width}px`).toBe(false);
    expect(result.markOverlapsProposition, `mark over proposition at ${width}px`).toBe(false);
    expect(result.desktopMarkOverlapsTitle, `mark over title text at ${width}px`).toBe(false);
  }
});
