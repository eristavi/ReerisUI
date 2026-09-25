import fs from 'node:fs';
import path from 'node:path';
import { extractClassNames } from './css-public-api.mjs';

const sourceDirs = ['components', 'forms', 'layout', 'utilities'].map(d => path.resolve('packages/core/src', d));
const files = sourceDirs.flatMap(dir => fs.readdirSync(dir).filter(f => f.endsWith('.css')).map(file => ({ dir, file })));
const selectors = new Set();
for (const { dir, file } of files) {
  const css = fs.readFileSync(path.join(dir, file), 'utf8');
  for (const name of extractClassNames(css)) selectors.add(name);
}

const requiredAnchors = {
  button: ['btn', 'btn-group'],
  forms: ['field', 'switch'],
  surfaces: ['card', 'badge', 'chip', 'avatar', 'content-state'],
  feedback: ['alert', 'progress', 'spinner', 'skeleton', 'toast'],
  navigation: ['navbar', 'tabs', 'pagination', 'mega-menu', 'hover-card'],
  overlays: ['dialog', 'popover', 'accordion', 'tooltip'],
  data: ['table', 'data-table', 'list-group', 'timeline'],
  app: ['app-shell', 'toolbar', 'widget'],
  workflow: ['stepper', 'wizard'],
  identity: ['identity', 'profile-card'],
  search: ['command-palette', 'combobox'],
  hierarchy: ['tree'],
  choice: ['choice', 'rating']
};

const coverage = Object.fromEntries(Object.entries(requiredAnchors).map(([area, names]) => [
  area,
  { required: names, present: names.filter(n => selectors.has(n)), missing: names.filter(n => !selectors.has(n)) }
]));

const packageVersion = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;

const report = {
  version: packageVersion,
  generatedAt: new Date().toISOString(),
  auditedCssFiles: files.length,
  discoveredClassNames: selectors.size,
  coverage
};

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync(`reports/core-scope-${packageVersion}.json`, JSON.stringify(report, null, 2) + '\n');
console.log(`Core scope audit: ${files.length} audited CSS files, ${selectors.size} discovered class names.`);
for (const [area, result] of Object.entries(coverage)) {
  if (result.missing.length) console.log(`Missing ${area}: ${result.missing.join(', ')}`);
}
