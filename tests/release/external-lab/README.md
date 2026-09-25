# Reeris UI 0.52.0 — External Release Lab

This kit converts every open Release Lab closure criterion into an executable field checklist. It does not change any gate status.

## Start the local fixture server

```text
node tooling/test-server.mjs
```

Then open `http://127.0.0.1:4173/docs/external-release-lab.html`.

## Test packs

- desktop-browser-matrix: 4
- mobile-browser-matrix: 3
- assistive-technology: 4
- zoom-reflow-touch: 3
- forced-colors-high-contrast: 2
- visual-regression-baselines: 2
- public-name-namespace-clearance: 3

Total: **21 criterion-specific packs**.

## Evidence workflow

1. Select exactly one criterion pack from `packs/`.
2. Execute the documented procedure on the required real browser/device/assistive technology or perform the required decision review.
3. Save screenshots, recordings, transcripts, logs or decision memos under a repository-relative evidence-artifact path.
4. Complete the matching JSON template under `tests/release/evidence-templates/`.
5. Hash every artifact and place the SHA-256 in the record.
6. Import the record with `node tooling/release-lab-evidence.mjs import <record.json>`.
7. Run `npm run audit:evidence`.
8. A named reviewer explicitly approves or rejects the record.
9. Run `npm run evidence:sync`; gate status is derived from approved evidence.

## Important boundary

Automated CI, local Chromium, WebKit emulation and mobile emulation can remain valuable supplemental evidence, but they cannot close a criterion that explicitly requires a real branded browser, real device, assistive technology, actual browser zoom, Windows High Contrast or human baseline approval.
