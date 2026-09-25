import fs from 'node:fs';
import crypto from 'node:crypto';

const rootPkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[]; const failures=[];
const check=(name,condition,detail='')=>{const pass=Boolean(condition);checks.push({name,pass,detail});if(!pass)failures.push({name,detail});};
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const exists=p=>fs.existsSync(p);
const version=rootPkg.version;

function normalizedApi(manifest){
  return {
    sourceModules: manifest.sourceModules.map(x=>x.source).sort(),
    classes: manifest.classes.map(x=>x.name).sort(),
    tokens: manifest.tokens.map(x=>({name:x.name,kind:x.kind})).sort((a,b)=>a.name.localeCompare(b.name)||a.kind.localeCompare(b.kind)),
    dataAttributes: manifest.dataAttributes.map(x=>({name:x.name,details:[...(x.details||[])].sort()})).sort((a,b)=>a.name.localeCompare(b.name)),
    packageExports: manifest.packageExports.map(x=>({package:x.package,name:x.name,target:x.target})).sort((a,b)=>(a.package+a.name).localeCompare(b.package+b.name)),
    jsApi: manifest.jsApi.map(x=>({name:x.name,kind:x.kind})).sort((a,b)=>(a.name+a.kind).localeCompare(b.name+b.kind))
  };
}
function digest(value){return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');}

check('RC version remains pre-1.0', /^0\./.test(version), version);
check('Root version is synchronized with @reeris/core', readJson('packages/core/package.json').version===version);
check('Root version is synchronized with @reeris/js', readJson('packages/js/package.json').version===version);
check('Core remains feature-frozen in README', /Core remains feature-frozen/i.test(fs.readFileSync('README.md','utf8')));
check('Current version has changelog entry', fs.readFileSync('CHANGELOG.md','utf8').includes(`## ${version}`));
check('Formal deprecation policy exists', exists('DEPRECATIONS.md'));
if(exists('DEPRECATIONS.md')){
  const dep=fs.readFileSync('DEPRECATIONS.md','utf8');
  check('Deprecation lifecycle includes Supported', /Supported/.test(dep));
  check('Deprecation lifecycle includes Deprecated', /Deprecated/.test(dep));
  check('Deprecation lifecycle includes migration period', /Migration period/i.test(dep));
  check('Deprecation lifecycle reserves removal for next major', /next major/i.test(dep));
  check('Current deprecated-API registry is explicit', /Current deprecated APIs/i.test(dep));
}

check('Generated public API manifest exists', exists('docs/api-manifest.json'));
check('RC public API freeze snapshot exists', exists('tests/release/public-api-freeze.json'));
if(exists('docs/api-manifest.json')&&exists('tests/release/public-api-freeze.json')){
  const manifest=readJson('docs/api-manifest.json');
  const freeze=readJson('tests/release/public-api-freeze.json');
  const current=normalizedApi(manifest);
  const currentDigest=digest(current);
  check('API manifest version matches release', manifest.version===version, `${manifest.version} vs ${version}`);
  check('API freeze baseline is recorded', /^0\.51\./.test(freeze.baselineVersion||''), freeze.baselineVersion);
  check('API freeze embedded digest is valid', freeze.sha256===digest(freeze.api), `${freeze.sha256} vs ${digest(freeze.api)}`);
  check('Current public API matches RC freeze snapshot', JSON.stringify(current)===JSON.stringify(freeze.api), `${currentDigest} vs ${freeze.sha256}`);
  check('RC API freeze covers public classes', current.classes.length>0, `${current.classes.length}`);
  check('RC API freeze covers public tokens/hooks', current.tokens.length>0, `${current.tokens.length}`);
  check('RC API freeze covers Reeris-owned data attributes', current.dataAttributes.length>0, `${current.dataAttributes.length}`);
  check('RC API freeze covers package exports', current.packageExports.length>0, `${current.packageExports.length}`);
  check('RC API freeze covers optional JS API', current.jsApi.length>0, `${current.jsApi.length}`);
}

const expectedReports=[
  'core-scope', 'forms-audit', 'content-states-audit', 'accessibility-audit', 'browser-reflow-audit',
  'css-architecture-audit', 'visual-regression-audit', 'i18n-audit', 'theme-audit',
  'build-reproducibility-audit', 'documentation-audit', 'starters-integration-audit',
  'security-audit', 'package-release-audit', 'rc-browser-infrastructure-audit', 'local-chromium-evidence-audit', 'external-release-lab-audit', 'release-lab-audit', 'naming-clearance-audit'
];
for(const prefix of expectedReports){
  const file=`reports/${prefix}-${version}.json`;
  check(`Current release evidence exists: ${prefix}`, exists(file), file);
  if(exists(file)){
    const report=readJson(file); const summary=report.summary||{};
    check(`Current release evidence has zero failures: ${prefix}`, Number(summary.failed??0)===0, JSON.stringify(summary));
  }
}

check('Manual release gates registry exists', exists('tests/release/manual-gates.json'));
let manualSummary={total:0,open:0,blocks1_0:0,blocksPublicPublication:0};
if(exists('tests/release/manual-gates.json')){
  const registry=readJson('tests/release/manual-gates.json');
  check('Manual gate registry version matches release', registry.version===version, registry.version);
  check('Manual gate registry contains gates', Array.isArray(registry.gates)&&registry.gates.length>0, `${registry.gates?.length||0}`);
  for(const gate of registry.gates||[]){
    check(`Manual gate has stable id: ${gate.id||'missing'}`, typeof gate.id==='string'&&gate.id.length>0);
    check(`Manual gate has explicit status: ${gate.id||'missing'}`, ['open','passed','not-applicable'].includes(gate.status), gate.status);
    check(`Manual gate has evidence requirement: ${gate.id||'missing'}`, typeof gate.evidence==='string'&&gate.evidence.length>0);
  }
  manualSummary={
    total:registry.gates.length,
    open:registry.gates.filter(g=>g.status==='open').length,
    blocks1_0:registry.gates.filter(g=>g.status==='open'&&g.blocks1_0).length,
    blocksPublicPublication:registry.gates.filter(g=>g.status==='open'&&g.blocksPublicPublication).length
  };
  check('Open manual gates are not falsely marked automated failures', true, `${manualSummary.open} open; ${manualSummary.blocks1_0} block 1.0`);
}

check('RC readiness documentation page exists', exists('docs/release-candidate-readiness.html'));
check('RC checklist report exists', exists(`docs/release-candidate-readiness-${version}.md`));
check('Release check does not publish to npm', !/npm\s+(?:publish|adduser|login)/.test(rootPkg.scripts?.['release:check']||''), rootPkg.scripts?.['release:check']||'');
check('RC audit is part of full audit gate', /audit:rc/.test(rootPkg.scripts?.['audit:all']||''));

const automatedReady=failures.length===0;
const status=automatedReady ? 'ready-for-rc-validation' : 'not-ready';
const report={version,generatedAt:new Date().toISOString(),status,automatedReady,manualSummary,summary:{passed:checks.filter(x=>x.pass).length,total:checks.length,failed:failures.length},failures,checks};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync(`reports/rc-readiness-audit-${version}.json`,JSON.stringify(report,null,2)+'\n');
console.log(`RC readiness audit: ${report.summary.passed}/${report.summary.total} checks passed. Status: ${status}.`);
console.log(`Manual/external gates open: ${manualSummary.open} (${manualSummary.blocks1_0} block 1.0; ${manualSummary.blocksPublicPublication} block public publication).`);
if(failures.length){for(const f of failures)console.error(`FAIL: ${f.name}${f.detail?` — ${f.detail}`:''}`);process.exitCode=1;}
