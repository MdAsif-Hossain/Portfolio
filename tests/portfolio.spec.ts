import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('production page renders WebGL, images and valid internal anchors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('get things done');
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Pause 3D animation' }).click();
  await expect(page.getByRole('button', { name: 'Play 3D animation' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const missing = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute('href')!)
        .filter((href) => !document.getElementById(href.slice(1))),
    );
  expect(missing).toEqual([]);
  await page.locator('.portrait').scrollIntoViewIfNeeded();
  await expect(page.locator('.portrait img')).toBeVisible();
  await expect
    .poll(() =>
      page.locator('.portrait img').evaluate((img) => (img as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('project filters update the URL and browser history', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'AI engineering', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(1);
  await expect(page.locator('.project-card')).toContainText('Attest');
  await expect(page).toHaveURL(/work=AI\+engineering/);
  await page.getByRole('button', { name: 'Agentic AI', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(2);
  await page.goBack();
  await expect(page.locator('.project-card')).toHaveCount(1);
});

test('retrieval demo answers, reveals sources, and declines unknown questions', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?work=AI+engineering');
  await page.getByRole('button', { name: 'Show me his agentic AI work' }).click();
  await expect(page.locator('.agent-result')).toContainText('AgriBot');
  await page.locator('.agent-result').getByRole('link', { name: 'AgriBot', exact: true }).click();
  await expect(page.locator('#p-agribot')).toBeVisible();
  await expect(page.locator('.project-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'What research has he published?' }).click();
  await expect(page.locator('.agent-result')).toContainText(
    'Two accepted IEEE papers. Two preprints.',
  );
  await expect(page.locator('.agent-result ul > li')).toHaveCount(4);
  await page.getByLabel('Ask about Asif’s work').fill('<script>quantum_cheesemaking</script>');
  await page.getByRole('button', { name: 'Run portfolio workflow' }).click();
  await expect(page.locator('.agent-result')).toContainText('I don’t have enough evidence');
  await expect(page.locator('.agent-result script')).toHaveCount(0);
  await page.getByText('Inspect execution details').click();
  await expect(page.locator('.trace-details ol')).toBeVisible();
});

test('certificate modal supports Escape and restores focus', async ({ page }) => {
  await page.goto('/');
  const certificate = page.getByRole('button', { name: /Machine Learning Specialization/ });
  await certificate.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Verify certificate' })).toHaveAttribute(
    'href',
    'https://coursera.org/verify/specialization/KQ8UEJW7OHWO',
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(certificate).toBeFocused();
});

test('loading feedback and email copy work without a backend', async ({ page, context }) => {
  const apiCalls: string[] = [];
  page.on('request', (request) => {
    if (['fetch', 'xhr'].includes(request.resourceType())) apiCalls.push(request.url());
  });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await expect(page.locator('.empty-output')).toContainText('Choose a question');
  await page.getByRole('button', { name: 'Why hire Asif?' }).click();
  await expect(page.locator('.output-heading')).toContainText('Running…');
  await expect(page.getByRole('button', { name: 'Run portfolio workflow' })).toBeDisabled();
  await expect(page.locator('.agent-result')).toContainText('Engineering depth. Research mindset.');
  expect(apiCalls).toEqual([]);
  await page.getByRole('button', { name: 'Copy email address' }).click();
  await expect(page.locator('.email-group')).toContainText('Copied!');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'asifhossain8612@gmail.com',
  );
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new Error('Clipboard denied');
    };
  });
  await page.getByRole('button', { name: 'Email copied' }).click();
  await expect(page.locator('.email-group')).toContainText('Select the email to copy it.');
});

test('mobile menu, keyboard focus, and responsive widths', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page.getByRole('navigation')).not.toBeVisible();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `No overflow at ${width}px`,
    ).toBe(true);
  }
});

test('reduced motion and no-WebGL visitors can still use the site', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type.startsWith('webgl')) return null;
      return original.call(this, type, ...args);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.locator('.orb-fallback')).toBeVisible();
  await page.getByRole('button', { name: 'Why hire Asif?' }).click();
  await expect(page.locator('.agent-result')).toContainText('Engineering depth. Research mindset.');
});

test('WCAG accessibility scan passes on desktop and mobile', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Pause 3D animation' }).click();
  const desktop = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(desktop.violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(mobile.violations).toEqual([]);
});
