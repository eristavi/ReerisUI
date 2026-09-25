# Visual baseline comparison pass

**Release:** Reeris UI 0.52.0

**Gate:** `visual-regression-baselines`

**Criterion:** `baseline-compare-pass`

**Evidence kind:** `visual-review`

**Closing evidence template:** `tests/release/evidence-templates/visual-regression-baselines--baseline-compare-pass.json`

## Objective

Demonstrate that the current release matches the approved canonical visual baseline set within the defined comparison policy.

## Before you start

- An approved baseline set already exists
- Use the same supported comparison/capture environment or document accepted normalization

## Test fixtures

- `docs/visual-regression.html` — http://127.0.0.1:4173/docs/visual-regression.html

## Procedure

1. Run `npm run visual:compare` or `npm run rc:visual:test` against the approved baselines.
2. Review the comparison report and every non-zero diff.
3. Do not accept a changed baseline merely to make the comparison pass.
4. Store the machine-readable comparison result and representative diff artifacts if any.

## Pass criteria

- [ ] Comparison command exits successfully.
- [ ] No unexplained visual differences remain.
- [ ] Comparison evidence references the approved baseline set.

## Required evidence artifacts

- [ ] Machine-readable visual comparison report.
- [ ] Console/log export showing successful comparison.
- [ ] Diff images if the tool generated any, including disposition notes.

## Environment fields to record

- `captureBrowser`
- `browserVersion`
- `osName`
- `osVersion`
- `baselineId`
- `comparisonTool`
- `tester`

## Closing the criterion

1. Complete the evidence template at `tests/release/evidence-templates/visual-regression-baselines--baseline-compare-pass.json`.
2. Copy supporting artifacts into a repository-relative evidence-artifact location and record their SHA-256 hashes.
3. Keep `review.status` as `pending` until an actual reviewer has examined the evidence.
4. Import the completed record with `node tooling/release-lab-evidence.mjs import <record.json>`.
5. Run `npm run audit:evidence`.
6. After deliberate approval, run `npm run evidence:sync` to derive gate status from approved evidence.

> Passing this checklist does not close the gate by itself. Release Lab closes a criterion only from valid, hashed, approved closing evidence.
