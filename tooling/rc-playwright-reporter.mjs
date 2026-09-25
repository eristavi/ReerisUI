import fs from 'node:fs';
import path from 'node:path';

export default class RevaRcReporter {
  constructor(){ this.rows=[]; this.startedAt=new Date().toISOString(); }
  onTestEnd(test,result){
    this.rows.push({
      project:test.parent?.project()?.name || test.parent?.title || 'unknown',
      title:test.titlePath().slice(1).join(' › '),
      status:result.status,
      durationMs:result.duration,
      retry:result.retry,
      errors:(result.errors||[]).map(e=>String(e.message||e.value||e).slice(0,1000))
    });
  }
  async onEnd(result){
    const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
    const passed=this.rows.filter(x=>x.status==='passed').length;
    const skipped=this.rows.filter(x=>x.status==='skipped').length;
    const failed=this.rows.filter(x=>!['passed','skipped'].includes(x.status)).length;
    const projects=[...new Set(this.rows.map(x=>x.project))].sort();
    const report={schemaVersion:1,version:pkg.version,generatedAt:new Date().toISOString(),startedAt:this.startedAt,playwrightStatus:result.status,projects,summary:{passed,skipped,failed,total:this.rows.length},tests:this.rows};
    fs.mkdirSync('reports',{recursive:true});
    fs.writeFileSync(path.join('reports',`rc-browser-evidence-${pkg.version}.json`),JSON.stringify(report,null,2)+'\n');
  }
}
