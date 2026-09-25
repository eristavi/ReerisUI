import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const coreSrc = path.join(root, 'packages/core/src');
const docsDir = path.join(root, 'docs');
const reportsDir = path.join(root, 'reports');
fs.mkdirSync(reportsDir, { recursive: true });

const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p); else files.push(p);
  }
}
walk(coreSrc);
const css = files.filter(f => f.endsWith('.css')).map(f => fs.readFileSync(f, 'utf8')).join('\n');
const generated = fs.readFileSync(path.join(coreSrc, 'tokens/generated.css'), 'utf8');
const theme = fs.readFileSync(path.join(coreSrc, 'core/theme.css'), 'utf8');
const buttonCss = fs.readFileSync(path.join(coreSrc, 'components/button.css'), 'utf8');
const surfacesCss = fs.readFileSync(path.join(coreSrc, 'components/surfaces.css'), 'utf8');
const toolbarCss = fs.readFileSync(path.join(coreSrc, 'components/toolbar-filters.css'), 'utf8');
const choiceCss = fs.readFileSync(path.join(coreSrc, 'components/choice.css'), 'utf8');
const navCss = fs.readFileSync(path.join(coreSrc, 'components/navigation.css'), 'utf8');
const advNavCss = fs.readFileSync(path.join(coreSrc, 'components/advanced-navigation.css'), 'utf8');
const overlaysCss = fs.readFileSync(path.join(coreSrc, 'components/overlays.css'), 'utf8');

const checks = [];
const add = (id, pass, detail, category='static') => checks.push({ id, category, pass: !!pass, detail });

// Foundation/accessibility infrastructure.
add('focus-visible-global', /:focus-visible\s*\{[^}]*outline:/s.test(css), 'Global :focus-visible outline exists.');
add('focus-token-width', /--reeris-focus-width:\s*2px/.test(theme), 'Focus ring width is 2px.');
add('forced-colors', /@media\s*\(forced-colors:\s*active\)/.test(css), 'Forced-colors handling is present.');
add('prefers-contrast', /@media\s*\(prefers-contrast:\s*more\)/.test(css), 'Explicit prefers-contrast: more handling is present.');
add('reduced-motion', /@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(css), 'Reduced-motion handling is present.');
add('reduced-transparency', /@media\s*\(prefers-reduced-transparency:\s*reduce\)/.test(css), 'Reduced-transparency fallbacks are present.');
add('screen-reader-utility', /\.sr-only/.test(css) && /\.sr-only-focusable/.test(css), 'Screen-reader-only utilities are present.');
add('no-outline-removal', !/(?:outline\s*:\s*(?:0|none))/.test(css), 'No outline: 0/none declarations found in Core CSS.');
add('logical-properties', /inset-inline|margin-inline|padding-inline|border-inline|inline-size/.test(css), 'Logical properties are used throughout Core.');
add('target-token', /--reeris-target-min:\s*1\.5rem/.test(generated), '24px minimum-target token exists.');
add('xs-control-target', /--reeris-control-xs:\s*1\.75rem/.test(generated), 'Smallest standard control is 28px, above WCAG 2.2 AA 24px target minimum.');
add('chip-remove-target', /\.chip-remove\)[^{]*\{[^}]*inline-size:var\(--reeris-target-min\)[^}]*block-size:var\(--reeris-target-min\)/s.test(surfacesCss), 'Chip remove action uses minimum target token.');
add('filter-remove-target', /\.filter-chip-remove\)[^{]*\{[^}]*inline-size:var\(--reeris-target-min\)[^}]*block-size:var\(--reeris-target-min\)/s.test(toolbarCss), 'Filter remove action uses minimum target token.');
add('rating-target', /button\.rating-star\)[^{]*\{[^}]*min-inline-size:\s*var\(--reeris-target-min\)[^}]*min-block-size:\s*var\(--reeris-target-min\)/s.test(choiceCss), 'Interactive rating stars use minimum target token.');
add('button-loading-reduced-motion', /prefers-reduced-motion:[^)]+\)[\s\S]*?btn\[data-reeris-state="loading"\][\s\S]*?animation:\s*none/.test(buttonCss), 'Button loading indicator stops motion when reduced motion is requested.');
add('aria-disabled-pointer-consistency', !/\[aria-disabled="true"\][^}]*pointer-events\s*:\s*none/s.test(navCss + advNavCss + overlaysCss), 'ARIA-disabled navigation/menu items are not pointer-disabled in CSS; application logic must suppress activation consistently for keyboard and pointer.');

