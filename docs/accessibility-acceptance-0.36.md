# Reeris UI 0.36 — Accessibility Acceptance Audit

Reeris Core remains feature-frozen. Version 0.36 is an accessibility hardening release against the WCAG 2.2 AA acceptance contract defined for Reeris Architecture v1.

## Result

The automated/static acceptance gate passes **51/51 checks**. The audit covers the Core CSS, semantic token relationships, official gradient endpoints, optional JavaScript safety, minimum target sizing for compact controls, and accessible names in all HTML demos.

This result is **not a claim of complete WCAG 2.2 AA conformance**. Full acceptance still requires browser/manual testing for keyboard sequences, screen-reader output, 200%/400% zoom and reflow, touch interaction, native control behavior, live regions, dialog/popover focus behavior, forced-colors visuals, and the published desktop/mobile browser matrix.

## Fixes made in 0.36

- Added explicit `prefers-contrast: more` token overrides with stronger muted text/borders and a 3px focus ring.
- Added the public `--reeris-target-min: 1.5rem` (24px) accessibility token.
- Increased compact remove/rating targets to the WCAG 2.2 AA 24px minimum while keeping their visual glyphs compact.
- Corrected light-theme `on-accent` and `on-warning` foreground relationships.
- Made official semantic gradients theme-aware so both endpoints retain at least 4.5:1 against their official foreground token in light and dark schemes.
- Stopped button loading rotation under `prefers-reduced-motion: reduce`.
- Removed `pointer-events: none` from ARIA-disabled navigation/menu styling. `aria-disabled` communicates semantics; application behavior must suppress activation consistently for both keyboard and pointer users.
- Corrected missing accessible names/labels in documentation demos, including dialogs, file input, size/state input examples, and the combobox example.
- Replaced the media lightbox demo's inline `onclick` activation with native command invocation.

## Contrast gate

Normal semantic foreground/background pairs all meet at least 4.5:1 in both official schemes. The tightest normal semantic pair is the light accent pair at approximately **4.60:1**. The official semantic gradient endpoint gate also requires at least 4.5:1; the tightest endpoint is approximately **4.60:1**.

The focus color exceeds the 3:1 non-text contrast target against the canvas in both schemes.

## Static acceptance areas

- Global `:focus-visible` system
- WCAG-sized focus ring tokens
- Forced-colors support
- `prefers-contrast: more`
- Reduced motion
- Reduced transparency
- Screen-reader-only utilities
- No Core `outline: none`/`outline: 0`
- Logical-property architecture
- 24px minimum compact target token
- Semantic foreground/background contrast
- Official gradient endpoint contrast
- Accessible names in official HTML demos
- No `eval`, `new Function`, `innerHTML =`, or `outerHTML =` in optional Reeris JS

## Manual/browser acceptance still required

The following remain release gates before Reeris 1.0:

1. Complete keyboard traversal and activation testing for all interactive examples.
2. Native dialog/popover/details focus and dismissal behavior across the supported browsers.
3. Screen-reader testing for semantic components and enhanced widgets.
4. 200% and 400% zoom/reflow testing without loss of content or controls.
5. Touch target and pointer-capability testing on iOS/iPadOS and Android.
6. Forced-colors and increased-contrast visual review on supported operating systems.
7. Reduced-motion review, including enhanced glide navigation.
8. RTL and long/localized-string stress testing.
9. Browser-specific native form-control review.
10. Visual regression testing across theme, density, radius, elevation and container sizes.

## Reproduce

```sh
npm run build
npm run audit:a11y
npm run audit:scope
npm run audit:forms
npm run audit:content-states
```

Machine-readable output is in `reports/accessibility-audit-0.36.0.json`.
