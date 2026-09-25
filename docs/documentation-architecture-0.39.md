# Reeris UI 0.39 — Documentation Architecture & API Completeness

Reeris Core is feature-frozen. 0.39 turns the existing demos and release evidence into an auditable documentation system and establishes a machine-derived inventory of the public API.

## What changed

- Added `docs/index.html` as the documentation entry point, grouped by Foundation, Navigation & Overlays, Data & Application Patterns, Content & Product Patterns, and Quality/Release Evidence.
- Added `docs/api-reference.html`, generated from the actual Core CSS and optional JS source.
- Added `docs/api-manifest.json` as the machine-readable public API inventory.
- Added shared documentation assets in `docs/assets/` rather than putting new documentation behavior into Core.
- Added `tooling/generate-api-reference.mjs` and `npm run docs:api`.
- Added `tooling/documentation-audit.mjs` and `npm run audit:docs`.
- Added the documentation audit to `npm run audit:all`.
- Added `tooling/css-public-api.mjs`, a selector-aware scanner shared by the Core scope and documentation audits.

## Public API inventory

The 0.39 generated reference contains:

| Surface | Count |
| --- | ---: |
| Core CSS source modules | 36 |
| Actual public/contextual class selectors | 732 |
| `--reeris-*` custom properties encountered | 516 |
| Defined public tokens | 489 |
| Fallback-only public override hooks | 27 |
| Reeris-owned `data-reeris-*` attributes | 11 |
| Public package export entries | 11 |
| Exported optional-JS symbols | 5 |

Every `--reeris-*` name is included because the frozen architecture treats the Reeris namespace as public API. The 27 fallback-only hooks are variables consumed with an explicit fallback rather than declared globally; the generated reference labels them as override hooks rather than pretending they are ordinary root tokens.

## Source-to-documentation contract

Every CSS source module under Core now maps to a maintained documentation page. The audit verifies both the mapping and that the target page exists. The generated API reference publishes this mapping so a source file cannot quietly become part of the stable Core without a documentation destination.

Narrative/demo documentation remains component-oriented. The generated API reference complements it with exhaustive class, token, data-attribute, package-export, and JS-export inventories.

## Selector inventory correction

Earlier scope audits used a broad class-like string matcher. Because Reeris uses named cascade layers, strings such as `reeris.components` could be counted as if `.components` were a CSS class. 0.39 replaces that approximation with a lightweight selector scanner that ignores at-rule preludes.

The resulting count is **732 actual class selectors**. This is a tooling correction, not the removal of public component classes.

## Documentation audit gate

`npm run audit:docs` currently passes **1427/1427 checks**. The gate verifies, among other things:

- generated docs artifacts exist and match the release version;
- every Core CSS source module has a documentation mapping;
- every configured documentation page exists and is linked from the docs home;
- every discovered class is present in the generated API reference;
- every public `--reeris-*` token/hook is present in the generated API reference;
- every discovered `data-reeris-*` contract is listed;
- every package export is documented and its target exists;
- optional JS exports are documented;
- contextual-class semantics, native/ARIA priority, fallback-only token hooks, and GlideNavigation lifecycle methods are explicitly explained.

## Boundaries

0.39 does **not** claim that every historical demo page has been visually migrated into the new shared documentation shell. The new docs home and generated API reference establish the architecture; existing component demos remain valid linked pages and can be progressively migrated without changing the public API.

Likewise, generated API presence is not a substitute for human-quality examples. Stable component pages still carry the usage, accessibility and composition guidance; the generated reference exists to prevent undocumented public surface area.
