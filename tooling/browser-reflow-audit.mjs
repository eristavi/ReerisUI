import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const coreSrc = path.join(root, 'packages/core/src');
const jsSrc = path.join(root, 'packages/js/src');
const docsDir = path.join(root, 'docs');
const reportsDir = path.join(root, 'reports');
fs.mkdirSync(reportsDir, { recursive: true });

function walk(dir, ext) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walk(p, ext));
    else if (!ext || p.endsWith(ext)) out.push(p);
  }
  return out;
}

const cssFiles = walk(coreSrc, '.css');
const css = cssFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const jsFiles = fs.existsSync(jsSrc) ? walk(jsSrc, '.js') : [];
const js = jsFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const htmlFiles = fs.readdirSync(docsDir).filter(n => n.endsWith('.html'));
const html = htmlFiles.map(n => fs.readFileSync(path.join(docsDir, n), 'utf8')).join('\n');

const source = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const button = source('packages/core/src/components/button.css');
const forms = source('packages/core/src/forms/forms.css');
const overlays = source('packages/core/src/components/overlays.css');
const nav = source('packages/core/src/components/navigation-extended.css');
const search = source('packages/core/src/components/search-command.css');
const identity = source('packages/core/src/components/identity.css');
const files = source('packages/core/src/components/files.css');
const tree = source('packages/core/src/components/tree.css');
const messaging = source('packages/core/src/components/messaging.css');
const appShell = source('packages/core/src/components/app-shell.css');
const tables = source('packages/core/src/components/tables.css');
const base = source('packages/core/src/core/base.css');
const reset = source('packages/core/src/core/reset.css');
const accessibility = source('packages/core/src/utilities/accessibility.css');
const glide = source('packages/js/src/glide-navigation.js');

const checks = [];
const add = (id, pass, detail, category = 'static') => checks.push({ id, category, pass: !!pass, detail });

