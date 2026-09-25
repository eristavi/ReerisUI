/** Lightweight CSS selector scanner used by API/audit tooling.
 * It intentionally ignores at-rule preludes such as `@layer reeris.components`.
 */
export function extractClassNames(css) {
  const names = new Set();
  let buffer = '';
  let quote = null;
  let comment = false;

  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    const next = css[i + 1];

    if (comment) {
      if (ch === '*' && next === '/') { comment = false; i++; }
      continue;
    }
    if (quote) {
      if (ch === '\\') { i++; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && next === '*') { comment = true; i++; continue; }
    if (ch === '"' || ch === "'") { quote = ch; buffer += ' '; continue; }

    if (ch === '{') {
      const prelude = buffer.trim();
      if (prelude && !prelude.startsWith('@')) {
        for (const match of prelude.matchAll(/\.([a-z][a-z0-9-]*)/gi)) names.add(match[1]);
      }
      buffer = '';
      continue;
    }
    if (ch === '}' || ch === ';') { buffer = ''; continue; }
    buffer += ch;
  }
  return names;
}
