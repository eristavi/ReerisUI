import fs from 'node:fs';
import path from 'node:path';

const docsDir = path.resolve('docs');
const htmlFiles = fs.readdirSync(docsDir).filter(name => name.endsWith('.html'));
const failures = [];

for (const name of htmlFiles) {
  const file = path.join(docsDir, name);
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('../packages/core/dist/reeris.css')) {
    failures.push(`${name}: committed docs must not depend on generated dist CSS`);
  }
  if (!html.includes('../packages/core/src/reeris.css')) {
    failures.push(`${name}: missing canonical source CSS entrypoint`);
  }
}

const generator = fs.readFileSync('tooling/generate-api-reference.mjs', 'utf8');
if (generator.includes('../packages/core/dist/reeris.css')) {
  failures.push('generate-api-reference.mjs still emits dist CSS links');
}
if (!generator.includes('../packages/core/src/reeris.css')) {
  failures.push('generate-api-reference.mjs does not emit source CSS links');
}

const siteBuilder = fs.readFileSync('tooling/build-docs-site.mjs', 'utf8');
for (const required of [
  'packages/core/dist/reeris.css',
  "path.join(docsOut, 'assets/reeris.css')",
  "replaceAll('../packages/core/src/reeris.css', 'assets/reeris.css')"
]) {
  if (!siteBuilder.includes(required)) failures.push(`build-docs-site.mjs missing contract: ${required}`);
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Docs CSS architecture audit passed for ${htmlFiles.length} HTML pages.`);
}