// Token parsing and contrast checks.
const decls = new Map();
for (const source of [generated, theme]) {
  const re = /(--reeris-[\w-]+)\s*:\s*([^;]+);/g;
  let m; while ((m = re.exec(source))) if (!decls.has(m[1])) decls.set(m[1], m[2].trim());
}
function splitTopLevel(s) {
  let depth=0, start=0; const out=[];
  for (let i=0;i<s.length;i++) {
    if (s[i]==='(') depth++; else if (s[i]===')') depth--; else if (s[i]===',' && depth===0) { out.push(s.slice(start,i).trim()); start=i+1; }
  }
  out.push(s.slice(start).trim()); return out;
}
function resolve(value, scheme, seen=new Set()) {
  value=value.trim();
  if (value==='white') return {kind:'rgb', value:[1,1,1]};
  if (value==='black') return {kind:'rgb', value:[0,0,0]};
  let m=value.match(/^var\((--reeris-[\w-]+)\)$/);
  if (m) {
    if (seen.has(m[1])) throw new Error(`Circular token ${m[1]}`);
    const next=new Set(seen); next.add(m[1]);
    return resolve(decls.get(m[1]) ?? '', scheme, next);
  }
  m=value.match(/^light-dark\((.*)\)$/);
  if (m) { const parts=splitTopLevel(m[1]); return resolve(parts[scheme==='light'?0:1], scheme, seen); }
  m=value.match(/^oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)$/);
  if (m) return {kind:'oklch', value:[+m[1],+m[2],+m[3]]};
  return null;
}
function oklchToLinear([Lp,C,hDeg]) {
  const L=Lp/100, h=hDeg*Math.PI/180;
  const a=C*Math.cos(h), b=C*Math.sin(h);
  const l_=L+0.3963377774*a+0.2158037573*b;
  const m_=L-0.1055613458*a-0.0638541728*b;
  const s_=L-0.0894841775*a-1.291485548*b;
  const l=l_**3, mm=m_**3, s=s_**3;
  const rgb=[4.0767416621*l-3.3077115913*mm+0.2309699292*s,-1.2684380046*l+2.6097574011*mm-0.3413193965*s,-0.0041960863*l-0.7034186147*mm+1.707614701*s];
  return rgb.map(v=>Math.max(0,Math.min(1,v)));
}
function rgbOf(res) { return res.kind==='rgb' ? res.value : oklchToLinear(res.value); }
function lum(rgb) { return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]; }
function ratio(a,b) { const [hi,lo]=[lum(a),lum(b)].sort((x,y)=>y-x); return (hi+.05)/(lo+.05); }
function tokenContrast(fg,bg,scheme) {
  const F=resolve(decls.get(fg),scheme), B=resolve(decls.get(bg),scheme);
  if (!F || !B) return null;
  return ratio(rgbOf(F),rgbOf(B));
}
const textPairs = [
  ['text-canvas','--reeris-color-text','--reeris-color-canvas'],
  ['muted-canvas','--reeris-color-text-muted','--reeris-color-canvas'],
  ['text-surface','--reeris-color-text','--reeris-color-surface'],
  ['muted-surface','--reeris-color-text-muted','--reeris-color-surface'],
  ['primary','--reeris-color-on-primary','--reeris-color-primary'],
  ['accent','--reeris-color-on-accent','--reeris-color-accent'],
  ['success','--reeris-color-on-success','--reeris-color-success'],
  ['warning','--reeris-color-on-warning','--reeris-color-warning'],
  ['danger','--reeris-color-on-danger','--reeris-color-danger'],
  ['info','--reeris-color-on-info','--reeris-color-info'],
];
const contrastResults=[];
for (const [name,fg,bg] of textPairs) for (const scheme of ['light','dark']) {
  const r=tokenContrast(fg,bg,scheme); contrastResults.push({name,scheme,ratio:r});
  add(`contrast-${name}-${scheme}`, r!==null && r>=4.5, `${name} ${scheme}: ${r?.toFixed(2) ?? 'unresolved'}:1 (required ≥ 4.5:1).`, 'contrast');
}
for (const scheme of ['light','dark']) {
  const r=tokenContrast('--reeris-focus-color','--reeris-color-canvas',scheme);
  add(`focus-contrast-${scheme}`, r!==null && r>=3, `Focus color vs canvas ${scheme}: ${r?.toFixed(2) ?? 'unresolved'}:1 (non-text indicator target ≥ 3:1).`, 'contrast');
}

