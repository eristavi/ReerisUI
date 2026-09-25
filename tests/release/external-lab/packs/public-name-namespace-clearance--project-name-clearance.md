# Reeris UI project-name clearance decision

**Release:** Reeris UI 0.52.0

**Gate:** `public-name-namespace-clearance`

**Criterion:** `project-name-clearance`

**Evidence kind:** `name-clearance`

**Closing evidence template:** `tests/release/evidence-templates/public-name-namespace-clearance--project-name-clearance.json`

## Objective

Record the final project-name/trademark/conflict decision before public launch.

## Before you start

- This is a documented project decision, not legal advice
- Record search date and sources consulted
- Preserve screenshots/exports/decision memo as evidence

## Test fixtures

- No Reeris browser fixture is required for this decision/clearance criterion.

## Procedure

1. Search relevant trademark databases and major software/open-source repositories for confusingly similar Reeris/Reeris UI names.
2. Record material conflicts, jurisdictions/markets considered and whether specialist legal review is required.
3. Make and document the final use/rename/qualified-name decision.

## Pass criteria

- [ ] A dated decision memo exists.
- [ ] Material conflicts and uncertainty are disclosed rather than omitted.
- [ ] The final launch name decision is explicit.

## Required evidence artifacts

- [ ] Name-clearance decision memo.
- [ ] Search screenshots/exports or counsel note where applicable.

## Environment fields to record

- `reviewDate`
- `reviewer`
- `jurisdictionsOrMarkets`
- `sourcesConsulted`
- `decision`

## Closing the criterion

1. Complete the evidence template at `tests/release/evidence-templates/public-name-namespace-clearance--project-name-clearance.json`.
2. Copy supporting artifacts into a repository-relative evidence-artifact location and record their SHA-256 hashes.
3. Keep `review.status` as `pending` until an actual reviewer has examined the evidence.
4. Import the completed record with `node tooling/release-lab-evidence.mjs import <record.json>`.
5. Run `npm run audit:evidence`.
6. After deliberate approval, run `npm run evidence:sync` to derive gate status from approved evidence.

> Passing this checklist does not close the gate by itself. Release Lab closes a criterion only from valid, hashed, approved closing evidence.
