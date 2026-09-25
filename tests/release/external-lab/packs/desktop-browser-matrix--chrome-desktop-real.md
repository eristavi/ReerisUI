# Google Chrome — desktop

**Release:** Reeris UI 0.52.0

**Gate:** `desktop-browser-matrix`

**Criterion:** `chrome-desktop-real`

**Evidence kind:** `manual-browser`

**Closing evidence template:** `tests/release/evidence-templates/desktop-browser-matrix--chrome-desktop-real.json`

## Objective

Validate Reeris Core in current stable Google Chrome — desktop using the canonical release fixtures.

## Before you start

- A checkout of the exact Reeris release under test
- Run `node tooling/test-server.mjs` from the repository root
- Disable browser extensions that alter page rendering
- Record exact browser and OS versions before testing

## Test fixtures

- `docs/foundation.html` — http://127.0.0.1:4173/docs/foundation.html
- `docs/forms-complete.html` — http://127.0.0.1:4173/docs/forms-complete.html
- `docs/navigation-completion.html` — http://127.0.0.1:4173/docs/navigation-completion.html
- `docs/overlays.html` — http://127.0.0.1:4173/docs/overlays.html
- `docs/tables.html` — http://127.0.0.1:4173/docs/tables.html
- `docs/browser-reflow.html` — http://127.0.0.1:4173/docs/browser-reflow.html
- `tests/i18n/index.html` — http://127.0.0.1:4173/tests/i18n/index.html
- `examples/starters/dashboard.html` — http://127.0.0.1:4173/examples/starters/dashboard.html

## Procedure

1. Open every listed fixture through the Reeris test server, not from a stale cache.
2. Check the default system theme, then explicitly test light and dark theme overrides where the fixture exposes them.
3. Exercise links, buttons, native form controls, details/disclosure, dialog/popover flows and keyboard focus where present.
4. Resize the viewport from a normal desktop width down to approximately 320 CSS pixels and confirm the browser-reflow fixture has no page-level horizontal overflow.
5. Inspect the developer console for uncaught Reeris errors or missing local assets.
6. Review forms, tables, navigation, overlays, RTL content and the dashboard starter for clipping, inaccessible focus, broken native controls or unreadable text.

## Pass criteria

- [ ] All listed fixtures render without Reeris-caused layout breakage or missing assets.
- [ ] Representative interactions work with pointer and keyboard.
- [ ] No uncaught Reeris runtime errors occur.
- [ ] No unexpected page-level horizontal scrolling appears in the canonical reflow fixture.
- [ ] Light/dark and RTL presentations remain legible and structurally correct.

## Required evidence artifacts

- [ ] Completed tester notes including exact browser/OS version and result for every fixture.
- [ ] At least four screenshots: foundation, forms, overlays and RTL/reflow or dashboard.
- [ ] Console-error note or export showing whether uncaught Reeris errors occurred.

## Environment fields to record

- `browserName`
- `browserVersion`
- `osName`
- `osVersion`
- `deviceOrHardware`
- `viewport`
- `displayScale`
- `theme`
- `tester`

## Closing the criterion

1. Complete the evidence template at `tests/release/evidence-templates/desktop-browser-matrix--chrome-desktop-real.json`.
2. Copy supporting artifacts into a repository-relative evidence-artifact location and record their SHA-256 hashes.
3. Keep `review.status` as `pending` until an actual reviewer has examined the evidence.
4. Import the completed record with `node tooling/release-lab-evidence.mjs import <record.json>`.
5. Run `npm run audit:evidence`.
6. After deliberate approval, run `npm run evidence:sync` to derive gate status from approved evidence.

> Passing this checklist does not close the gate by itself. Release Lab closes a criterion only from valid, hashed, approved closing evidence.
