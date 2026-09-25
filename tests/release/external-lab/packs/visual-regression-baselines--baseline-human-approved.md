# Human-approved canonical visual baseline

**Release:** Reeris UI 0.52.0

**Gate:** `visual-regression-baselines`

**Criterion:** `baseline-human-approved`

**Evidence kind:** `visual-review`

**Closing evidence template:** `tests/release/evidence-templates/visual-regression-baselines--baseline-human-approved.json`

## Objective

Create and explicitly approve the canonical Reeris PNG baseline set after human visual review.

## Before you start

- Run in an approved browser/CI environment capable of stable screenshot capture
- Use the canonical visual matrix from the current release
- Do not update baselines as part of the normal compare command

## Test fixtures

- `docs/visual-regression.html` — http://127.0.0.1:4173/docs/visual-regression.html
- `examples/starters/dashboard.html` — http://127.0.0.1:4173/examples/starters/dashboard.html
- `examples/starters/data-management.html` — http://127.0.0.1:4173/examples/starters/data-management.html
- `examples/starters/marketing.html` — http://127.0.0.1:4173/examples/starters/marketing.html
- `tests/i18n/index.html` — http://127.0.0.1:4173/tests/i18n/index.html

## Procedure

1. Run `npm run visual:capture` or the approved Playwright visual capture in a stable environment.
2. Review every canonical case for theme, density, RTL, radius/elevation, mobile/desktop and starter composition correctness.
3. Reject and fix any unexplained visual anomaly before approval.
4. Record the baseline file manifest and hashes.
5. Have a named reviewer explicitly approve the set.

## Pass criteria

- [ ] Every canonical visual case has a PNG baseline.
- [ ] Human review finds no unexplained regression or fixture error.
- [ ] The approved baseline manifest is hashed and tied to the current release.

## Required evidence artifacts

- [ ] Approved baseline directory or archive.
- [ ] Baseline manifest with SHA-256 hashes.
- [ ] Reviewer approval notes identifying reviewer and date.

## Environment fields to record

- `captureBrowser`
- `browserVersion`
- `osName`
- `osVersion`
- `viewportMatrix`
- `reviewer`

## Closing the criterion

1. Complete the evidence template at `tests/release/evidence-templates/visual-regression-baselines--baseline-human-approved.json`.
2. Copy supporting artifacts into a repository-relative evidence-artifact location and record their SHA-256 hashes.
3. Keep `review.status` as `pending` until an actual reviewer has examined the evidence.
4. Import the completed record with `node tooling/release-lab-evidence.mjs import <record.json>`.
5. Run `npm run audit:evidence`.
6. After deliberate approval, run `npm run evidence:sync` to derive gate status from approved evidence.

> Passing this checklist does not close the gate by itself. Release Lab closes a criterion only from valid, hashed, approved closing evidence.
