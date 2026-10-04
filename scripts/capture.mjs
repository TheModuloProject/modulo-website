import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('docs/previews', { recursive: true });
const browser = await chromium.launch({});
const records = [];
try {
  for (const [name, width, height] of [['desktop', 1440, 960], ['tablet', 834, 1194], ['mobile', 390, 844], ['compact', 320, 700], ['wide-mobile', 600, 900]]) {
    const context = await browser.newContext({ viewport: { width, height }, colorScheme: 'light' });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('http://127.0.0.1:3000');
    await page.waitForFunction(() => !document.documentElement.classList.contains('motion-ready'));
    await page.screenshot({ path: `docs/previews/${name}-light.png`, fullPage: false });
    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await page.waitForFunction(() => !document.documentElement.classList.contains('theme-changing'));
    await page.screenshot({ path: `docs/previews/${name}-dark.png`, fullPage: false });
    records.push({ name, width, height, ...await page.evaluate(() => ({ cls: window.__cls, overflow: document.documentElement.scrollWidth > innerWidth, requests: performance.getEntriesByType('resource').map(item => ({ url: item.name, bytes: item.transferSize })) })) });
    if (name === 'mobile') {
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      await page.waitForFunction(() => document.getAnimations().every(a => a.playState === 'finished' || a.playState === 'idle'));
      await page.screenshot({ path: 'docs/previews/mobile-menu-dark.png', fullPage: false });
    }
    await context.close();
  }
  await writeFile('docs/browser-measurements.json', JSON.stringify(records, null, 2) + '\n');
  console.log(JSON.stringify(records.map(({ name, width, height, cls, overflow, requests }) => ({ name, width, height, cls, overflow, transferBytes: requests.reduce((sum, item) => sum + item.bytes, 0) })), null, 2));
} finally { await browser.close(); }
