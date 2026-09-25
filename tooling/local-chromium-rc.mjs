import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';

const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const version=pkg.version;
const port=Number(process.env.REVA_TEST_PORT||4173);
const httpBase=`http://127.0.0.1:${port}`;
const sha256=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const safe=s=>String(s).toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'');
const coreCss=fs.readFileSync('packages/core/dist/reeris.css','utf8');
const docsCss=fs.readFileSync('docs/assets/docs.css','utf8');
const glideSource=fs.readFileSync('packages/js/dist/glide-navigation.js','utf8');

class Cdp {
  constructor(url){this.url=url;this.ws=null;this.id=0;this.pending=new Map();this.handlers=new Map();}
  async connect(){
    this.ws=new WebSocket(this.url);
    await new Promise((resolve,reject)=>{this.ws.addEventListener('open',resolve,{once:true});this.ws.addEventListener('error',reject,{once:true});});
    this.ws.addEventListener('message',event=>{
      const msg=JSON.parse(event.data);
      if(msg.id){const p=this.pending.get(msg.id);if(!p)return;this.pending.delete(msg.id);if(msg.error)p.reject(new Error(`${p.method}: ${msg.error.message}`));else p.resolve(msg.result);return;}
      const key=`${msg.sessionId||''}:${msg.method}`;for(const fn of this.handlers.get(key)||[])fn(msg.params||{});
    });
  }
  send(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++this.id;this.pending.set(id,{resolve,reject,method});this.ws.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});}
  on(method,fn,sessionId){const key=`${sessionId||''}:${method}`;const arr=this.handlers.get(key)||[];arr.push(fn);this.handlers.set(key,arr);}
  close(){try{this.ws?.close();}catch{}}
}
async function waitHttp(url,timeout=10000){const start=Date.now();while(Date.now()-start<timeout){try{const r=await fetch(url);if(r.ok)return;}catch{}await sleep(100);}throw new Error(`Server not ready: ${url}`);}
function findChromium(){if(process.env.REVA_CHROMIUM_PATH&&fs.existsSync(process.env.REVA_CHROMIUM_PATH))return process.env.REVA_CHROMIUM_PATH;for(const n of ['chromium','chromium-browser','google-chrome','google-chrome-stable']){const r=spawnSync('which',[n],{encoding:'utf8'});if(r.status===0&&r.stdout.trim())return r.stdout.trim();}throw new Error('Chromium-family executable not found.');}
async function launchChromium(executable){
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'reeris-chromium-'));
  const args=['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--disable-component-update','--disable-default-apps','--disable-sync','--metrics-recording-only','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'];
  const child=spawn(executable,args,{cwd:root,stdio:['ignore','ignore','pipe'],detached:true});let stderr='';
  const wsUrl=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`DevTools endpoint timeout. ${stderr.slice(-1000)}`)),15000);child.stderr.setEncoding('utf8');child.stderr.on('data',c=>{stderr+=c;const m=stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1]);}});child.once('exit',(code,signal)=>{clearTimeout(timer);reject(new Error(`Chromium exited (${code}/${signal}). ${stderr.slice(-1000)}`));});});
  return {child,profile,wsUrl,getStderr:()=>stderr};
}
function killTree(child){if(!child?.pid)return;try{process.kill(-child.pid,'SIGKILL');}catch{try{child.kill('SIGKILL');}catch{}}}
function fixtureHtml(rel){
  const clean=rel.split('?')[0].replace(/^\//,'');const abs=path.resolve(root,clean);if(!abs.startsWith(root+path.sep)||!fs.existsSync(abs))throw new Error(`Fixture missing: ${rel}`);
  let html=fs.readFileSync(abs,'utf8');
  html=html.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi,'').replace(/<script\b[^>]*\bsrc=["'][^"']+["'][^>]*>\s*<\/script>/gi,'');
  const injected=`<style data-reeris-local-evidence>${coreCss}\n${docsCss}</style>`;
  html=html.includes('</head>')?html.replace('</head>',`${injected}</head>`):injected+html;
  return html;
}
function queryState(rel){const q=rel.includes('?')?rel.slice(rel.indexOf('?')+1):'';const p=new URLSearchParams(q);return {theme:p.get('theme'),density:p.get('density'),dir:p.get('dir'),radius:p.get('radius'),elevation:p.get('elevation'),motion:p.get('motion')||'none'};}

