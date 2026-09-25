import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const manifest=JSON.parse(fs.readFileSync('tests/visual/cases.json','utf8'));
const platform=process.env.REVA_VISUAL_PLATFORM || manifest.baselineEngine || 'chromium-linux';
const baselineDir=path.resolve('tests/visual/baselines',platform);
const currentDir=path.resolve('tests/visual/current',platform);
const diffDir=path.resolve('tests/visual/diff',platform); fs.mkdirSync(diffDir,{recursive:true});
const maxPixels=Number(process.env.REVA_VISUAL_MAX_PIXELS||0);
const magick=spawnSync('magick',['-version'],{stdio:'ignore'}).status===0?'magick':(spawnSync('compare',['-version'],{stdio:'ignore'}).status===0?'compare':null);
if(!magick){console.error('ImageMagick is required for visual comparison.');process.exit(2);}
let failed=0;
for(const item of manifest.cases){
  const baseline=path.join(baselineDir,`${item.id}.png`), current=path.join(currentDir,`${item.id}.png`), diff=path.join(diffDir,`${item.id}.png`);
  if(!fs.existsSync(baseline)||!fs.existsSync(current)){console.error(`MISSING ${item.id}: ${!fs.existsSync(baseline)?'baseline ':''}${!fs.existsSync(current)?'current':''}`);failed++;continue;}
  const args=magick==='magick'?['compare','-metric','AE',baseline,current,diff]:['-metric','AE',baseline,current,diff];
  const r=spawnSync(magick,args,{encoding:'utf8'}); const metric=Number(String(r.stderr||r.stdout||'').trim().match(/[0-9.]+/)?.[0]||0);
  if(metric>maxPixels){console.error(`DIFF ${item.id}: ${metric} pixels (allowed ${maxPixels})`);failed++;} else {console.log(`PASS ${item.id}: ${metric} pixels`); if(fs.existsSync(diff)) fs.rmSync(diff);}
}
if(failed){console.error(`${failed} visual cases failed.`);process.exit(1);} console.log(`Visual comparison passed for ${manifest.cases.length} cases.`);
