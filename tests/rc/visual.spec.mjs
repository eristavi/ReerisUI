import fs from 'node:fs';
import { test, expect } from '@playwright/test';

const manifest=JSON.parse(fs.readFileSync('tests/visual/cases.json','utf8'));
for(const item of manifest.cases){
  test(`visual ${item.id}`, async ({page},testInfo)=>{
    test.skip(testInfo.project.name!=='chromium','Canonical Reeris visual baselines use Chromium Linux.');
    await page.setViewportSize({width:item.width,height:item.height});
    await page.goto('/'+item.path,{waitUntil:'networkidle'});
    await page.emulateMedia({reducedMotion:'reduce'});
    await expect(page).toHaveScreenshot(`${item.id}.png`,{fullPage:true,animations:'disabled'});
  });
}
