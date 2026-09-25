import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const version=pkg.version;
const gatesPath='tests/release/manual-gates.json';
const criteriaPath='tests/release/gate-criteria.json';
const evidenceDir='tests/release/evidence';
const templateDir='tests/release/evidence-templates';
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha256=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const safeId=s=>String(s).toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'');
const iso=s=>typeof s==='string' && !Number.isNaN(Date.parse(s));

function loadPolicy(){
  const registry=readJson(gatesPath);
  const criteria=readJson(criteriaPath);
  return {registry,criteria};
}
function evidenceFiles(){
  if(!fs.existsSync(evidenceDir)) return [];
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.name==='.gitkeep'?[]:e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
  return walk(evidenceDir).filter(f=>f.endsWith('.json')).sort();
}
function policyMap(criteria){
  const out=new Map();
  for(const [gateId,gate] of Object.entries(criteria.gates||{})){
    for(const c of gate.criteria||[]) out.set(`${gateId}/${c.id}`,{gateId,gate,criterion:c});
  }
  return out;
}
function validateRecord(record,file,policy){
  const errors=[];
  const req=['schemaVersion','evidenceId','releaseVersion','gateId','kind','role','collectedAt','outcome','claims','environment','artifacts','review'];
  for(const k of req) if(record[k]===undefined) errors.push(`missing ${k}`);
  if(record.schemaVersion!==1) errors.push('schemaVersion must be 1');
  if(!/^[a-z0-9][a-z0-9._-]+$/.test(record.evidenceId||'')) errors.push('invalid evidenceId');
  if(!policy.criteria.gates?.[record.gateId]) errors.push(`unknown gateId ${record.gateId}`);
  if(!['closing','supplemental'].includes(record.role)) errors.push('invalid role');
  if(!['pass','fail','inconclusive'].includes(record.outcome)) errors.push('invalid outcome');
  if(!iso(record.collectedAt)) errors.push('invalid collectedAt');
  if(!Array.isArray(record.claims)) errors.push('claims must be array');
  if(!Array.isArray(record.artifacts)) errors.push('artifacts must be array');
  if(typeof record.environment!=='object'||record.environment===null||Array.isArray(record.environment)) errors.push('environment must be object');
  if(typeof record.review!=='object'||record.review===null) errors.push('review must be object');
  const gate=policy.criteria.gates?.[record.gateId];
  if(gate && record.role==='closing'){
    if(!record.claims?.length) errors.push('closing evidence must claim at least one criterion');
    if(record.outcome==='pass' && !record.artifacts?.length) errors.push('passing closing evidence must include at least one hashed artifact');
    if(!gate.persistentAcrossVersions && record.releaseVersion!==version) errors.push(`closing evidence targets ${record.releaseVersion}; current release is ${version}`);
    for(const claim of record.claims||[]){
      const c=(gate.criteria||[]).find(x=>x.id===claim);
      if(!c){errors.push(`unknown criterion ${record.gateId}/${claim}`);continue;}
      if(!(c.allowedKinds||[]).includes(record.kind)) errors.push(`kind ${record.kind} cannot satisfy ${record.gateId}/${claim}`);
    }
  }
  const review=record.review||{};
  if(!['pending','approved','rejected'].includes(review.status)) errors.push('invalid review.status');
  if(review.status!=='pending'){
    if(typeof review.reviewedBy!=='string'||!review.reviewedBy.trim()) errors.push('reviewedBy required for approved/rejected evidence');
    if(!iso(review.reviewedAt)) errors.push('valid reviewedAt required for approved/rejected evidence');
  }
  for(const artifact of record.artifacts||[]){
    if(typeof artifact.path!=='string'||!artifact.path) {errors.push('artifact path missing');continue;}
    if(!/^[a-f0-9]{64}$/.test(artifact.sha256||'')) errors.push(`invalid artifact sha256 for ${artifact.path}`);
    const abs=path.resolve(root,artifact.path);
    if(!fs.existsSync(abs)) errors.push(`artifact missing: ${artifact.path}`);
    else if(/^[a-f0-9]{64}$/.test(artifact.sha256||'') && sha256(abs)!==artifact.sha256) errors.push(`artifact hash mismatch: ${artifact.path}`);
  }
  return errors;
}
function evaluate(){
  const {registry,criteria}=loadPolicy();
  const records=[]; const invalid=[];
  for(const file of evidenceFiles()){
    try{
      const record=readJson(file); const errors=validateRecord(record,file,{registry,criteria});
      records.push({file,record,errors});
      if(errors.length) invalid.push({file,evidenceId:record.evidenceId,errors});
    }catch(error){invalid.push({file,errors:[String(error.message||error)]});}
  }
  const gateResults=[];
  for(const gateEntry of registry.gates||[]){
    const gatePolicy=criteria.gates?.[gateEntry.id];
    const criterionResults=[];
    for(const c of gatePolicy?.criteria||[]){
      const matches=records.filter(({record,errors})=>!errors.length && record.gateId===gateEntry.id && record.role==='closing' && record.claims.includes(c.id) && record.outcome==='pass' && record.review.status==='approved' && (gatePolicy.persistentAcrossVersions || record.releaseVersion===version));
      criterionResults.push({id:c.id,description:c.description,passed:matches.length>0,evidence:matches.map(x=>x.record.evidenceId)});
    }
    const passed=criterionResults.length>0 && criterionResults.every(x=>x.passed);
    const supplemental=records.filter(({record,errors})=>!errors.length && record.gateId===gateEntry.id && record.role==='supplemental').map(x=>x.record.evidenceId);
    gateResults.push({id:gateEntry.id,storedStatus:gateEntry.status,effectiveStatus:passed?'passed':'open',blocks1_0:Boolean(gateEntry.blocks1_0),blocksPublicPublication:Boolean(gateEntry.blocksPublicPublication),criteria:criterionResults,supplementalEvidence:supplemental});
  }
  return {registry,criteria,records,invalid,gateResults};
}
function writeAudit(){
  const state=evaluate(); const checks=[]; const fail=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});
  fail('Gate criteria version matches current release',state.criteria.version===version,`${state.criteria.version} vs ${version}`);
  fail('Manual gate registry version matches current release',state.registry.version===version,`${state.registry.version} vs ${version}`);
  const gateIds=new Set((state.registry.gates||[]).map(g=>g.id));
  fail('Every registry gate has closure criteria',[...gateIds].every(id=>state.criteria.gates?.[id]),`${gateIds.size} registry gates`);
  fail('Criteria contains no unknown gates',Object.keys(state.criteria.gates||{}).every(id=>gateIds.has(id)));
  const criterionKeys=[];
  for(const [gateId,g] of Object.entries(state.criteria.gates||{})) for(const c of g.criteria||[]) criterionKeys.push(`${gateId}/${c.id}`);
  fail('Closure criterion IDs are unique',new Set(criterionKeys).size===criterionKeys.length,`${criterionKeys.length} criteria`);
  fail('All evidence records validate',state.invalid.length===0,`${state.invalid.length} invalid`);
  for(const g of state.gateResults) fail(`Stored gate status matches evidence-derived status: ${g.id}`,g.storedStatus===g.effectiveStatus,`${g.storedStatus} vs ${g.effectiveStatus}`);
  const summary={passed:checks.filter(x=>x.pass).length,total:checks.length,failed:checks.filter(x=>!x.pass).length};
  const report={version,generatedAt:new Date().toISOString(),summary,evidenceSummary:{records:state.records.length,invalid:state.invalid.length,closing:state.records.filter(x=>x.record.role==='closing').length,supplemental:state.records.filter(x=>x.record.role==='supplemental').length},gateSummary:{total:state.gateResults.length,passed:state.gateResults.filter(g=>g.effectiveStatus==='passed').length,open:state.gateResults.filter(g=>g.effectiveStatus==='open').length,openBlocking1_0:state.gateResults.filter(g=>g.effectiveStatus==='open'&&g.blocks1_0).length,openBlockingPublication:state.gateResults.filter(g=>g.effectiveStatus==='open'&&g.blocksPublicPublication).length,criteriaTotal:criterionKeys.length,criteriaPassed:state.gateResults.flatMap(g=>g.criteria).filter(c=>c.passed).length},invalid:state.invalid,gates:state.gateResults,checks};
  fs.mkdirSync('reports',{recursive:true}); fs.writeFileSync(`reports/release-lab-audit-${version}.json`,JSON.stringify(report,null,2)+'\n');
  console.log(`Release Lab audit: ${summary.passed}/${summary.total} checks passed. Evidence: ${report.evidenceSummary.records}; gates passed: ${report.gateSummary.passed}/${report.gateSummary.total}; closure criteria: ${report.gateSummary.criteriaPassed}/${report.gateSummary.criteriaTotal}.`);
  if(summary.failed){for(const c of checks.filter(x=>!x.pass)) console.error(`FAIL: ${c.name}${c.detail?` — ${c.detail}`:''}`);process.exitCode=1;}
}
function sync(){
  const state=evaluate();
  if(state.invalid.length) throw new Error(`Cannot sync with ${state.invalid.length} invalid evidence record(s).`);
  state.registry.version=version;
  state.registry.gates=state.registry.gates.map(g=>{
    const result=state.gateResults.find(x=>x.id===g.id);
    return {...g,status:result.effectiveStatus,criteriaStatus:Object.fromEntries(result.criteria.map(c=>[c.id,{status:c.passed?'passed':'open',evidence:c.evidence}])),supplementalEvidence:result.supplementalEvidence};
  });
  fs.writeFileSync(gatesPath,JSON.stringify(state.registry,null,2)+'\n');
  console.log(`Synchronized ${state.registry.gates.length} release gates from approved evidence. No gate is changed without satisfying every required criterion.`);
}
function template(gateId){
  const {criteria}=loadPolicy(); const gate=criteria.gates?.[gateId]; if(!gate) throw new Error(`Unknown gate: ${gateId}`);
  fs.mkdirSync(templateDir,{recursive:true});
  for(const c of gate.criteria||[]){
    const record={schemaVersion:1,evidenceId:`${gateId}-${c.id}-replace-me`,releaseVersion:version,gateId,kind:(c.allowedKinds||['other'])[0],role:'closing',collectedAt:'REPLACE_WITH_ISO_TIMESTAMP',outcome:'pass',claims:[c.id],environment:{notes:'Describe browser/device/assistive-tech/zoom/high-contrast/review environment.'},artifacts:[{path:'REPLACE_WITH_REPOSITORY_RELATIVE_EVIDENCE_PATH',sha256:'REPLACE_WITH_SHA256',description:'Screenshot, notes, device-cloud export, decision memo, or other supporting evidence.'}],notes:'Describe what was tested, the result, and any limitations.',review:{status:'pending',reviewedBy:null,reviewedAt:null,notes:'Approval must be deliberate and evidence-based.'}};
    const out=path.join(templateDir,`${gateId}--${c.id}.json`); fs.writeFileSync(out,JSON.stringify(record,null,2)+'\n');
  }
  console.log(`Wrote ${gate.criteria.length} evidence template(s) for ${gateId} to ${templateDir}/.`);
}
function importRecord(src){
  const record=readJson(src); const policy=loadPolicy(); const errors=validateRecord(record,src,policy); if(errors.length) throw new Error(errors.join('; '));
  const dir=path.join(evidenceDir,record.gateId); fs.mkdirSync(dir,{recursive:true}); const out=path.join(dir,`${safeId(record.evidenceId)}.json`);
  if(fs.existsSync(out)) throw new Error(`Evidence already exists: ${out}`);
  fs.writeFileSync(out,JSON.stringify(record,null,2)+'\n'); console.log(`Imported ${record.evidenceId} → ${out}. Run evidence:sync explicitly to derive gate status.`);
}
function importBrowser(arg){
  let files=[];
  if(arg==='--latest'||!arg) files=fs.existsSync('reports')?fs.readdirSync('reports').filter(n=>n.startsWith('rc-browser-evidence-')&&n.endsWith('.json')).map(n=>path.join('reports',n)).sort():[];
  else files=[arg];
  if(!files.length) throw new Error('No RC browser evidence report found.');
  for(const src of files){
    const report=readJson(src); const projects=report.projects||[]; const outcome=Number(report.summary?.failed||0)===0?'pass':'fail'; const hash=sha256(src).slice(0,12);
    const mappings=[['desktop-browser-matrix',projects.filter(p=>['chromium','firefox','webkit','edge'].includes(p))],['mobile-browser-matrix',projects.filter(p=>['mobile-chromium','mobile-webkit'].includes(p))]];
    for(const [gateId,coverage] of mappings){
      if(!coverage.length) continue;
      const evidenceId=`rc-ci-${gateId}-${report.version||version}-${hash}`;
      const record={schemaVersion:1,evidenceId,releaseVersion:report.version||version,gateId,kind:'automated-ci',role:'supplemental',collectedAt:report.generatedAt||new Date().toISOString(),outcome,claims:[],coverage,environment:{runner:'Playwright CI',projects:coverage,sourceReport:src},artifacts:[{path:src,sha256:sha256(src),description:'Machine-readable Reeris Playwright RC browser report.'}],notes:'Supplemental prerequisite evidence only. It does not satisfy real branded-browser/device closure criteria.',review:{status:'pending',reviewedBy:null,reviewedAt:null,notes:'Supplemental CI evidence; not gate-closing.'}};
      const dir=path.join(evidenceDir,gateId);fs.mkdirSync(dir,{recursive:true});const out=path.join(dir,`${evidenceId}.json`);fs.writeFileSync(out,JSON.stringify(record,null,2)+'\n');console.log(`Normalized supplemental browser evidence → ${out}`);
    }
  }
}

const [cmd,arg]=process.argv.slice(2);
try{
  if(!cmd||cmd==='audit') writeAudit();
  else if(cmd==='sync') sync();
  else if(cmd==='template') {if(!arg) throw new Error('Usage: template <gate-id>');template(arg);}
  else if(cmd==='template-all'){for(const id of Object.keys(loadPolicy().criteria.gates||{})) template(id);}
  else if(cmd==='import'){if(!arg) throw new Error('Usage: import <evidence.json>');importRecord(arg);}
  else if(cmd==='import-browser') importBrowser(arg);
  else throw new Error(`Unknown command: ${cmd}`);
}catch(error){console.error(`Release Lab: ${error.message||error}`);process.exitCode=1;}
