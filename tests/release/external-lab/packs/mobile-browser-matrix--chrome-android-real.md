# Chrome — real Android

**Release:** Reeris UI 0.52.0

**Gate:** `mobile-browser-matrix`

**Criterion:** `chrome-android-real`

**Evidence kind:** `manual-browser`

**Closing evidence template:** `tests/release/evidence-templates/mobile-browser-matrix--chrome-android-real.json`

## Objective

Validate Reeris on Chrome — real Android, including touch, safe areas and native form controls.

## Before you start

- Use a real current device or a trusted real-device cloud session
- Record exact device model, OS version and browser version
- Serve the exact Reeris release over HTTP/HTTPS
- Test both portrait and landscape when supported

## Test fixtures

- `docs/forms-complete.html` — http://127.0.0.1:4173/docs/forms-complete.html
- `docs/advanced-navigation.html` — http://127.0.0.1:4173/docs/advanced-navigation.html
- `docs/overlays.html` — http://127.0.0.1:4173/docs/overlays.html
- `docs/authentication.html` — http://127.0.0.1:4173/docs/authentication.html
- `docs/browser-reflow.html` — http://127.0.0.1:4173/docs/browser-reflow.html
- `tests/i18n/index.html` — http://127.0.0.1:4173/tests/i18n/index.html
- `examples/starters/dashboard.html` — http://127.0.0.1:4173/examples/starters/dashboard.html

## Procedure

1. Open every fixture and confirm the page honors the device safe area and does not create unexpected horizontal overflow.
2. Exercise native select, date/time, file and text inputs; open/close the virtual keyboard and confirm focused controls remain usable.
3. Exercise bottom/mobile navigation, dialog/drawer/disclosure controls and scrollable table/content regions.
4. Rotate between portrait and landscape and repeat representative interactions.
5. Verify touch interactions do not require hover and that visible controls can be activated without accidental neighboring activation.
6. Check RTL/i18n fixture, long strings and authentication/dashboard starters for clipping or inaccessible content.

## Pass criteria

- [ ] No Reeris-caused layout clipping or page-level overflow in canonical fixtures.
- [ ] Native controls remain usable with the platform keyboard/pickers.
- [ ] Safe-area-aware fixed UI does not collide with device insets.
- [ ] Touch interactions work without hover dependency.
- [ ] Portrait and landscape remain usable.

## Required evidence artifacts

- [ ] Completed device/browser notes.
- [ ] Portrait and landscape screenshots from at least three representative fixtures.
- [ ] Screenshot or short recording showing native form control/virtual-keyboard behavior.

## Environment fields to record

- `deviceModel`
- `osName`
- `osVersion`
- `browserName`
- `browserVersion`
- `orientation`
- `displayScale`
- `tester`
- `deviceCloudProvider`

## Closing the criterion

1. Complete the evidence template at `tests/release/evidence-templates/mobile-browser-matrix--chrome-android-real.json`.
2. Copy supporting artifacts into a repository-relative evidence-artifact location and record their SHA-256 hashes.
3. Keep `review.status` as `pending` until an actual reviewer has examined the evidence.
4. Import the completed record with `node tooling/release-lab-evidence.mjs import <record.json>`.
5. Run `npm run audit:evidence`.
6. After deliberate approval, run `npm run evidence:sync` to derive gate status from approved evidence.

> Passing this checklist does not close the gate by itself. Release Lab closes a criterion only from valid, hashed, approved closing evidence.
