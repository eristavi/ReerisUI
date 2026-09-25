import fs from 'node:fs';
import path from 'node:path';
import { extractClassNames } from './css-public-api.mjs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const coreCss = fs.readFileSync('packages/core/dist/reeris.css', 'utf8');
const knownClasses = new Set(extractClassNames(coreCss));
const manifest = JSON.parse(fs.readFileSync('docs/api-manifest.json', 'utf8'));
const knownDataAttributes = new Set(manifest.dataAttributes.map(item => item.name));
const root = path.resolve('examples/starters');
const starters = {
  'dashboard.html': ['app-shell', 'stats', 'dashboard-grid', 'widget', 'viz-bar', 'activity-feed'],
  'data-management.html': ['app-shell', 'filter-bar', 'filter-chips', 'bulk-actions', 'data-table', 'table', 'pagination'],
  'authentication.html': ['auth-shell', 'auth-card', 'auth-form', 'field', 'auth-providers'],
  'settings.html': ['settings-layout', 'settings-content', 'settings-section', 'setting-row', 'switch', 'danger-zone'],
  'marketing.html': ['navbar', 'hero', 'feature-grid', 'pricing-grid', 'testimonial', 'cta']
};
const failures = [];
const checks = [];
function check(name, condition, detail = '') {
  const pass = Boolean(condition);
  checks.push({ name, pass, detail });
  if (!pass) failures.push({ name, detail });
}
function classesFrom(html) {
  return new Set([...html.matchAll(/\bclass\s*=\s*["']([^"']+)["']/gi)].flatMap(match => match[1].trim().split(/\s+/).filter(Boolean)));
}
function stylesFrom(html) {
  return [...html.matchAll(/\bstyle\s*=\s*["']([^"']*)["']/gi)].map(match => match[1]);
}
function dataAttrsFrom(html) {
  return new Set([...html.matchAll(/\b(data-reeris-[a-z0-9-]+)(?:\s*=|\s|>)/gi)].map(match => match[1].toLowerCase()));
}

check('Starter directory exists', fs.existsSync(root));
check('Starter index exists', fs.existsSync(path.join(root, 'index.html')));
check('Starter README exists', fs.existsSync(path.join(root, 'README.md')));
check('Starters documentation page exists', fs.existsSync('docs/starters.html'));

for (const [file, anchors] of Object.entries(starters)) {
  const full = path.join(root, file);
  check(`${file}: exists`, fs.existsSync(full));
  if (!fs.existsSync(full)) continue;
  const html = fs.readFileSync(full, 'utf8');
  const usedClasses = classesFrom(html);
  const unknown = [...usedClasses].filter(name => !knownClasses.has(name)).sort();
  const dataAttrs = [...dataAttrsFrom(html)];
  const unknownAttrs = dataAttrs.filter(name => !knownDataAttributes.has(name));
  const badStyles = stylesFrom(html).filter(value => value.split(';').map(x => x.trim()).filter(Boolean).some(decl => !decl.startsWith('--reeris-')));

  check(`${file}: language declared`, /<html\b[^>]*\blang=["'][^"']+["']/i.test(html));
  check(`${file}: viewport declared`, /<meta\b[^>]*name=["']viewport["']/i.test(html));
  check(`${file}: title declared`, /<title>[^<]+<\/title>/i.test(html));
  check(`${file}: main landmark`, /<main\b/i.test(html));
  check(`${file}: Reeris Core stylesheet`, /href=["']\.\.\/\.\.\/packages\/core\/dist\/reeris\.css["']/i.test(html));
  check(`${file}: no embedded style block`, !/<style\b/i.test(html));
  check(`${file}: no inline event handlers`, !/\son[a-z]+\s*=/i.test(html));
  check(`${file}: no runtime script required`, !/<script\b/i.test(html));
  check(`${file}: inline styles only use public Reeris custom properties`, badStyles.length === 0, badStyles.join(' | '));
  check(`${file}: only public Reeris classes`, unknown.length === 0, unknown.join(', '));
  check(`${file}: only known Reeris data attributes`, unknownAttrs.length === 0, unknownAttrs.join(', '));
  for (const anchor of anchors) check(`${file}: composition anchor .${anchor}`, usedClasses.has(anchor));
}

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const file of Object.keys(starters)) check(`Starter index links ${file}`, index.includes(`href="${file}"`));
const docs = fs.readFileSync('docs/starters.html', 'utf8');
for (const file of Object.keys(starters)) check(`Docs link ${file}`, docs.includes(`../examples/starters/${file}`));

const report = {
  version: pkg.version,
  generatedAt: new Date().toISOString(),
  summary: {
    passed: checks.filter(item => item.pass).length,
    total: checks.length,
    failed: failures.length,
    starters: Object.keys(starters).length,
    publicClassesAvailable: knownClasses.size
  },
  failures,
  checks
};
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync(`reports/starters-integration-audit-${pkg.version}.json`, JSON.stringify(report, null, 2) + '\n');
console.log(`Starter integration audit: ${report.summary.passed}/${report.summary.total} checks passed across ${report.summary.starters} official starters.`);
if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure.name}${failure.detail ? ` — ${failure.detail}` : ''}`);
  process.exitCode = 1;
}
