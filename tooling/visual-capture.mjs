import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
const manifest=JSON.parse(fs.readFileSync('tests/visual/cases.json','utf8'));
const platform=process.env.REVA_VISUAL_PLATFORM || manifest.baselineEngine || 'chromium-linux';
const outDir=path.resolve('tests/visual/current',platform);
fs.mkdirSync(outDir,{recursive:true});

function executableWorks(candidate){ if(!candidate) return false; if(candidate.includes(path.sep)) return fs.existsSync(candidate); return spawnSync('which',[candidate],{stdio:'ignore'}).status===0; }
const probes=[process.env.REVA_VISUAL_BROWSER,'chromium','chromium-browser','google-chrome','google-chrome-stable','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser=probes.find(executableWorks);
if(!browser){ console.error('No compatible Chromium browser found. Set REVA_VISUAL_BROWSER to an executable path.'); process.exit(2); }

function urlFor(rel){ const [pathname,query='']=rel.split('?'); const u=pathToFileURL(path.resolve(pathname)); if(query) u.search=query; return u.href; }
function capture(item){ return new Promise((resolve,reject)=>{
  const file=path.join(outDir,`${item.id}.png`);
  const args=['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--disable-default-apps','--disable-extensions','--disable-sync','--hide-scrollbars','--force-device-scale-factor=1',`--window-size=${item.width},${item.height}`,`--screenshot=${file}`,urlFor(item.path)];
  const child=spawn(browser,args,{stdio:['ignore','ignore','pipe']});
  let stderr=''; child.stderr.on('data',d=>stderr+=d);
  const timer=setTimeout(()=>{ child.kill('SIGKILL'); reject(new Error(`Browser timeout capturing ${item.id}. This environment may not support headless Chromium.\n${stderr.slice(-1200)}`)); }, Number(process.env.REVA_VISUAL_TIMEOUT_MS||20000));
  child.on('error',err=>{clearTimeout(timer);reject(err)});
  child.on('exit',code=>{clearTimeout(timer); if(code===0&&fs.existsSync(file)) resolve(file); else reject(new Error(`Capture failed for ${item.id} (exit ${code}).\n${stderr.slice(-1200)}`));});
}); }

for(const item of manifest.cases){ process.stdout.write(`capture ${item.id} ... `); try{await capture(item); console.log('ok');}catch(err){console.log('failed'); console.error(err.message); process.exit(2);} }
console.log(`Captured ${manifest.cases.length} screenshots to ${path.relative(root,outDir)}.`);
