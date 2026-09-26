import fs from 'node:fs';
import path from 'node:path';
import { validateOfficialTheme, validateThemeFile } from './theme-validator.mjs';

const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[]; const failures=[];
const check=(name,condition,detail='')=>{const pass=Boolean(condition); checks.push({name,pass,detail}); if(!pass) failures.push({name,detail});};
const themeCss=fs.readFileSync('packages/core/src/core/theme.css','utf8');
const personalityCss=fs.readFileSync('packages/core/src/core/personality.css','utf8');
const generatedCss=fs.readFileSync('packages/core/src/tokens/generated.css','utf8');
const fixture='tests/themes/ocean.css';

const official=await validateOfficialTheme();
for(const item of official.results) check(`Official ${item.scheme} ${item.type} ${item.name} contrast >= 4.5`,item.pass,`${item.ratio.toFixed(2)}:1`);
check('Official theme uses browser-native light/dark negotiation',/:root\s*\{[\s\S]*color-scheme:\s*light\s+dark/.test(themeCss));
check('Explicit light override sets color-scheme only',/\[data-theme="light"\]\s*\{\s*color-scheme:\s*light;?\s*\}/.test(themeCss));
check('Explicit dark override sets color-scheme only',/\[data-theme="dark"\]\s*\{\s*color-scheme:\s*dark;?\s*\}/.test(themeCss));
check('Glass theme selects light native controls and translucent surfaces',/\[data-theme="glass"\]\s*\{\s*color-scheme:\s*light;/.test(themeCss) && /--reeris-color-surface:\s*rgb\([^)]*\//.test(themeCss));
check('Glass respects reduced transparency',themeCss.includes('(prefers-reduced-transparency: reduce)') && themeCss.includes('backdrop-filter: none;'));
check('Semantic theme uses light-dark()',themeCss.includes('light-dark('));

const pairs=['primary','accent','success','warning','danger','info'];
for(const name of pairs){
  check(`Semantic color token exists: ${name}`,themeCss.includes(`--reeris-color-${name}:`));
  check(`Paired foreground token exists: on-${name}`,themeCss.includes(`--reeris-color-on-${name}:`));
}
for(const name of ['primary','accent','success','warning','danger','surface','brand']) check(`Additional gradient exists: ${name}`,themeCss.includes(`--reeris-gradient-${name}:`));

check('Custom theme fixture exists',fs.existsSync(fixture));
const baseCss=`${generatedCss}\n${themeCss}`;
const custom=await validateThemeFile(fixture,{baseCss});
check('Custom fixture contains multiple theme blocks',custom.blocks>=2,`${custom.blocks} blocks`);
for(const item of custom.results) check(`Custom ${item.selector} ${item.scheme} ${item.type} ${item.name} contrast >= 4.5`,item.pass,`${item.ratio.toFixed(2)}:1`);
const fixtureCss=fs.readFileSync(fixture,'utf8');
check('Partial custom theme does not duplicate the primitive palette',!fixtureCss.includes('--reeris-indigo-500:'));
check('Partial custom theme overrides semantic tokens',fixtureCss.includes('--reeris-color-primary:'));
check('Custom theme demonstrates gradient override',fixtureCss.includes('--reeris-gradient-primary:'));
check('Custom theme demonstrates explicit nested dark scheme',/\[data-theme="ocean-night"\][\s\S]*?color-scheme:\s*dark/.test(fixtureCss));

for(const selector of ['data-radius="sharp"','data-radius="rounded"','data-radius="soft"','data-elevation="flat"','data-elevation="subtle"','data-elevation="floating"','data-density="compact"','data-density="comfortable"','data-motion="none"','data-motion="reduced"','data-motion="expressive"']) {
  const css = selector.startsWith('data-density') || selector.startsWith('data-motion') ? fs.readFileSync('packages/core/src/core/personality.css','utf8') + fs.readFileSync('packages/core/src/core/base.css','utf8') : personalityCss;
  check(`Personality contract remains available: [${selector}]`,css.includes(`[${selector}]`));
}
check('Theme fixture does not override personality tokens',!/(--reeris-(?:radius|shadow|duration|control)-)/.test(fixtureCss));
check('Core has no required JavaScript theme engine',!fs.existsSync('packages/js/src/theme.js'));
check('Theme validator CLI is present',fs.existsSync('tooling/theme-validator.mjs'));
check('Theme documentation page exists',fs.existsSync('docs/themes.html'));

const report={version:pkg.version,summary:{passed:checks.filter(x=>x.pass).length,total:checks.length,failed:failures.length,officialContrastCases:official.results.length,customContrastCases:custom.results.length},checks};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync(`reports/theme-audit-${pkg.version}.json`,JSON.stringify(report,null,2)+'\n');
console.log(`Theme audit ${report.summary.passed}/${report.summary.total} checks passed (${official.results.length} official contrast cases, ${custom.results.length} custom-theme contrast cases).`);
if(failures.length){ for(const f of failures) console.error(`FAIL ${f.name}${f.detail?`: ${f.detail}`:''}`); process.exit(1); }
