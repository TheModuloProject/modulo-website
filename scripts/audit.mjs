import {chromium} from '@playwright/test';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { writeFile } from 'node:fs/promises';

const chrome = await launch({
  chromePath: process.env.MODULO_BROWSER_PATH || chromium.executablePath(),
  chromeFlags: ['--headless', '--disable-background-networking']
});
try {
  const result = await lighthouse('http://127.0.0.1:3000', {
    port: chrome.port,
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    logLevel: 'error'
  });
  await writeFile('docs/lighthouse-mobile.json', result.report);
  const report = result.lhr;
  console.log(JSON.stringify({
    categories: Object.fromEntries(Object.entries(report.categories).map(([id, item]) => [id, Math.round(item.score * 100)])),
    metrics: Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'speed-index'].map(id => [id, report.audits[id].displayValue])),
    failedAudits: Object.values(report.audits).filter(a => a.score !== null && a.score < 1 && !['manual', 'informative', 'notApplicable'].includes(a.scoreDisplayMode)).map(a => ({ title: a.title, value: a.displayValue, details: a.details?.items }))
  }, null, 2));
} finally { await chrome.kill(); }
