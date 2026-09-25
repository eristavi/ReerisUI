# Increased-contrast preference review

**Release:** Reeris UI 0.52.0

**Gate:** `forced-colors-high-contrast`

**Criterion:** `prefers-contrast-review`

**Evidence kind:** `forced-colors`

**Closing evidence template:** `tests/release/evidence-templates/forced-colors-high-contrast--prefers-contrast-review.json`

## Objective

Validate Reeris response to a real OS/browser increased-contrast preference where supported.

## Before you start

- Use an OS/browser combination that exposes `prefers-contrast: more` or document lack of support
- Enable the operating-system accessibility setting rather than only DevTools emulation

## Test fixtures

- `docs/foundation.html` — http://127.0.0.1:4173/docs/foundation.html
- `docs/forms-complete.html` — http://127.0.0.1:4173/docs/forms-complete.html
- `docs/navigation-completion.html` — http://127.0.0.1:4173/docs/navigation-completion.html
- `docs/content-states.html` — http://127.0.0.1:4173/docs/content-states.html

## Procedure

1. Enable the OS increased-contrast setting.
2. Confirm `matchMedia("(prefers-contrast: more)")` reports the expected state where supported.
3. Review borders, focus, text/surface separation, form states and feedback patterns.
4. Disable the setting and confirm the normal theme returns without stale state.

## Pass criteria

- [ ] Where the preference is supported, Reeris visibly strengthens appropriate contrast/boundaries without breaking layout.
- [ ] Where unsupported, the evidence explicitly records the platform limitation rather than claiming a pass from emulation alone.

## Required evidence artifacts

- [ ] Screenshot(s) with increased contrast enabled.
- [ ] Tester note recording OS setting, browser support and `matchMedia` result.

## Environment fields to record

- `osName`
- `osVersion`
- `browserName`
- `browserVersion`
- `preferenceSetting`
- `mediaQueryMatches`
- `tester`

## Closing the criterion

1. Complete the evidence template at `tests/release/evidence-templates/forced-colors-high-contrast--prefers-contrast-review.json`.
2. Copy supporting artifacts into a repository-relative evidence-artifact location and record their SHA-256 hashes.
3. Keep `review.status` as `pending` until an actual reviewer has examined the evidence.
4. Import the completed record with `node tooling/release-lab-evidence.mjs import <record.json>`.
5. Run `npm run audit:evidence`.
6. After deliberate approval, run `npm run evidence:sync` to derive gate status from approved evidence.

> Passing this checklist does not close the gate by itself. Release Lab closes a criterion only from valid, hashed, approved closing evidence.
