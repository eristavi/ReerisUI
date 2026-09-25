# Real-browser 400% zoom/reflow

**Release:** Reeris UI 0.52.0

**Gate:** `zoom-reflow-touch`

**Criterion:** `zoom-400-real`

**Evidence kind:** `zoom-reflow`

**Closing evidence template:** `tests/release/evidence-templates/zoom-reflow-touch--zoom-400-real.json`

## Objective

Validate Reeris at actual browser zoom 400%, not CSS transform or viewport emulation.

## Before you start

- Use a current supported desktop browser
- Set browser zoom using the browser UI/shortcut and verify the displayed zoom value
- Start from a normal desktop viewport such as 1280×720 CSS pixels before zooming

## Test fixtures

- `docs/browser-reflow.html` — http://127.0.0.1:4173/docs/browser-reflow.html
- `docs/forms-complete.html` — http://127.0.0.1:4173/docs/forms-complete.html
- `docs/navigation-completion.html` — http://127.0.0.1:4173/docs/navigation-completion.html
- `docs/tables.html` — http://127.0.0.1:4173/docs/tables.html
- `tests/i18n/index.html` — http://127.0.0.1:4173/tests/i18n/index.html
- `examples/starters/dashboard.html` — http://127.0.0.1:4173/examples/starters/dashboard.html

## Procedure

1. Set browser zoom to exactly 400%.
2. Open every listed fixture and move through the full page using keyboard and pointer.
3. Check headings, buttons, forms, app-shell navigation, tables and long translated strings for clipping or overlap.
4. Confirm content reflows into a single direction wherever WCAG reflow requires it; intentional two-dimensional table/data regions may scroll within their own container.
5. Confirm dialogs/top-layer UI remain reachable and dismissible.
6. Capture representative evidence at the browser-reported zoom level.

## Pass criteria

- [ ] No loss of information or controls caused by overlap/clipping.
- [ ] No page-level two-dimensional scrolling is required for ordinary content.
- [ ] Intentional data tables/regions contain their own overflow.
- [ ] Interactive controls remain operable and focus-visible.

## Required evidence artifacts

- [ ] Screenshot showing browser zoom indicator plus browser-reflow fixture.
- [ ] Additional screenshots for forms/navigation and a dense data/application fixture.
- [ ] Completed notes describing any intentional horizontal-scroll regions.

## Environment fields to record

- `browserName`
- `browserVersion`
- `osName`
- `osVersion`
- `zoomLevel`
- `viewport`
- `displayScale`
- `tester`

## Closing the criterion

1. Complete the evidence template at `tests/release/evidence-templates/zoom-reflow-touch--zoom-400-real.json`.
2. Copy supporting artifacts into a repository-relative evidence-artifact location and record their SHA-256 hashes.
3. Keep `review.status` as `pending` until an actual reviewer has examined the evidence.
4. Import the completed record with `node tooling/release-lab-evidence.mjs import <record.json>`.
5. Run `npm run audit:evidence`.
6. After deliberate approval, run `npm run evidence:sync` to derive gate status from approved evidence.

> Passing this checklist does not close the gate by itself. Release Lab closes a criterion only from valid, hashed, approved closing evidence.
