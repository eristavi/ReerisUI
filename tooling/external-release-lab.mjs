import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const version=pkg.version;
const catalogPath='tests/release/external-lab/test-catalog.json';
const criteriaPath='tests/release/gate-criteria.json';
const templateDir='tests/release/evidence-templates';
const labDir='tests/release/external-lab';
const packDir=path.join(labDir,'packs');
const manifestPath=path.join(labDir,'manifest.json');
const docsPath='docs/external-release-lab.html';
const reportPath=`reports/external-release-lab-audit-${version}.json`;
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const slug=s=>String(s).replace(/[^a-z0-9._-]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase();
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function load(){return {catalog:readJson(catalogPath),criteria:readJson(criteriaPath)};}
function templateName(item){return `${item.gateId}--${item.criterionId}.json`;}
function packName(item){return `${item.gateId}--${item.criterionId}.md`;}
function fixtureUrl(f){return `http://127.0.0.1:4173/${f}`;}

function markdown(item){
  const lines=[
    `# ${item.title}`,'',
    `**Release:** Reeris UI ${version}`,'',
    `**Gate:** \`${item.gateId}\``,'',
    `**Criterion:** \`${item.criterionId}\``,'',
    `**Evidence kind:** \`${item.kind}\``,'',
    `**Closing evidence template:** \`tests/release/evidence-templates/${templateName(item)}\``,'',
    '## Objective','',item.objective,'',
    '## Before you start',''
  ];
  for(const x of item.prerequisites) lines.push(`- ${x}`);
  lines.push('','## Test fixtures','');
  if(item.fixtures.length) for(const f of item.fixtures) lines.push(`- \`${f}\` — ${fixtureUrl(f)}`);
  else lines.push('- No Reeris browser fixture is required for this decision/clearance criterion.');
  lines.push('','## Procedure','');
  item.steps.forEach((x,i)=>lines.push(`${i+1}. ${x}`));
  lines.push('','## Pass criteria','');
  for(const x of item.passCriteria) lines.push(`- [ ] ${x}`);
  lines.push('','## Required evidence artifacts','');
  for(const x of item.requiredArtifacts) lines.push(`- [ ] ${x}`);
  lines.push('','## Environment fields to record','');
  for(const x of item.environmentFields) lines.push(`- \`${x}\``);
  lines.push('','## Closing the criterion','',
    `1. Complete the evidence template at \`tests/release/evidence-templates/${templateName(item)}\`.`,
    '2. Copy supporting artifacts into a repository-relative evidence-artifact location and record their SHA-256 hashes.',
    '3. Keep `review.status` as `pending` until an actual reviewer has examined the evidence.',
    '4. Import the completed record with `node tooling/release-lab-evidence.mjs import <record.json>`.',
    '5. Run `npm run audit:evidence`.',
    '6. After deliberate approval, run `npm run evidence:sync` to derive gate status from approved evidence.','',
    '> Passing this checklist does not close the gate by itself. Release Lab closes a criterion only from valid, hashed, approved closing evidence.',''
  );
  return lines.join('\n');
}

function html(catalog){
  const gateOrder=[...new Set(catalog.items.map(x=>x.gateId))];
  const sections=gateOrder.map(gate=>{
    const items=catalog.items.filter(x=>x.gateId===gate);
    return `<section class="docs-section"><h2>${esc(gate)}</h2><div class="docs-card-grid">${items.map(item=>{
      const id=slug(item.id);
      return `<article class="docs-card" id="${id}"><strong>${esc(item.title)}</strong><span><code>${esc(item.criterionId)}</code> · ${esc(item.kind)}</span><p>${esc(item.objective)}</p><details><summary>Open test procedure</summary><h3>Prerequisites</h3><ul>${item.prerequisites.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h3>Fixtures</h3>${item.fixtures.length?`<ul>${item.fixtures.map(f=>`<li><a href="../${esc(f)}">${esc(f)}</a></li>`).join('')}</ul>`:'<p>No browser fixture required.</p>'}<h3>Procedure</h3><ol>${item.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><h3>Pass criteria</h3><ul>${item.passCriteria.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h3>Evidence</h3><ul>${item.requiredArtifacts.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p><code>tests/release/external-lab/packs/${packName(item)}</code></p></details></article>`;
    }).join('')}</div></section>`;
  }).join('\n');
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="color-scheme" content="light dark"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reeris UI — External Release Lab ${esc(version)}</title><link rel="stylesheet" href="../packages/core/dist/reeris.css"><link rel="stylesheet" href="assets/docs.css"><script type="module" src="assets/docs.js"></script></head><body class="docs-body"><header class="docs-topbar"><a class="docs-brand" href="index.html">Reeris UI</a><nav class="docs-topnav" aria-label="Documentation"><a href="index.html">Docs</a><a href="api-reference.html">API</a></nav></header><main class="docs-home"><section class="docs-hero"><span class="badge primary">Reeris UI ${esc(version)}</span><h1>External Release Lab</h1><p>Twenty-one criterion-specific test packs for closing the seven remaining external/manual release gates. Results become release evidence only after artifacts are hashed, imported and explicitly approved.</p><div class="l-cluster"><span class="badge">21 criteria</span><span class="badge warning">7 gates open until evidence passes</span></div></section><section class="docs-section"><h2>Run locally</h2><pre><code>node tooling/test-server.mjs\n# open http://127.0.0.1:4173/docs/external-release-lab.html</code></pre><p>For each criterion, use its Markdown field sheet under <code>tests/release/external-lab/packs/</code> and the matching evidence template under <code>tests/release/evidence-templates/</code>.</p></section>${sections}</main></body></html>\n`;
}

function readme(catalog){
  const counts=Object.fromEntries([...new Set(catalog.items.map(x=>x.gateId))].map(g=>[g,catalog.items.filter(x=>x.gateId===g).length]));
  const lines=[`# Reeris UI ${version} — External Release Lab`,'','This kit converts every open Release Lab closure criterion into an executable field checklist. It does not change any gate status.','','## Start the local fixture server','', '```text','node tooling/test-server.mjs','```','','Then open `http://127.0.0.1:4173/docs/external-release-lab.html`.','','## Test packs',''];
  for(const [g,n] of Object.entries(counts)) lines.push(`- ${g}: ${n}`);
  lines.push('','Total: **21 criterion-specific packs**.','','## Evidence workflow','',
    '1. Select exactly one criterion pack from `packs/`.','2. Execute the documented procedure on the required real browser/device/assistive technology or perform the required decision review.','3. Save screenshots, recordings, transcripts, logs or decision memos under a repository-relative evidence-artifact path.','4. Complete the matching JSON template under `tests/release/evidence-templates/`.','5. Hash every artifact and place the SHA-256 in the record.','6. Import the record with `node tooling/release-lab-evidence.mjs import <record.json>`.','7. Run `npm run audit:evidence`.','8. A named reviewer explicitly approves or rejects the record.','9. Run `npm run evidence:sync`; gate status is derived from approved evidence.','','## Important boundary','','Automated CI, local Chromium, WebKit emulation and mobile emulation can remain valuable supplemental evidence, but they cannot close a criterion that explicitly requires a real branded browser, real device, assistive technology, actual browser zoom, Windows High Contrast or human baseline approval.','');
  return lines.join('\n');
}

function generate(){
  const {catalog}=load();
  if(catalog.version!==version) throw new Error(`Catalog version ${catalog.version} does not match ${version}`);
  fs.mkdirSync(packDir,{recursive:true});
  for(const old of fs.readdirSync(packDir).filter(x=>x.endsWith('.md'))) fs.unlinkSync(path.join(packDir,old));
  for(const item of catalog.items) fs.writeFileSync(path.join(packDir,packName(item)),markdown(item));
  fs.writeFileSync(path.join(labDir,'README.md'),readme(catalog));
  fs.writeFileSync(docsPath,html(catalog));
  const manifest={schemaVersion:1,version,generatedAt:new Date().toISOString(),criteria:catalog.items.map(x=>({id:x.id,gateId:x.gateId,criterionId:x.criterionId,kind:x.kind,pack:`tests/release/external-lab/packs/${packName(x)}`,template:`tests/release/evidence-templates/${templateName(x)}`,fixtures:x.fixtures}))};
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  console.log(`External Release Lab generated: ${catalog.items.length} criterion packs.`);
}

function audit(){
  const {catalog,criteria}=load();
  const checks=[];
  const add=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});
  add('Catalog version matches release',catalog.version===version,`${catalog.version} vs ${version}`);
  add('Criteria policy version matches release',criteria.version===version,`${criteria.version} vs ${version}`);
  const policy=[];
  for(const [gateId,gate] of Object.entries(criteria.gates||{})) for(const criterion of gate.criteria||[]) policy.push({gateId,criterion});
  add('Catalog contains exactly one item per policy criterion',catalog.items.length===policy.length,`${catalog.items.length} vs ${policy.length}`);
  const ids=catalog.items.map(x=>x.id);
  add('Catalog IDs are unique',new Set(ids).size===ids.length,`${ids.length} ids`);
  for(const {gateId,criterion} of policy){
    const item=catalog.items.find(x=>x.gateId===gateId&&x.criterionId===criterion.id);
    add(`Criterion mapped: ${gateId}/${criterion.id}`,Boolean(item));
    if(!item) continue;
    add(`Evidence kind is allowed: ${gateId}/${criterion.id}`,(criterion.allowedKinds||[]).includes(item.kind),`${item.kind}; allowed ${(criterion.allowedKinds||[]).join(', ')}`);
    add(`Objective present: ${gateId}/${criterion.id}`,typeof item.objective==='string'&&item.objective.length>=20);
    add(`Procedure is actionable: ${gateId}/${criterion.id}`,Array.isArray(item.steps)&&item.steps.length>=3,`${item.steps?.length||0} steps`);
    add(`Pass criteria present: ${gateId}/${criterion.id}`,Array.isArray(item.passCriteria)&&item.passCriteria.length>=2,`${item.passCriteria?.length||0}`);
    add(`Evidence artifacts specified: ${gateId}/${criterion.id}`,Array.isArray(item.requiredArtifacts)&&item.requiredArtifacts.length>=1,`${item.requiredArtifacts?.length||0}`);
    add(`Environment fields specified: ${gateId}/${criterion.id}`,Array.isArray(item.environmentFields)&&item.environmentFields.length>=2,`${item.environmentFields?.length||0}`);
    const pack=path.join(packDir,packName(item));
    add(`Generated pack exists: ${gateId}/${criterion.id}`,fs.existsSync(pack),pack);
    if(fs.existsSync(pack)){
      const text=fs.readFileSync(pack,'utf8');
      add(`Pack names criterion: ${gateId}/${criterion.id}`,text.includes(`\`${item.criterionId}\``));
      add(`Pack references template: ${gateId}/${criterion.id}`,text.includes(templateName(item)));
      add(`Pack preserves approval boundary: ${gateId}/${criterion.id}`,/does not close the gate by itself/i.test(text));
    }
    const template=path.join(templateDir,templateName(item));
    add(`Evidence template exists: ${gateId}/${criterion.id}`,fs.existsSync(template),template);
    if(fs.existsSync(template)){
      const t=readJson(template);
      add(`Evidence template version is current: ${gateId}/${criterion.id}`,t.releaseVersion===version,`${t.releaseVersion} vs ${version}`);
      add(`Evidence template maps correct gate: ${gateId}/${criterion.id}`,t.gateId===gateId,t.gateId);
      add(`Evidence template maps correct criterion: ${gateId}/${criterion.id}`,Array.isArray(t.claims)&&t.claims.includes(criterion.id),JSON.stringify(t.claims));
    }
    for(const fixture of item.fixtures||[]) add(`Fixture exists: ${gateId}/${criterion.id} → ${fixture}`,fs.existsSync(fixture),fixture);
  }
  for(const item of catalog.items){
    const c=criteria.gates?.[item.gateId]?.criteria?.find(x=>x.id===item.criterionId);
    add(`No unknown catalog criterion: ${item.id}`,Boolean(c));
  }
  add('External Lab README exists',fs.existsSync(path.join(labDir,'README.md')));
  add('External Lab manifest exists',fs.existsSync(manifestPath));
  add('External Lab documentation page exists',fs.existsSync(docsPath));
  if(fs.existsSync(docsPath)){
    const doc=fs.readFileSync(docsPath,'utf8');
    for(const item of catalog.items) add(`Docs exposes criterion: ${item.id}`,doc.includes(slug(item.id)));
    add('Docs follows native/system color scheme',/name="color-scheme" content="light dark"/.test(doc));
    add('Docs does not force root light/dark theme',!/<html[^>]*data-theme=/i.test(doc));
  }
  const registry=readJson('tests/release/manual-gates.json');
  add('External Lab generation does not close gates',registry.gates.every(g=>g.status!=='passed'),`${registry.gates.filter(g=>g.status==='passed').length} passed`);
  const summary={passed:checks.filter(x=>x.pass).length,total:checks.length,failed:checks.filter(x=>!x.pass).length};
  const report={version,generatedAt:new Date().toISOString(),summary,catalog:{criteria:catalog.items.length,gates:new Set(catalog.items.map(x=>x.gateId)).size,packs:catalog.items.length},checks};
  fs.mkdirSync('reports',{recursive:true}); fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  console.log(`External Release Lab audit: ${summary.passed}/${summary.total} checks passed across ${catalog.items.length} criterion packs.`);
  if(summary.failed){for(const c of checks.filter(x=>!x.pass)) console.error(`FAIL: ${c.name}${c.detail?` — ${c.detail}`:''}`);process.exitCode=1;}
}

const cmd=process.argv[2]||'audit';
if(cmd==='generate') generate();
else if(cmd==='audit') audit();
else if(cmd==='all'){generate();audit();}
else {console.error('Usage: node tooling/external-release-lab.mjs [generate|audit|all]');process.exitCode=1;}
