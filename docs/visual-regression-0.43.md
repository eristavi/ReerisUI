# Reeris UI 0.43 — Visual regression & documentation theme audit

## Scope

0.43 establishes the browser-specific visual-regression contract while keeping Reeris Core feature-frozen. It also corrects documentation pages that were forcing light mode at the document root.

## Native theme correction

Documentation and official starter pages now omit root `data-theme` by default and advertise `light dark` through the `color-scheme` metadata. Reeris Core's `:root { color-scheme: light dark; }` plus semantic `light-dark()` tokens therefore follows the browser/OS preference. Explicit `data-theme="light"` and `data-theme="dark"` remain supported application overrides, but are not the docs default.

The documentation audit rejects future root theme forcing and raw color literals in the shared docs chrome stylesheet.

## Visual matrix

The canonical case manifest covers:

- system, light and dark schemes
- compact, default and comfortable density
- LTR and RTL
- radius/elevation personality variants
- desktop and narrow/mobile viewports
- representative Dashboard, Data Management and Marketing starters

`docs/visual-regression.html` is the canonical component fixture.

## Baseline workflow

- `npm run audit:visual` validates the visual contract and docs theme behavior without requiring a browser.
- `npm run visual:capture` captures browser-rendered current images.
- `npm run visual:compare` compares current images to committed baselines using ImageMagick.
- `npm run visual:update` is the only command that promotes current screenshots to baselines.
- `npm run visual:test` captures and compares.

The current container's Chromium process is known to stall on unavailable system services/DBus, so 0.43 does not fabricate PNG baselines or claim a browser screenshot pass. Baselines must be captured in a functioning release-lab browser environment.

## Static acceptance result

The 0.43 static visual/docs-theme audit passes **153/153 checks** across **12 canonical visual cases** and **43 documentation/starter HTML pages**. The complete Core quality suite remains green; browser-rendered PNG comparison remains a release-lab gate until a functioning headless/browser environment is available.
