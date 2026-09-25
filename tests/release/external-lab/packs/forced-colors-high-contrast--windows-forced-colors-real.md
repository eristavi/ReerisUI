# Windows forced-colors / High Contrast

**Release:** Reeris UI 0.52.0

**Gate:** `forced-colors-high-contrast`

**Criterion:** `windows-forced-colors-real`

**Evidence kind:** `forced-colors`

**Closing evidence template:** `tests/release/evidence-templates/forced-colors-high-contrast--windows-forced-colors-real.json`

## Objective

Validate Reeris with real Windows forced-colors/High Contrast enabled.

## Before you start

- Windows 11 or currently supported Windows release
- Current supported Edge, Chrome or Firefox
- Enable a Windows Contrast Theme / forced-colors mode at OS level

## Test fixtures

- `docs/foundation.html` — http://127.0.0.1:4173/docs/foundation.html
- `docs/forms-complete.html` — http://127.0.0.1:4173/docs/forms-complete.html
- `docs/navigation-completion.html` — http://127.0.0.1:4173/docs/navigation-completion.html
- `docs/overlays.html` — http://127.0.0.1:4173/docs/overlays.html
- `docs/tables.html` — http://127.0.0.1:4173/docs/tables.html
- `docs/content-states.html` — http://127.0.0.1:4173/docs/content-states.html
- `examples/starters/dashboard.html` — http://127.0.0.1:4173/examples/starters/dashboard.html

## Procedure

1. Enable a Windows contrast theme and restart/reload the browser if required.
2. Verify focus rings, borders, selected/current/checked states and validation errors remain visible.
3. Check buttons, links, form controls, dialogs, tables, status indicators and content states.
4. Confirm meaning is not carried solely by background color, shadow or transparency.
5. Exercise keyboard focus while forced colors are active.

## Pass criteria

- [ ] Important boundaries and focus indicators remain perceivable.
- [ ] Selected/checked/error/current states remain distinguishable.
- [ ] Text remains readable and system colors are respected.
- [ ] No essential meaning depends solely on suppressed color/shadow effects.

## Required evidence artifacts

- [ ] Screenshots from at least foundation, forms and dashboard while a Windows Contrast Theme is active.
- [ ] Completed notes naming the Windows contrast theme and browser.

## Environment fields to record

- `osName`
- `osVersion`
- `contrastTheme`
- `browserName`
- `browserVersion`
- `tester`

## Closing the criterion

1. Complete the evidence template at `tests/release/evidence-templates/forced-colors-high-contrast--windows-forced-colors-real.json`.
2. Copy supporting artifacts into a repository-relative evidence-artifact location and record their SHA-256 hashes.
3. Keep `review.status` as `pending` until an actual reviewer has examined the evidence.
4. Import the completed record with `node tooling/release-lab-evidence.mjs import <record.json>`.
5. Run `npm run audit:evidence`.
6. After deliberate approval, run `npm run evidence:sync` to derive gate status from approved evidence.

> Passing this checklist does not close the gate by itself. Release Lab closes a criterion only from valid, hashed, approved closing evidence.
