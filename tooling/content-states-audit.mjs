import fs from 'node:fs';

const css = fs.readFileSync('packages/core/src/components/surfaces.css', 'utf8');
const docs = fs.readFileSync('docs/content-states.html', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const checks = [
  ['base content-state component', css.includes('.content-state)')],
  ['icon part', css.includes('.content-state-icon')],
  ['title part', css.includes('.content-state-title')],
  ['description part', css.includes('.content-state-description')],
  ['actions part', css.includes('.content-state-actions')],
  ['compact variant', css.includes('.content-state.compact')],
  ['no-results variant', css.includes('.content-state.no-results')],
  ['error variant', css.includes('.content-state.error')],
  ['success variant', css.includes('.content-state.success')],
  ['offline variant', css.includes('.content-state.offline')],
  ['permission-required variant', css.includes('.content-state.permission-required')],
  ['maintenance variant', css.includes('.content-state.maintenance')],
  ['public padding token', css.includes('--reeris-content-state-padding')],
  ['public gap token', css.includes('--reeris-content-state-gap')],
  ['public description-width token', css.includes('--reeris-content-state-max-description')],
  ['public icon-size token', css.includes('--reeris-content-state-icon-size')],
  ['public icon background token', css.includes('--reeris-content-state-icon-bg')],
  ['public icon color token', css.includes('--reeris-content-state-icon-color')],
  ['forced-colors handling', css.includes('@media (forced-colors: active)') && css.includes('.content-state-icon')],
  ['empty/default documented', docs.includes('No projects yet')],
  ['no-results documented', docs.includes('No results')],
  ['error documented', docs.includes('Couldn’t load data')],
  ['success documented', docs.includes('Import complete')],
  ['offline documented', docs.includes('You’re offline')],
  ['permission documented', docs.includes('Permission required')],
  ['maintenance documented', docs.includes('Scheduled maintenance')],
  ['live-region guidance documented', docs.includes('role="status"') && docs.includes('role="alert"')],
  ['decorative icon guidance documented', docs.includes('aria-hidden="true"')]
];

const passed = checks.filter(([, ok]) => ok).length;
const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
const report = { version: pkg.version, passed, total: checks.length, failed };
fs.mkdirSync('reports', { recursive:true });
fs.writeFileSync(`reports/content-states-audit-${pkg.version}.json`, JSON.stringify(report, null, 2) + '\n');
console.log(`Content states audit: ${passed}/${checks.length} checks passed.`);
if (failed.length) {
  console.error(`Failed: ${failed.join(', ')}`);
  process.exitCode = 1;
}
