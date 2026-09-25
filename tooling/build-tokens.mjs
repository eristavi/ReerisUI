import { tokens } from '../tokens/foundation.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export async function buildTokens() {
  const out = new URL('../packages/core/src/tokens/generated.css', import.meta.url);
  const jsonOut = new URL('../packages/core/dist/tokens.json', import.meta.url);
  const jsOut = new URL('../packages/core/dist/tokens.js', import.meta.url);
  const lines = [];
  const publicGroupNames = {
    spacing: 'space',
    fluidSpacing: 'space-fluid',
    borderWidth: 'border',
    fontWeight: 'font-weight',
    fontSize: 'font-size',
    lineHeight: 'line-height'
  };

  for (const [group, values] of Object.entries(tokens)) {
    if (group === 'color') continue;
    for (const [key, value] of Object.entries(values)) {
      const name = publicGroupNames[group] ?? group.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
      lines.push(`  --reeris-${name}-${key}: ${value};`);
    }
  }
  for (const [name, shades] of Object.entries(tokens.color.palette)) {
    for (const [shade, value] of Object.entries(shades)) lines.push(`  --reeris-${name}-${shade}: ${value};`);
  }

  const css = `/* Generated from tokens/foundation.mjs. Do not edit directly. */\n@layer reeris.tokens {\n:root {\n${lines.join('\n')}\n}\n}\n`;
  await mkdir(new URL('../packages/core/dist/', import.meta.url), { recursive: true });
  await writeFile(out, css);
  await writeFile(jsonOut, `${JSON.stringify(tokens, null, 2)}\n`);
  await writeFile(jsOut, `export const tokens = ${JSON.stringify(tokens, null, 2)};\n`);
  console.log(`Generated ${lines.length} public token variables.`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) await buildTokens();
