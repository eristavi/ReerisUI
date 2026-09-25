# Reeris UI 0.47 — Release Candidate Validation Readiness

## Status

Reeris Core remains feature-frozen and its public API still matches the 0.46 RC freeze baseline. Reeris 0.47 adds reproducible browser-matrix and visual-baseline infrastructure without falsely closing device/manual evidence gates.

Current classification: **ready for RC validation infrastructure / not yet ready for 1.0**.

## Automated RC browser coverage

The Playwright matrix is pinned to `@playwright/test` 1.63.0 and provides projects for:

- Chromium on Linux
- Firefox on Linux
- WebKit on Linux
- Pixel-class Chromium mobile/touch emulation
- iPhone-class WebKit mobile/touch emulation
- Microsoft Edge on Windows when `REVA_INCLUDE_EDGE=1`

Representative browser flows cover Foundation, Forms, Navigation, Overlays, Tables, Browser/Reflow, i18n, and the Dashboard starter. Interaction flows exercise keyboard focus, native switches, dialogs, disclosure, glide navigation, and narrow-viewport overflow.

## Visual baselines

Playwright screenshot assertions consume the canonical `tests/visual/cases.json` matrix.

- Generate candidate baselines: `npm run rc:visual:update`
- Compare approved baselines: `npm run rc:visual:test`

Baseline generation remains manual and reviewable. No screenshot is automatically approved by `release:check`.

## Evidence

- Browser infrastructure audit: `reports/rc-browser-infrastructure-audit-0.47.0.json`
- Browser-run evidence schema: `tests/release/browser-evidence-schema.json`
- Browser-run evidence output when executed: `reports/rc-browser-evidence-0.47.0.json`
- CI workflow: `.github/workflows/rc-browser-matrix.yml`
- API freeze: `tests/release/public-api-freeze.json`
- Manual gates: `tests/release/manual-gates.json`

## Open 1.0 gates

The following remain open even though automation now helps generate evidence:

1. Current desktop Chrome/Edge/Firefox/Safari release-lab matrix.
2. Real iOS/iPadOS Safari and Android Chrome device matrix.
3. Keyboard plus representative screen-reader review.
4. Real 200%/400% zoom, reflow, coarse-pointer and touch review.
5. Windows forced-colors/high-contrast review.
6. Human-approved visual-regression PNG baselines and a passing comparison run.

The separate public naming/package/repository clearance gate remains open before public publication.

## Important boundary

Playwright WebKit is cross-engine evidence, **not proof that Safari passed**. Device emulation is layout/touch prerequisite evidence, **not proof that real mobile browsers passed**. Automated keyboard flows do not replace screen-reader review.
