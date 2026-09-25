import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[]; const failures=[];
function check(name, condition, detail='') { const pass=Boolean(condition); checks.push({name,pass,detail}); if(!pass) failures.push({name,detail}); }
function filesUnder(dir, extRe=/.*/) {
  const out=[];
  if(!fs.existsSync(dir)) return out;
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})) {
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()) out.push(...filesUnder(p,extRe)); else if(extRe.test(ent.name)) out.push(p);
  }
  return out;
}

check('SECURITY.md exists', fs.existsSync('SECURITY.md'));
if(fs.existsSync('SECURITY.md')) {
  const security=fs.readFileSync('SECURITY.md','utf8');
  check('Security policy includes private reporting guidance', /do \*\*not\*\* publish|private security/i.test(security));
  check('Security policy documents supported versions', /Supported versions/i.test(security));
  check('Security policy documents CSP architecture', /Content Security Policy|CSP/i.test(security));
}

const jsFiles=[...filesUnder('packages/js/src',/\.js$/),...filesUnder('packages/js/dist',/\.js$/)];
const forbidden = [
  ['eval()', /\beval\s*\(/],
  ['new Function', /\bnew\s+Function\b/],
  ['document.write', /\bdocument\.write\s*\(/],
  ['innerHTML assignment', /\.innerHTML\s*=/],
  ['outerHTML assignment', /\.outerHTML\s*=/],
  ['insertAdjacentHTML', /\.insertAdjacentHTML\s*\(/],
  ['setAttribute style sink', /\.setAttribute\s*\(\s*['"]style['"]/],
  ['dynamic script creation', /createElement\s*\(\s*['"]script['"]/i],
  ['dynamic style creation', /createElement\s*\(\s*['"]style['"]/i],
  ['network fetch', /\bfetch\s*\(/],
  ['XMLHttpRequest', /\bXMLHttpRequest\b/],
  ['WebSocket', /\bWebSocket\b/],
  ['localStorage', /\blocalStorage\b/],
  ['sessionStorage', /\bsessionStorage\b/],
  ['document.cookie', /\bdocument\.cookie\b/]
];
for(const file of jsFiles) {
  const text=fs.readFileSync(file,'utf8');
  for(const [label,re] of forbidden) check(`${path.relative(root,file)} avoids ${label}`, !re.test(text));
}

const cssFiles=[...filesUnder('packages/core/src',/\.css$/),...filesUnder('packages/core/dist',/\.css$/)];
for(const file of cssFiles) {
  const text=fs.readFileSync(file,'utf8');
  check(`${path.relative(root,file)} has no remote @import`, !/@import\s+(?:url\()?['"]?https?:/i.test(text));
  check(`${path.relative(root,file)} has no remote url()`, !/url\(\s*['"]?https?:/i.test(text));
  check(`${path.relative(root,file)} has no javascript: URL`, !/javascript\s*:/i.test(text));
}

for(const manifestPath of ['package.json','packages/core/package.json','packages/js/package.json']) {
  const m=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  check(`${manifestPath} has no production dependencies`, !m.dependencies || Object.keys(m.dependencies).length===0);
}

const fixture='tests/csp/index.html';
check('Strict CSP fixture exists', fs.existsSync(fixture));
if(fs.existsSync(fixture)) {
  const html=fs.readFileSync(fixture,'utf8');
  check('CSP fixture forbids default external loading', /default-src\s+'none'/i.test(html));
  check('CSP fixture does not require unsafe-inline', !/unsafe-inline/i.test(html));
  check('CSP fixture does not require unsafe-eval', !/unsafe-eval/i.test(html));
  check('CSP fixture has no inline style attributes', !/\sstyle\s*=/i.test(html));
  check('CSP fixture has no inline event handlers', !/\son[a-z]+\s*=/i.test(html));
  const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  check('CSP fixture scripts are external', scripts.every(m=>/\ssrc\s*=/.test(m[1]) && !m[2].trim()));
  check('CSP fixture has no embedded style blocks', !/<style\b/i.test(html));
}

const report={version:pkg.version,generatedAt:new Date().toISOString(),summary:{passed:checks.filter(c=>c.pass).length,total:checks.length,failed:failures.length,jsFiles:jsFiles.length,cssFiles:cssFiles.length},failures,checks};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync(`reports/security-audit-${pkg.version}.json`,JSON.stringify(report,null,2)+'\n');
console.log(`Security/CSP audit: ${report.summary.passed}/${report.summary.total} checks passed across ${jsFiles.length} JS and ${cssFiles.length} CSS artifacts.`);
if(failures.length){for(const f of failures.slice(0,30)) console.error(`FAIL: ${f.name}${f.detail?` — ${f.detail}`:''}`); process.exitCode=1;}
