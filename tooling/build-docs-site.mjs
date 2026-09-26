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

for (const name of fs.readdirSync(docsOut)) {
  if (!name.endsWith('.html')) continue;
  const file = path.join(docsOut, name);
  let html = fs.readFileSync(file, 'utf8')
    .replaceAll('../packages/core/src/reeris.css', 'assets/reeris.css');
  if (name !== 'index.html' && name !== 'api-reference.html') {
    if (!html.includes('assets/docs.css')) html = html.replace('</head>', '<link rel="stylesheet" href="assets/docs.css"></head>');
    html = html.replace(/<body([^>]*)>/i, '<body$1><a class="docs-back-link" href="index.html">← Reeris docs</a>');
  }
  html = html.replaceAll('href="assets/docs.css"', `href="assets/docs.css?v=${revision}"`)
    .replaceAll('src="assets/docs.js"', `src="assets/docs.js?v=${revision}"`);
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
