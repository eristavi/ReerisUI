import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const srcRoot = path.join(root, 'packages/core/src');
const distRoot = path.join(root, 'packages/core/dist');
const reportsDir = path.join(root, 'reports');
fs.mkdirSync(reportsDir, { recursive: true });

const budgets = JSON.parse(fs.readFileSync(path.join(root, 'tooling/performance-budgets.json'), 'utf8'));

function walk(dir, ext = '') {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) out.push(...walk(p, ext));
    else if (!ext || p.endsWith(ext)) out.push(p);
  }
  return out;
}

function stripComments(input) {
  let out = '';
  let quote = null;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      out += ch;
      if (ch === '\\' && i + 1 < input.length) out += input[++i];
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; out += ch; continue; }
    if (ch === '/' && input[i + 1] === '*') {
      const end = input.indexOf('*/', i + 2);
      if (end === -1) break;
      i = end + 1;
      continue;
    }
    out += ch;
  }
  return out;
}

function findMatchingBrace(input, openIndex) {
  let depth = 1;
  let quote = null;
  for (let i = openIndex + 1; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return i;
  }
  return -1;
}

function parseRules(input, context = [], out = []) {
  input = stripComments(input);
  let start = 0;
  let quote = null;
  let paren = 0;
  let bracket = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '(') paren++;
    else if (ch === ')') paren = Math.max(0, paren - 1);
    else if (ch === '[') bracket++;
    else if (ch === ']') bracket = Math.max(0, bracket - 1);
    else if (ch === ';' && paren === 0 && bracket === 0) start = i + 1;
    else if (ch === '{' && paren === 0 && bracket === 0) {
      const header = input.slice(start, i).trim();
      const close = findMatchingBrace(input, i);
      if (close === -1) break;
      const body = input.slice(i + 1, close);
      if (header.startsWith('@')) {
        const m = header.match(/^@([\w-]+)\s*(.*)$/s);
        const name = m?.[1] || '';
        const prelude = (m?.[2] || '').trim();
        if (!/keyframes$/i.test(name) && !['font-face', 'property', 'page'].includes(name)) {
          parseRules(body, [...context, `${name}:${prelude}`], out);
        }
      } else if (header) {
        out.push({ selector: header, body: body.trim(), context: [...context] });
      }
      i = close;
      start = close + 1;
    }
  }
  return out;
}

