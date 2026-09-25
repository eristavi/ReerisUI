# Reeris RC browser tests

`browser-matrix.spec.mjs` exercises representative pages and keyboard/native-interaction/reflow flows across Playwright projects.

`visual.spec.mjs` consumes the canonical `tests/visual/cases.json` matrix. Generate candidate baselines only with `npm run rc:visual:update`; review them before committing.

Playwright evidence is written by `tooling/rc-playwright-reporter.mjs` to `reports/rc-browser-evidence-<version>.json`.
