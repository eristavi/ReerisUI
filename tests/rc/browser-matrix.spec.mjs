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
  await page.getByRole('button',{name:/open keyboard test dialog/i}).click();
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
      sidebarDisplay:document.querySelector('.docs-sidebar') && getComputedStyle(document.querySelector('.docs-sidebar')).display,
      offenders:[...document.querySelectorAll('body *')].filter(el=>{
        const box=el.getBoundingClientRect();
        return box.width && (box.right>document.documentElement.clientWidth+1 || box.left<-1);
      }).slice(0,8).map(el=>`${el.tagName.toLowerCase()}${el.className && typeof el.className==='string' ? '.'+el.className.trim().replace(/\s+/g,'.') : ''} (${Math.round(el.getBoundingClientRect().left)}–${Math.round(el.getBoundingClientRect().right)}; ${el.textContent.trim().slice(0,40)})`)
    }));
    expect(layout.overflow, `${pathname} overflows at 320px: ${layout.offenders.join(', ')}`).toBeLessThanOrEqual(1);
    if (layout.shellColumns !== null) expect(layout.shellColumns, `${pathname} docs shell`).toBe(1);
    if (layout.sidebarDisplay !== null) expect(layout.sidebarDisplay, `${pathname} mobile sections`).toBe('flex');
  }
});

test('conversation header keeps the contact name and status readable', async ({page}) => {
  for (const width of [320, 390, 1024]) {
    await page.setViewportSize({width,height:800});
    await page.goto('/docs/messaging.html');
    const layout=await page.locator('.conversation-header').evaluate(header=>{
      const name=header.querySelector('.identity-name');
      const meta=header.querySelector('.identity-meta');
      const lineHeight=element=>parseFloat(getComputedStyle(element).lineHeight);
      return {
        nameHeight:name.getBoundingClientRect().height,
        nameLineHeight:lineHeight(name),
        metaHeight:meta.getBoundingClientRect().height,
        metaLineHeight:lineHeight(meta),
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
      };
    });
    expect(layout.nameHeight, `${width}px contact name wraps`).toBeLessThanOrEqual(layout.nameLineHeight+1);
    expect(layout.metaHeight, `${width}px contact status wraps`).toBeLessThanOrEqual(layout.metaLineHeight+1);
    expect(layout.overflow, `${width}px document overflow`).toBeLessThanOrEqual(1);
  }
});

test('form addons and native date/time inputs fit phone cards', async ({page}) => {
  for (const width of [320,390]) {
    await page.setViewportSize({width,height:800});
    await page.goto('/docs/forms-complete.html');
    const layout=await page.evaluate(()=>{
      const budget=[...document.querySelectorAll('.field.horizontal')].find(el=>el.textContent.includes('Monthly budget'));
      const group=budget.querySelector('.input-group');
      const suffix=group.querySelector('.input-addon:last-child');
      const field=group.querySelector('input');
      const native=[...document.querySelectorAll('input[type="date"],input[type="time"]')];
      const fits=(inner,outer)=>inner.getBoundingClientRect().right<=outer.getBoundingClientRect().right+1;
      return {
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        groupFits:fits(group,budget),
        suffixFits:fits(suffix,group),
        suffixOneLine:suffix.getBoundingClientRect().height<=field.getBoundingClientRect().height+2,
        nativeFit:native.map(input=>fits(input,input.closest('.panel'))),
        nativeValues:native.map(input=>input.value)
      };
    });
    expect(layout.overflow, `${width}px document overflow`).toBeLessThanOrEqual(1);
    expect(layout.groupFits, `${width}px budget group`).toBe(true);
    expect(layout.suffixFits, `${width}px budget suffix`).toBe(true);
    expect(layout.suffixOneLine, `${width}px budget suffix wrap`).toBe(true);
    expect(layout.nativeFit, `${width}px native controls`).toEqual([true,true]);
    expect(layout.nativeValues).toEqual(['2026-09-26','09:30']);
  }
});

test('steps keep markers, labels, and connectors aligned on phones', async ({page}) => {
  for (const width of [320,390]) {
    await page.setViewportSize({width,height:800});
    await page.goto('/docs/navigation.html');
    const layout=await page.locator('.steps').first().evaluate(steps=>({
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      items:[...steps.querySelectorAll('.step')].map(step=>{
        const marker=getComputedStyle(step,'::before');
        const connector=getComputedStyle(step,'::after');
        const box=step.getBoundingClientRect();
        const label=step.querySelector('.step-label').getBoundingClientRect();
        return {
          markerColumn:marker.gridColumnStart,
          markerRow:marker.gridRowStart,
          labelColumn:getComputedStyle(step.querySelector('.step-label')).gridColumnStart,
          labelOffset:label.left-box.left,
          labelFits:label.right<=box.right+1,
          connectorOffset:parseFloat(connector.left),
          connectorWidth:parseFloat(connector.width)
        };
      })
    }));
    expect(layout.overflow, `${width}px navigation overflow`).toBeLessThanOrEqual(1);
    expect(layout.items).toHaveLength(4);
    for (const item of layout.items) {
      expect(item.markerColumn, `${width}px marker column`).toBe('1');
      expect(item.markerRow, `${width}px marker row`).toBe('1');
      expect(item.labelColumn, `${width}px label column`).toBe('2');
      expect(item.labelOffset, `${width}px label offset`).toBeGreaterThanOrEqual(40);
      expect(item.labelFits, `${width}px label fits`).toBe(true);
    }
    for (const item of layout.items.slice(0,-1)) {
      expect(item.connectorOffset, `${width}px connector center`).toBe(16);
      expect(item.connectorWidth, `${width}px connector width`).toBe(1);
    }
  }
});

test('workflow stepper retains its distinct markers on phones', async ({page}) => {
  await page.setViewportSize({width:320,height:800});
  await page.goto('/docs/workflow.html');
  const layout=await page.locator('.stepper > .step').first().evaluate(step=>({
    markerVisible:getComputedStyle(step.querySelector('.step-marker')).display,
    navigationConnector:getComputedStyle(step,'::after').content,
    labelColumn:getComputedStyle(step.querySelector('.step-label')).gridColumnStart,
    lineWidth:getComputedStyle(step.nextElementSibling,'::before').width
  }));
  expect(layout.markerVisible).toBe('grid');
  expect(layout.navigationConnector).toBe('none');
  expect(layout.labelColumn).toBe('2');
  expect(parseFloat(layout.lineWidth)).toBe(2);
});
