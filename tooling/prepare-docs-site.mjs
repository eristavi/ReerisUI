import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, '.reeris-docs-public');
const docsOut = path.join(publicDir, 'docs');
const builtCss = path.join(root, 'packages/core/dist/reeris.css');
if (!fs.existsSync(builtCss)) throw new Error('Run npm run build before preparing Astro documentation assets.');
fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(docsOut, { recursive: true });

// Astro renders HTML routes. Copy downloads, scripts and media as static assets.
for (const name of fs.readdirSync('docs')) {
  if (name.endsWith('.html')) continue;
  fs.cpSync(path.join(root, 'docs', name), path.join(docsOut, name), { recursive: true });
}
fs.copyFileSync(builtCss, path.join(docsOut, 'assets/reeris.css'));
for (const directory of ['packages/core/dist', 'packages/core/src', 'packages/js/dist', 'tests/i18n', 'tests/themes']) {
  fs.cpSync(path.join(root, directory), path.join(publicDir, directory), { recursive: true });
}
fs.writeFileSync(path.join(publicDir, '.nojekyll'), '');
console.log('Prepared production CSS, documentation assets and validation fixtures for Astro.');