// Gradient endpoint contrast: official gradient buttons use the corresponding on-* token.
function gradientStops(token, scheme) {
  const raw=decls.get(token) ?? '';
  const vars=[];
  // Resolve light-dark() stop expressions when present.
  const body=raw.replace(/^linear-gradient\([^,]+,\s*/,'').replace(/\)\s*$/,'');
  for (const part of splitTopLevel(body)) {
    const r=resolve(part,scheme); if (r) vars.push(r);
  }
  return vars;
}
const gradientPairs=[
  ['primary','--reeris-gradient-primary','--reeris-color-on-primary'],
  ['accent','--reeris-gradient-accent','--reeris-color-on-accent'],
  ['success','--reeris-gradient-success','--reeris-color-on-success'],
  ['warning','--reeris-gradient-warning','--reeris-color-on-warning'],
  ['danger','--reeris-gradient-danger','--reeris-color-on-danger'],
];
for (const [name,g,fgToken] of gradientPairs) for (const scheme of ['light','dark']) {
  const fg=resolve(decls.get(fgToken),scheme); const stops=gradientStops(g,scheme);
  const rs=stops.map(s=>ratio(rgbOf(fg),rgbOf(s)));
  const min=rs.length?Math.min(...rs):0;
  add(`gradient-contrast-${name}-${scheme}`, rs.length>=2 && min>=4.5, `${name} gradient ${scheme}: endpoint minimum ${min.toFixed(2)}:1 (required ≥ 4.5:1).`, 'contrast');
}

// Conservative docs checks: examples should model accessible names.
const htmlFiles = fs.readdirSync(docsDir).filter(n=>n.endsWith('.html'));
const docIssues=[];
function attrsMap(raw) {
  const out={}; const re=/([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g; let m;
  while ((m=re.exec(raw))) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  return out;
}
function stripTags(s) { return s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim(); }
for (const name of htmlFiles) {
  const html=fs.readFileSync(path.join(docsDir,name),'utf8');
  const htmlTag=html.match(/<html\b([^>]*)>/i); if (!htmlTag || !/\blang\s*=/.test(htmlTag[1])) docIssues.push({file:name,type:'missing-lang'});
  for (const m of html.matchAll(/<img\b([^>]*)>/gi)) if (!/\balt\s*=/.test(m[1])) docIssues.push({file:name,type:'image-missing-alt',snippet:m[0]});
  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const a=attrsMap(m[1]), text=stripTags(m[2]); if (!text && !a['aria-label'] && !a['aria-labelledby']) docIssues.push({file:name,type:'button-missing-name',snippet:m[0].slice(0,180)});
  }
  for (const m of html.matchAll(/<dialog\b([^>]*)>/gi)) { const a=attrsMap(m[1]); if (!a['aria-label'] && !a['aria-labelledby']) docIssues.push({file:name,type:'dialog-missing-name',snippet:m[0]}); }
  const labelBlocks=[...html.matchAll(/<label\b([^>]*)>([\s\S]*?)<\/label>/gi)].map(m=>m[0]);
  const explicitFors=new Set([...html.matchAll(/<label\b[^>]*\bfor\s*=\s*["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]));
  for (const m of html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
    const tag=m[1].toLowerCase(), a=attrsMap(m[2]);
    if (tag==='input' && (a.type||'text').toLowerCase()==='hidden') continue;
    let named=!!(a['aria-label']||a['aria-labelledby']||(a.id && explicitFors.has(a.id)));
    if (!named) named=labelBlocks.some(block=>block.includes(m[0]));
    if (!named) docIssues.push({file:name,type:`${tag}-missing-label`,snippet:m[0].slice(0,180)});
  }
}
add('docs-accessible-names', docIssues.length===0, `${htmlFiles.length} HTML demos checked; ${docIssues.length} accessible-name issues found.`, 'docs');

// JS/CSP-adjacent safety relevant to accessible enhancement robustness.
let js='';
const jsSrc=path.join(root,'packages/js/src'); if (fs.existsSync(jsSrc)) for (const n of fs.readdirSync(jsSrc)) if (n.endsWith('.js')) js += fs.readFileSync(path.join(jsSrc,n),'utf8')+'\n';
add('js-no-eval', !/\beval\s*\(|new\s+Function\s*\(/.test(js), 'No eval/new Function in optional JS.', 'js');
add('js-no-innerhtml', !/(?:innerHTML|outerHTML)\s*=/.test(js), 'Optional JS does not inject HTML with innerHTML/outerHTML.', 'js');

const failed=checks.filter(c=>!c.pass);
const report={
  version,
  generatedAt:new Date().toISOString(),
  scope:'Static accessibility acceptance audit for Reeris Core and documentation examples',
  note:'Passing this audit does not by itself establish full WCAG 2.2 AA conformance. Manual/browser checks remain required for keyboard behavior, screen readers, zoom/reflow, touch behavior, native-control rendering, and visual regression.',
  summary:{total:checks.length,passed:checks.length-failed.length,failed:failed.length,docsChecked:htmlFiles.length},
  contrastResults,
  docIssues,
  checks
};
fs.writeFileSync(path.join(reportsDir,`accessibility-audit-${version}.json`),JSON.stringify(report,null,2)+'\n');
console.log(`Accessibility audit ${version}: ${report.summary.passed}/${report.summary.total} static checks passed; ${failed.length} failed.`);
if (failed.length) { for (const f of failed) console.error(`FAIL ${f.id}: ${f.detail}`); process.exitCode=1; }
