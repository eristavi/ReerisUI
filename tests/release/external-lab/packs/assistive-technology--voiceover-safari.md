# VoiceOver + Safari acceptance

**Release:** Reeris UI 0.52.0

**Gate:** `assistive-technology`

**Criterion:** `voiceover-safari`

**Evidence kind:** `assistive-technology`

**Closing evidence template:** `tests/release/evidence-templates/assistive-technology--voiceover-safari.json`

## Objective

Validate representative Reeris semantics with VoiceOver and Safari on macOS or iOS.

## Before you start

- Current VoiceOver/Safari combination on supported Apple OS
- Record whether macOS or iOS is used
- Use standard VoiceOver navigation unless a deviation is documented

## Test fixtures

- `docs/forms-complete.html` — http://127.0.0.1:4173/docs/forms-complete.html
- `docs/navigation-completion.html` — http://127.0.0.1:4173/docs/navigation-completion.html
- `docs/overlays.html` — http://127.0.0.1:4173/docs/overlays.html
- `docs/tables.html` — http://127.0.0.1:4173/docs/tables.html
- `docs/toast.html` — http://127.0.0.1:4173/docs/toast.html
- `docs/content-states.html` — http://127.0.0.1:4173/docs/content-states.html
- `examples/starters/dashboard.html` — http://127.0.0.1:4173/examples/starters/dashboard.html

## Procedure

1. Navigate by landmarks/headings and confirm page structure is announced coherently.
2. Review form labels, required/invalid states, help/error text and checkbox/switch state announcements.
3. Open dialog/disclosure/navigation examples and confirm role, name, state and focus changes are announced.
4. Review table headers/row relationships and selected/sort state where present.
5. Trigger or inspect status/alert/toast examples and confirm dynamic feedback uses appropriate live-region behavior without duplicate announcement.
6. Check disabled/read-only and current/selected navigation states.

## Pass criteria

- [ ] Controls expose meaningful accessible names, roles and states.
- [ ] Focus and reading order match the visual/DOM structure.
- [ ] Dialog/disclosure state changes are announced and operable.
- [ ] Forms and tables convey required semantics.
- [ ] Dynamic feedback is understandable without visual-only cues.

## Required evidence artifacts

- [ ] Completed screen-reader notes including exact speech/browser combination.
- [ ] Short transcript or recording for representative forms, dialog and dynamic feedback flows.
- [ ] Screenshots identifying the tested fixtures/states.

## Environment fields to record

- `screenReader`
- `browserName`
- `browserVersion`
- `osName`
- `osVersion`
- `deviceModel`
- `tester`

## Closing the criterion

1. Complete the evidence template at `tests/release/evidence-templates/assistive-technology--voiceover-safari.json`.
2. Copy supporting artifacts into a repository-relative evidence-artifact location and record their SHA-256 hashes.
3. Keep `review.status` as `pending` until an actual reviewer has examined the evidence.
4. Import the completed record with `node tooling/release-lab-evidence.mjs import <record.json>`.
5. Run `npm run audit:evidence`.
6. After deliberate approval, run `npm run evidence:sync` to derive gate status from approved evidence.

> Passing this checklist does not close the gate by itself. Release Lab closes a criterion only from valid, hashed, approved closing evidence.
