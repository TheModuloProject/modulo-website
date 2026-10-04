import { chromium } from '@playwright/test';
const browser = await chromium.launch({});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:3000/assets/social-preview.svg');
  await page.screenshot({ path: 'assets/social-preview.png' });
} finally { await browser.close(); }
