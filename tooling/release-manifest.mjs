import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const artifacts=[
  'packages/core/dist/reeris.css',
  'packages/core/dist/reeris.min.css',
  'packages/core/dist/reeris.css.map',
  'packages/core/dist/reeris.min.css.map',
  'packages/core/dist/tokens.json',
  'packages/core/dist/tokens.js',
  'packages/js/dist/index.js',
  'packages/js/dist/glide-navigation.js'
].filter(fs.existsSync);
function sha256(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
const auditNames=['core-scope','forms-audit','content-states-audit','accessibility-audit','browser-reflow-audit','css-architecture-audit','documentation-audit','starters-integration-audit','security-audit','package-release-audit','build-reproducibility-audit','visual-regression-audit','i18n-audit','theme-audit','rc-browser-infrastructure-audit', 'local-chromium-evidence-audit', 'external-release-lab-audit', 'release-lab-audit', 'naming-clearance-audit', 'rc-readiness-audit'];
const audits={};
for(const name of auditNames){
  const file=`reports/${name}-${pkg.version}.json`;
  if(fs.existsSync(file)){
    const data=JSON.parse(fs.readFileSync(file,'utf8'));
    audits[name]={file,summary:data.summary};
  }
}
const evidence=[
  'tests/release/public-api-freeze.json',
  'tests/release/external-lab/test-catalog.json', 'tests/release/external-lab/manifest.json',
  `tests/release/evidence-artifacts/${pkg.version}/local-chromium/local-chromium-report.json`,
  'tests/release/manual-gates.json', 'tests/release/gate-criteria.json', 'tests/release/evidence-schema.json', 'tests/release/browser-evidence-schema.json', 'playwright.config.mjs', '.github/workflows/rc-browser-matrix.yml',
  'DEPRECATIONS.md', 'tests/release/naming-clearance.json', 'docs/naming-clearance-0.51.md'
].filter(fs.existsSync);
const manifest={
  name:'Reeris UI',version:pkg.version,generatedAt:new Date().toISOString(),license:'MIT',
  artifacts:artifacts.map(file=>({file,bytes:fs.statSync(file).size,sha256:sha256(file)})),
  releaseEvidence:evidence.map(file=>({file,bytes:fs.statSync(file).size,sha256:sha256(file)})),
  audits,
  securityPolicy:'SECURITY.md',
  changelog:'CHANGELOG.md',
  rcStatus:(audits['rc-browser-infrastructure-audit']?.summary?.failed===0 && audits['rc-readiness-audit']?.summary?.failed===0)?'ready-for-rc-validation':'not-ready'
};
fs.mkdirSync('reports',{recursive:true});
const out=`reports/release-manifest-${pkg.version}.json`;
fs.writeFileSync(out,JSON.stringify(manifest,null,2)+'\n');
console.log(`Release manifest written: ${out} (${manifest.artifacts.length} hashed artifacts, ${Object.keys(audits).length} audit summaries).`);
