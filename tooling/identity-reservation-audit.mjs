import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const version=pkg.version;
const checks=[]; const failures=[];
const check=(name,condition,detail='')=>{const pass=Boolean(condition);checks.push({name,pass,detail});if(!pass)failures.push({name,detail});};
const exists=p=>fs.existsSync(p);
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const report='tests/release/identity-reservation.json';
const doc='docs/identity-reservation-0.52.md';
check('Identity reservation machine report exists',exists(report),report);
check('Identity reservation human report exists',exists(doc),doc);
if(exists(report)){
 const d=readJson(report);
 check('Report matches release version',d.version===version,d.version);
 check('Brand is Reeris UI',d.brand==='Reeris UI',d.brand);
 check('Canonical repository is Eristavi/ReerisUI',d.canonicalRepository==='Eristavi/ReerisUI',d.canonicalRepository);
 check('npm scope is @reeris',d.npmScope==='@reeris',d.npmScope);
 check('npm reservation is still required',d.npm?.reservationRequired===true);
 check('GitHub reservation/rename verification still required',d.github?.reservationRequired===true);
 check('Domain registrar availability is not overclaimed',d.domains?.registrarAvailabilityVerified===false);
 check('Formal trademark similarity search remains pending',d.trademark?.formalSimilaritySearchCompleted===false);
 check('Research is explicitly not a legal opinion',d.trademark?.legalOpinion===false);
 for(const id of ['project-name-clearance','package-namespace-clearance','repository-domain-clearance']) check(`Criterion stays open: ${id}`,d.criteria?.[id]==='open',d.criteria?.[id]);
 const expected=['@reeris/core','@reeris/icons','@reeris/js','@reeris/react','@reeris/vue','@reeris/svelte'];
 for(const p of expected) check(`npm target recorded: ${p}`,d.npm?.targets?.includes(p));
 check('Preferred domain starts with reeris.dev',d.domains?.preferred?.[0]==='reeris.dev',d.domains?.preferred?.[0]);
}
if(exists(doc)){
 const md=fs.readFileSync(doc,'utf8');
 check('Human report leaves publication gate open',/gate therefore remains \*\*OPEN\*\*/.test(md));
 check('Human report does not claim npm availability',/not proof of availability/i.test(md));
 check('Human report requires registrar confirmation',/until a registrar confirms/i.test(md));
 check('Human report states not legal advice',/not legal advice/i.test(md));
 check('Human report records exact repository',/Eristavi\/ReerisUI/.test(md));
}
const gates=readJson('tests/release/manual-gates.json');
const g=(gates.gates||[]).find(x=>x.id==='public-name-namespace-clearance');
check('Publication naming gate remains open',g?.status==='open',g?.status);
for(const id of ['project-name-clearance','package-namespace-clearance','repository-domain-clearance']) check(`Release Lab remains open: ${id}`,g?.criteriaStatus?.[id]?.status==='open',g?.criteriaStatus?.[id]?.status);
const result={version,generatedAt:new Date().toISOString(),status:failures.length?'fail':'pass',summary:{passed:checks.filter(x=>x.pass).length,total:checks.length,failed:failures.length},failures,checks};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync(`reports/identity-reservation-audit-${version}.json`,JSON.stringify(result,null,2)+'\n');
console.log(`Identity reservation audit: ${result.summary.passed}/${result.summary.total} checks passed. Publication reservations remain external/open.`);
if(failures.length){for(const f of failures)console.error(`FAIL: ${f.name}${f.detail?` — ${f.detail}`:''}`);process.exitCode=1;}
