import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const version=pkg.version; const checks=[]; const failures=[];
const check=(name,condition,detail='')=>{const pass=Boolean(condition);checks.push({name,pass,detail});if(!pass)failures.push({name,detail});};
const exists=p=>fs.existsSync(p);
const text=p=>fs.readFileSync(p,'utf8');

for(const rel of ['playwright.config.mjs','tooling/test-server.mjs','tooling/rc-playwright-reporter.mjs','tests/rc/browser-matrix.spec.mjs','tests/rc/visual.spec.mjs','.github/workflows/rc-browser-matrix.yml','tests/release/browser-evidence-schema.json','docs/rc-validation-0.47.md']) check(`RC browser infrastructure exists: ${rel}`,exists(rel),rel);
check('Playwright is pinned exactly', pkg.devDependencies?.['@playwright/test']==='1.63.0',pkg.devDependencies?.['@playwright/test']||'missing');
check('Browser test script exists', /playwright test tests\/rc\/browser-matrix\.spec\.mjs/.test(pkg.scripts?.['rc:browser:test']||''));
check('Visual compare script exists', /playwright test tests\/rc\/visual\.spec\.mjs/.test(pkg.scripts?.['rc:visual:test']||''));
check('Visual update is explicit and separate', /--update-snapshots/.test(pkg.scripts?.['rc:visual:update']||''));
check('Release check does not invoke browser tests', !/rc:browser:test|rc:visual:test/.test(pkg.scripts?.['release:check']||''),pkg.scripts?.['release:check']||'');
const cfg=text('playwright.config.mjs');
for(const project of ['chromium','firefox','webkit','mobile-chromium','mobile-webkit','edge']) check(`Playwright config covers ${project}`,cfg.includes(`name: '${project}'`));
const spec=text('tests/rc/browser-matrix.spec.mjs');
for(const concept of ['forms-complete','navigation-completion','overlays','tables','browser-reflow','i18n','dashboard']) check(`Browser matrix covers ${concept}`,spec.includes(concept));
for(const flow of ['keyboard focus','native dialog','native disclosure','glide navigation','horizontal overflow']) check(`Interaction flow covered: ${flow}`,spec.toLowerCase().includes(flow));
const visual=text('tests/rc/visual.spec.mjs');
check('Visual spec consumes canonical case manifest',visual.includes("tests/visual/cases.json"));
check('Visual spec uses screenshot assertions',visual.includes('toHaveScreenshot'));
const workflow=text('.github/workflows/rc-browser-matrix.yml');
for(const browser of ['chromium','firefox','webkit']) check(`Linux CI runs ${browser}`,workflow.includes(`--project=${browser}`));
check('Windows CI opts into Edge project',workflow.includes('REVA_INCLUDE_EDGE: 1')&&workflow.includes('--project=edge'));
check('CI uploads RC evidence artifacts',/upload-artifact/.test(workflow)&&/rc-browser-evidence/.test(workflow));
check('CI visual baseline job is manual',/workflow_dispatch/.test(workflow)&&/rc:visual:update/.test(workflow));
const gates=JSON.parse(text('tests/release/manual-gates.json'));
check('Manual gates registry version matches',gates.version===version,gates.version);
for(const id of ['desktop-browser-matrix','mobile-browser-matrix','assistive-technology','zoom-reflow-touch','forced-colors-high-contrast','visual-regression-baselines']){
  const g=gates.gates.find(x=>x.id===id); check(`Manual gate has evidence-derived status: ${id}`,['open','passed','not-applicable'].includes(g?.status),g?.status||'missing'); check(`Manual gate records automation boundary: ${id}`,typeof g?.automation==='string'&&g.automation.length>30,g?.automation||'');
}
const report={version,generatedAt:new Date().toISOString(),status:failures.length?'not-ready':'infrastructure-ready',summary:{passed:checks.filter(x=>x.pass).length,total:checks.length,failed:failures.length},note:'This audit validates RC browser/visual infrastructure only. It does not claim real Safari/iOS/Android, assistive-technology, Windows High Contrast or approved screenshot-baseline evidence.',failures,checks};
fs.mkdirSync('reports',{recursive:true}); fs.writeFileSync(`reports/rc-browser-infrastructure-audit-${version}.json`,JSON.stringify(report,null,2)+'\n');
console.log(`RC browser infrastructure audit: ${report.summary.passed}/${report.summary.total} checks passed. Status: ${report.status}.`);
if(failures.length){for(const f of failures)console.error(`FAIL: ${f.name}${f.detail?` — ${f.detail}`:''}`);process.exitCode=1;}
