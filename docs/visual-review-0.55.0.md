# Reeris UI 0.55.0 — Visual review packet

These are the 14 Chromium screenshots captured from the 0.55 source in [GitHub Actions run 65](https://github.com/Eristavi/ReerisUI/actions/runs/36542076637). The machine-readable report and image hashes are in [`local-chromium-report.json`](../tests/release/evidence-artifacts/0.55.0/local-chromium/local-chromium-report.json). The project owner approved this exact set on 2026-09-29. The [approved baseline manifest](../tests/release/evidence-artifacts/0.55.0/visual-baseline/baseline-manifest.json) lists the SHA-256 hash of each committed PNG.

| Case | Screenshot | Check |
| --- | --- | --- |
| Core, system default LTR | [View PNG](../tests/release/evidence-artifacts/0.55.0/local-chromium/visual/core-system-default-ltr.png) | General hierarchy and system theme |
| Core, light default LTR | [View PNG](../tests/release/evidence-artifacts/0.55.0/local-chromium/visual/core-light-default-ltr.png) | Controls, badge, toast |
| Core, dark default LTR | [View PNG](../tests/release/evidence-artifacts/0.55.0/local-chromium/visual/core-dark-default-ltr.png) | Dark contrast and feedback |
| Core, light compact LTR | [View PNG](../tests/release/evidence-artifacts/0.55.0/local-chromium/visual/core-light-compact-ltr.png) | Compact spacing |
| Core, dark comfortable LTR | [View PNG](../tests/release/evidence-artifacts/0.55.0/local-chromium/visual/core-dark-comfortable-ltr.png) | Comfortable spacing and elevation |
| Core, light default RTL | [View PNG](../tests/release/evidence-artifacts/0.55.0/local-chromium/visual/core-light-default-rtl.png) | Direction and layout order |
| Core, dark soft RTL | [View PNG](../tests/release/evidence-artifacts/0.55.0/local-chromium/visual/core-dark-soft-rtl.png) | Direction and theme |
| Core, phone system | [View PNG](../tests/release/evidence-artifacts/0.55.0/local-chromium/visual/core-mobile-system.png) | Card badge and toast close control |
| Core, phone dark compact | [View PNG](../tests/release/evidence-artifacts/0.55.0/local-chromium/visual/core-mobile-dark-compact.png) | Narrow dark layout |
| Dashboard starter | [View PNG](../tests/release/evidence-artifacts/0.55.0/local-chromium/visual/starter-dashboard-system.png) | Application composition |
| Data management starter | [View PNG](../tests/release/evidence-artifacts/0.55.0/local-chromium/visual/starter-data-system.png) | Dense controls and table |
| Marketing starter | [View PNG](../tests/release/evidence-artifacts/0.55.0/local-chromium/visual/starter-marketing-system.png) | Gradient CTA heading contrast |
| i18n desktop | [View PNG](../tests/release/evidence-artifacts/0.55.0/local-chromium/visual/i18n-rtl-desktop.png) | Mixed direction and long text |
| i18n phone | [View PNG](../tests/release/evidence-artifacts/0.55.0/local-chromium/visual/i18n-rtl-mobile.png) | Scrollable table and readable headings |

Agent inspection found the card badge, toast dismiss control, RTL phone table, and gradient CTA issue and verified their corrected captures. Revaz Eristavi approved this 14-image packet in the conversation after being asked to approve all images or identify changes. The committed baselines are byte-for-byte copies of these PNGs. Independent [run 68](https://github.com/eristavi/ReerisUI/actions/runs/36561882722) reproduced all 14 hashes; the [comparison report](../tests/release/evidence-artifacts/0.55.0/visual-baseline/comparison-report.json) and [log](../tests/release/evidence-artifacts/0.55.0/visual-baseline/compare.log) show zero changed pixels. Real device, screen reader, and other manual release gates are separate.
