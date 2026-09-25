import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const rootPkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const packages=[['@reeris/core','packages/core'],['@reeris/js','packages/js']];
const budgets=JSON.parse(fs.readFileSync('tooling/package-budgets.json','utf8'));

const checks=[]; const failures=[]; const packEvidence=[];
function check(name, condition, detail=''){const pass=Boolean(condition);checks.push({name,pass,detail});if(!pass) failures.push({name,detail});}
function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'));}

check('Root monorepo remains private', rootPkg.private===true);
check('Root license is MIT', rootPkg.license==='MIT');
check('Root has no production dependencies', !rootPkg.dependencies || Object.keys(rootPkg.dependencies).length===0);
check('CHANGELOG includes current version', fs.existsSync('CHANGELOG.md') && fs.readFileSync('CHANGELOG.md','utf8').includes(rootPkg.version));
check('Root LICENSE exists', fs.existsSync('LICENSE'));
check('Root README exists', fs.existsSync('README.md'));

for(const [expectedName,dir] of packages){
  const manifestPath=path.join(dir,'package.json');
  const p=readJson(manifestPath);
  check(`${expectedName} name`, p.name===expectedName, p.name);
  check(`${expectedName} version synchronized`, p.version===rootPkg.version, `${p.version} vs ${rootPkg.version}`);
  check(`${expectedName} MIT license`, p.license==='MIT');
  check(`${expectedName} public scoped publish config`, p.publishConfig?.access==='public');
  check(`${expectedName} package files restricted`, Array.isArray(p.files) && p.files.length>0 && p.files.includes('dist'));
  check(`${expectedName} no production dependencies`, !p.dependencies || Object.keys(p.dependencies).length===0);
  check(`${expectedName} local README exists`, fs.existsSync(path.join(dir,'README.md')));
  check(`${expectedName} local LICENSE exists`, fs.existsSync(path.join(dir,'LICENSE')));
  if(fs.existsSync(path.join(dir,'LICENSE'))) check(`${expectedName} license matches root`, fs.readFileSync(path.join(dir,'LICENSE'),'utf8')===fs.readFileSync('LICENSE','utf8'));
  for(const [key,target] of Object.entries(p.exports||{})){
    check(`${expectedName} export avoids src/: ${key}`, !String(target).includes('/src/'), String(target));
    const raw=String(target).replace(/^\.\//,'');
    if(raw.includes('*')) {
      const prefix=raw.slice(0,raw.indexOf('*'));
      check(`${expectedName} export prefix exists: ${key}`, fs.existsSync(path.join(dir,prefix)), prefix);
    } else check(`${expectedName} export target exists: ${key}`, fs.existsSync(path.join(dir,raw)), raw);
  }
  const packed=spawnSync('npm',['pack','--dry-run','--json'],{cwd:path.resolve(root,dir),encoding:'utf8'});
  check(`${expectedName} npm pack dry-run succeeds`, packed.status===0, packed.stderr.trim());
  if(packed.status===0){
    let result=[];
    try{result=JSON.parse(packed.stdout);}catch{}
    const info=result[0]||{}; const files=(info.files||[]).map(x=>x.path);
    packEvidence.push({package:expectedName,filename:info.filename,packageSize:info.size,unpackedSize:info.unpackedSize,fileCount:files.length,files});
    const budget=budgets[expectedName];
    check(`${expectedName} has package budget`, Boolean(budget));
    if(budget){
      check(`${expectedName} packed size within budget`, Number(info.size)<=budget.maxPackedBytes, `${info.size} / ${budget.maxPackedBytes} B`);
      check(`${expectedName} unpacked size within budget`, Number(info.unpackedSize)<=budget.maxUnpackedBytes, `${info.unpackedSize} / ${budget.maxUnpackedBytes} B`);
      check(`${expectedName} file count within budget`, files.length<=budget.maxFiles, `${files.length} / ${budget.maxFiles}`);
    }
    check(`${expectedName} pack includes package.json`, files.includes('package.json'));
    check(`${expectedName} pack includes README`, files.some(f=>/^readme\.md$/i.test(f)));
    check(`${expectedName} pack includes LICENSE`, files.some(f=>/^license$/i.test(f)));
    check(`${expectedName} pack includes dist`, files.some(f=>f.startsWith('dist/')));
    if(expectedName==='@reeris/core'){
      check('@reeris/core pack includes full CSS source map', files.includes('dist/reeris.css.map'));
      check('@reeris/core pack includes minified CSS source map', files.includes('dist/reeris.min.css.map'));
      check('@reeris/core pack includes published CSS sources', files.some(f=>f.startsWith('dist/sources/')&&f.endsWith('.css')));
    }
    check(`${expectedName} pack excludes src`, files.every(f=>!f.startsWith('src/')));
    check(`${expectedName} pack excludes reports/tooling`, files.every(f=>!f.startsWith('reports/')&&!f.startsWith('tooling/')));
  }
}

const core=readJson('packages/core/package.json');
check('@reeris/core style entry points to reeris.css', core.style==='./dist/reeris.css');
check('@reeris/core unpkg entry points to minified CSS', core.unpkg==='./dist/reeris.min.css');
check('@reeris/core jsDelivr entry points to minified CSS', core.jsdelivr==='./dist/reeris.min.css');
check('@reeris/core CSS side effects declared', Array.isArray(core.sideEffects) && core.sideEffects.some(x=>String(x).includes('.css')));
const js=readJson('packages/js/package.json');
check('@reeris/js marked side-effect free', js.sideEffects===false);

const report={version:rootPkg.version,generatedAt:new Date().toISOString(),summary:{passed:checks.filter(c=>c.pass).length,total:checks.length,failed:failures.length,packages:packages.length},packs:packEvidence,failures,checks};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync(`reports/package-release-audit-${rootPkg.version}.json`,JSON.stringify(report,null,2)+'\n');
console.log(`Package/release audit: ${report.summary.passed}/${report.summary.total} checks passed for ${packages.length} publishable packages.`);
for(const p of packEvidence) console.log(`${p.package}: ${p.fileCount} files, ${p.packageSize ?? '?'} B packed, ${p.unpackedSize ?? '?'} B unpacked.`);
if(failures.length){for(const f of failures.slice(0,30)) console.error(`FAIL: ${f.name}${f.detail?` — ${f.detail}`:''}`);process.exitCode=1;}
