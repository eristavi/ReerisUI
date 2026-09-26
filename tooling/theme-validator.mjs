import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const semanticPairs = [
  ['primary','on-primary'], ['accent','on-accent'], ['success','on-success'],
  ['warning','on-warning'], ['danger','on-danger'], ['info','on-info'],
  ['surface','on-surface'], ['surface-muted','on-surface-muted'], ['canvas','text']
];
const gradientPairs = [
  ['primary','on-primary'], ['accent','on-accent'], ['success','on-success'],
  ['warning','on-warning'], ['danger','on-danger']
];

function blocks(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const selector = m[1].trim();
    if (selector.startsWith('@')) continue;
    const declarations = {};
    for (const part of m[2].split(';')) {
      const i = part.indexOf(':');
      if (i < 0) continue;
      const key = part.slice(0,i).trim();
      const value = part.slice(i+1).trim();
      if (key && value) declarations[key] = value;
    }
    out.push({ selector, declarations });
  }
  return out;
}

function allCustomProperties(css) {
  const vars = {};
  // Only inherited root defaults belong in the baseline; conditional theme and
  // preference declarations must not overwrite values used for other schemes.
  for (const block of css.matchAll(/(?:^|[{}\s]):root\s*\{([^{}]*)\}/g)) {
    for (const m of block[1].matchAll(/(--reeris-[\w-]+)\s*:\s*([^;{}]+);/g)) vars[m[1]] = m[2].trim();
  }
  return vars;
}

function splitTopLevel(input, delimiter=',') {
  const out=[]; let depth=0, start=0;
  for (let i=0;i<input.length;i++) {
    const ch=input[i];
    if (ch==='(') depth++;
    else if (ch===')') depth--;
    else if (ch===delimiter && depth===0) { out.push(input.slice(start,i).trim()); start=i+1; }
  }
  out.push(input.slice(start).trim());
  return out;
}

function resolveValue(value, vars, scheme, stack=[]) {
  let v=value.trim();
  const ld = v.match(/^light-dark\((.*)\)$/s);
  if (ld) {
    const parts=splitTopLevel(ld[1]);
    return resolveValue(parts[scheme==='dark'?1:0], vars, scheme, stack);
  }
  const wholeVar=v.match(/^var\((--reeris-[\w-]+)(?:,\s*(.*))?\)$/s);
  if (wholeVar) {
    const name=wholeVar[1];
    if (stack.includes(name)) throw new Error(`Circular token reference: ${[...stack,name].join(' -> ')}`);
    const next=vars[name] ?? wholeVar[2];
    if (!next) throw new Error(`Unresolved token ${name}`);
    return resolveValue(next, vars, scheme, [...stack,name]);
  }
  v=v.replace(/var\((--reeris-[\w-]+)(?:,\s*([^()]+))?\)/g, (_,name,fallback) => {
    const next=vars[name] ?? fallback;
    if (!next) throw new Error(`Unresolved token ${name}`);
    return resolveValue(next, vars, scheme, [...stack,name]);
  });
  const nestedLd = v.match(/^light-dark\((.*)\)$/s);
  if (nestedLd) return resolveValue(splitTopLevel(nestedLd[1])[scheme==='dark'?1:0], vars, scheme, stack);
  return v.trim();
}

function parseColor(value) {
  const v=value.trim().toLowerCase();
  if (v==='white') return [1,1,1];
  if (v==='black') return [0,0,0];
  const hex=v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) { const h=hex[1].length===3 ? [...hex[1]].map(x=>x+x).join('') : hex[1]; return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(srgbToLinear); }
  const rgbMatch=v.match(/^rgb\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+%?)?\s*\)$/i);
  if (rgbMatch) return [Number(rgbMatch[1]),Number(rgbMatch[2]),Number(rgbMatch[3])].map(x=>Math.min(255,x)/255).map(srgbToLinear);
  const m=v.match(/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*\)$/i);
  if (!m) throw new Error(`Unsupported color syntax: ${value}`);
  const L=Number(m[1])/100, C=Number(m[2]), h=Number(m[3])*Math.PI/180;
  const a=C*Math.cos(h), b=C*Math.sin(h);
  const l_=L+0.3963377774*a+0.2158037573*b;
  const m_=L-0.1055613458*a-0.0638541728*b;
  const s_=L-0.0894841775*a-1.291485548*b;
  const l=l_**3, mm=m_**3, s=s_**3;
  const rgb=[
    4.0767416621*l-3.3077115913*mm+0.2309699292*s,
    -1.2684380046*l+2.6097574011*mm-0.3413193965*s,
    -0.0041960863*l-0.7034186147*mm+1.707614701*s
  ];
  return rgb.map(x=>Math.min(1,Math.max(0,x)));
}
function srgbToLinear(c){ return c<=0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4; }
function luminance(rgb){ return 0.2126*rgb[0]+0.7152*rgb[1]+0.0722*rgb[2]; }
function contrast(a,b){ const [hi,lo]=[luminance(a),luminance(b)].sort((x,y)=>y-x); return (hi+.05)/(lo+.05); }

