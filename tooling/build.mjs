import fs from 'node:fs';
import path from 'node:path';
import { buildTokens } from './build-tokens.mjs';

const root = path.resolve('packages/core/src');
const dist = path.resolve('packages/core/dist');
const entry = path.join(root, 'reeris.css');
const base64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function posix(value) { return value.split(path.sep).join('/'); }
function sourceRel(file) { return posix(path.relative(root, path.resolve(file))); }
function readLines(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
  return text.split('\n').map((text, line) => ({ text, origin: { source: sourceRel(file), line } }));
}

function expand(file, seen = new Set()) {
  const abs = path.resolve(file);
  if (seen.has(abs)) return [];
  seen.add(abs);
  const out = [];
  for (const item of readLines(abs)) {
    const match = item.text.match(/^\s*@import\s+["'](.+?)["'];\s*$/);
    if (match) out.push(...expand(path.resolve(path.dirname(abs), match[1]), seen));
    else out.push(item);
  }
  return out;
}

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir).sort()) {
    const target = path.join(dir, name);
    const stat = fs.statSync(target);
    if (stat.isDirectory()) out.push(...walk(target));
    else out.push(target);
  }
  return out;
}

function encodeVlq(value) {
  let number = value < 0 ? ((-value) << 1) + 1 : value << 1;
  let encoded = '';
  do {
    let digit = number & 31;
    number >>>= 5;
    if (number > 0) digit |= 32;
    encoded += base64[digit];
  } while (number > 0);
  return encoded;
}

function encodeMappings(events, lineCount, sourceIndexes) {
  const byLine = Array.from({ length: lineCount }, () => []);
  for (const event of events) byLine[event.generatedLine]?.push(event);
  let previousSource = 0;
  let previousOriginalLine = 0;
  let previousOriginalColumn = 0;
  const lines = [];
  for (let line = 0; line < lineCount; line++) {
    const items = byLine[line].sort((a, b) => a.generatedColumn - b.generatedColumn);
    let previousGeneratedColumn = 0;
    const segments = [];
    for (const item of items) {
      const sourceIndex = sourceIndexes.get(item.source);
      const fields = [
        item.generatedColumn - previousGeneratedColumn,
        sourceIndex - previousSource,
        item.originalLine - previousOriginalLine,
        item.originalColumn - previousOriginalColumn
      ];
      segments.push(fields.map(encodeVlq).join(''));
      previousGeneratedColumn = item.generatedColumn;
      previousSource = sourceIndex;
      previousOriginalLine = item.originalLine;
      previousOriginalColumn = item.originalColumn;
    }
    lines.push(segments.join(','));
  }
  return lines.join(';');
}

function writeSourceMap(fileName, mapName, sources, events, lineCount) {
  const sourceIndexes = new Map(sources.map((source, index) => [source, index]));
  const map = {
    version: 3,
    file: fileName,
    sources: sources.map(source => `sources/${source}`),
    names: [],
    mappings: encodeMappings(events, lineCount, sourceIndexes)
  };
  fs.writeFileSync(path.join(dist, mapName), `${JSON.stringify(map)}\n`);
}

