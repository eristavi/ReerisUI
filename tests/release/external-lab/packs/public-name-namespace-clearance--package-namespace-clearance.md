# Package namespace clearance decision

**Release:** Reeris UI 0.52.0

**Gate:** `public-name-namespace-clearance`

**Criterion:** `package-namespace-clearance`

**Evidence kind:** `name-clearance`

**Closing evidence template:** `tests/release/evidence-templates/public-name-namespace-clearance--package-namespace-clearance.json`

## Objective

Confirm the public package scope/names that will be used for Reeris releases.

## Before you start

- This is a documented project decision, not legal advice
- Record search date and sources consulted
- Preserve screenshots/exports/decision memo as evidence

## Test fixtures

- No Reeris browser fixture is required for this decision/clearance criterion.

## Procedure

1. Check the intended npm scope and package names such as `@reeris/core` and `@reeris/js` immediately before publication.
2. Record ownership/availability or the chosen alternate scope.
3. Confirm package metadata and documentation use the approved namespace before publishing.

## Pass criteria

- [ ] A dated package-namespace decision exists.
- [ ] Intended package names are available/owned or an alternate namespace is selected.
- [ ] Repository metadata is aligned to the approved package namespace.

## Required evidence artifacts

- [ ] Package namespace availability/ownership evidence.
- [ ] Decision memo naming the final package scope and package names.

## Environment fields to record

- `registry`
- `reviewDate`
- `reviewer`
- `intendedScope`
- `decision`

## Closing the criterion

1. Complete the evidence template at `tests/release/evidence-templates/public-name-namespace-clearance--package-namespace-clearance.json`.
2. Copy supporting artifacts into a repository-relative evidence-artifact location and record their SHA-256 hashes.
3. Keep `review.status` as `pending` until an actual reviewer has examined the evidence.
4. Import the completed record with `node tooling/release-lab-evidence.mjs import <record.json>`.
5. Run `npm run audit:evidence`.
6. After deliberate approval, run `npm run evidence:sync` to derive gate status from approved evidence.

> Passing this checklist does not close the gate by itself. Release Lab closes a criterion only from valid, hashed, approved closing evidence.
