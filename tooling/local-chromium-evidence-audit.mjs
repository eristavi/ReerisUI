import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const version=pkg.version;
const root=process.cwd();
const checks=[];const failures=[];
const check=(name,condition,detail='')=>{const pass=Boolean(condition);checks.push({name,pass,detail});if(!pass)failures.push({name,detail});};
const sha256=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const artifactRoot=path.join('tests/release/evidence-artifacts',version,'local-chromium');
const reportPath=path.join(artifactRoot,'local-chromium-report.json');
check('Local Chromium report exists',fs.existsSync(reportPath),reportPath);
let report=null;
if(fs.existsSync(reportPath)){
  report=JSON.parse(fs.readFileSync(reportPath,'utf8'));
  check('Local Chromium report version matches release',report.version===version,`${report.version} vs ${version}`);
  check('Local Chromium product is recorded',/^Chrome\//.test(report.browser?.product||''),report.browser?.product||'missing');
  check('Local Chromium report has zero failed smoke/interaction checks',Number(report.summary?.failed||0)===0,JSON.stringify(report.summary||{}));
  check('Local Chromium report captures all canonical visual cases',Number(report.summary?.visualCandidates||0)===JSON.parse(fs.readFileSync('tests/visual/cases.json','utf8')).cases.length,`${report.summary?.visualCandidates||0}`);
  check('Local Chromium visual candidates have zero layout failures',Number(report.summary?.visualCandidateFailures||0)===0,`${report.summary?.visualCandidateFailures||0}`);
  for(const item of report.visualCandidates||[]){
    const rel=item.image?.path;const abs=rel?path.resolve(root,rel):'';
    check(`Candidate screenshot exists: ${item.id}`,Boolean(rel)&&fs.existsSync(abs),rel||'missing');
    if(rel&&fs.existsSync(abs)) check(`Candidate screenshot hash matches: ${item.id}`,sha256(abs)===item.image.sha256,item.image.sha256||'missing');
  }
  check('Forced-colors candidate was exercised',(report.tests||[]).some(x=>x.name==='forced-colors media emulation activates'&&x.pass));
  check('prefers-contrast candidate was exercised',(report.tests||[]).some(x=>x.name==='prefers-contrast media emulation activates'&&x.pass));
  check('Keyboard switch interaction passed',(report.tests||[]).some(x=>x.name==='keyboard switch toggles with Space'&&x.pass));
  check('Dialog Escape interaction passed',(report.tests||[]).some(x=>x.name==='native dialog opens and Escape closes'&&x.pass));
  check('Disclosure keyboard interaction passed',(report.tests||[]).some(x=>x.name==='native disclosure opens with Enter'&&x.pass));
  check('Glide initialization passed',(report.tests||[]).some(x=>x.name==='glide navigation initializes'&&x.pass));
  check('320px overflow interaction passed',(report.tests||[]).some(x=>x.name==='320px viewport has no document overflow'&&x.pass));
}
const expectedGates=['desktop-browser-matrix','assistive-technology','zoom-reflow-touch','forced-colors-high-contrast','visual-regression-baselines'];
for(const gateId of expectedGates){
  const file=path.join('tests/release/evidence',gateId,`local-chromium-${gateId}-${version}.json`);
  check(`Supplemental evidence exists: ${gateId}`,fs.existsSync(file),file);
  if(fs.existsSync(file)){
    const e=JSON.parse(fs.readFileSync(file,'utf8'));
    check(`Supplemental evidence remains non-closing: ${gateId}`,e.role==='supplemental'&&Array.isArray(e.claims)&&e.claims.length===0,`${e.role}/${e.claims?.length}`);
    check(`Supplemental evidence targets current release: ${gateId}`,e.releaseVersion===version,e.releaseVersion);
    check(`Supplemental evidence outcome passes: ${gateId}`,e.outcome==='pass',e.outcome);
  }
}
const gates=JSON.parse(fs.readFileSync('tests/release/manual-gates.json','utf8'));
for(const gateId of expectedGates){const g=gates.gates.find(x=>x.id===gateId);check(`Local automated evidence did not close manual gate: ${gateId}`,g?.status==='open',g?.status||'missing');}
const summary={passed:checks.filter(x=>x.pass).length,total:checks.length,failed:failures.length};
const out={version,generatedAt:new Date().toISOString(),status:failures.length?'invalid':'supplemental-evidence-ready',summary,boundary:'Validates local Chromium supplemental evidence only. It intentionally does not close real branded-browser, real-device, assistive-technology, zoom/touch, Windows High Contrast, or human-approved visual gates.',failures,checks};
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync(`reports/local-chromium-evidence-audit-${version}.json`,JSON.stringify(out,null,2)+'\n');
console.log(`Local Chromium evidence audit: ${summary.passed}/${summary.total} checks passed. Status: ${out.status}.`);
if(failures.length){for(const f of failures)console.error(`FAIL: ${f.name}${f.detail?` — ${f.detail}`:''}`);process.exitCode=1;}
