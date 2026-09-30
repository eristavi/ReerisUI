import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { parse } from 'parse5';
import { documentationSections } from './documentation-config.mjs';

const out = path.resolve('.reeris-docs-site');
const origin = 'https://eristavi.github.io';
const base = '/ReerisUI/';
const manifest = JSON.parse(fs.readFileSync('docs/api-manifest.json', 'utf8'));
const failures = [];
let checks = 0;
const check = (condition, message) => { checks++; if (!condition) failures.push(message); };
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
  ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const nodes = root => [root, ...(root.childNodes || []).flatMap(nodes)];
const attribute = (node, name) => node.attrs?.find(attr => attr.name === name)?.value;
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
const documents = new Map();
for (const file of walk(out).filter(file => file.endsWith('.html'))) {
  const relative = path.relative(out, file).replaceAll(path.sep, '/');
  documents.set(relative, nodes(parse(fs.readFileSync(file, 'utf8'))));
}

const routes = [...fs.readdirSync('docs').filter(file => file.endsWith('.html')).map(file => `docs/${file}`),
  ...fs.readdirSync('examples/starters').filter(file => file.endsWith('.html')).map(file => `examples/starters/${file}`)];
for (const route of routes) {
  const elements = documents.get(route);
  check(Boolean(elements), `Preserved HTML route: ${route}`);
  if (!elements) continue;
  check(elements.some(node => attribute(node, 'name') === 'generator' && attribute(node, 'content')?.startsWith('Astro')), `${route}: rendered by Astro`);
  check(elements.filter(node => attribute(node, 'data-docs-theme') !== undefined).length === 1, `${route}: exactly one theme control`);
  check(!elements.some(node => node.tagName === 'astro-island'), `${route}: static HTML without framework hydration`);
  const stylesheet = elements.find(node => node.tagName === 'link' && attribute(node, 'href')?.includes('/docs/assets/reeris.css'));
  check(Boolean(stylesheet), `${route}: production Reeris stylesheet`);
  const themeInit = elements.find(node => node.tagName === 'script' && attribute(node, 'src')?.includes('/theme-init.js'));
  check(elements.indexOf(themeInit) < elements.indexOf(stylesheet), `${route}: theme is restored before CSS`);
  const canonical = elements.find(node => attribute(node, 'rel') === 'canonical');
  check(attribute(canonical || {}, 'href') === `${origin}${base}${route}`, `${route}: canonical GitHub Pages URL`);
}

for (const [route, elements] of documents) {
  for (const node of elements) {
    for (const name of ['href', 'src', 'poster']) {
      const value = attribute(node, name);
      if (!value || value.startsWith('#') || /^(data:|mailto:|tel:|javascript:)/.test(value)) continue;
      const url = new URL(value, `${origin}${base}${route}`);
      if (url.origin !== origin) continue;
      check(url.pathname.startsWith(base), `${route}: link stays under repository base: ${value}`);
      const relative = decodeURIComponent(url.pathname.slice(base.length));
      const target = path.join(out, relative || 'index.html');
      check(fs.existsSync(target), `${route}: linked asset/page exists: ${value}`);
    }
  }
}

const api = documents.get('docs/api-reference.html') || [];
const codes = new Set(api.filter(node => node.tagName === 'code').map(text));
for (const item of manifest.classes) check(codes.has(`.${item.name}`), `API class: .${item.name}`);
for (const item of manifest.tokens) check(codes.has(item.name), `API token: ${item.name}`);
for (const item of manifest.dataAttributes) check(codes.has(item.name), `API attribute: ${item.name}`);
for (const item of manifest.packageExports) {
  check(codes.has(item.package) && codes.has(item.name) && codes.has(item.target), `API package export: ${item.package}/${item.name}`);
}
for (const item of manifest.jsApi) check(codes.has(item.name), `API JavaScript export: ${item.name}`);
const home = documents.get('docs/index.html') || [];
const homeLinks = new Set(home.map(node => attribute(node, 'href')));
for (const [href] of documentationSections.flatMap(section => section.pages)) check(homeLinks.has(href), `Home directory page: ${href}`);
for (const route of routes.filter(route => route.startsWith('docs/'))) {
  const source = fs.readFileSync(route, 'utf8');
  const count = [...source.matchAll(/<section\b[^>]*\bdata-docs-example\b/gi)].length;
  const actual = (documents.get(route) || []).filter(node => node.tagName === 'fieldset' && attribute(node, 'class')?.includes('docs-example-tabs')).length;
  check(count === actual, `${route}: preserves ${count} Preview/HTML examples`);
}
assert.deepEqual(fs.readFileSync(path.join(out, 'docs/assets/reeris.css')), fs.readFileSync('packages/core/dist/reeris.css'), 'Docs use the tested distribution CSS');
fs.writeFileSync(path.join(out, 'site-audit.json'), JSON.stringify({ version: manifest.version, routes: routes.length, checks, failures }, null, 2) + '\n');
console.log(`Astro documentation audit: ${checks - failures.length}/${checks} checks passed; ${routes.length} documentation/starter routes.`);
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
