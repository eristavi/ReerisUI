# Reeris UI 0.47 — RC Validation & CI Browser Matrix

## Purpose

0.47 turns the remaining 1.0 browser/manual gates into reproducible evidence workflows. It does **not** mark those gates complete merely because test infrastructure exists.

## Automated CI matrix

Playwright 1.63.0 is pinned as a development-only dependency. The CI workflow runs:

- Chromium on Linux
- Firefox on Linux
- WebKit on Linux
- Chromium with Pixel-class touch/mobile emulation
- WebKit with iPhone-class touch/mobile emulation
- Microsoft Edge on Windows when the Edge project is enabled

The browser suite exercises representative Foundation, Forms, Navigation, Overlay, Table, Reflow, i18n and Dashboard pages plus keyboard/disclosure/dialog/glide/reflow flows.

## Visual evidence

`npm run rc:visual:update` is an explicit, manual baseline-generation command. It is intentionally separate from ordinary release checks. Generated PNG candidates must be reviewed and committed/approved before the `visual-regression-baselines` gate can move from `open` to `passed`.

`npm run rc:visual:test` compares the canonical Chromium visual matrix against approved Playwright snapshots once those baselines exist.

## Evidence files

The custom Playwright reporter writes `reports/rc-browser-evidence-<version>.json`. The expected shape is documented by `tests/release/browser-evidence-schema.json`.

CI uploads the JSON evidence and Playwright failure traces/screenshots/videos as workflow artifacts.

## What remains manual

Playwright WebKit is useful cross-engine evidence, but it is not a substitute for real Safari. Mobile emulation is useful prerequisite coverage, but it is not a substitute for real iOS/iPadOS Safari or Android Chrome. Likewise, keyboard automation does not replace screen-reader review, and emulated viewport checks do not replace real 200%/400% browser zoom or Windows High Contrast validation.

Therefore all six existing 1.0 manual gates remain open in 0.47 until their required human/device evidence is attached and approved.