async function createPage(cdp){
  const {targetId}=await cdp.send('Target.createTarget',{url:'about:blank'});const {sessionId}=await cdp.send('Target.attachToTarget',{targetId,flatten:true});
  for(const m of ['Page.enable','Runtime.enable','Network.enable','Accessibility.enable'])await cdp.send(m,{},sessionId);
  const runtimeErrors=[];const consoleErrors=[];const docResponses=[];
  cdp.on('Runtime.exceptionThrown',p=>runtimeErrors.push(p.exceptionDetails?.exception?.description||p.exceptionDetails?.text||'Runtime exception'),sessionId);
  cdp.on('Runtime.consoleAPICalled',p=>{if(p.type==='error')consoleErrors.push((p.args||[]).map(a=>a.value||a.description||'').join(' '));},sessionId);
  cdp.on('Network.responseReceived',p=>{if(p.type==='Document')docResponses.push({url:p.response.url,status:p.response.status});},sessionId);
  const evalJs=async expression=>{const r=await cdp.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true},sessionId);if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text||'Runtime evaluate failed');return r.result?.value;};
  const configure=async({width=1280,height=900,mobile=false,features=[{name:'prefers-reduced-motion',value:'reduce'}]}={})=>{runtimeErrors.length=0;consoleErrors.length=0;docResponses.length=0;await cdp.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile,screenWidth:width,screenHeight:height},sessionId);await cdp.send('Emulation.setEmulatedMedia',{media:'screen',features},sessionId);};
  const ready=async()=>{const deadline=Date.now()+10000;while(Date.now()<deadline){if(await evalJs(`document.readyState==='complete'||document.readyState==='interactive'`))break;await sleep(25);}await evalJs(`(async()=>{if(document.fonts?.ready)await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return true;})()`);};
  const navigate=async(url,opts={})=>{await configure(opts);const n=await cdp.send('Page.navigate',{url},sessionId);if(n.errorText)throw new Error(n.errorText);await ready();return {runtimeErrors:[...runtimeErrors],consoleErrors:[...consoleErrors],responses:[...docResponses]};};
  const injectFixture=async(rel,opts={})=>{await configure(opts);const tree=await cdp.send('Page.getFrameTree',{},sessionId);await cdp.send('Page.setDocumentContent',{frameId:tree.frameTree.frame.id,html:fixtureHtml(rel)},sessionId);await ready();const state=queryState(rel);const script=`(()=>{const e=document.documentElement;const s=${JSON.stringify(state)};if(s.theme&&s.theme!=='system')e.dataset.theme=s.theme;else delete e.dataset.theme;if(s.density)e.dataset.density=s.density;if(s.dir)e.dir=s.dir;if(s.radius)e.dataset.radius=s.radius;if(s.elevation)e.dataset.elevation=s.elevation;if(s.motion)e.dataset.motion=s.motion;const o=document.querySelector('[data-visual-settings]');if(o)o.textContent='theme='+(s.theme||'system')+' · density='+(s.density||'default')+' · dir='+(s.dir||'ltr')+' · radius='+(s.radius||'default')+' · elevation='+(s.elevation||'default');return true;})()`;await evalJs(script);await sleep(25);return {runtimeErrors:[...runtimeErrors],consoleErrors:[...consoleErrors],responses:[]};};
  const key=async(name)=>{const map={Space:{key:' ',code:'Space',vk:32,text:' '},Enter:{key:'Enter',code:'Enter',vk:13,text:'\r'},Escape:{key:'Escape',code:'Escape',vk:27,text:''}};const x=map[name];await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:x.key,code:x.code,windowsVirtualKeyCode:x.vk,nativeVirtualKeyCode:x.vk,text:x.text},sessionId);await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:x.key,code:x.code,windowsVirtualKeyCode:x.vk,nativeVirtualKeyCode:x.vk},sessionId);};
  const screenshot=async out=>{const {data}=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:true},sessionId);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,Buffer.from(data,'base64'));return {path:path.relative(root,out).replaceAll('\\','/'),bytes:fs.statSync(out).size,sha256:sha256(out)};};
  const ax=async()=>{const t=await cdp.send('Accessibility.getFullAXTree',{},sessionId);const c={};for(const n of t.nodes||[]){const r=n.role?.value;if(r)c[r]=(c[r]||0)+1;}return c;};
  const loadGlide=async()=>{let code=glideSource.replace(/\bexport\s+default\s+GlideNavigation\s*;?/g,'').replace(/\bexport\s+class\s+GlideNavigation/,'class GlideNavigation');code+=`\nfor (const el of document.querySelectorAll('[data-reeris-glide]')) new GlideNavigation(el);`;await evalJs(`(()=>{${code}\nreturn true;})()`);};
  return {navigate,injectFixture,evalJs,key,screenshot,ax,loadGlide,errors:()=>({runtimeErrors:[...runtimeErrors],consoleErrors:[...consoleErrors]})};
}

