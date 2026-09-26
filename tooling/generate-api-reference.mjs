import fs from 'node:fs';
import path from 'node:path';
import { documentationSections, sourceDocumentation } from './documentation-config.mjs';
import { extractClassNames } from './css-public-api.mjs';

const root = process.cwd();
const coreSrc = path.join(root, 'packages/core/src');
const jsSrc = path.join(root, 'packages/js/src');
const docsDir = path.join(root, 'docs');

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const relCore = file => path.relative(coreSrc, file).replaceAll(path.sep, '/');
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const kebab = value => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const cssFiles = walk(coreSrc).filter(file => file.endsWith('.css'));
const jsFiles = fs.existsSync(jsSrc) ? walk(jsSrc).filter(file => file.endsWith('.js')) : [];

const classes = new Map();
const tokenDefinitions = new Map();
const tokenUses = new Map();
const dataAttributes = new Map();

function add(map, key, source, detail) {
  if (!map.has(key)) map.set(key, { name: key, sources: new Set(), details: new Set() });
  map.get(key).sources.add(source);
  if (detail) map.get(key).details.add(detail);
}

for (const file of cssFiles) {
  const source = relCore(file);
  const text = fs.readFileSync(file, 'utf8');
  for (const name of extractClassNames(text)) add(classes, name, source);
  for (const match of text.matchAll(/(--reeris-[a-z0-9-]+)\s*:/gi)) add(tokenDefinitions, match[1], source);
  for (const match of text.matchAll(/--reeris-[a-z0-9-]+/gi)) add(tokenUses, match[0], source);
  for (const match of text.matchAll(/data-reeris-[a-z0-9-]+/gi)) add(dataAttributes, match[0], source);
  for (const match of text.matchAll(/\[(data-reeris-[a-z0-9-]+)(?:=["']([^"']+)["'])?/gi)) {
    add(dataAttributes, match[1], source, match[2] ? `value: ${match[2]}` : 'presence');
  }
}

for (const file of jsFiles) {
  const source = `@reeris/js/${path.relative(jsSrc, file).replaceAll(path.sep, '/')}`;
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/data-reeris-[a-z0-9-]+/gi)) add(dataAttributes, match[0], source);
  for (const match of text.matchAll(/dataset\.([A-Za-z][A-Za-z0-9]*)/g)) add(dataAttributes, `data-${kebab(match[1])}`, source);
}

const tokens = [...tokenUses.keys()].sort().map(name => ({
  name,
  kind: tokenDefinitions.has(name) ? 'defined token' : 'override hook (fallback-only)',
  sources: [...(tokenDefinitions.get(name)?.sources || tokenUses.get(name)?.sources || [])].sort()
}));
const classItems = [...classes.values()].sort((a,b) => a.name.localeCompare(b.name)).map(item => ({ name: item.name, sources: [...item.sources].sort() }));
const attrItems = [...dataAttributes.values()].sort((a,b) => a.name.localeCompare(b.name)).map(item => ({ name: item.name, sources: [...item.sources].sort(), details: [...item.details].sort() }));

const corePkg = JSON.parse(fs.readFileSync(path.join(root, 'packages/core/package.json'), 'utf8'));
const jsPkg = JSON.parse(fs.readFileSync(path.join(root, 'packages/js/package.json'), 'utf8'));
const packageExports = [
  ...Object.entries(corePkg.exports || {}).map(([name, target]) => ({ package: corePkg.name, name, target })),
  ...Object.entries(jsPkg.exports || {}).map(([name, target]) => ({ package: jsPkg.name, name, target }))
];

const jsApi = [];
for (const file of jsFiles) {
  const source = path.relative(root, file).replaceAll(path.sep, '/');
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/export\s+class\s+([A-Za-z_$][\w$]*)/g)) jsApi.push({ name: match[1], kind: 'class', source });
  for (const match of text.matchAll(/export\s+function\s+([A-Za-z_$][\w$]*)/g)) jsApi.push({ name: match[1], kind: 'function', source });
  for (const match of text.matchAll(/export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) jsApi.push({ name: match[1], kind: 'value', source });
  for (const match of text.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const raw of match[1].split(',')) {
      const name = raw.trim().split(/\s+as\s+/).at(-1);
      if (name) jsApi.push({ name, kind: 're-export', source });
    }
  }
}
const jsApiUnique = [...new Map(jsApi.map(item => [`${item.name}|${item.kind}`, item])).values()].sort((a,b) => a.name.localeCompare(b.name));

const sourceModules = cssFiles.map(file => {
  const source = relCore(file);
  return { source, documentation: sourceDocumentation[source] || null };
}).sort((a,b) => a.source.localeCompare(b.source));

