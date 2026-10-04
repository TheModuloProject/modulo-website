import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    browserName: 'chromium',
    colorScheme: 'light',
    launchOptions: process.env.MODULO_BROWSER_PATH ? { executablePath: process.env.MODULO_BROWSER_PATH } : {},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 960 } } },
    { name: 'tablet', use: { viewport: { width: 834, height: 1194 }, hasTouch: true } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
    { name: 'compact', use: { viewport: { width: 320, height: 700 }, hasTouch: true, isMobile: true } }
  ]
});
