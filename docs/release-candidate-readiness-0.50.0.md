# Reeris UI 0.50.0 — Release Candidate Readiness

## Classification

**Ready for RC validation, not ready for 1.0 publication.**

Core remains feature-frozen and the normalized public API remains pinned to the RC freeze baseline. 0.50 does not add Core features; it prepares the external validation work required to close the remaining gates.

## External Release Lab

All **21 closing criteria** now have criterion-specific procedures under `tests/release/external-lab/packs/`, matching current-release evidence templates under `tests/release/evidence-templates/`.

The preparation audit requires one-to-one coverage of every criterion, valid evidence kinds, actionable procedures, explicit pass conditions, required artifact guidance, environment fields, current templates and valid local fixture paths.

## Current gate status

- External/manual gates: **7 total**
- Gates passed: **0**
- Gates still blocking 1.0: **6**
- Gate still blocking public publication: **1**
- Closing criteria passed: **0/21**
- Supplemental evidence records retained from earlier runs: **5**

This is intentional. Test preparation is not evidence completion.

## Commands

```text
npm run lab:prepare
node tooling/test-server.mjs
npm run audit:external-lab
npm run audit:evidence
npm run evidence:sync
npm run release:check
```

Open `http://127.0.0.1:4173/docs/external-release-lab.html` after starting the local test server.

## 1.0 boundary

Reeris 1.0 remains blocked until approved closing evidence exists for real desktop browsers, real mobile browsers, assistive technology, actual browser zoom/reflow/touch, real forced-colors/high-contrast behavior, and approved visual baselines. Public publication additionally requires the recorded naming/package/repository clearance decisions.
