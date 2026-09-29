# Reeris UI 0.55.0 — Source Version Lock and Audit

The source, `@reeris/core`, and `@reeris/js` versions are locked at **0.55.0**. The public API snapshot records 762 classes, 544 tokens and hooks, 11 Reeris data attributes, 14 package exports, and 5 optional JavaScript exports. This is a source version lock, not a public npm release or approval of the remaining manual gates.

## Automated results

The full `npm run audit:all` sequence passed on the 0.52 source before the version change, after repairing the narrow message-sender wrap and stale static audit assertions. The 0.55 run passed through Core scope, forms, content states, accessibility, browser/reflow static checks, CSS architecture, visual infrastructure, RTL, themes, reproducibility, generated API docs, docs CSS, starters, security, packages, and RC browser infrastructure. External Lab generation and its 482 checks, plus the evidence-registry audit, also passed when run separately.

The refreshed 0.55 Chromium run in [GitHub Actions](https://github.com/Eristavi/ReerisUI/actions/runs/36542076637) recorded 15/15 passing checks and 14 visual screenshots. Its versioned report, screenshots, and five supplemental records are included in `tests/release/`. The visual review found and fixed a wrapping card badge, oversized toast dismiss control, cramped RTL phone table, and dark heading on the marketing gradient CTA. The current screenshots show these corrections. `npm run audit:local-browser` passes 66/66 checks, and `npm run audit:evidence` passes 13/13.

The [RC browser matrix](https://github.com/Eristavi/ReerisUI/actions/runs/36542076637) passed its Linux Playwright, Windows Edge, and local Chromium evidence jobs after the layout fixes. The 0.55 [identity research](identity-reservation-0.55.0.md) replaces the stale 0.52 observations: GitHub is publicly verified, six npm package endpoints returned 404, and two `.com` RDAP lookups returned 404. These observations do not establish npm account control or trademark clearance. No domain change is part of this release step.

The automated 0.55 audit sequence passes, but this is **not publication approval**. The visual-regression-baselines gate is now passed, with two of 21 closure criteria approved and six of seven gates still open. The generated 0.55 release manifest is informational and does not override these gates.

A focused [cloud Chrome keyboard spot-check](../tests/release/evidence-artifacts/0.55.0/manual-keyboard/cloud-chrome-review.md) on the deployed 0.55 stylesheet covered forms, example switches, dialogs, popovers, disclosure, navigation and a table header control. It is supplemental evidence: the full assistive-technology procedure, exact branded-browser version, screen readers and real-device checks remain outstanding.

The [visual review packet](visual-review-0.55.0.md) links all 14 owner-approved screenshots. The [baseline manifest](../tests/release/evidence-artifacts/0.55.0/visual-baseline/baseline-manifest.json), [approval note](../tests/release/evidence-artifacts/0.55.0/visual-baseline/review-approval.md), and [zero-diff comparison](../tests/release/evidence-artifacts/0.55.0/visual-baseline/comparison-report.json) close the visual gate. CI now compares each new local Chromium capture to the committed baseline set; Playwright snapshot candidates use a separate capture route and were not included in this approval.

## Next validation

Collect the required real-browser evidence, confirm npm account control, and obtain formal name/similarity clearance before package publication. Complete the assistive-technology, real-device, zoom/touch, and contrast/high-contrast procedures in the [External Release Lab](external-release-lab.html). Retain historical 0.52 artifacts under their original version and hashes.
