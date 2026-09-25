# Repository and domain clearance decision

**Release:** Reeris UI 0.52.0

**Gate:** `public-name-namespace-clearance`

**Criterion:** `repository-domain-clearance`

**Evidence kind:** `name-clearance`

**Closing evidence template:** `tests/release/evidence-templates/public-name-namespace-clearance--repository-domain-clearance.json`

## Objective

Record the public repository/org/domain naming decision before launch.

## Before you start

- This is a documented project decision, not legal advice
- Record search date and sources consulted
- Preserve screenshots/exports/decision memo as evidence

## Test fixtures

- No Reeris browser fixture is required for this decision/clearance criterion.

## Procedure

1. Check intended repository organization/name and desired documentation/domain naming immediately before public launch.
2. Record availability, ownership and any conflicts.
3. Document the final repository URL/domain plan and any redirects/alternates.

## Pass criteria

- [ ] A dated repository/domain decision exists.
- [ ] Required repository namespace is available/owned or an alternate is selected.
- [ ] Public documentation will point to the approved canonical locations.

## Required evidence artifacts

- [ ] Repository/domain availability evidence.
- [ ] Decision memo naming canonical repository and domain/documentation locations.

## Environment fields to record

- `reviewDate`
- `reviewer`
- `repositoryHost`
- `repositoryName`
- `domain`
- `decision`

## Closing the criterion

1. Complete the evidence template at `tests/release/evidence-templates/public-name-namespace-clearance--repository-domain-clearance.json`.
2. Copy supporting artifacts into a repository-relative evidence-artifact location and record their SHA-256 hashes.
3. Keep `review.status` as `pending` until an actual reviewer has examined the evidence.
4. Import the completed record with `node tooling/release-lab-evidence.mjs import <record.json>`.
5. Run `npm run audit:evidence`.
6. After deliberate approval, run `npm run evidence:sync` to derive gate status from approved evidence.

> Passing this checklist does not close the gate by itself. Release Lab closes a criterion only from valid, hashed, approved closing evidence.
