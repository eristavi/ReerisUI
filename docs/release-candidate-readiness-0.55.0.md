# Reeris UI 0.55.0 — Source Version Lock and Audit

The source, `@reeris/core`, and `@reeris/js` versions are locked at **0.55.0**. The public API snapshot records 762 classes, 544 tokens and hooks, 11 Reeris data attributes, 14 package exports, and 5 optional JavaScript exports. This is a source version lock, not a public npm release or approval of the remaining manual gates.

## Automated results

The full `npm run audit:all` sequence passed on the 0.52 source before the version change, after repairing the narrow message-sender wrap and stale static audit assertions. The 0.55 run passed through Core scope, forms, content states, accessibility, browser/reflow static checks, CSS architecture, visual infrastructure, RTL, themes, reproducibility, generated API docs, docs CSS, starters, security, packages, and RC browser infrastructure. External Lab generation and its 482 checks, plus the evidence-registry audit, also passed when run separately.

The 0.55 full sequence **does not pass**: `audit:local-browser` needs a new version-specific Chromium report and five supplemental evidence records. No current 0.55 screenshots or browser report were created in this environment. `audit:naming` and `audit:identity-reservation` identify the prior 0.52 research as historical; current registry, domain, and formal trademark clearance remain unresolved. The seven manual/external gates remain open, with zero of 21 closure criteria approved. The generated 0.55 release manifest is informational and does not override these failures.

## Next validation

Run the 0.55 browser matrix and local Chromium procedure in an environment with the required browsers, then collect release-specific evidence. Refresh the naming and account-level reservations before package publication, and complete the assisted-technology, real-device, visual-approval, and other manual gate procedures in the [External Release Lab](external-release-lab.html). Re-run `npm run release:check` only after evidence is recorded; retain historical 0.52 artifacts under their original version and hashes.
