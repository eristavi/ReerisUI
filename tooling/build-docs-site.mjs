import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, '.reeris-docs-site');
const docsOut = path.join(out, 'docs');
const revision = (process.env.GITHUB_SHA || JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version).slice(0, 12);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

fs.cpSync(path.join(root, 'docs'), docsOut, { recursive: true });

const builtCss = path.join(root, 'packages/core/dist/reeris.css');
if (!fs.existsSync(builtCss)) {
  throw new Error('packages/core/dist/reeris.css is missing. Run npm run build first.');
}

fs.copyFileSync(builtCss, path.join(docsOut, 'assets/reeris.css'));

const themeControl = '<label class="docs-theme-control" hidden>Theme <select data-docs-theme><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option><option value="glass">Glass</option></select></label>';
const demoMenu = `<nav class="docs-demo-topbar" aria-label="Demo menu"><a href="index.html">← Reeris docs</a>${themeControl}</nav>`;

for (const name of fs.readdirSync(docsOut)) {
  if (!name.endsWith('.html')) continue;
  const file = path.join(docsOut, name);
  let html = fs.readFileSync(file, 'utf8')
    .replaceAll('../packages/core/src/reeris.css', 'assets/reeris.css');
  if (!html.includes('assets/docs.css')) html = html.replace('</head>', '<link rel="stylesheet" href="assets/docs.css"></head>');
  if (!html.includes('assets/docs.js')) html = html.replace('</head>', '<script type="module" src="assets/docs.js"></script></head>');
  html = html.replace(/(<link\b[^>]*href="assets\/reeris\.css"[^>]*>)/, '<script src="assets/theme-init.js"></script>$1');
  if (html.includes('class="docs-topbar"')) {
    if (html.includes('class="docs-topnav"')) {
      html = html.replace(/(<header class="docs-topbar">[\s\S]*?<nav class="docs-topnav"[^>]*>[\s\S]*?)(<\/nav>)/, `$1${themeControl}$2`);
    } else {
      html = html.replace(/(<header class="docs-topbar">[\s\S]*?)(<\/header>)/, `$1${themeControl}$2`);
    }
  } else {
    html = html.replace(/<body([^>]*)>/i, `<body$1>${demoMenu}`);
  }
  html = html.replaceAll('href="assets/reeris.css"', `href="assets/reeris.css?v=${revision}"`)
    .replaceAll('href="assets/docs.css"', `href="assets/docs.css?v=${revision}"`)
    .replaceAll('src="assets/docs.js"', `src="assets/docs.js?v=${revision}"`)
    .replaceAll('src="assets/theme-init.js"', `src="assets/theme-init.js?v=${revision}"`);
  fs.writeFileSync(file, html);
}

if (fs.existsSync(path.join(root, 'examples'))) {
  fs.cpSync(path.join(root, 'examples'), path.join(out, 'examples'), { recursive: true });
}

fs.mkdirSync(path.join(out, 'packages/core/dist'), { recursive: true });
fs.copyFileSync(builtCss, path.join(out, 'packages/core/dist/reeris.css'));
fs.cpSync(path.join(root, 'packages/js/dist'), path.join(out, 'packages/js/dist'), { recursive: true });
for (const fixture of ['i18n', 'themes']) {
  fs.cpSync(path.join(root, 'tests', fixture), path.join(out, 'tests', fixture), { recursive: true });
}

const redirect = '<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=docs/index.html"><title>Reeris UI Docs</title></head><body><a href="docs/index.html">Open Reeris UI documentation</a></body></html>\n';
fs.writeFileSync(path.join(out, 'index.html'), redirect);

console.log('Built self-contained docs site at .reeris-docs-site/');
