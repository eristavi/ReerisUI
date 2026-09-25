# Reeris UI 0.48 — Release Lab Evidence & Gate Closure

## Purpose

0.48 turns the remaining manual/external release gates into an auditable evidence ledger. Gate state is derived from approved evidence rather than manually asserted.

## Closure criteria

The seven gates are decomposed into 21 required criteria:

- Desktop browsers: real/current Chrome, Edge, Firefox, Safari.
- Mobile browsers: real/current iOS Safari, iPadOS Safari, Android Chrome.
- Assistive technology: manual keyboard review, NVDA, VoiceOver/Safari, TalkBack/Chrome.
- Zoom/reflow/touch: real 200% zoom, real 400% zoom, real coarse-pointer/touch-target review.
- Contrast: Windows forced colors/high contrast and `prefers-contrast` review.
- Visual regression: human-approved baseline set and a passing baseline comparison.
- Public launch: project-name, package-namespace, and repository/domain clearance decisions.

## Evidence rules

A gate-closing record must be valid for the criterion, have a passing outcome, include SHA-256-verified supporting artifacts, and have an explicit approved review. Ordinary test evidence must target the current release; public naming clearance can persist across versions.

Supplemental automation such as Playwright WebKit or mobile emulation is kept as evidence but cannot close real Safari/device/manual criteria.

## Commands

```text
npm run evidence:templates
npm run audit:evidence
npm run evidence:sync
node tooling/release-lab-evidence.mjs import <record.json>
node tooling/release-lab-evidence.mjs import-browser --latest
```

`audit:evidence` is read-only. `evidence:sync` is the explicit reconciliation command.

## Current result

0.48 ships the evidence infrastructure with all seven external/manual gates still open. No release gate is claimed as passed without real approved evidence.
