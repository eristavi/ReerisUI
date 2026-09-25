# Reeris UI 0.50 — External Release Lab Test Packs

## Purpose

0.50 converts all 21 remaining Release Lab closure criteria into criterion-specific field procedures. Each procedure identifies the exact environment, Reeris fixtures, execution steps, pass conditions, evidence artifacts and environment metadata required to create defensible closing evidence.

## Coverage

The kit contains:

- 4 real desktop-browser procedures: Chrome, Edge, Firefox and Safari.
- 3 real mobile-browser procedures: iPhone Safari, iPad Safari and Android Chrome.
- 4 assistive-technology procedures: keyboard-only, NVDA, VoiceOver/Safari and TalkBack/Chrome.
- 3 zoom/reflow/touch procedures: real 200% zoom, real 400% zoom and real-device touch targets.
- 2 contrast procedures: Windows forced colors/High Contrast and increased-contrast preference review.
- 2 visual-regression procedures: human baseline approval and baseline comparison.
- 3 public-launch clearance procedures: project name, package namespace and repository/domain decision.

## How to run

Start the local fixture server:

```text
node tooling/test-server.mjs
```

Then open:

```text
http://127.0.0.1:4173/docs/external-release-lab.html
```

The Markdown field sheets live under `tests/release/external-lab/packs/`. The shared results worksheet is `tests/release/external-lab/RESULTS-WORKSHEET.md`.

## Evidence boundary

A completed checklist does not close a gate. Evidence must still be stored in a repository-relative location, hashed with SHA-256, entered into the matching Release Lab JSON template, imported, reviewed and explicitly approved. `npm run evidence:sync` then derives gate status from approved evidence.

0.50 intentionally leaves all seven external/manual gates open until those real test/decision activities occur.