function splitSelectorList(selector) {
  const out = [];
  let start = 0;
  let quote = null;
  let paren = 0;
  let bracket = 0;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '(') paren++;
    else if (ch === ')') paren = Math.max(0, paren - 1);
    else if (ch === '[') bracket++;
    else if (ch === ']') bracket = Math.max(0, bracket - 1);
    else if (ch === ',' && paren === 0 && bracket === 0) {
      out.push(selector.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(selector.slice(start).trim());
  return out.filter(Boolean);
}

function removeZeroSpecificityWhere(selector) {
  let out = '';
  for (let i = 0; i < selector.length; i++) {
    if (selector.startsWith(':where(', i)) {
      let depth = 1;
      i += 6;
      let quote = null;
      for (; i + 1 < selector.length; i++) {
        const ch = selector[i + 1];
        if (quote) {
          if (ch === '\\') i++;
          else if (ch === quote) quote = null;
          continue;
        }
        if (ch === '"' || ch === "'") { quote = ch; continue; }
        if (ch === '(') depth++;
        else if (ch === ')' && --depth === 0) { i++; break; }
      }
      continue;
    }
    out += selector[i];
  }
  return out;
}

function specificity(selector) {
  let s = removeZeroSpecificityWhere(selector);
  const a = (s.match(/#[\w-]+/g) || []).length;
  s = s.replace(/#[\w-]+/g, ' ');
  const attrs = (s.match(/\[[^\]]+\]/g) || []).length;
  s = s.replace(/\[[^\]]+\]/g, ' ');
  const classes = (s.match(/\.[_a-zA-Z][\w-]*/g) || []).length;
  s = s.replace(/\.[_a-zA-Z][\w-]*/g, ' ');
  const pseudoElements = (s.match(/::[_a-zA-Z][\w-]*/g) || []).length;
  s = s.replace(/::[_a-zA-Z][\w-]*/g, ' ');
  const pseudoClasses = (s.match(/:(?!:)[_a-zA-Z][\w-]*(?:\([^)]*\))?/g) || []).length;
  s = s.replace(/:(?!:)[_a-zA-Z][\w-]*(?:\([^)]*\))?/g, ' ');
  const elements = (s.match(/(^|[>+~\s,(])([a-zA-Z][\w-]*|\*)/g) || [])
    .map(x => x.trim()).filter(x => x && x !== '*').length;
  return [a, attrs + classes + pseudoClasses, elements + pseudoElements];
}

function compareSpecificity(a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

function normalizeWhitespace(s) { return s.replace(/\s+/g, ' ').trim(); }
function compressSizes(buf) {
  return {
    raw: buf.length,
    gzip: zlib.gzipSync(buf, { level: 9 }).length,
    brotli: zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length,
  };
}

const fullPath = path.join(distRoot, 'reeris.css');
const minPath = path.join(distRoot, 'reeris.min.css');
if (!fs.existsSync(fullPath) || !fs.existsSync(minPath)) {
  console.error('Run npm run build before audit:css.');
  process.exit(1);
}
const fullCss = fs.readFileSync(fullPath, 'utf8');
const minCss = fs.readFileSync(minPath, 'utf8');
const rules = parseRules(fullCss);
const selectorItems = rules.flatMap(r => splitSelectorList(r.selector).map(selector => ({ selector, context: r.context, specificity: specificity(selector) })));
const maxSpecificityItem = selectorItems.reduce((max, item) => compareSpecificity(item.specificity, max.specificity) > 0 ? item : max, { specificity: [0,0,0], selector: '' });
const maxSelectorItem = selectorItems.reduce((max, item) => item.selector.length > max.selector.length ? item : max, { selector: '' });
const idSelectorCount = selectorItems.filter(x => x.specificity[0] > 0).length;
const unlayered = rules.filter(r => !r.context.some(c => c.startsWith('layer:')));
const exactCounts = new Map();
for (const r of rules) {
  const signature = `${r.context.join('|')}@@${normalizeWhitespace(r.selector)}@@${normalizeWhitespace(r.body)}`;
  exactCounts.set(signature, (exactCounts.get(signature) || 0) + 1);
}
const exactDuplicateRules = [...exactCounts.values()].filter(n => n > 1).length;

const repeatBodies = new Map();
for (const r of rules) {
  const body = normalizeWhitespace(r.body);
  if (body.length < 40 || (body.match(/;/g) || []).length < 2) continue;
  if (!repeatBodies.has(body)) repeatBodies.set(body, []);
  repeatBodies.get(body).push(r.selector);
}
const repeatedDeclarationBlocks = [...repeatBodies.entries()]
  .filter(([, selectors]) => selectors.length > 1)
  .map(([body, selectors]) => ({ occurrences: selectors.length, bytes: Buffer.byteLength(body), selectors: selectors.slice(0, 6) }))
  .sort((a, b) => (b.occurrences * b.bytes) - (a.occurrences * a.bytes));

const sourceFiles = walk(srcRoot, '.css').filter(f => path.basename(f) !== 'reeris.css');
const moduleSizes = sourceFiles.map(f => ({ file: path.relative(srcRoot, f).replaceAll(path.sep, '/'), bytes: fs.statSync(f).size })).sort((a,b) => b.bytes - a.bytes);
const largestModule = moduleSizes[0];

const entry = fs.readFileSync(path.join(srcRoot, 'reeris.css'), 'utf8');
const imports = [...entry.matchAll(/@import\s+["'](.+?)["'];/g)].map(m => m[1].replace(/^\.\//, ''));
const sourceModules = sourceFiles.map(f => path.relative(srcRoot, f).replaceAll(path.sep, '/'));
const orphanModules = sourceModules.filter(f => !imports.includes(f));
const missingImports = imports.filter(f => !sourceModules.includes(f));

const modularDirs = ['components', 'forms', 'layout', 'utilities', 'core'];
const modularMismatches = [];
for (const dir of modularDirs) {
  for (const file of walk(path.join(srcRoot, dir), '.css')) {
    const rel = path.relative(srcRoot, file);
    const out = path.join(distRoot, rel);
    if (!fs.existsSync(out)) modularMismatches.push({ file: rel, issue: 'missing-dist-copy' });
    else if (!fs.readFileSync(file).equals(fs.readFileSync(out))) modularMismatches.push({ file: rel, issue: 'dist-copy-differs' });
  }
}

const importantUses = sourceFiles.flatMap(file => {
  const rel = path.relative(srcRoot, file).replaceAll(path.sep, '/');
  return fs.readFileSync(file, 'utf8').split('\n').map((line, i) => ({ file: rel, line: i + 1, text: line.trim() })).filter(x => x.text.includes('!important'));
});
const disallowedImportant = importantUses.filter(x => !(x.file === 'utilities/accessibility.css' || (x.file === 'components/commerce.css' && /@media\s+print|receipt|invoice|no-print/.test(fs.readFileSync(path.join(srcRoot, x.file), 'utf8')))));

const physicalDirectionUses = sourceFiles.flatMap(file => {
  const rel = path.relative(srcRoot, file).replaceAll(path.sep, '/');
  return fs.readFileSync(file, 'utf8').split('\n').map((line, i) => ({ file: rel, line: i + 1, text: line.trim() }))
    .filter(x => !x.text.startsWith('--') && /\b(?:margin-left|margin-right|padding-left|padding-right|border-left|border-right|left|right)\s*:/.test(x.text));
});
const physicalDirectionExceptions = physicalDirectionUses.filter(x => x.file === 'components/navigation-extended.css' && /left\s*:\s*0/.test(x.text));

const fullSizes = compressSizes(Buffer.from(fullCss));
const minSizes = compressSizes(Buffer.from(minCss));
const jsFiles = walk(path.join(root, 'packages/js/dist'), '.js');
const jsBundle = Buffer.concat(jsFiles.map(f => fs.readFileSync(f)));
const jsSizes = compressSizes(jsBundle);

const checks = [];
const add = (id, pass, detail, category) => checks.push({ id, category, pass: !!pass, detail });
add('all-qualified-rules-layered', unlayered.length <= budgets.maxUnlayeredQualifiedRules, `${unlayered.length} qualified rules are outside Reeris cascade layers.`, 'cascade');
add('specificity-budget', compareSpecificity(maxSpecificityItem.specificity, budgets.maxSpecificity) <= 0, `Maximum approximate specificity is ${maxSpecificityItem.specificity.join(',')} (${maxSpecificityItem.selector}).`, 'specificity');
add('no-id-selectors', idSelectorCount <= budgets.maxIdSelectors, `${idSelectorCount} selectors contain an ID contribution.`, 'specificity');
add('selector-length-budget', maxSelectorItem.selector.length <= budgets.maxSelectorLength, `Longest individual selector is ${maxSelectorItem.selector.length} characters.`, 'specificity');
add('no-exact-duplicate-rules', exactDuplicateRules <= budgets.maxExactDuplicateRules, `${exactDuplicateRules} exact duplicate rule signatures found.`, 'duplication');
add('important-allowlist', disallowedImportant.length === 0, `${importantUses.length} !important declarations found; ${disallowedImportant.length} fall outside the accessibility/print allowlist.`, 'cascade');
add('logical-property-policy', physicalDirectionUses.length === physicalDirectionExceptions.length, `${physicalDirectionUses.length} physical direction declarations found; ${physicalDirectionExceptions.length} are the documented glide-geometry exception.`, 'rtl');
add('entry-import-completeness', orphanModules.length === 0 && missingImports.length === 0, `${orphanModules.length} orphan source modules; ${missingImports.length} missing import targets.`, 'modules');
add('modular-dist-consistency', modularMismatches.length === 0, `${modularMismatches.length} modular dist copies differ from source.`, 'modules');
add('full-raw-budget', fullSizes.raw <= budgets.fullRawBytes, `reeris.css raw ${fullSizes.raw} / ${budgets.fullRawBytes} bytes.`, 'size');
add('min-raw-budget', minSizes.raw <= budgets.minRawBytes, `reeris.min.css raw ${minSizes.raw} / ${budgets.minRawBytes} bytes.`, 'size');
add('min-gzip-budget', minSizes.gzip <= budgets.minGzipBytes, `reeris.min.css gzip ${minSizes.gzip} / ${budgets.minGzipBytes} bytes.`, 'size');
add('min-brotli-budget', minSizes.brotli <= budgets.minBrotliBytes, `reeris.min.css brotli ${minSizes.brotli} / ${budgets.minBrotliBytes} bytes.`, 'size');
add('module-size-budget', largestModule.bytes <= budgets.largestModuleBytes, `Largest CSS source module is ${largestModule.file} at ${largestModule.bytes} / ${budgets.largestModuleBytes} bytes.`, 'size');

const failed = checks.filter(x => !x.pass);
const report = {
  version,
  generatedAt: new Date().toISOString(),
  scope: 'Feature-frozen Reeris Core CSS architecture, cascade, selector, duplication, modularity and bundle-size audit',
  budgets,
  summary: {
    total: checks.length,
    passed: checks.length - failed.length,
    failed: failed.length,
    qualifiedRules: rules.length,
    individualSelectors: selectorItems.length,
    sourceCssModules: sourceModules.length,
  },
  bundle: { full: fullSizes, minified: minSizes, optionalJsAllModules: jsSizes },
  architecture: {
    maxSpecificity: maxSpecificityItem,
    longestSelector: { length: maxSelectorItem.selector.length, selector: maxSelectorItem.selector },
    unlayeredQualifiedRules: unlayered.slice(0, 20),
    idSelectorCount,
    exactDuplicateRules,
    importantUses,
    disallowedImportant,
    physicalDirectionUses,
    physicalDirectionExceptions,
  },
  duplication: {
    note: 'Repeated declaration blocks are informational because semantic components may intentionally share declarations. Exact duplicate rules are a release-gating error.',
    repeatedDeclarationBlocks: repeatedDeclarationBlocks.slice(0, 15),
  },
  modules: { largest: moduleSizes.slice(0, 15), orphanModules, missingImports, modularMismatches },
  checks,
};

fs.writeFileSync(path.join(reportsDir, `css-architecture-audit-${version}.json`), JSON.stringify(report, null, 2) + '\n');
console.log(`CSS architecture audit ${version}: ${report.summary.passed}/${report.summary.total} checks passed; ${failed.length} failed.`);
console.log(`Bundle: ${minSizes.raw} B min / ${minSizes.gzip} B gzip / ${minSizes.brotli} B brotli. Max specificity ${maxSpecificityItem.specificity.join(',')}.`);
if (failed.length) {
  for (const f of failed) console.error(`FAIL ${f.id}: ${f.detail}`);
  process.exitCode = 1;
}
