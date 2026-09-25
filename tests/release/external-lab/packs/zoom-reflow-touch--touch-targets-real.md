# Real-device touch-target acceptance

**Release:** Reeris UI 0.52.0

**Gate:** `zoom-reflow-touch`

**Criterion:** `touch-targets-real`

**Evidence kind:** `zoom-reflow`

**Closing evidence template:** `tests/release/evidence-templates/zoom-reflow-touch--touch-targets-real.json`

## Objective

Confirm Reeris target sizing and pointer behavior on coarse-pointer hardware.

## Before you start

- Real touch hardware or trusted real-device cloud
- Do not rely solely on browser touch emulation
- Record device model and OS/browser versions

## Test fixtures

- `docs/button.html` — http://127.0.0.1:4173/docs/button.html
- `docs/forms-complete.html` — http://127.0.0.1:4173/docs/forms-complete.html
- `docs/advanced-navigation.html` — http://127.0.0.1:4173/docs/advanced-navigation.html
- `docs/overlays.html` — http://127.0.0.1:4173/docs/overlays.html
- `docs/choice.html` — http://127.0.0.1:4173/docs/choice.html
- `examples/starters/dashboard.html` — http://127.0.0.1:4173/examples/starters/dashboard.html

## Procedure

1. Use touch only to activate representative buttons, icon buttons, checkboxes, switches, navigation, disclosures, close controls and selectable choices.
2. Check compact-density examples as well as default density.
3. Attempt adjacent controls deliberately and confirm target separation does not cause frequent wrong-target activation.
4. Verify hover-only information is not required to complete an action.
5. Check fixed/bottom navigation near device safe areas.

## Pass criteria

- [ ] Critical controls meet the Reeris minimum-target contract or have equivalent target spacing.
- [ ] No required interaction depends on hover.
- [ ] Adjacent targets are practically distinguishable on real hardware.
- [ ] Safe-area-fixed controls remain reachable.

## Required evidence artifacts

- [ ] Device/browser notes.
- [ ] Screenshots or short recording of compact/default touch controls and fixed navigation.

## Environment fields to record

- `deviceModel`
- `osName`
- `osVersion`
- `browserName`
- `browserVersion`
- `pointerType`
- `tester`

## Closing the criterion

1. Complete the evidence template at `tests/release/evidence-templates/zoom-reflow-touch--touch-targets-real.json`.
2. Copy supporting artifacts into a repository-relative evidence-artifact location and record their SHA-256 hashes.
3. Keep `review.status` as `pending` until an actual reviewer has examined the evidence.
4. Import the completed record with `node tooling/release-lab-evidence.mjs import <record.json>`.
5. Run `npm run audit:evidence`.
6. After deliberate approval, run `npm run evidence:sync` to derive gate status from approved evidence.

> Passing this checklist does not close the gate by itself. Release Lab closes a criterion only from valid, hashed, approved closing evidence.
