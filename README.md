# Reeris UI

A modern, native-web UI framework. HTML and CSS first. No JavaScript required by the core and no consumer build step required.

**Documentation:** [Browse the Reeris UI docs](https://eristavi.github.io/ReerisUI/docs/index.html)

**Typography standards:** [View the heading scale and text roles](https://eristavi.github.io/ReerisUI/docs/typography.html)

## Status

Reeris UI 0.51 — Naming & Publication Clearance Research. Core remains feature-frozen and the public Core/JS API remains under the RC freeze baseline. The public-name gate remains open: current research found material conflicts around the Reeris identity, including active software products/projects using Reeris and prior exact Reeris UI use. A rename review is recommended before public publication; no package namespace has been changed yet.

## Principles

- Native HTML/CSS first
- Progressive enhancement
- WCAG 2.2 AA acceptance target
- Container-first responsive components
- Direction-independent LTR/RTL core
- Zero production dependencies for Reeris Core
- MIT licensed

## Monorepo

- `packages/core` — canonical CSS framework
- `packages/icons` — SVG icon system
- `packages/js` — optional vanilla-JS enhancements
- `packages/react`, `vue`, `svelte` — framework adapters
- `tokens` — typed, standards-compatible design-token source
- `docs`, `examples`, `tests`, `tooling`, `labs`

