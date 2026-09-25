# Reeris UI 0.49 — Local Chromium RC Evidence

## Result

The local Chromium 144 evidence run passes **15/15** smoke/interaction checks and captures **14/14** canonical visual candidates without mobile-size document overflow failures. The run also verifies native switch keyboard toggling, native dialog Escape behavior, native disclosure keyboard behavior, optional glide initialization, forced-colors media emulation, and `prefers-contrast: more` media emulation.

## Environment boundary

The managed build environment allows Chromium to run through the Chrome DevTools Protocol but blocks browser navigation to localhost with `ERR_BLOCKED_BY_ADMINISTRATOR`. The runner therefore falls back to DevTools `Page.setDocumentContent`, injecting the exact compiled Reeris Core CSS and documentation CSS into the fixtures. This still exercises the actual Chromium rendering and interaction engine, but it is intentionally classified as **supplemental evidence**.

It does **not** satisfy the closing criteria for branded Google Chrome, Edge, Firefox, Safari, real iOS/iPadOS/Android devices, screen readers, real browser zoom/touch, Windows High Contrast, or human-approved visual baselines.

## Commands

```text
npm run rc:local:chromium
npm run audit:local-browser
npm run audit:evidence
npm run evidence:sync
```

Evidence artifacts live under `tests/release/evidence-artifacts/0.49.0/local-chromium/`, with SHA-256 hashes recorded in the machine-readable report and Release Lab records.