function writeSupplementalEvidence({reportPath,reportHash,browser,generatedAt,outcome}){
  const defs=[
    ['desktop-browser-matrix',[`${browser.product} local Linux render/smoke/interaction run`],'Real local Chromium-engine execution. Supplemental only: Chromium is not treated as branded current Google Chrome, Edge, Firefox, or Safari evidence.'],
    ['assistive-technology',['Automated keyboard focus, switch, disclosure, dialog and glide interactions'],'Keyboard automation only. No screen reader was exercised.'],
    ['zoom-reflow-touch',['320px document-overflow check and mobile-size render candidates'],'Viewport/reflow prerequisite evidence only; not real 200%/400% browser zoom or real touch hardware.'],
    ['forced-colors-high-contrast',['Chromium forced-colors and prefers-contrast media emulation'],'Automated media emulation only; not Windows High Contrast/manual review.'],
    ['visual-regression-baselines',['Canonical Chromium candidate screenshots captured and hashed'],'Candidate screenshots only; not human-approved baselines.']
  ];
  for(const [gateId,coverage,notes] of defs){const evidenceId=`local-chromium-${safe(gateId)}-${version}`;const record={schemaVersion:1,evidenceId,releaseVersion:version,gateId,kind:'other',role:'supplemental',collectedAt:generatedAt,outcome,claims:[],coverage,environment:{runner:'Local Chromium via Chrome DevTools Protocol',browser:browser.product,userAgent:browser.userAgent,platform:process.platform,arch:process.arch,node:process.version},artifacts:[{path:reportPath,sha256:reportHash,description:'Machine-readable local Chromium RC report with test results and screenshot hashes.'}],notes,review:{status:'pending',reviewedBy:null,reviewedAt:null,notes:'Supplemental automated evidence; intentionally not gate-closing.'}};const dir=path.join('tests/release/evidence',gateId);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,`${evidenceId}.json`),JSON.stringify(record,null,2)+'\n');}
}

