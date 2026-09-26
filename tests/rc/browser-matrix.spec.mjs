import { test, expect } from '@playwright/test';

const pages=[
  '/docs/foundation.html',
  '/docs/forms-complete.html',
  '/docs/navigation-completion.html',
  '/docs/carousel.html',
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

test('inbox sender and preview use separate rows on phones', async ({page}) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({width,height:800});
    await page.goto('/.reeris-docs-site/docs/messaging.html');
    for (const row of await page.locator('.message-row').all()) {
      const layout=await row.evaluate(element=>{
        const sender=element.querySelector('.message-sender');
        const content=element.children[2];
        const time=element.querySelector('.message-time');
        const lineHeight=parseFloat(getComputedStyle(sender).lineHeight);
        return {
          senderHeight:sender.getBoundingClientRect().height,
          lineHeight,
          senderWidth:sender.getBoundingClientRect().width,
          contentTop:content.getBoundingClientRect().top,
          senderBottom:sender.getBoundingClientRect().bottom,
          timeBottom:time.getBoundingClientRect().bottom,
          overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
        };
      });
      expect(layout.senderHeight, `${width}px sender wraps`).toBeLessThanOrEqual(layout.lineHeight+1);
      expect(layout.senderWidth, `${width}px sender has no room`).toBeGreaterThan(60);
      expect(layout.contentTop, `${width}px preview overlaps sender`).toBeGreaterThanOrEqual(Math.max(layout.senderBottom,layout.timeBottom));
      expect(layout.overflow).toBeLessThanOrEqual(1);
    }
  }
});

