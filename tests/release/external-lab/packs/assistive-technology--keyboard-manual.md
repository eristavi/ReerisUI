# Manual keyboard-only acceptance

**Release:** Reeris UI 0.52.0

**Gate:** `assistive-technology`

**Criterion:** `keyboard-manual`

**Evidence kind:** `assistive-technology`

**Closing evidence template:** `tests/release/evidence-templates/assistive-technology--keyboard-manual.json`

## Objective

Confirm representative Reeris interactions are fully operable without a pointer.

## Before you start

- Use a desktop browser from the supported matrix
- Do not use mouse/touch during the test
- Enable visible browser focus indicators normally

## Test fixtures

- `docs/forms-complete.html` — http://127.0.0.1:4173/docs/forms-complete.html
- `docs/navigation-completion.html` — http://127.0.0.1:4173/docs/navigation-completion.html
- `docs/overlays.html` — http://127.0.0.1:4173/docs/overlays.html
- `docs/tables.html` — http://127.0.0.1:4173/docs/tables.html
- `docs/toast.html` — http://127.0.0.1:4173/docs/toast.html
- `docs/browser-reflow.html` — http://127.0.0.1:4173/docs/browser-reflow.html

## Procedure

1. Starting at the address bar, use Tab and Shift+Tab through each fixture and verify a visible focus indicator.
2. Use Enter/Space on buttons, links, checkboxes, switches, details and other native controls as appropriate.
3. Open and close dialogs/popovers/disclosures; verify Escape closes modal/top-layer UI where expected and focus returns logically.
4. Verify keyboard focus does not become trapped except while a modal interaction legitimately owns focus.
5. Check disabled/read-only states cannot be accidentally activated and remain understandable.
6. Record any component requiring a pointer-only interaction.

## Pass criteria

- [ ] Every interactive control is reachable or intentionally not focusable.
- [ ] A visible focus indicator is present.
- [ ] Native activation keys work as expected.
- [ ] No unintended keyboard trap occurs.
- [ ] Dialogs/disclosures preserve logical focus behavior.

## Required evidence artifacts

- [ ] Completed keyboard checklist with pass/fail by fixture.
- [ ] Screenshots of representative focus-visible states and any exceptions.

## Environment fields to record

- `browserName`
- `browserVersion`
- `osName`
- `osVersion`
- `keyboardLayout`
- `tester`

## Closing the criterion

1. Complete the evidence template at `tests/release/evidence-templates/assistive-technology--keyboard-manual.json`.
2. Copy supporting artifacts into a repository-relative evidence-artifact location and record their SHA-256 hashes.
3. Keep `review.status` as `pending` until an actual reviewer has examined the evidence.
4. Import the completed record with `node tooling/release-lab-evidence.mjs import <record.json>`.
5. Run `npm run audit:evidence`.
6. After deliberate approval, run `npm run evidence:sync` to derive gate status from approved evidence.

> Passing this checklist does not close the gate by itself. Release Lab closes a criterion only from valid, hashed, approved closing evidence.
