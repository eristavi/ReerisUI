import fs from 'node:fs';
import path from 'node:path';
const version=JSON.parse(fs.readFileSync('package.json','utf8')).version;
const checks=[]; const failures=[];
const check=(name,cond,detail='')=>{const pass=Boolean(cond);checks.push({name,pass,detail});if(!pass)failures.push({name,detail});};
const fixture='tests/i18n/index.html';
check('i18n stress fixture exists',fs.existsSync(fixture));
const html=fs.readFileSync(fixture,'utf8');
for(const lang of ['ar','he','de','ja']) check(`Fixture language represented: ${lang}`,new RegExp(`lang=["']${lang}["']`).test(html));
check('Arabic RTL fixture represented',/dir=["']rtl["'][^>]*lang=["']ar["']|lang=["']ar["'][^>]*dir=["']rtl["']/.test(html));
check('Hebrew RTL fixture represented',/dir=["']rtl["'][^>]*lang=["']he["']|lang=["']he["'][^>]*dir=["']rtl["']/.test(html));
check('Bidi isolation examples use bdi', (html.match(/<bdi>/g)||[]).length>=4);
check('Semantic time examples included', (html.match(/<time\b/g)||[]).length>=3);
check('Long translation stress included',/Donaudampfschifffahrtsgesellschaft/.test(html));

const cssFiles=[];
const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(p.endsWith('.css'))cssFiles.push(p);}};
walk('packages/core/src');
const all=cssFiles.map(f=>`/* ${f} */\n${fs.readFileSync(f,'utf8')}`).join('\n');
check('Core does not globally force direction', !/(^|[;{]\s*)direction\s*:\s*(?:ltr|rtl)/m.test(all));
check('Core avoids physical text alignment', !/text-align\s*:\s*(?:left|right)\b/.test(all));
check('Core uses logical inline spacing', /padding-inline|margin-inline|inset-inline/.test(all));
check('Logical safe-area start token exists', /--reeris-safe-inline-start\s*:/.test(all));
check('Logical safe-area end token exists', /--reeris-safe-inline-end\s*:/.test(all));
check('RTL swaps logical safe-area tokens', /:root:dir\(rtl\)[\s\S]*--reeris-safe-inline-start:\s*var\(--reeris-safe-right\)[\s\S]*--reeris-safe-inline-end:\s*var\(--reeris-safe-left\)/.test(all));
check('FAB uses logical safe-area end', /inset-inline-end:[^;]*--reeris-safe-inline-end/.test(all));
check('Toast start/end use logical safe-area aliases', /--reeris-safe-inline-start/.test(fs.readFileSync('packages/core/src/components/toast.css','utf8')) && /--reeris-safe-inline-end/.test(fs.readFileSync('packages/core/src/components/toast.css','utf8')));
check('Sidebar subnav indentation is logical', /sidebar-subnav[^}]*padding-inline-start/.test(fs.readFileSync('packages/core/src/components/advanced-navigation.css','utf8')));
check('Tree directional disclosure mirrors in RTL', /\[dir="rtl"\][^}]*tree-toggle/.test(fs.readFileSync('packages/core/src/components/tree.css','utf8')));

const physical=[];
for(const f of cssFiles){const text=fs.readFileSync(f,'utf8'); text.split(/\n/).forEach((line,i)=>{
  if(/\b(?:margin-left|margin-right|padding-left|padding-right|border-left|border-right|float)\s*:/.test(line)) physical.push(`${f}:${i+1}:${line.trim()}`);
});}
check('No physical directional box properties remain',physical.length===0,physical.slice(0,8).join(' | '));
const nav=fs.readFileSync('packages/core/src/components/navigation-extended.css','utf8');
const leftDecl=(nav.match(/\bleft\s*:/g)||[]).length;
check('Only documented physical left anchor is glide geometry',leftDecl===1 && /Glide navigation/.test(nav),`left declarations=${leftDecl}`);

const report={version,generatedAt:new Date().toISOString(),summary:{passed:checks.filter(x=>x.pass).length,total:checks.length,failed:failures.length},manualGate:['Screen-reader reading order in Arabic/Hebrew','Native control rendering under RTL in Safari/iOS and Chrome/Android','Locale-formatted dates/numbers supplied by applications','Font fallback quality for Arabic, Hebrew and CJK','Directional icon review for application-provided icon sets'],failures,checks};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync(`reports/i18n-audit-${version}.json`,JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(`reports/i18n-audit-${version}.md`,`# Reeris UI ${version} — RTL & Internationalization Audit\n\nStatic audit: **${report.summary.passed}/${report.summary.total} passed**.\n\n## Coverage\nArabic and Hebrew RTL, German expansion, CJK, bidi isolation, semantic date/number fixtures, logical spacing, safe-area direction mapping and directional tree disclosure.\n\n## Manual release gate\n${report.manualGate.map(x=>`- ${x}`).join('\n')}\n`);
console.log(`RTL/i18n audit: ${report.summary.passed}/${report.summary.total} checks passed.`);
if(failures.length){for(const f of failures)console.error(`FAIL: ${f.name}${f.detail?` — ${f.detail}`:''}`);process.exitCode=1;}