test('image card adapts to its container independently of viewport', async ({page}) => {
  await page.setViewportSize({width:1000,height:800});
  await page.goto('/.reeris-docs-site/docs/media.html');
  const cards=page.locator('.image-card.adaptive');
  const columns=async card=>card.evaluate(element=>getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(await columns(cards.nth(0))).toBe(1);
  expect(await columns(cards.nth(1))).toBe(2);
  await cards.nth(1).locator('..').evaluate(wrapper=>wrapper.style.inlineSize='280px');
  expect(await columns(cards.nth(1))).toBe(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('CSS scroll progress follows root scroll and respects reduced motion', async ({page}) => {
  await page.goto('/.reeris-docs-site/docs/feedback.html');
  const supported=await page.evaluate(()=>CSS.supports('animation-timeline','scroll(root block)'));
  const bar=page.locator('.scroll-progress');
  if (supported) {
    expect(await bar.evaluate(element=>getComputedStyle(element).display)).toBe('block');
    const scale=()=>bar.evaluate(element=>new DOMMatrix(getComputedStyle(element).transform).a);
    const before=await scale();
    await page.evaluate(async()=>{window.scrollTo(0,document.scrollingElement.scrollHeight);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
    await expect.poll(scale).toBeGreaterThan(before+.2);
  } else {
    await expect(bar).toBeHidden();
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(bar).toBeHidden();
});

test('sticky navbar keeps a readable fallback and responds to scroll state', async ({page}) => {
  for (const width of [320, 1024]) {
    await page.setViewportSize({width,height:800});
    await page.goto('/docs/navigation.html');
    const result=await page.locator('.scroll-state-demo').evaluate(async scroller=>{
      const surface=scroller.querySelector('.navbar-surface');
      const initial=getComputedStyle(surface).boxShadow;
      scroller.scrollTop=120;
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      return {
        supported:CSS.supports('container-type','scroll-state'),
        scrolled:scroller.scrollTop,
        shadow:getComputedStyle(surface).boxShadow,
        background:getComputedStyle(surface).backgroundColor,
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        initial
      };
    });
    expect(result.scrolled).toBeGreaterThan(0);
    expect(result.background).not.toBe('rgba(0, 0, 0, 0)');
    expect(result.overflow).toBeLessThanOrEqual(1);
    if (result.supported) expect(result.shadow, `${width}px stuck navbar`).not.toBe(result.initial);
    else expect(result.shadow, `${width}px fallback navbar`).toBe(result.initial);
  }
});

test('sticky navbar glide follows links with JavaScript disabled', async ({browser}) => {
  const context=await browser.newContext({javaScriptEnabled:false});
  try {
    const page=await context.newPage();
    await page.goto('/docs/navigation.html');
    const nav=page.locator('.scroll-state-demo .navbar-nav.glide');
    await expect(nav).not.toHaveAttribute('data-reeris-glide','');
    const geometry=()=>nav.evaluate(element=>{
      const indicator=getComputedStyle(element,'::before');
      return {
        supported:CSS.supports('anchor-name','--reeris-glide-target') && CSS.supports('inset-inline-start','anchor(--reeris-glide-target start)') && CSS.supports('inline-size','anchor-size(--reeris-glide-target width)'),
        left:parseFloat(indicator.left), width:parseFloat(indicator.width), opacity:indicator.opacity
      };
    });
    const initial=await geometry();
    const details=nav.getByRole('link',{name:'Details'});
    await details.hover();
    if (initial.supported) {
      await expect.poll(async ()=>(await geometry()).left).not.toBe(initial.left);
      const hovered=await geometry();
      expect(hovered.width).toBeGreaterThan(0);
      expect(hovered.opacity).toBe('1');
    } else {
      await expect(details).toHaveCSS('background-color',/rgba?\(/);
    }
    await nav.getByRole('link',{name:'Overview'}).focus();
    await page.keyboard.press('Tab');
    await expect(details).toBeFocused();
  } finally {
    await context.close();
  }
});

test('carousel scrolls and snaps with JavaScript disabled at desktop and phone widths', async ({browser}) => {
  const context=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce'});
  try {
    const page=await context.newPage();
    for (const width of [1100,320]) {
      await page.setViewportSize({width,height:800});
      await page.goto('/docs/carousel.html');
      const track=page.locator('.carousel:not(.single) .carousel-track');
      const initial=await track.evaluate(element=>({
        scrollWidth:element.scrollWidth,
        clientWidth:element.clientWidth,
        snap:getComputedStyle(element).scrollSnapType,
        itemWidth:element.querySelector('.carousel-slide').getBoundingClientRect().width
      }));
      expect(initial.scrollWidth).toBeGreaterThan(initial.clientWidth);
      expect(initial.snap).toMatch(/mandatory/);
      expect(initial.itemWidth / initial.clientWidth).toBeGreaterThan(width===320 ? .8 : .25);
      await track.focus();
      await page.keyboard.press('ArrowRight');
      await expect.poll(()=>track.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    }
    const single=page.locator('.carousel.single .carousel-track');
    expect(await single.locator('.carousel-slide').count()).toBe(3);
    expect(await single.evaluate(element=>getComputedStyle(element).scrollSnapType)).toMatch(/mandatory/);
  } finally {
    await context.close();
  }
});

test('published demo theme selector persists across pages and resets to system', async ({page}) => {
  await page.goto('/.reeris-docs-site/docs/carousel.html');
  const demoTheme=page.getByLabel('Theme');
  await expect(demoTheme).toBeVisible();
  await demoTheme.selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme)).toBe('dark');
  await page.goto('/.reeris-docs-site/docs/navigation.html');
  await expect(page.getByLabel('Theme')).toHaveValue('dark');
  await page.getByLabel('Theme').selectOption('glass');
  await expect(page.locator('html')).toHaveAttribute('data-theme','glass');
  const glass=await page.evaluate(()=>({
    scheme:getComputedStyle(document.documentElement).colorScheme,
    surface:getComputedStyle(document.querySelector('.docs-demo-topbar')).backgroundColor,
    canvas:getComputedStyle(document.body).backgroundImage
  }));
  expect(glass.scheme).toBe('light');
  expect(glass.surface).toMatch(/rgba?\(/);
  expect(glass.canvas).toContain('gradient');
  await page.goto('/.reeris-docs-site/docs/index.html');
  const homeTheme=page.getByLabel('Theme');
  await expect(homeTheme).toBeVisible();
  await expect(homeTheme).toHaveValue('glass');
  await homeTheme.selectOption('light');
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme)).toBe('light');
  await homeTheme.selectOption('system');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  expect(await page.evaluate(()=>localStorage.getItem('reeris-docs-theme'))).toBeNull();
  await page.setViewportSize({width:320,height:700});
  await page.goto('/.reeris-docs-site/docs/carousel.html');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
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

test('form focus has one halo and selects keep native controls aligned', async ({page},testInfo) => {
  await page.goto('/.reeris-docs-site/docs/forms-complete.html');
  const textarea=page.locator('textarea.textarea.xl');
  await textarea.focus();
  const focus=await textarea.evaluate(element=>({
    outline:getComputedStyle(element).outlineStyle,
    shadow:getComputedStyle(element).boxShadow
  }));
  expect(focus.outline).toBe('none');
  expect(focus.shadow).not.toBe('none');
  const select=await page.locator('select.select.customizable').evaluate(element=>({
    supported:CSS.supports('appearance','base-select'),
    appearance:getComputedStyle(element).appearance,
    image:getComputedStyle(element).backgroundImage
  }));
  if (select.supported) {
    expect(select.appearance).toBe('base-select');
    expect(select.image).toBe('none');
  }
  const multiple=await page.locator('select.select[multiple]').evaluate(element=>({
    image:getComputedStyle(element).backgroundImage,
    padding:parseFloat(getComputedStyle(element.options[0]).paddingInlineStart),
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
  }));
  expect(multiple.image).toBe('none');
  expect(multiple.padding).toBeGreaterThan(0);
  expect(multiple.overflow).toBeLessThanOrEqual(1);
  if (testInfo.project.name==='edge') {
    await testInfo.attach('textarea-focus', {body:await textarea.screenshot(),contentType:'image/png'});
    const panel=page.locator('.panel').filter({hasText:'Native select + progressive customization'});
    await testInfo.attach('select-panel', {body:await panel.screenshot(),contentType:'image/png'});
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
