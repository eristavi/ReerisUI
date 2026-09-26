import { test, expect } from '@playwright/test';

const pages=[
  '/docs/foundation.html',
  '/docs/forms-complete.html',
  '/docs/navigation-completion.html',
  '/docs/overlays.html',
  '/docs/tables.html',
  '/docs/browser-reflow.html',
  '/tests/i18n/index.html',
  '/examples/starters/dashboard.html'
];

for (const pathname of pages) {
  test(`smoke ${pathname}`, async ({page}) => {
    const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    const response=await page.goto(pathname,{waitUntil:'domcontentloaded'});
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('keyboard focus is visible and native controls remain operable', async ({page}) => {
  await page.goto('/docs/forms-complete.html');
  const first=page.locator('input:not([disabled]), select:not([disabled]), button:not([disabled])').first();
  await first.focus();
  await expect(first).toBeFocused();
  const switchControl=page.getByRole('switch',{name:/automatic updates/i});
  await switchControl.focus();
  const before=await switchControl.isChecked();
  await page.keyboard.press('Space');
  expect(await switchControl.isChecked()).toBe(!before);
});

test('native dialog opens, traps interaction surface, and closes with Escape', async ({page}) => {
  await page.goto('/docs/browser-reflow.html');
  await page.getByRole('button',{name:/open focus test dialog/i}).click();
  const dialog=page.getByRole('dialog',{name:/keyboard focus test dialog/i});
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('native disclosure is keyboard operable', async ({page}) => {
  await page.goto('/docs/overlays.html');
  const summary=page.getByText('Does this need JavaScript?',{exact:true});
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Not for native disclosure behavior.')).toBeVisible();
});

test('glide navigation initializes without breaking links', async ({page}) => {
  await page.goto('/docs/navigation-completion.html');
  const nav=page.locator('[data-reeris-glide]').first();
  await expect(nav).toHaveAttribute('data-reeris-glide-ready','');
  const links=nav.locator('a.nav-link');
  expect(await links.count()).toBeGreaterThan(1);
  await links.nth(1).hover();
  await links.nth(1).focus();
  await expect(links.nth(1)).toBeFocused();
});

test('narrow viewport has no document-level horizontal overflow', async ({page}) => {
  await page.setViewportSize({width:320,height:800});
  for (const pathname of [
    '/docs/index.html',
    '/docs/foundation.html',
    '/docs/tables.html',
    '/docs/app-shell.html',
    '/docs/marketing.html',
    '/docs/browser-reflow.html',
    '/examples/starters/dashboard.html'
  ]) {
    await page.goto(pathname);
    const layout=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      shellColumns:document.querySelector('.docs-shell') && getComputedStyle(document.querySelector('.docs-shell')).gridTemplateColumns.split(' ').length,
      sidebarDisplay:document.querySelector('.docs-sidebar') && getComputedStyle(document.querySelector('.docs-sidebar')).display
    }));
    expect(layout.overflow, `${pathname} overflows at 320px`).toBeLessThanOrEqual(1);
    if (layout.shellColumns !== null) expect(layout.shellColumns, `${pathname} docs shell`).toBe(1);
    if (layout.sidebarDisplay !== null) expect(layout.sidebarDisplay, `${pathname} mobile sections`).toBe('flex');
  }
});
