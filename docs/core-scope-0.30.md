# Reeris UI 0.30 — Core Scope Gap Analysis

This milestone compares the implemented Core against the frozen Reeris Architecture v1 scope. It intentionally adds no new component family. The purpose is to stop uncontrolled scope growth and define the remaining path to Core 1.0.

## Result

Reeris Core already covers the majority of the planned foundational surface. The remaining work is smaller than the raw file count suggests because several CSS files contain multiple component families.

### Complete / substantially complete

| Area | Families already represented |
|---|---|
| Foundation | tokens, reset/base, themes, personalities, typography, spacing/sizing, accessibility utilities, curated utilities |
| Layout | stack, cluster, grid, sidebar, split, center, cover, app shell, dashboard grid |
| Actions | button, icon button, button group, loading button |
| Forms | fields, labels, help/validation feedback, inputs, textarea, select, checkbox, radio, switch, input groups, floating labels, advanced native controls |
| Surfaces | card, panel, well, divider, badge/status, chip, avatar, content states |
| Feedback | alert, callout, banner, progress, meter, spinner, skeleton, status/presence |
| Navigation | navbar, nav, breadcrumbs, tabs, pills, segmented control, pagination, steps, sidebar navigation, mobile navigation |
| Overlays/disclosure | dialog, popover, menu/dropdown presentation, drawer, accordion/details, tooltip |
| Data | semantic tables, data-table composition, lists, description/data lists, timeline, activity feed, stats/KPIs |
| Application UI | app shell, widgets, toolbars, filters, search bars, bulk actions, settings, authentication/onboarding |
| Visualization presentation | metrics, trend, CSS bars, rings, sparklines, legends, chart containers |
| Workflow | stepper, workflow/process timeline, wizard, status flow |
| Content/media | media object, figure, gallery, thumbnails, image card, lightbox presentation |
| Identity | profile, user row, member/team patterns, account menu |
| Communication | notifications, inbox/message rows, conversation/message presentation, composer |
| Files | file browser/list/grid, upload queue, dropzone, attachments, storage meter |
| Commerce | product/order rows, cart/checkout, transactions, invoices/receipts |
| Search/selection | command palette, search results, combobox/autocomplete presentation, tree/hierarchy, choice cards, rating/reaction/voting |
| Marketing | hero, feature grid, pricing, testimonials, logo cloud, comparison, CTA |

## Remaining Core gaps before feature freeze

The following are genuinely useful foundational gaps and fit the original Core boundary.

1. **Button completion** — split-button composition, floating action button presentation, close button, copy/action button patterns, and clearer icon-only accessible examples. These extend the existing button family rather than create a new subsystem.
2. **Toast / transient notification presentation** — alerts and notification centers exist, but a small top-layer-friendly toast stack/presentation is still missing. Reeris Core owns presentation; triggering/timing remains application or optional-JS responsibility.
3. **Responsive navbar disclosure composition** — navbar exists and app/mobile navigation exists, but the general website navbar needs an explicit native-first responsive disclosure pattern.
4. **Hover-card / rich preview presentation** — popover and tooltip exist, but the documented native-popover rich-preview pattern is not yet represented.
5. **Mega-menu composition** — useful as a navigation composition built from existing popover/menu primitives. It should remain CSS/native-HTML presentation, not a separate JS system.
6. **Form completeness audit** — verify every originally promised native input type/state and field layout is represented in documentation, not merely styled incidentally by broad selectors. Fill only actual omissions.
7. **Content-state completeness** — existing content-state patterns cover empty/error/success; explicitly add/document no-results, offline, permission-required and maintenance variants without inventing separate component APIs.

These are the final component-level Core gaps currently identified. Calendar, Scheduler, Kanban, Gantt, Charts, Files-as-an-application, Editor UI and similar advanced systems remain outside Core.

## Hardening work still required before 1.0

Feature completion is not the same as 1.0 readiness. After the remaining gaps are closed, Core should enter a hardening phase:

- automated accessibility tests and manual keyboard/screen-reader review
- visual regression coverage across light/dark, density, radius/elevation personalities and RTL
- browser matrix runs on Chrome, Edge, Firefox, Safari, iOS Safari and Android Chrome
- forced-colors, reduced-motion, reduced-transparency and zoom checks
- specificity and duplicate-declaration audit
- public token/API inventory and deprecation metadata
- package/export verification and minified production artifacts
- source maps
- strict-CSP test page
- print verification where applicable
- official starter applications and interactive documentation consolidation
- performance/bundle-size budget reporting

## Core completion sequence

The recommended sequence from 0.30 is:

1. 0.31 — Button completion + action primitives
2. 0.32 — Toast + transient feedback
3. 0.33 — Responsive navbar + mega-menu + hover-card compositions
4. 0.34 — Forms completeness audit/fixes
5. 0.35 — Content-state completion + Core feature freeze
6. 0.36+ — accessibility, browser, visual, API, packaging and documentation hardening
7. 0.x release candidates — starter apps and full acceptance-matrix validation
8. 1.0 — only after the frozen quality gate passes

## Scope rule

From 0.30 onward, a new Core component must satisfy at least one of these tests:

- it closes an item already present in the frozen v1 architecture;
- it is necessary to make an existing Core family complete;
- it is required to satisfy accessibility, responsive, internationalization or progressive-enhancement contracts.

Otherwise it belongs in a future Reeris module, Labs, an example/starter, or application code.
