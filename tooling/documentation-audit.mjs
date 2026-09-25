import fs from 'node:fs';
import path from 'node:path';
import { documentationSections, sourceDocumentation } from './documentation-config.mjs';

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const manifestPath = path.resolve('docs/api-manifest.json');
const apiPath = path.resolve('docs/api-reference.html');
const indexPath = path.resolve('docs/index.html');
const docsAssets = ['docs/assets/docs.css', 'docs/assets/docs.js'];
const failures = [];
const checks = [];

function check(name, condition, detail = '') {
  const pass = Boolean(condition);
  checks.push({ name, pass, detail });
  if (!pass) failures.push({ name, detail });
}

check('API manifest exists', fs.existsSync(manifestPath));
check('Generated API reference exists', fs.existsSync(apiPath));
check('Documentation home exists', fs.existsSync(indexPath));
for (const asset of docsAssets) check(`Shared docs asset exists: ${asset}`, fs.existsSync(asset));

if (!fs.existsSync(manifestPath) || !fs.existsSync(apiPath) || !fs.existsSync(indexPath)) {
  console.error('Documentation audit cannot continue: generated documentation artifacts are missing. Run npm run docs:api first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const api = fs.readFileSync(apiPath, 'utf8');
const index = fs.readFileSync(indexPath, 'utf8');
check('Manifest version matches package version', manifest.version === pkg.version, `${manifest.version} vs ${pkg.version}`);

const allCss = ['reeris.css'];
for (const group of ['core','tokens','layout','utilities','forms','components']) {
  const dir = path.resolve('packages/core/src', group);
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) if (name.endsWith('.css')) allCss.push(`${group}/${name}`);
}
for (const source of allCss) {
  check(`Source module mapped: ${source}`, Boolean(sourceDocumentation[source]), sourceDocumentation[source] || 'no documentation mapping');
  if (sourceDocumentation[source]) check(`Mapped doc exists: ${sourceDocumentation[source]}`, fs.existsSync(path.resolve('docs', sourceDocumentation[source])));
}

const configuredPages = documentationSections.flatMap(section => section.pages.map(page => page[0]));
for (const page of new Set(configuredPages)) {
  check(`Docs index links: ${page}`, index.includes(`href="${page}"`));
  check(`Configured page exists: ${page}`, fs.existsSync(path.resolve('docs', page)));
}
check('Docs index links API reference', index.includes('href="api-reference.html"'));

for (const item of manifest.classes) check(`Class documented: .${item.name}`, api.includes(`.${item.name}</code>`));
for (const item of manifest.tokens) check(`Token documented: ${item.name}`, api.includes(`${item.name}</code>`));
for (const item of manifest.dataAttributes) check(`Data attribute documented: ${item.name}`, api.includes(`${item.name}</code>`));
for (const item of manifest.packageExports) check(`Package export documented: ${item.package} ${item.name}`, api.includes(`${item.package}</code>`) && api.includes(`${item.name}</code>`));
for (const item of manifest.packageExports) {
  const pkgDir = item.package === '@reeris/core' ? 'packages/core' : item.package === '@reeris/js' ? 'packages/js' : null;
  if (!pkgDir) continue;
  const target = item.target.replace(/^\.\//, '');
  const probe = target.includes('*') ? target.slice(0, target.indexOf('*')) : target;
  const resolved = path.resolve(pkgDir, probe);
  check(`Package export target exists: ${item.package} ${item.name}`, fs.existsSync(resolved), resolved);
}
for (const item of manifest.jsApi) check(`JS export documented: ${item.name}`, api.includes(`>${item.name}</code>`));

check('API reference explains contextual modifiers', api.includes('Classes are contextual'));
check('API reference explains fallback-only token hooks', api.includes('Override hook'));
check('API reference states native/ARIA priority', api.includes('Native attributes and ARIA remain preferred'));
check('Glide instance lifecycle documented', ['moveTo(item, animate)','restore(animate)','refresh()','destroy()'].every(value => api.includes(value)));

// Documentation must follow the browser/OS scheme by default; explicit themes belong to demos/tests only.
for (const name of fs.readdirSync('docs').filter(name => name.endsWith('.html'))) {
  const rel = `docs/${name}`;
  const text = fs.readFileSync(rel, 'utf8');
  const rootTag = (text.match(/<html\b[^>]*>/i) || [''])[0];
  check(`Docs page follows system scheme: ${name}`, !/\bdata-theme\s*=/.test(rootTag), rootTag);
  check(`Docs page declares UA light/dark support: ${name}`, /<meta\s+name=["']color-scheme["']\s+content=["']light dark["']/i.test(text));
}
const docsChromeCss = fs.readFileSync('docs/assets/docs.css', 'utf8');
check('Docs chrome avoids hard-coded hex colors', !/#[0-9a-f]{3,8}\b/i.test(docsChromeCss));
check('Docs chrome avoids hard-coded rgb/hsl/oklch colors', !/\b(?:rgb|hsl|oklch)\s*\(/i.test(docsChromeCss));
check('Docs chrome consumes semantic Reeris color tokens', /--reeris-color-(?:background|surface|text|border|primary)/.test(docsChromeCss));

const report = {
  version: pkg.version,
  generatedAt: new Date().toISOString(),
  summary: {
    passed: checks.filter(c => c.pass).length,
    total: checks.length,
    failed: failures.length,
    sourceModules: manifest.counts.sourceModules,
    classes: manifest.counts.classes,
    tokens: manifest.counts.tokens,
    definedTokens: manifest.counts.definedTokens,
    overrideHooks: manifest.counts.overrideHooks,
    dataAttributes: manifest.counts.dataAttributes,
    packageExports: manifest.counts.packageExports,
    jsApi: manifest.counts.jsApi
  },
  failures,
  checks
};
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync(`reports/documentation-audit-${pkg.version}.json`, JSON.stringify(report, null, 2) + '\n');
console.log(`Documentation/API audit: ${report.summary.passed}/${report.summary.total} checks passed.`);
console.log(`Inventory: ${report.summary.sourceModules} source modules, ${report.summary.classes} classes, ${report.summary.tokens} tokens (${report.summary.overrideHooks} fallback-only hooks), ${report.summary.dataAttributes} data attributes, ${report.summary.packageExports} package exports, ${report.summary.jsApi} JS exports.`);
if (failures.length) {
  for (const failure of failures.slice(0, 30)) console.error(`FAIL: ${failure.name}${failure.detail ? ` — ${failure.detail}` : ''}`);
  if (failures.length > 30) console.error(`...and ${failures.length - 30} more failures.`);
  process.exitCode = 1;
}
