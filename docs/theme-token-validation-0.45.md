# Reeris UI 0.45.0 — Theme & Design Token Validation

Reeris's browser-facing theme contract remains CSS custom properties. Version 0.45 adds a reproducible validator around that contract without introducing a runtime theme engine.

## Acceptance scope

- Official light and dark semantic foreground/background pairs are evaluated at WCAG AA 4.5:1.
- Primary, accent, success, warning and danger gradient endpoints are checked against their semantic foreground token.
- Partial custom themes inherit all tokens they do not override.
- Nested themes may inherit the surrounding color scheme or explicitly select `color-scheme: light` / `dark`.
- Density, radius, elevation and motion remain independent personality contracts and are not redefined by themes.
- Reeris continues to follow the browser/OS color preference by default through `color-scheme: light dark` and `light-dark()`.

## Custom theme validation

```sh
node tooling/theme-validator.mjs path/to/theme.css
```

The validator resolves Reeris primitive and semantic token references and reports contrast results for each custom `[data-theme="..."]` block. A theme block without an explicit `color-scheme` is checked in both light and dark inherited contexts.

The release fixture is `tests/themes/ocean.css`; it demonstrates a partial custom theme and an explicitly dark nested variant.