// Keyboard/focus acceptance.
add('global-focus-visible', /:focus-visible\s*\{[^}]*outline:/s.test(base), 'Global :focus-visible indicator is present.', 'keyboard');
add('no-outline-suppression', !/outline\s*:\s*(?:0|none)/.test(css), 'Core CSS does not suppress focus outlines.', 'keyboard');
add('hover-card-focus-path', /\.hover-card:focus-within\s*>\s*\.hover-card-panel/.test(nav), 'Hover-card content opens for keyboard focus as well as pointer hover.', 'keyboard');
add('dropzone-focus-path', /\.dropzone:hover,\.dropzone:focus-within/.test(files), 'Drop-zone highlight has a focus-within path.', 'keyboard');
add('glide-follow-focus', /focusin/.test(glide) && /focusout/.test(glide) && /followFocus/.test(glide), 'Optional glide navigation follows keyboard focus.', 'keyboard');
add('glide-pointer-not-touch-only', /pointerover/.test(glide) && /pointerType === 'touch'/.test(glide), 'Glide pointer enhancement avoids relying on touch hover.', 'keyboard');
add('aria-disabled-not-pointer-blocked', !/\[aria-disabled="true"\][^}]*pointer-events\s*:\s*none/s.test(css), 'ARIA-disabled controls are not pointer-only disabled in CSS.', 'keyboard');
add('native-details-used', /<details\b/i.test(html) && /<summary\b/i.test(html), 'Documentation exercises native details/summary disclosure patterns.', 'keyboard');
add('native-dialog-used', /<dialog\b/i.test(html), 'Documentation exercises native dialog semantics.', 'keyboard');
add('no-inline-event-handlers', !/\son(?:click|keydown|keyup|keypress|mouseover|mouseenter|focus)\s*=/i.test(html), 'Documentation does not depend on inline event handlers.', 'keyboard');
add('no-div-button-pattern', !/<(?:div|span)\b[^>]*role\s*=\s*["'](?:button|link)["'][^>]*>/i.test(html), 'Documentation does not model generic div/span button or link roles.', 'keyboard');

// Reflow/zoom acceptance.
add('text-size-adjust', /-webkit-text-size-adjust:\s*100%/.test(reset), 'Browser text-size adjustment is not disabled.', 'reflow');
add('long-content-wrap', /overflow-wrap:\s*anywhere/.test(base), 'Long prose/table content has a global overflow-wrap safety net.', 'reflow');
add('button-wraps', /\.btn\)[^{]*\{[\s\S]*?overflow-wrap:\s*anywhere;[\s\S]*?white-space:\s*normal;/s.test(button), 'Buttons may grow and wrap long/translated labels.', 'reflow');
add('input-group-shrink-safe', /\.input-group\)[^{]*\{[^}]*min-inline-size:\s*0[^}]*max-inline-size:\s*100%/s.test(forms), 'Input groups can shrink inside narrow containers.', 'reflow');
add('input-addon-wraps', /\.input-addon\)[^{]*\{[^}]*overflow-wrap:\s*anywhere/s.test(forms) && !/\.input-addon\)[^{]*\{[^}]*white-space:\s*nowrap/s.test(forms), 'Input addons wrap instead of forcing horizontal overflow.', 'reflow');
add('dialog-viewport-safe', /--reeris-dialog-inline-size:\s*min\([^;]*100vi/.test(overlays), 'Dialog width is capped to the logical viewport.', 'reflow');
add('drawer-viewport-safe', /max-inline-size:\s*100vi/.test(overlays) && /block-size:\s*100dvb/.test(overlays), 'Drawers use logical/dynamic viewport constraints.', 'reflow');
add('mega-menu-viewport-safe', /mega-menu-panel[\s\S]*?100vi/s.test(nav), 'Mega-menu width is capped to the logical viewport.', 'reflow');
add('hover-card-viewport-safe', /hover-card-panel[\s\S]*?100vi/s.test(nav), 'Hover-card width is capped to the logical viewport.', 'reflow');
add('command-palette-viewport-safe', /command-palette\)[^{]*\{[^}]*100vi/s.test(search), 'Command palette width is capped to the logical viewport.', 'reflow');
add('identity-wraps', /identity-name\)[^{]*\{[^}]*overflow-wrap:\s*anywhere/s.test(identity) && /identity-meta\)[^{]*\{[^}]*overflow-wrap:\s*anywhere/s.test(identity), 'Identity text wraps instead of being permanently ellipsized.', 'reflow');
add('file-name-wraps', /file-name\)[^{]*\{[^}]*overflow-wrap:\s*anywhere/s.test(files), 'File names can wrap at narrow widths.', 'reflow');
add('tree-label-wraps', /tree-label\)[^{]*\{[^}]*overflow-wrap:\s*anywhere/s.test(tree), 'Tree labels can wrap at narrow widths.', 'reflow');
add('message-narrow-wrap', /@container\s*\(max-width:\s*38rem\)[\s\S]*message-sender[^}]*white-space:\s*normal/s.test(messaging), 'Inbox/message text unwraps in narrow containers.', 'reflow');
add('app-title-wraps', /app-topbar-title\)[^{]*\{[^}]*overflow-wrap:\s*anywhere/s.test(appShell), 'Application title can wrap rather than clip.', 'reflow');
add('table-horizontal-fallback', /\.table-wrap\)[^{]*\{[^}]*overflow:\s*auto/s.test(tables), 'Wide semantic tables have an explicit scrolling fallback.', 'reflow');
add('table-stack-mode', /\.table\.stack/.test(tables) && /@container/.test(tables), 'Tables provide an opt-in container-aware stacked presentation.', 'reflow');
add('no-100vw-in-core', !/\b100vw\b/.test(css), 'Core does not use physical 100vw sizing that can induce scrollbar overflow.', 'reflow');
add('no-100vh-in-core', !/\b100vh\b/.test(css), 'Core uses dynamic/logical viewport units rather than 100vh.', 'reflow');
add('no-root-overflow-hidden', !/(?:html|body)[^{]*\{[^}]*overflow(?:-x)?:\s*hidden/s.test(css), 'Core does not globally hide horizontal overflow.', 'reflow');
add('responsive-breakpoints-rem', !/@media\s*\([^)]*(?:min|max)-width:\s*\d+px/.test(css), 'Viewport breakpoints are not hard-coded in px.', 'reflow');
add('container-query-coverage', (css.match(/@container\s*\(/g) || []).length >= 15, 'Core contains broad container-query coverage for component reflow.', 'reflow');

// Intentional nowrap/overflow exceptions should remain narrowly scoped.
const nowrapLines = cssFiles.flatMap(f => fs.readFileSync(f, 'utf8').split('\n').map((line, i) => ({ file: path.relative(root, f), line: i + 1, text: line.trim() }))).filter(x => /white-space:\s*nowrap/.test(x.text));
const allowedNowrap = nowrapLines.filter(x =>
  x.file.endsWith('utilities/accessibility.css') ||
  x.file.endsWith('tables.css') ||
  /product-price|order-total|transaction-amount|money/.test(x.text) ||
  /app-sidebar-label/.test(x.text) ||
  (x.file.endsWith('messaging.css') && /message-sender|message-subject|message-preview|message-time/.test(x.text) && /@container\s*\(max-width:\s*38rem\)[\s\S]*white-space:\s*normal/.test(messaging))
);
add('nowrap-is-intentional', nowrapLines.length === allowedNowrap.length, `${nowrapLines.length} nowrap declarations found; ${allowedNowrap.length} match the intentional allowlist.`, 'reflow');

// Browser-matrix prerequisites.
add('logical-properties-present', /inline-size|padding-inline|margin-inline|inset-inline/.test(css), 'Logical properties are used for direction-independent layout.', 'browser');
add('progressive-support-guards', /@supports\s*\(/.test(css), 'Progressive browser features are protected with @supports.', 'browser');
add('forced-colors-present', /@media\s*\(forced-colors:\s*active\)/.test(css), 'Forced-colors adaptations are present.', 'browser');
add('reduced-motion-present', /@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(css), 'Reduced-motion adaptations are present.', 'browser');
add('touch-capability-query', /@media\s*\(hover:\s*none\)/.test(css), 'At least one touch/no-hover capability adaptation is present.', 'browser');
add('safe-area-support', /safe-area-inset/.test(css), 'Safe-area insets are exposed/used for mobile browser UI.', 'browser');
add('print-support', /@media\s+print/.test(css), 'Print fallback rules are present.', 'browser');

const failed = checks.filter(c => !c.pass);
const report = {
  version,
  generatedAt: new Date().toISOString(),
  scope: 'Static keyboard, browser-prerequisite, zoom/reflow acceptance audit for feature-frozen Reeris Core',
  environment: {
    chromiumDetected: (() => { try { return fs.existsSync('/usr/bin/chromium'); } catch { return false; } })(),
    runtimeNote: 'This audit is static. The build container Chromium process is not a substitute for the published desktop/mobile browser matrix; interactive verification remains a manual/release-lab gate.'
  },
  summary: { total: checks.length, passed: checks.length - failed.length, failed: failed.length, docsChecked: htmlFiles.length, cssFiles: cssFiles.length },
  nowrapDeclarations: nowrapLines,
  checks,
  manualGate: [
    'Keyboard-only traversal: Tab/Shift+Tab, Enter/Space, Escape, native details/dialog/popover behavior, visible focus, no focus traps outside modals.',
    'Zoom/reflow at 200% and 400% at a 1280 CSS-pixel desktop baseline and narrow mobile widths; verify no loss of content/functionality and no two-dimensional scrolling except data tables or intentionally scrollable regions.',
    'Safari macOS/iOS/iPadOS, Chrome/Edge/Firefox desktop, Chrome Android using the release-specific tested version matrix.',
    'Touch target and gesture review on physical/mobile emulation, including fixed bottom navigation and drawers.',
    'RTL plus long translated strings at 200%/400% zoom.',
    'Screen-reader pass for dynamic overlays, menus, validation, loading and transient feedback.'
  ]
};
fs.writeFileSync(path.join(reportsDir, `browser-reflow-audit-${version}.json`), JSON.stringify(report, null, 2) + '\n');
console.log(`Browser/reflow audit ${version}: ${report.summary.passed}/${report.summary.total} static checks passed; ${failed.length} failed.`);
if (failed.length) {
  for (const f of failed) console.error(`FAIL ${f.id}: ${f.detail}`);
  process.exitCode = 1;
}