function minifyWithMap(lines, prefixLength = 0) {
  let output = '';
  let quote = null;
  let inComment = false;
  let pendingSpace = false;
  let escaped = false;
  const events = [];
  const mappedLines = new Set();

  function record(origin, originalColumn) {
    if (!origin) return;
    const key = `${origin.source}:${origin.line}`;
    if (mappedLines.has(key)) return;
    mappedLines.add(key);
    events.push({
      generatedLine: 0,
      generatedColumn: prefixLength + output.length,
      source: origin.source,
      originalLine: origin.line,
      originalColumn
    });
  }

  function emitToken(ch, origin, originalColumn) {
    if (pendingSpace) {
      if (output && !'{;,}'.includes(output.at(-1)) && ch !== '}') output += ' ';
      pendingSpace = false;
    }
    record(origin, originalColumn);
    output += ch;
  }

  for (const line of lines) {
    for (let column = 0; column <= line.text.length; column++) {
      const ch = column === line.text.length ? '\n' : line.text[column];
      const next = column + 1 < line.text.length ? line.text[column + 1] : '';

      if (inComment) {
        if (ch === '*' && next === '/') {
          inComment = false;
          column++;
          pendingSpace = true;
        }
        continue;
      }

      if (quote) {
        record(line.origin, column);
        output += ch;
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === quote) quote = null;
        continue;
      }

      if (ch === '/' && next === '*') {
        inComment = true;
        column++;
        pendingSpace = true;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        emitToken(ch, line.origin, column);
        continue;
      }
      if (/\s/.test(ch)) {
        pendingSpace = true;
        continue;
      }
      if ('{};,'.includes(ch)) {
        if (output.endsWith(' ')) output = output.slice(0, -1);
        record(line.origin, column);
        output += ch;
        pendingSpace = false;
        continue;
      }
      emitToken(ch, line.origin, column);
    }
  }

  return { css: output.replaceAll(';}','}').trim(), events };
}

function copyTree(sourceDir, targetDir, predicate = () => true) {
  for (const file of walk(sourceDir)) {
    if (!predicate(file)) continue;
    const relative = path.relative(sourceDir, file);
    const target = path.join(targetDir, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(file, target);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
await buildTokens();

const pkg = JSON.parse(fs.readFileSync(path.resolve('packages/core/package.json'), 'utf8'));
const expanded = expand(entry);
const allSources = [...new Set(expanded.map(line => line.origin?.source).filter(Boolean))].sort();
const fullLines = [
  { text: `/* Reeris UI ${pkg.version} | MIT License */`, origin: null },
  { text: '', origin: null },
  ...expanded,
  { text: '/*# sourceMappingURL=reeris.css.map */', origin: null }
];
const fullCss = `${fullLines.map(line => line.text).join('\n')}\n`;
fs.writeFileSync(path.join(dist, 'reeris.css'), fullCss);
const fullEvents = fullLines.flatMap((line, generatedLine) => line.origin ? [{
  generatedLine,
  generatedColumn: 0,
  source: line.origin.source,
  originalLine: line.origin.line,
  originalColumn: 0
}] : []);
writeSourceMap('reeris.css', 'reeris.css.map', allSources, fullEvents, fullLines.length);

const minBanner = `/*! Reeris UI ${pkg.version} | MIT License */`;
const minified = minifyWithMap(expanded, minBanner.length);
const minCss = `${minBanner}${minified.css}\n/*# sourceMappingURL=reeris.min.css.map */\n`;
fs.writeFileSync(path.join(dist, 'reeris.min.css'), minCss);
writeSourceMap('reeris.min.css', 'reeris.min.css.map', allSources, minified.events, 2);

for (const dir of ['components','forms','layout','utilities','core']) {
  const srcDir = path.join(root, dir);
  const outDir = path.join(dist, dir);
  fs.mkdirSync(outDir, { recursive: true });
  for (const name of fs.readdirSync(srcDir).sort()) {
    if (name.endsWith('.css')) fs.copyFileSync(path.join(srcDir, name), path.join(outDir, name));
  }
}
copyTree(root, path.join(dist, 'sources'), file => file.endsWith('.css'));

console.log(`Built packages/core/dist/reeris.css (${fullLines.length} mapped lines), reeris.min.css, source maps, source modules and modular CSS exports`);

const jsSrc = path.resolve('packages/js/src');
const jsDist = path.resolve('packages/js/dist');
if (fs.existsSync(jsSrc)) {
  fs.rmSync(jsDist, { recursive: true, force: true });
  fs.mkdirSync(jsDist, { recursive: true });
  for (const name of fs.readdirSync(jsSrc).sort()) {
    if (name.endsWith('.js')) fs.copyFileSync(path.join(jsSrc, name), path.join(jsDist, name));
  }
  console.log('Built packages/js/dist (native ES modules)');
}
