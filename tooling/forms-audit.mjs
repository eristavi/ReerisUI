import fs from 'node:fs';
import path from 'node:path';

const cssPath = path.resolve('packages/core/src/forms/forms.css');
const css = fs.readFileSync(cssPath, 'utf8');
const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;

const checks = [
  ['text controls', /\.input\b[\s\S]*\.select\b[\s\S]*\.textarea\b/],
  ['five control sizes', /\.input\.xs[\s\S]*\.input\.sm[\s\S]*\.input\.lg[\s\S]*\.input\.xl/],
  ['textarea size variants', /\.textarea\.xs[\s\S]*\.textarea\.sm[\s\S]*\.textarea\.lg[\s\S]*\.textarea\.xl/],
  ['native invalid state', /:user-invalid/],
  ['server/custom invalid state', /aria-invalid="true"/],
  ['native valid state', /:user-valid/],
  ['disabled state', /:disabled/],
  ['read-only state', /:read-only/],
  ['checkbox and radio', /type="checkbox"[\s\S]*type="radio"/],
  ['indeterminate checkbox', /:indeterminate/],
  ['switch', /\.switch/],
  ['choice groups', /\.choice-group/],
  ['input groups and addons', /\.input-group[\s\S]*\.input-addon/],
  ['decorated inputs and actions', /\.input-wrap[\s\S]*\.input-action/],
  ['floating labels', /\.field\.floating/],
  ['search input', /type="search"/],
  ['native date and time controls', /type="date"[\s\S]*type="time"[\s\S]*type="datetime-local"/],
  ['file input', /\.file\b/],
  ['drop-zone presentation', /\.dropzone/],
  ['range input', /\.range/],
  ['color input', /\.color-input/],
  ['OTP/PIN layout', /\.otp/],
  ['strength presentation', /\.strength/],
  ['loading state', /data-reeris-state="loading"/],
  ['ARIA busy state', /aria-busy="true"/],
  ['form grid', /\.form-grid/],
  ['responsive horizontal fields', /\.field\.horizontal/],
  ['fieldsets', /\.fieldset/],
  ['progressive customizable select', /appearance:\s*base-select[\s\S]*::picker\(select\)/],
  ['RTL-specific handling', /\[dir="rtl"\]/],
  ['forced-colors handling', /forced-colors:\s*active/],
  ['reduced-motion handling', /prefers-reduced-motion:\s*reduce/]
];

const results = checks.map(([name, pattern]) => ({ name, passed: pattern.test(css) }));
const failed = results.filter(x => !x.passed);

const report = {
  version,
  generatedAt: new Date().toISOString(),
  source: 'packages/core/src/forms/forms.css',
  checks: results,
  passed: results.length - failed.length,
  failed: failed.length
};
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync(`reports/forms-audit-${version}.json`, JSON.stringify(report, null, 2) + '\n');
console.log(`Forms audit: ${report.passed}/${results.length} checks passed.`);
if (failed.length) {
  for (const item of failed) console.error(`Missing: ${item.name}`);
  process.exitCode = 1;
}