const manifest = {
  version: corePkg.version,
  generatedAt: new Date().toISOString(),
  counts: {
    sourceModules: sourceModules.length,
    classes: classItems.length,
    tokens: tokens.length,
    definedTokens: tokens.filter(t => t.kind === 'defined token').length,
    overrideHooks: tokens.filter(t => t.kind !== 'defined token').length,
    dataAttributes: attrItems.length,
    packageExports: packageExports.length,
    jsApi: jsApiUnique.length
  },
  sourceModules,
  classes: classItems,
  tokens,
  dataAttributes: attrItems,
  packageExports,
  jsApi: jsApiUnique
};
fs.writeFileSync(path.join(docsDir, 'api-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const rows = (items, render) => items.map(render).join('\n');
const sourceLinks = sources => sources.map(source => `<code>${esc(source)}</code>`).join(' ');
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="color-scheme" content="light dark">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reeris UI API Reference ${esc(corePkg.version)}</title>
<link rel="stylesheet" href="../packages/core/src/reeris.css">
<link rel="stylesheet" href="assets/docs.css">
<script type="module" src="assets/docs.js"></script>
</head>
<body class="docs-body">
<header class="docs-topbar"><a class="docs-brand" href="index.html">Reeris UI</a><nav class="docs-topnav" aria-label="Documentation"><a href="index.html">Docs</a><a aria-current="page" href="api-reference.html">API</a></nav></header>
<main class="docs-shell">
<aside class="docs-sidebar" aria-label="API sections"><a href="#summary">Summary</a><a href="#modules">Modules</a><a href="#classes">Classes</a><a href="#tokens">Tokens</a><a href="#data-attributes">Data attributes</a><a href="#package-exports">Package exports</a><a href="#javascript">JavaScript</a></aside>
<article class="docs-content">
<section id="summary" class="docs-hero"><span class="badge primary">Generated reference</span><h1>Public API reference</h1><p>Machine-derived inventory for Reeris UI ${esc(corePkg.version)}. Public <code>--reeris-*</code> names, component classes, Reeris-owned data attributes and package/JavaScript exports are listed here so API drift becomes auditable.</p><div class="docs-stat-grid">${Object.entries(manifest.counts).map(([key,value]) => `<div class="docs-stat"><strong>${value}</strong><span>${esc(key.replace(/([A-Z])/g,' $1'))}</span></div>`).join('')}</div></section>
<section id="modules" class="docs-section"><h2>Source module → documentation contract</h2><p>Every Core source module must map to a maintained documentation page.</p><div class="table-responsive"><table class="table"><thead><tr><th>Source module</th><th>Documentation</th></tr></thead><tbody>${rows(sourceModules, item => `<tr><td><code>${esc(item.source)}</code></td><td>${item.documentation ? `<a href="${esc(item.documentation)}">${esc(item.documentation)}</a>` : '<span class="badge danger">Missing</span>'}</td></tr>`)}</tbody></table></div></section>
<section id="classes" class="docs-section"><div class="docs-section-head"><div><h2>Public class vocabulary</h2><p>Classes are contextual: a modifier such as <code>.primary</code> only has meaning where the owning component defines it.</p></div><label class="docs-search">Filter classes<input type="search" data-docs-filter="classes" placeholder="card, btn, primary…"></label></div><div class="table-responsive"><table class="table" data-docs-table="classes"><thead><tr><th>Class</th><th>Source</th></tr></thead><tbody>${rows(classItems, item => `<tr data-docs-row><td><code>.${esc(item.name)}</code></td><td>${sourceLinks(item.sources)}</td></tr>`)}</tbody></table></div></section>
<section id="tokens" class="docs-section"><div class="docs-section-head"><div><h2>Public CSS custom properties</h2><p>All <code>--reeris-*</code> names are public. “Override hook” means the variable is consumed with a fallback rather than declared globally, and can be set by an application at the relevant scope.</p></div><label class="docs-search">Filter tokens<input type="search" data-docs-filter="tokens" placeholder="color, space, button…"></label></div><div class="table-responsive"><table class="table" data-docs-table="tokens"><thead><tr><th>Token</th><th>Kind</th><th>Source</th></tr></thead><tbody>${rows(tokens, item => `<tr data-docs-row><td><code>${esc(item.name)}</code></td><td>${esc(item.kind)}</td><td>${sourceLinks(item.sources)}</td></tr>`)}</tbody></table></div></section>
<section id="data-attributes" class="docs-section"><h2>Reeris-owned data attributes</h2><p>Native attributes and ARIA remain preferred for native/semantic state. Reeris-specific state/configuration uses <code>data-reeris-*</code>.</p><div class="table-responsive"><table class="table"><thead><tr><th>Attribute</th><th>Known contract</th><th>Source</th></tr></thead><tbody>${rows(attrItems, item => `<tr><td><code>${esc(item.name)}</code></td><td>${item.details.length ? item.details.map(esc).join(', ') : 'configuration / state hook'}</td><td>${sourceLinks(item.sources)}</td></tr>`)}</tbody></table></div></section>
<section id="package-exports" class="docs-section"><h2>Package exports</h2><div class="table-responsive"><table class="table"><thead><tr><th>Package</th><th>Export</th><th>Target</th></tr></thead><tbody>${rows(packageExports, item => `<tr><td><code>${esc(item.package)}</code></td><td><code>${esc(item.name)}</code></td><td><code>${esc(item.target)}</code></td></tr>`)}</tbody></table></div></section>
<section id="javascript" class="docs-section"><h2>Optional JavaScript API</h2><p>JavaScript enhances Reeris but is not required by Core when the browser already provides the necessary behavior.</p><div class="table-responsive"><table class="table"><thead><tr><th>Name</th><th>Kind</th><th>Source</th></tr></thead><tbody>${rows(jsApiUnique, item => `<tr><td><code>${esc(item.name)}</code></td><td>${esc(item.kind)}</td><td><code>${esc(item.source)}</code></td></tr>`)}</tbody></table></div><h3>GlideNavigation instance contract</h3><p><code>new GlideNavigation(element, options)</code> exposes <code>moveTo(item, animate)</code>, <code>restore(animate)</code>, <code>refresh()</code>, and <code>destroy()</code>. The package-level helpers are <code>init(container)</code>, <code>destroy(container)</code>, and <code>getInstance(element)</code>.</p></section>
</article>
</main>
</body></html>`;
fs.writeFileSync(path.join(docsDir, 'api-reference.html'), html);

const navCards = documentationSections.map((section, index) => `<section class="docs-section" id="section-${index}" data-docs-directory-section><h2>${esc(section.title)}</h2><p>${esc(section.description)}</p><div class="docs-card-grid">${section.pages.map(([href,title,description]) => `<a class="docs-card" data-docs-directory-card href="${esc(href)}"><strong>${esc(title)}</strong><span>${esc(description)}</span></a>`).join('')}</div></section>`).join('\n');
const indexHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="color-scheme" content="light dark"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reeris UI Documentation ${esc(corePkg.version)}</title><link rel="stylesheet" href="../packages/core/src/reeris.css"><link rel="stylesheet" href="assets/docs.css"><script type="module" src="assets/docs.js"></script></head><body class="docs-body"><header class="docs-topbar"><a class="docs-brand" href="index.html">Reeris UI</a><nav class="docs-topnav" aria-label="Documentation"><a aria-current="page" href="index.html">Docs</a><a href="api-reference.html">API</a><a href="https://github.com/Eristavi/ReerisUI">GitHub</a></nav></header><main class="docs-home"><section class="docs-hero"><span class="badge primary">Reeris UI ${esc(corePkg.version)}</span><h1>Build with the native web.</h1><p>Accessible, adaptable UI built with HTML and CSS. Core needs no JavaScript or build step.</p><div class="l-cluster"><a class="btn primary" href="#get-started">Get started</a><a class="btn outline" href="#browse">Explore components</a><a class="btn outline" href="api-reference.html">API reference</a></div></section><section class="docs-section" id="get-started"><h2>Start in three steps</h2><div class="docs-steps"><div><strong>1. Add the stylesheet</strong><p>Download <a href="assets/reeris.css">the built CSS</a> from this site, or install <code>@reeris/core</code> when published.</p><pre><code>&lt;link rel="stylesheet" href="reeris.css"&gt;</code></pre></div><div><strong>2. Use semantic HTML</strong><p>Keep native controls and add Reeris classes where you need them.</p><pre><code>&lt;button class="btn primary"&gt;Continue&lt;/button&gt;</code></pre></div><div><strong>3. Explore examples</strong><p>Open a component page for patterns and accessibility guidance.</p><a href="button.html">See buttons →</a></div></div></section><section class="docs-section" id="browse"><h2>Find what you need</h2><p>Browse by topic or filter the pages below.</p><label class="docs-directory-search">Find a page<input type="search" data-docs-directory-search placeholder="Try forms, navigation, tables…" autocomplete="off" aria-controls="docs-directory" ></label><p data-docs-directory-empty hidden>No matching pages. Try a different term or browse the <a href="api-reference.html">API reference</a>.</p><div id="docs-directory">${navCards}</div></section><section class="docs-section"><h2>Release evidence</h2><p>Validation reports and the remaining RC gates are available in the <a href="release-candidate-readiness.html">release candidate guide</a>.</p></section></main></body></html>`;
fs.writeFileSync(path.join(docsDir, 'index.html'), indexHtml);

console.log(`Generated docs/api-manifest.json, docs/api-reference.html and docs/index.html for Reeris ${corePkg.version}.`);
console.log(`API inventory: ${classItems.length} classes, ${tokens.length} tokens (${manifest.counts.overrideHooks} fallback-only hooks), ${attrItems.length} data attributes, ${packageExports.length} package exports, ${jsApiUnique.length} JS exports.`);
