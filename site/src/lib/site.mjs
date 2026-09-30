import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { addDemoCodeTabs } from '../../../tooling/demo-code-tabs.mjs';

export const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url));
const version = JSON.parse(fs.readFileSync(`${repositoryRoot}package.json`, 'utf8')).version;
export const revision = (process.env.GITHUB_SHA || version).slice(0, 12);
export const siteUrl = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export const assetUrl = path => `${siteUrl(path)}?v=${revision}`;

// Read only maintained repository content at build time. No runtime HTML fetching.
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map(([, key, double, single]) => [key, double ?? single]));
}

export function readDemo(relativePath, examples = true) {
  let html = fs.readFileSync(`${repositoryRoot}${relativePath}`, 'utf8');
  if (examples) html = addDemoCodeTabs(html, relativePath.split('/').at(-1));
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  let body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  if (head === undefined || body === undefined) throw new Error(`Invalid documentation document: ${relativePath}`);
  const title = head.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || 'Reeris UI';
  const extraHead = head
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*(?:charset|name=["'](?:viewport|color-scheme)["'])[^>]*>/gi, '')
    .replace(/<link\b[^>]*href=["'][^"']*(?:reeris\.css|assets\/docs\.css)[^"']*["'][^>]*>/gi, '')
    .replace(/<script\b[^>]*src=["'][^"']*assets\/(?:docs|theme-init)\.js[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '');
  // Astro owns the shared navigation; preserve the actual example headers.
  body = body.replace(/<header class="docs-topbar">[\s\S]*?<\/header>/, '');
  const main = body.match(/<main\b[^>]*>/i)?.[0];
  const mainId = main?.match(/\bid=["']([^"']+)["']/)?.[1] || 'docs-main';
  if (main && !/\bid=/.test(main)) body = body.replace(main, main.replace('<main', '<main id="docs-main"'));
  return {
    title,
    extraHead,
    body,
    mainId,
    htmlAttributes: attributes(html.match(/<html\b[^>]*>/i)?.[0] || ''),
    bodyAttributes: attributes(html.match(/<body\b[^>]*>/i)?.[0] || '')
  };
}

export function demoPages(directory) {
  return fs.readdirSync(`${repositoryRoot}${directory}`).filter(name => name.endsWith('.html')
    && (directory !== 'docs' || !['index.html', 'api-reference.html'].includes(name)));
}
