// Expand opted-in documentation examples during the static site build.
// The preview stays usable in the source HTML, including without JavaScript.
const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function formatSnippet(markup) {
  if (markup.includes('\n')) return markup;
  let depth = 0;
  return markup.replaceAll('><', '>\n<').split('\n').map((line) => {
    const tag = line.match(/^<(\/)?([a-z][\w-]*)\b/i);
    if (tag?.[1]) depth = Math.max(0, depth - 1);
    const formatted = '  '.repeat(depth) + line;
    if (tag && !tag[1] && !voidTags.has(tag[2].toLowerCase()) && !line.startsWith('<!')
      && !/\/>$/.test(line) && !line.includes(`</${tag[2]}>`)) depth++;
    return formatted;
  }).join('\n');
}

function sectionEnd(html, start) {
  let depth = 0;
  for (const match of html.slice(start).matchAll(/<\/?section\b[^>]*>/gi)) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return start + match.index + match[0].length;
  }
  throw new Error(`Unclosed example section at character ${start}`);
}

export function addDemoCodeTabs(html, page) {
  const openings = [...html.matchAll(/<section\b(?=[^>]*\bdata-docs-example\b)[^>]*>/gi)];
  for (let index = openings.length - 1; index >= 0; index--) {
    const opening = openings[index];
    const start = opening.index;
    const end = sectionEnd(html, start);
    const section = html.slice(start, end);
    const head = section.slice(0, opening[0].length);
    const inner = section.slice(head.length, -'</section>'.length);
    const heading = inner.match(/^(\s*<h2\b[^>]*>[\s\S]*?<\/h2>)([\s\S]*)$/i);
    if (!heading) throw new Error(`${page}: example section must start with an h2`);
    const title = heading[1].replace(/<[^>]+>/g, '').trim();
    const preview = heading[2].trim();
    if (!preview) throw new Error(`${page}: ${title} has no example markup`);
    const id = `docs-example-${page.replace(/\.html$/, '')}-${index + 1}`;
    const source = escapeHtml(formatSnippet(preview));
    const tabs = `<fieldset class="tabs radio-tabs docs-example-tabs"><legend class="sr-only">${escapeHtml(title)} example views</legend>`
      + `<input class="radio-tab-input" type="radio" name="${id}" id="${id}-preview" checked><label class="tab" for="${id}-preview">Preview</label><div class="radio-tab-panel docs-example-preview">${preview}</div>`
      + `<input class="radio-tab-input" type="radio" name="${id}" id="${id}-html"><label class="tab" for="${id}-html">HTML</label><div class="radio-tab-panel docs-example-code"><pre><code>${source}</code></pre></div>`
      + '</fieldset>';
    html = html.slice(0, start) + head.replace(/\sdata-docs-example(?:="[^"]*")?/, '') + heading[1] + tabs + '</section>' + html.slice(end);
  }
  return html;
}
