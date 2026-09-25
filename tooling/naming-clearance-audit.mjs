import fs from 'node:fs';

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const version=pkg.version;
const checks=[]; const failures=[];
const check=(name,condition,detail='')=>{const pass=Boolean(condition);checks.push({name,pass,detail});if(!pass)failures.push({name,detail});};
const exists=p=>fs.existsSync(p);
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));

const reportPath='tests/release/naming-clearance.json';
const docPath='docs/identity-reservation-0.52.md';
const migrationPath='docs/reva-to-reeris-migration-0.51.md';
const evidencePath=`tests/release/evidence/public-name-namespace-clearance/naming-research-${version}.json`;

check('Naming clearance machine report exists', exists(reportPath), reportPath);
check('Naming clearance human report exists', exists(docPath), docPath);
check('Rename migration note exists', exists(migrationPath), migrationPath);
check('Current-version naming research evidence exists', exists(evidencePath), evidencePath);

if(exists(reportPath)){
  const data=readJson(reportPath);
  check('Naming report matches release version', data.version===version, data.version);
  check('Selected project name is Reeris UI', data.selectedName==='Reeris UI', data.selectedName);
  check('Short brand is Reeris', data.shortBrand==='Reeris', data.shortBrand);
  check('Canonical repository is Eristavi/ReerisUI', data.canonicalRepository==='Eristavi/ReerisUI', data.canonicalRepository);
  check('Intended package scope is @reeris', data.intendedPackageScope==='@reeris', data.intendedPackageScope);
  check('Rename may proceed while publication remains gated', data.status==='selected-pending-live-reservation-and-formal-clearance', data.status);
  check('Public research records no material exact software-framework collision', data.researchSummary?.exactSoftwareFrameworkConflictFound===false);
  check('Research is explicitly not a legal opinion', data.researchSummary?.legalClearance==='not-a-legal-opinion');
  check('npm availability remains unverified', /pending|not-authoritatively-verified/.test(data.researchSummary?.npmAvailability||''));
  check('Domain availability remains unverified', /pending|not-authoritatively-verified/.test(data.researchSummary?.domainAvailability||''));
  for(const id of ['project-name-clearance','package-namespace-clearance','repository-domain-clearance']){
    check(`Publication criterion remains open: ${id}`, data.criteria?.[id]==='open', data.criteria?.[id]||'missing');
  }
}

if(exists(docPath)){
  const md=fs.readFileSync(docPath,'utf8');
  check('Human report says publication gate remains open', /gate therefore remains \*\*OPEN\*\*/i.test(md));
  check('Human report warns research is not legal advice', /not legal advice/i.test(md));
  check('Human report does not claim npm availability', /not proof of availability/i.test(md));
  check('Human report does not claim domain availability', /Do not treat any of these as available|Do \*\*not\*\* treat any of these as available/i.test(md));
  check('Human report records Reeris ecosystem identity', /@reeris\/core/.test(md)&&/Eristavi\/ReerisUI/.test(md));
}

const gates=readJson('tests/release/manual-gates.json');
const nameGate=(gates.gates||[]).find(g=>g.id==='public-name-namespace-clearance');
check('Publication naming gate exists', Boolean(nameGate));
check('Publication naming gate remains open', nameGate?.status==='open', nameGate?.status||'missing');
for(const id of ['project-name-clearance','package-namespace-clearance','repository-domain-clearance']){
  check(`Release Lab criterion remains open: ${id}`, nameGate?.criteriaStatus?.[id]?.status==='open', nameGate?.criteriaStatus?.[id]?.status||'missing');
}

const core=readJson('packages/core/package.json');
const js=readJson('packages/js/package.json');
check('Core package uses @reeris scope', core.name==='@reeris/core', core.name);
check('JS package uses @reeris scope', js.name==='@reeris/js', js.name);
check('Core default stylesheet export is reeris.css', core.exports?.['.']==='./dist/reeris.css', core.exports?.['.']);
check('Root monorepo is renamed', pkg.name==='reeris-ui-monorepo', pkg.name);

if(exists(evidencePath)){
  const ev=readJson(evidencePath);
  check('Naming evidence is supplemental', ev.role==='supplemental', ev.role);
  check('Naming evidence cannot close criteria', ev.role!=='closing'&&ev.outcome!=='pass');
  check('Naming evidence references Reeris repository', ev.environment?.canonicalRepository==='Eristavi/ReerisUI', ev.environment?.canonicalRepository||'');
}

const result={version,generatedAt:new Date().toISOString(),status:failures.length?'fail':'pass',summary:{passed:checks.filter(x=>x.pass).length,total:checks.length,failed:failures.length},failures,checks};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync(`reports/naming-clearance-audit-${version}.json`,JSON.stringify(result,null,2)+'\n');
console.log(`Naming clearance audit: ${result.summary.passed}/${result.summary.total} checks passed. Reeris selected; publication gate remains open.`);
if(failures.length){for(const f of failures)console.error(`FAIL: ${f.name}${f.detail?` — ${f.detail}`:''}`);process.exitCode=1;}
