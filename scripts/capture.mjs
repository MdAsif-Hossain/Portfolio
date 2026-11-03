import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.goto(process.env.PREVIEW_URL || 'http://localhost:5173/', { waitUntil: 'networkidle' });
await page.locator('.hero').waitFor();
await page.getByRole('button', { name: 'Pause 3D animation' }).click();
await page.locator('.portrait').scrollIntoViewIfNeeded();
await page.locator('.portrait img').evaluate((img) => img.decode());
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
});
await page.screenshot({ path: 'artifacts/desktop.png', fullPage: true });
await page.screenshot({ path: 'artifacts/hero.png' });
await page.locator('#projects').screenshot({ path: 'artifacts/projects.png' });
await page.locator('#about').screenshot({ path: 'artifacts/about.png' });
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: 'artifacts/mobile.png', fullPage: true });
await page.screenshot({ path: 'artifacts/mobile-hero.png' });
await page.locator('#contact').screenshot({ path: 'artifacts/mobile-contact.png' });
console.log(
  JSON.stringify(
    {
      errors,
      title: await page.title(),
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      canvas: await page.locator('canvas').count(),
    },
    null,
    2,
  ),
);
await browser.close();