let server,browser,cdp;
try{
  const artifactRoot=path.join(root,'tests/release/evidence-artifacts',version,'local-chromium');fs.rmSync(artifactRoot,{recursive:true,force:true});fs.mkdirSync(artifactRoot,{recursive:true});
  server=spawn(process.execPath,['tooling/test-server.mjs'],{cwd:root,stdio:['ignore','ignore','ignore'],detached:true,env:{...process.env,REVA_TEST_PORT:String(port)}});await waitHttp(`${httpBase}/docs/index.html`);
  browser=await launchChromium(findChromium());cdp=new Cdp(browser.wsUrl);await cdp.connect();const vi=await cdp.send('Browser.getVersion');const browserInfo={product:vi.product,userAgent:vi.userAgent,revision:vi.revision,protocolVersion:vi.protocolVersion,executable:findChromium()};const page=await createPage(cdp);
  let mode='http';try{await page.navigate(`${httpBase}/docs/index.html`);}catch(error){if(String(error.message||error).includes('ERR_BLOCKED_BY_ADMINISTRATOR'))mode='injected';else throw error;}
  const open=async(rel,opts={})=>mode==='http'?page.navigate(`${httpBase}${rel}`,opts):page.injectFixture(rel,opts);
  const tests=[];const record=(name,pass,detail={})=>tests.push({name,pass:Boolean(pass),detail});
  const smoke=['/docs/foundation.html','/docs/forms-complete.html','/docs/navigation-completion.html','/docs/overlays.html','/docs/tables.html','/docs/browser-reflow.html','/tests/i18n/index.html','/examples/starters/dashboard.html'];
  for(const rel of smoke){try{const r=await open(rel);const body=await page.evalJs('Boolean(document.body&&document.body.getClientRects().length)');const title=await page.evalJs('document.title');record(`smoke ${rel}`,body&&!r.runtimeErrors.length&&!r.consoleErrors.length,{title,runtimeErrors:r.runtimeErrors,consoleErrors:r.consoleErrors,axRoles:await page.ax(),mode});}catch(error){record(`smoke ${rel}`,false,{error:String(error.message||error)});}}
  try{await open('/docs/forms-complete.html');const before=await page.evalJs(`(()=>{const e=document.querySelector('input[role="switch"]');e.focus();return {checked:e.checked,focused:document.activeElement===e}})()`);await page.key('Space');const after=await page.evalJs(`(()=>{const e=document.querySelector('input[role="switch"]');return {checked:e.checked,focused:document.activeElement===e}})()`);record('keyboard switch toggles with Space',before.focused&&after.focused&&before.checked!==after.checked,{before,after});}catch(error){record('keyboard switch toggles with Space',false,{error:String(error.message||error)});}
  try{await open('/docs/browser-reflow.html');await page.evalJs(`document.querySelector('#test-dialog').showModal()`);const opened=await page.evalJs(`document.querySelector('#test-dialog').open`);await page.key('Escape');await sleep(75);const closed=!(await page.evalJs(`document.querySelector('#test-dialog').open`));record('native dialog opens and Escape closes',opened&&closed,{opened,closed});}catch(error){record('native dialog opens and Escape closes',false,{error:String(error.message||error)});}
  try{await open('/docs/overlays.html');const before=await page.evalJs(`(()=>{const d=[...document.querySelectorAll('details')].find(x=>x.querySelector('summary')?.textContent.includes('Does this need JavaScript?'));d.querySelector('summary').focus();return d.open})()`);await page.key('Enter');await sleep(75);const after=await page.evalJs(`[...document.querySelectorAll('details')].find(x=>x.querySelector('summary')?.textContent.includes('Does this need JavaScript?')).open`);record('native disclosure opens with Enter',!before&&after,{before,after});}catch(error){record('native disclosure opens with Enter',false,{error:String(error.message||error)});}
  try{await open('/docs/navigation-completion.html');if(mode==='injected')await page.loadGlide();const ready=await page.evalJs(`(()=>{const n=document.querySelector('[data-reeris-glide]');return {ready:n?.hasAttribute('data-reeris-glide-ready')||false,links:n?.querySelectorAll('a.nav-link').length||0}})()`);record('glide navigation initializes',ready.ready&&ready.links>1,ready);}catch(error){record('glide navigation initializes',false,{error:String(error.message||error)});}
  try{await open('/docs/browser-reflow.html',{width:320,height:800});const overflow=await page.evalJs(`document.documentElement.scrollWidth-document.documentElement.clientWidth`);record('320px viewport has no document overflow',overflow<=1,{overflow});}catch(error){record('320px viewport has no document overflow',false,{error:String(error.message||error)});}
  try{await open('/docs/foundation.html',{features:[{name:'forced-colors',value:'active'},{name:'prefers-reduced-motion',value:'reduce'}]});const active=await page.evalJs(`matchMedia('(forced-colors: active)').matches`);const shot=await page.screenshot(path.join(artifactRoot,'forced-colors.png'));record('forced-colors media emulation activates',active,{active,screenshot:shot});}catch(error){record('forced-colors media emulation activates',false,{error:String(error.message||error)});}
  try{await open('/docs/foundation.html',{features:[{name:'prefers-contrast',value:'more'},{name:'prefers-reduced-motion',value:'reduce'}]});const active=await page.evalJs(`matchMedia('(prefers-contrast: more)').matches`);const shot=await page.screenshot(path.join(artifactRoot,'prefers-contrast-more.png'));record('prefers-contrast media emulation activates',active,{active,screenshot:shot});}catch(error){record('prefers-contrast media emulation activates',false,{error:String(error.message||error)});}
  const vm=JSON.parse(fs.readFileSync('tests/visual/cases.json','utf8'));const visuals=[];for(const item of vm.cases){try{const rel='/'+item.path;await open(rel,{width:item.width,height:item.height,mobile:item.width<=400,features:[{name:'prefers-reduced-motion',value:'reduce'}]});const image=await page.screenshot(path.join(artifactRoot,'visual',`${item.id}.png`));const overflow=await page.evalJs(`document.documentElement.scrollWidth-document.documentElement.clientWidth`);visuals.push({id:item.id,pass:overflow<=1||item.width>400,viewport:{width:item.width,height:item.height},overflow,image});}catch(error){visuals.push({id:item.id,pass:false,error:String(error.message||error)});}}
  const generatedAt=new Date().toISOString();const summary={passed:tests.filter(x=>x.pass).length,failed:tests.filter(x=>!x.pass).length,total:tests.length,visualCandidates:visuals.length,visualCandidateFailures:visuals.filter(x=>!x.pass).length};const report={schemaVersion:1,version,generatedAt,browser:browserInfo,environment:{platform:process.platform,arch:process.arch,node:process.version,navigationMode:mode,httpNavigationPolicy:mode==='injected'?'localhost navigation blocked by administrator; fixtures rendered through DevTools Page.setDocumentContent with exact built Core CSS and docs CSS injected':'local HTTP server'},summary,tests,visualCandidates:visuals,boundary:'Supplemental local Chromium evidence only. Injected mode is a render/interaction fallback for a managed environment that blocks localhost navigation. This run does not satisfy branded Chrome/Edge/Firefox/Safari, real mobile device, screen-reader, real zoom/touch, Windows High Contrast, or human-approved visual baseline closure criteria.'};const reportPath=path.join(artifactRoot,'local-chromium-report.json');fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');const relReport=path.relative(root,reportPath).replaceAll('\\','/');const hash=sha256(reportPath);const outcome=summary.failed===0&&summary.visualCandidateFailures===0?'pass':'fail';writeSupplementalEvidence({reportPath:relReport,reportHash:hash,browser:browserInfo,generatedAt,outcome});console.log(`Local Chromium RC run: ${summary.passed}/${summary.total} interaction/smoke checks passed; ${visuals.length-summary.visualCandidateFailures}/${visuals.length} visual candidates passed layout checks.`);console.log(`Browser: ${browserInfo.product}; navigation mode: ${mode}`);console.log(`Evidence: ${relReport}`);if(outcome!=='pass')process.exitCode=1;
}catch(error){console.error(`Local Chromium RC: ${error.stack||error.message||error}`);process.exitCode=1;}finally{try{cdp?.close();}catch{}killTree(browser?.child);killTree(server);}
