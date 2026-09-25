import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const version = JSON.parse(fs.readFileSync('package.json','utf8')).version;
const manifestPath = path.resolve('tests/visual/cases.json');
const reportsDir = path.resolve('reports');
fs.mkdirSync(reportsDir,{recursive:true});
const checks=[];
const failures=[];
function check(name, condition, detail='') {
  const pass=Boolean(condition); checks.push({name,pass,detail}); if(!pass) failures.push({name,detail});
}

check('Visual case manifest exists', fs.existsSync(manifestPath));
if (!fs.existsSync(manifestPath)) { console.error('Visual manifest missing.'); process.exit(1); }
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
check('Visual manifest schema version is 1', manifest.schemaVersion===1);
check('Canonical baseline engine declared', typeof manifest.baselineEngine==='string' && manifest.baselineEngine.length>0);
check('Primary visual fixture exists', fs.existsSync(path.resolve(manifest.fixture||'')), manifest.fixture||'');
check('At least 10 visual cases defined', Array.isArray(manifest.cases) && manifest.cases.length>=10, String(manifest.cases?.length||0));
const ids=new Set();
for (const item of manifest.cases||[]) {
  check(`Unique visual id: ${item.id}`, Boolean(item.id) && !ids.has(item.id)); ids.add(item.id);
  check(`Visual path exists: ${item.id}`, fs.existsSync(path.resolve(String(item.path).split('?')[0])), item.path);
  check(`Viewport valid: ${item.id}`, Number.isInteger(item.width)&&item.width>=320&&Number.isInteger(item.height)&&item.height>=600, `${item.width}x${item.height}`);
}
const joined=(manifest.cases||[]).map(x=>x.path).join('\n');
for (const theme of ['system','light','dark']) check(`Theme represented: ${theme}`, joined.includes(`theme=${theme}`));
for (const density of ['compact','default','comfortable']) check(`Density represented: ${density}`, joined.includes(`density=${density}`));
for (const dir of ['ltr','rtl']) check(`Direction represented: ${dir}`, joined.includes(`dir=${dir}`));
check('Mobile viewport represented', (manifest.cases||[]).some(x=>x.width<=400));
check('Radius personality variation represented', /radius=(?:rounded|soft|sharp)/.test(joined));
check('Elevation personality variation represented', /elevation=(?:flat|subtle|floating)/.test(joined));

for (const rel of ['tooling/visual-capture.mjs','tooling/visual-compare.mjs','tooling/visual-update.mjs','tests/visual/README.md','docs/assets/visual-regression.js']) {
  check(`Visual tooling exists: ${rel}`, fs.existsSync(path.resolve(rel)));
}
for (const dir of ['tests/visual/baselines/chromium-linux','tests/visual/current/chromium-linux','tests/visual/diff/chromium-linux']) check(`Visual directory exists: ${dir}`, fs.existsSync(path.resolve(dir)));

// Default docs/starter behavior must follow browser/OS color preference.
const htmlFiles=[];
for (const base of ['docs','examples/starters']) {
  for (const name of fs.readdirSync(base)) if(name.endsWith('.html')) htmlFiles.push(path.join(base,name));
}
for (const rel of htmlFiles) {
  const text=fs.readFileSync(rel,'utf8');
  const rootTag=(text.match(/<html\b[^>]*>/i)||[''])[0];
  check(`System-native root theme: ${rel}`, !/\bdata-theme\s*=/.test(rootTag), rootTag);
  check(`UA color-scheme metadata: ${rel}`, /<meta\s+name=["']color-scheme["']\s+content=["']light dark["']/i.test(text));
}
const docsCss=fs.readFileSync('docs/assets/docs.css','utf8');
check('Docs chrome uses no raw hex colors', !/#[0-9a-f]{3,8}\b/i.test(docsCss));
check('Docs chrome uses no raw rgb/hsl/oklch colors', !/\b(?:rgb|hsl|oklch)\s*\(/i.test(docsCss));
check('Docs chrome uses semantic Reeris colors', /--reeris-color-(?:background|surface|text|border|primary)/.test(docsCss));
const themeCss=fs.readFileSync('packages/core/src/core/theme.css','utf8');
check('Core default advertises light and dark scheme', /color-scheme:\s*light dark/.test(themeCss));
check('Core still supports explicit light override', /\[data-theme="light"\]\s*\{\s*color-scheme:\s*light/.test(themeCss));
check('Core still supports explicit dark override', /\[data-theme="dark"\]\s*\{\s*color-scheme:\s*dark/.test(themeCss));
const docsJs=fs.readFileSync('docs/assets/docs.js','utf8');
check('Normal docs JS does not force a theme', !/data-theme|dataset\.theme|setAttribute\([^)]*theme/.test(docsJs));

const report={version,generatedAt:new Date().toISOString(),summary:{passed:checks.filter(x=>x.pass).length,total:checks.length,failed:failures.length,cases:manifest.cases.length,htmlPages:htmlFiles.length},baselineStatus:'Infrastructure ready; browser-rendered PNG baselines require a functioning release-lab browser and are intentionally not synthesized by the static audit.',failures,checks};
fs.writeFileSync(path.join(reportsDir,`visual-regression-audit-${version}.json`),JSON.stringify(report,null,2)+'\n');
console.log(`Visual/docs-theme audit: ${report.summary.passed}/${report.summary.total} checks passed across ${report.summary.cases} cases and ${report.summary.htmlPages} HTML pages.`);
if(failures.length){ for(const f of failures.slice(0,30)) console.error(`FAIL: ${f.name}${f.detail?` — ${f.detail}`:''}`); process.exitCode=1; }
