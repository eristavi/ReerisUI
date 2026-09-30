import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

test('published routes and assets work under the GitHub Pages base', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const routes = [...fs.readdirSync('docs').filter(name => name.endsWith('.html')).map(name => `docs/${name}`),
    ...fs.readdirSync('examples/starters').filter(name => name.endsWith('.html')).map(name => `examples/starters/${name}`)];
  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response.status(), route).toBe(200);
    await expect(page.locator('[data-docs-theme]'), route).toBeVisible();
    await expect(page.locator('meta[name="generator"]'), route).toHaveAttribute('content', /^Astro/);
  }
  expect(errors).toEqual([]);
});

for (const [device, viewport] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  test(`${device}: navigation, API filtering, theme persistence and layout`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const pages = ['docs/index.html', 'docs/api-reference.html', 'docs/forms-complete.html', 'docs/typography.html', 'examples/starters/authentication.html'];
    for (const route of pages) {
      await page.goto(route);
      await expect(page.locator('[data-docs-theme]')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), route).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`${device}-${path.basename(route, '.html')}.png`) });
    }
    await page.goto('docs/api-reference.html');
    await page.locator('[data-docs-filter="classes"]').fill('btn-close');
    const visible = page.locator('[data-docs-table="classes"] [data-docs-row]:visible');
    await expect(visible).toHaveCount(1);
    await expect(visible).toContainText('.btn-close');
    await page.locator('[data-docs-theme]').selectOption('glass');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'glass');
    await page.locator('.docs-topnav').getByRole('link', { name: 'Docs', exact: true }).click();
    await expect(page).toHaveURL(/\/ReerisUI\/docs\/index\.html$/);
    await expect(page.locator('[data-docs-theme]')).toHaveValue('glass');
    await page.locator('[data-docs-directory-search]').fill('typography');
    await expect(page.locator('[data-docs-directory-card]:visible')).toHaveCount(2);
    await page.locator('[data-docs-theme]').selectOption('system');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  });
}

test('Preview/HTML tabs work with JavaScript disabled', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/ReerisUI/docs/button.html');
  const tabs = page.locator('.docs-example-tabs').first();
  await expect(tabs.locator('.docs-example-preview')).toBeVisible();
  await tabs.getByText('HTML', { exact: true }).click();
  await expect(tabs.locator('.docs-example-code')).toBeVisible();
  await expect(tabs.locator('.docs-example-code code')).toContainText('<button class="btn primary">');
  await expect(tabs.locator('.docs-example-preview')).toBeHidden();
  await page.screenshot({ path: testInfo.outputPath('phone-css-html-tab.png') });
  await context.close();
});
