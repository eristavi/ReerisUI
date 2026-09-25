# Reeris visual regression

The visual suite is browser-specific. The canonical baseline family is `chromium-linux`; other release labs may keep their own engine/OS baseline directories without replacing it.

## Matrix

`cases.json` defines canonical viewport and personality combinations. The primary fixture covers system/light/dark themes, compact/default/comfortable density, LTR/RTL, radius personalities, elevation personalities, and narrow/mobile reflow. Official starters are also captured as integration surfaces.

## Commands

- `npm run audit:visual` validates the visual-test contract and docs theme behavior without needing a browser.
- `npm run visual:capture` captures current screenshots using `REVA_VISUAL_BROWSER` or an auto-detected Chromium executable.
- `npm run visual:compare` compares current screenshots with committed baselines using ImageMagick.
- `npm run visual:update` intentionally promotes current screenshots to baselines.
- `npm run visual:test` captures and compares.

The capture command intentionally fails if the browser cannot render reliably; it never silently creates a fake baseline. Baselines are only updated by the explicit `visual:update` command.

Documentation and starters follow the browser/OS color scheme by default. Explicit theme variants are applied only by the visual fixture query parameters so the default product contract remains system-native.
