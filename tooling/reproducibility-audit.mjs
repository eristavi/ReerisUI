import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const checks = [];
const failures = [];
function check(name, condition, detail = '') {
  const pass = Boolean(condition);
  checks.push({ name, pass, detail });
  if (!pass) failures.push({ name, detail });
}
function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir).sort()) {
    const target = path.join(dir, name);
    const stat = fs.statSync(target);
    if (stat.isDirectory()) out.push(...walk(target));
    else out.push(target);
  }
  return out;
}
function snapshot() {
  const files = ['packages/core/dist', 'packages/js/dist'].flatMap(walk).sort();
  const entries = files.map(file => {
    const relative = file.split(path.sep).join('/');
    const buffer = fs.readFileSync(file);
    return { file: relative, bytes: buffer.length, sha256: sha256(buffer) };
  });
  const treeHash = sha256(Buffer.from(entries.map(item => `${item.file}\0${item.bytes}\0${item.sha256}`).join('\n')));
  return { entries, treeHash };
}
function runBuild(label) {
  const result = spawnSync('npm', ['run', 'build'], { cwd: root, encoding: 'utf8' });
  check(`${label} succeeds`, result.status === 0, result.stderr.trim() || result.stdout.trim());
  return result.status === 0;
}
function mapSegments(mappings) {
  return mappings.split(';').reduce((total, line) => total + (line ? line.split(',').filter(Boolean).length : 0), 0);
}
function validateMap(cssName, mapName) {
  const cssPath = path.join('packages/core/dist', cssName);
  const mapPath = path.join('packages/core/dist', mapName);
  check(`${cssName} exists`, fs.existsSync(cssPath));
  check(`${mapName} exists`, fs.existsSync(mapPath));
  if (!fs.existsSync(cssPath) || !fs.existsSync(mapPath)) return null;
  const css = fs.readFileSync(cssPath, 'utf8');
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  check(`${cssName} references ${mapName}`, css.includes(`sourceMappingURL=${mapName}`));
  check(`${mapName} is Source Map v3`, map.version === 3);
  check(`${mapName} targets ${cssName}`, map.file === cssName, map.file);
  check(`${mapName} has individual module sources`, Array.isArray(map.sources) && map.sources.length >= 30, `${map.sources?.length ?? 0} sources`);
  check(`${mapName} has mappings`, typeof map.mappings === 'string' && map.mappings.length > 0, `${mapSegments(map.mappings || '')} segments`);
  check(`${mapName} contains no absolute source paths`, map.sources.every(source => !path.isAbsolute(source) && !/^[A-Za-z]:[\\/]/.test(source) && !source.includes('\\')));
  for (const source of map.sources) {
    const resolved = path.resolve(path.dirname(mapPath), source);
    check(`${mapName} source exists: ${source}`, fs.existsSync(resolved), resolved);
  }
  return { sources: map.sources.length, segments: mapSegments(map.mappings) };
}

const firstOk = runBuild('First deterministic build');
const first = firstOk ? snapshot() : { entries: [], treeHash: '' };
const secondOk = runBuild('Second deterministic build');
const second = secondOk ? snapshot() : { entries: [], treeHash: '' };
check('Repeated builds emit identical file lists', JSON.stringify(first.entries.map(x => x.file)) === JSON.stringify(second.entries.map(x => x.file)));
check('Repeated builds emit byte-identical artifacts', first.treeHash && first.treeHash === second.treeHash, `${first.treeHash} vs ${second.treeHash}`);

const fullMap = validateMap('reeris.css', 'reeris.css.map');
const minMap = validateMap('reeris.min.css', 'reeris.min.css.map');
if (fullMap && minMap) check('Full and minified maps expose the same source-module set', fullMap.sources === minMap.sources, `${fullMap.sources} vs ${minMap.sources}`);

const sourceRoot = 'packages/core/dist/sources';
const publishedSources = walk(sourceRoot).filter(file => file.endsWith('.css'));
const canonicalSources = walk('packages/core/src').filter(file => file.endsWith('.css'));
check('Published source-module count matches canonical CSS source count', publishedSources.length === canonicalSources.length, `${publishedSources.length} vs ${canonicalSources.length}`);
for (const canonical of canonicalSources) {
  const rel = path.relative('packages/core/src', canonical);
  const published = path.join(sourceRoot, rel);
  check(`Published source is byte-identical: ${rel.split(path.sep).join('/')}`, fs.existsSync(published) && fs.readFileSync(canonical).equals(fs.readFileSync(published)));
}

for (const item of second.entries) {
  const file = path.resolve(item.file);
  if (!/\.(css|map|js|json)$/.test(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  check(`Deterministic artifact has no generated timestamp: ${item.file}`, !/generatedAt|builtAt|buildTime|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/.test(text));
  check(`Deterministic artifact has no machine-local absolute path: ${item.file}`, !text.includes(root) && !text.includes('/mnt/data/'));
}

const report = {
  version: pkg.version,
  generatedAt: new Date().toISOString(),
  summary: {
    passed: checks.filter(item => item.pass).length,
    total: checks.length,
    failed: failures.length,
    artifacts: second.entries.length,
    sourceModules: publishedSources.length,
    treeHash: second.treeHash,
    fullMapSources: fullMap?.sources ?? 0,
    fullMapSegments: fullMap?.segments ?? 0,
    minMapSources: minMap?.sources ?? 0,
    minMapSegments: minMap?.segments ?? 0
  },
  firstTreeHash: first.treeHash,
  secondTreeHash: second.treeHash,
  failures,
  checks
};
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync(`reports/build-reproducibility-audit-${pkg.version}.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Build reproducibility audit: ${report.summary.passed}/${report.summary.total} checks passed.`);
console.log(`Deterministic tree hash: ${report.summary.treeHash}; ${report.summary.artifacts} artifacts; ${report.summary.sourceModules} published CSS sources.`);
console.log(`Source maps: full ${report.summary.fullMapSources} sources/${report.summary.fullMapSegments} mappings; minified ${report.summary.minMapSources} sources/${report.summary.minMapSegments} mappings.`);
if (failures.length) {
  for (const failure of failures.slice(0, 30)) console.error(`FAIL: ${failure.name}${failure.detail ? ` — ${failure.detail}` : ''}`);
  if (failures.length > 30) console.error(`...and ${failures.length - 30} more failures.`);
  process.exitCode = 1;
}
