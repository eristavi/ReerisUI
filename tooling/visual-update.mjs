import fs from 'node:fs';
import path from 'node:path';
const manifest=JSON.parse(fs.readFileSync('tests/visual/cases.json','utf8'));
const platform=process.env.REVA_VISUAL_PLATFORM || manifest.baselineEngine || 'chromium-linux';
const source=path.resolve('tests/visual/current',platform), target=path.resolve('tests/visual/baselines',platform); fs.mkdirSync(target,{recursive:true});
let copied=0;
for(const item of manifest.cases){const src=path.join(source,`${item.id}.png`);if(!fs.existsSync(src)){console.error(`Missing current screenshot: ${src}. Run npm run visual:capture first.`);process.exit(1);}fs.copyFileSync(src,path.join(target,`${item.id}.png`));copied++;}
console.log(`Promoted ${copied} current screenshots to ${path.relative(process.cwd(),target)}. Review these changes before committing.`);
