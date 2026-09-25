# Reeris UI 0.37 — Browser, Keyboard & Reflow Acceptance

## Status

Reeris Core remains feature-frozen. Version 0.37 hardens the framework for keyboard operation and WCAG reflow/zoom testing, and adds a reproducible browser acceptance fixture. The automated/static gate passes, but this release **does not claim the full desktop/mobile browser matrix has been manually passed**.

## Changes made during the acceptance pass

- Long button labels can wrap and grow instead of forcing horizontal overflow.
- Form input groups and long input addons can shrink/wrap in narrow containers.
- Identity names/metadata, file names, tree labels, sidebar/mobile labels, badges/chips and app titles no longer rely on permanent visual truncation for normal presentation.
- Inbox/message labels unwrap in narrow containers.
- Search/command result labels and metadata wrap instead of being permanently ellipsized.
- Mega menus, hover cards, command palettes and toast regions use logical viewport sizing (`vi`) rather than physical `vw` sizing.
- Remaining demo `onclick` handlers were moved to an external module so documentation follows the strict-CSP architecture.
- A canonical `docs/browser-reflow.html` fixture now stresses keyboard focus, long translations, unbroken strings, dialogs, forms, identity, files, trees, tables and optional glide navigation.

## Automated acceptance

Run:

```sh
npm run build
npm run audit:a11y
npm run audit:forms
npm run audit:content-states
npm run audit:scope
npm run audit:browser-reflow
```

The 0.37 browser/reflow audit checks keyboard/focus prerequisites, long-content wrapping, viewport safety, container-query coverage, deliberate horizontal table fallback, logical/dynamic viewport use, CSP-friendly documentation behavior, reduced motion, forced colors, safe areas and intentional `nowrap` exceptions.

## Manual browser gate

The following remains a release-lab/manual requirement:

| Area | Acceptance requirement | 0.37 status |
| --- | --- | --- |
| Keyboard | Tab/Shift+Tab, Enter/Space, Escape, visible focus, native disclosure/dialog behavior | Fixture ready; manual matrix pending |
| Zoom/reflow | 200% and 400%; no loss of content/functionality; no two-dimensional scroll except intentional regions such as tables | Hardened + fixture ready; manual matrix pending |
| Desktop | Chrome, Edge, Firefox, Safari | Pending release-lab execution |
| Mobile | Safari iOS/iPadOS, Chrome Android | Pending release-lab execution |
| Touch | Touch targets, drawers, bottom navigation, no hover-only critical behavior | Static prerequisites pass; device pass pending |
| RTL/i18n | RTL plus long translated strings at zoom | Fixture/hardening ready; manual pass pending |
| Assistive tech | Screen-reader interaction for overlays, validation, loading and transient feedback | Pending manual pass |

## Build-container limitation

Chromium 144.0.7559.96 is installed in the current build container, but even a trivial `--headless --dump-dom` invocation does not complete because the container browser process stalls while trying to initialize unavailable system services/DBus. Therefore Chromium execution is **not** recorded as a browser pass or failure for Reeris. The static gate and fixture are reproducible, while interactive browser acceptance must be run in a proper browser environment.

## Reflow policy clarified

Reeris does not solve reflow by globally hiding overflow. Components should shrink, wrap, stack or expose a deliberate scrolling region. Horizontal scrolling remains legitimate for inherently two-dimensional content such as semantic data tables. Explicit truncation/nowrap utilities remain opt-in behavior rather than the default for meaningful user content.
