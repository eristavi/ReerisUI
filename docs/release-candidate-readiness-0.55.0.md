# Reeris UI 0.55.0 — Source Version Lock and Audit

The source, `@reeris/core`, and `@reeris/js` versions are locked at **0.55.0**. The public API snapshot records 762 classes, 544 tokens and hooks, 11 Reeris data attributes, 14 package exports, and 5 optional JavaScript exports. This is a source version lock, not a public npm release or approval of the remaining manual gates.

## Automated results

The full `npm run audit:all` sequence passed on the 0.52 source before the version change, after repairing the narrow message-sender wrap and stale static audit assertions. The 0.55 run passed through Core scope, forms, content states, accessibility, browser/reflow static checks, CSS architecture, visual infrastructure, RTL, themes, reproducibility, generated API docs, docs CSS, starters, security, packages, and RC browser infrastructure. External Lab generation and its 482 checks, plus the evidence-registry audit, also passed when run separately.

The 0.55 Chromium run in [GitHub Actions](https://github.com/Eristavi/ReerisUI/actions/runs/36475031639) recorded 15/15 passing checks and 14 visual candidate screenshots. Its versioned report, screenshots, and five supplemental records are included in `tests/release/`. `npm run audit:local-browser` passes 66/66 checks, and `npm run audit:evidence` passes 13/13. This is automated Chromium evidence; visual candidates and automated interaction checks do not approve the manual gates.

The [RC browser matrix](https://github.com/Eristavi/ReerisUI/actions/runs/36476173514) passed its Linux Playwright, Windows Edge, and local Chromium evidence jobs after the Glass canvas assertion was updated. The 0.55 [identity research](identity-reservation-0.55.0.md) replaces the stale 0.52 observations: GitHub is publicly verified, six npm package endpoints returned 404, and two `.com` RDAP lookups returned 404. These observations do not establish npm account control, domain registration, or trademark clearance.

The automated 0.55 audit sequence passes, but this is **not publication approval**. The seven manual/external gates remain open, with zero of 21 closure criteria approved. The generated 0.55 release manifest is informational and does not override these gates.

## Next validation

Collect the required real-browser evidence, confirm npm account control, register a primary domain, and obtain formal name/similarity clearance before package publication. Complete the assistive-technology, real-device, visual-approval, and other manual gate procedures in the [External Release Lab](external-release-lab.html). Retain historical 0.52 artifacts under their original version and hashes.
