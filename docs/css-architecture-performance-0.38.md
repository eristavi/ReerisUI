# Reeris UI 0.38 — CSS Architecture & Performance Audit

Reeris Core remains feature-frozen. Version 0.38 audits the CSS architecture itself: cascade-layer integrity, selector specificity, exact duplicate rules, module/export consistency, direction-independent properties and bundle budgets.

## Release result

The automated CSS architecture gate passes **14/14 checks**.

| Metric | 0.38 result | Release budget |
| --- | ---: | ---: |
| `reeris.css` raw | 224,194 B | 245,760 B |
| `reeris.min.css` raw | 204,024 B | 220,160 B |
| `reeris.min.css` gzip | 29,602 B | 32,768 B |
| `reeris.min.css` Brotli | 24,715 B | 27,648 B |
| Largest source module | `forms/forms.css` — 23,093 B | 26,624 B |
| Approx. maximum selector specificity | `0,1,1` | `0,1,1` |
| Longest individual selector | 332 chars | 400 chars |
| ID selectors | 0 | 0 |
| Qualified rules outside Reeris layers | 0 | 0 |
| Exact duplicate rule signatures | 0 | 0 |

The current optional `@reeris/js` modules together are about **5,451 B raw / 1,570 B gzip / 1,332 B Brotli**. JavaScript remains optional and is not part of the Core CSS budget.

## Cascade correction

The audit found **17 qualified rules** that had been written outside the declared Reeris cascade layers. Most were accessibility overrides in `prefers-reduced-motion`, `forced-colors`, `prefers-contrast`, and a Forms container query. Unlayered author CSS outranks layered author CSS, so those rules could unexpectedly defeat Reeris's documented override model.

0.38 moves them into their intended layers:

- theme and motion preference overrides → `reeris.tokens`
- global forced-colors focus override → `reeris.base`
- Forms accessibility and reflow rules → `reeris.forms`
- Button accessibility/motion rules → `reeris.components`

The release gate now fails if any normal qualified rule escapes a Reeris layer.

## Specificity policy

The framework continues to use `:where()` aggressively for public component selectors. The audit rejects ID selectors and caps approximate specificity at `0,1,1`.

The current maximum is the RTL status-flow pseudo-element rule:

```css
:dir(rtl) :where(.status-flow > li:not(:last-child))::after
```

No selector exceeds the budget.

## Duplicate-rule policy

The audit distinguishes two cases:

1. **Exact duplicate rules** — same cascade context, selector and declaration block. These are release-gating errors. Current count: **0**.
2. **Repeated declaration patterns** — semantically separate components may intentionally share focus, layout or forced-colors declarations. These are reported for refactoring review but are not automatically treated as errors.

This avoids forcing unrelated components into brittle shared selectors merely to save a few bytes.

## Logical-property policy

Physical left/right layout properties remain prohibited in normal Core layout. The audit currently records one deliberate exception: the JS-enhanced glide indicator uses `left: 0` as a physical geometry origin because its enhancement calculates an X coordinate in the element's physical coordinate space. All document-flow spacing and positioning APIs remain logical/RTL-aware.

## Production artifacts

The build now emits both:

```text
packages/core/dist/reeris.css
packages/core/dist/reeris.min.css
```

`@reeris/core/reeris.min.css` is an explicit package export. Minification is deliberately conservative: it removes comments and formatting whitespace without rewriting CSS values or modern syntax.

## Performance budgets

Budgets are stored in `tooling/performance-budgets.json` and enforced by:

```bash
npm run audit:css
```

The complete static quality gate is available through:

```bash
npm run audit:all
```

A budget regression is a release issue, not merely an informational warning.

## Still pending

This release does not close the previously documented manual browser/device acceptance gate. It also does not yet implement the source-map publication requirement; that remains part of the packaging/release-tooling hardening phase so maps can be generated against meaningful original source modules rather than shipping a nominal but useless map.