function gradientColors(value, vars, scheme) {
  const resolved = resolveValue(value, vars, scheme);
  const m=resolved.match(/^(?:linear|radial|conic)-gradient\((.*)\)$/s);
  if (!m) throw new Error(`Unsupported gradient syntax: ${resolved}`);
  const args=splitTopLevel(m[1]);
  const first=args[0]?.trim() || '';
  const firstIsColor=/^(?:var\(|light-dark\(|oklch\(|rgb\(|#|white$|black$)/i.test(first);
  const colorArgs=firstIsColor ? args : args.slice(1);
  const colors=[];
  for (const arg of colorArgs) {
    let candidate=arg.trim();
    // remove a trailing percentage/length stop without touching functional color syntax
    candidate=candidate.replace(/\s+(?:[\d.]+%|[\d.]+(?:px|rem|em))\s*$/,'');
    candidate=resolveValue(candidate, vars, scheme);
    colors.push(candidate);
  }
  return colors;
}

function ratioFor(bgToken, fgToken, vars, scheme) {
  const bg=resolveValue(vars[`--reeris-color-${bgToken}`],vars,scheme);
  const fg=resolveValue(vars[`--reeris-color-${fgToken}`],vars,scheme);
  return {ratio:contrast(parseColor(bg),parseColor(fg)),bg,fg};
}

export async function validateThemeFile(path, { baseCss='', minContrast=4.5 }={}) {
  const css=await readFile(path,'utf8');
  const baseVars=allCustomProperties(baseCss);
  const themeBlocks=blocks(css).filter(b=>/\[data-theme=/.test(b.selector));
  const results=[];
  for (const block of themeBlocks) {
    const own=Object.fromEntries(Object.entries(block.declarations).filter(([k])=>k.startsWith('--reeris-')));
    const vars={...baseVars,...own};
    const declaredScheme=block.declarations['color-scheme'];
    const schemes=declaredScheme==='dark'?['dark']:declaredScheme==='light'?['light']:['light','dark'];
    for (const scheme of schemes) {
      for (const [bg,fg] of semanticPairs) {
        if (!vars[`--reeris-color-${bg}`] || !vars[`--reeris-color-${fg}`]) continue;
        const info=ratioFor(bg,fg,vars,scheme);
        results.push({type:'pair',selector:block.selector,scheme,name:`${bg}/${fg}`,...info,pass:info.ratio>=minContrast});
      }
      for (const [gradient,fg] of gradientPairs) {
        const g=vars[`--reeris-gradient-${gradient}`], f=vars[`--reeris-color-${fg}`];
        if (!g || !f) continue;
        const fgColor=parseColor(resolveValue(f,vars,scheme));
        const stops=gradientColors(g,vars,scheme);
        const ratios=stops.map(stop=>contrast(parseColor(stop),fgColor));
        results.push({type:'gradient',selector:block.selector,scheme,name:`gradient-${gradient}/${fg}`,ratio:Math.min(...ratios),stops,pass:ratios.every(r=>r>=minContrast)});
      }
    }
  }
  return { path, blocks: themeBlocks.length, results, pass: results.every(r=>r.pass) };
}

export async function validateOfficialTheme({ root=new URL('../', import.meta.url) }={}) {
  const generated=await readFile(new URL('packages/core/src/tokens/generated.css',root),'utf8');
  const theme=await readFile(new URL('packages/core/src/core/theme.css',root),'utf8');
  const vars={...allCustomProperties(generated),...allCustomProperties(theme)};
  const results=[];
  for (const scheme of ['light','dark']) {
    for (const [bg,fg] of semanticPairs) {
      const info=ratioFor(bg,fg,vars,scheme);
      results.push({type:'pair',scheme,name:`${bg}/${fg}`,...info,pass:info.ratio>=4.5});
    }
    for (const [gradient,fg] of gradientPairs) {
      const stops=gradientColors(vars[`--reeris-gradient-${gradient}`],vars,scheme);
      const fgColor=parseColor(resolveValue(vars[`--reeris-color-${fg}`],vars,scheme));
      const ratios=stops.map(stop=>contrast(parseColor(stop),fgColor));
      results.push({type:'gradient',scheme,name:`gradient-${gradient}/${fg}`,ratio:Math.min(...ratios),stops,pass:ratios.every(r=>r>=4.5)});
    }
  }
  return {results,pass:results.every(r=>r.pass),vars};
}

async function cli(){
  const file=process.argv[2];
  if(!file){ console.error('Usage: node tooling/theme-validator.mjs <theme.css>'); process.exit(2); }
  const generated=await readFile(new URL('../packages/core/src/tokens/generated.css',import.meta.url),'utf8');
  const theme=await readFile(new URL('../packages/core/src/core/theme.css',import.meta.url),'utf8');
  const report=await validateThemeFile(file,{baseCss:`${generated}\n${theme}`});
  for(const r of report.results) console.log(`${r.pass?'PASS':'FAIL'} ${r.selector} ${r.scheme} ${r.name}: ${r.ratio.toFixed(2)}:1`);
  if(!report.pass) process.exit(1);
}
if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) await cli();
