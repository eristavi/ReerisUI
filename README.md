# Reeris UI

A modern, native-web UI framework. HTML and CSS first. No JavaScript required by the core and no consumer build step required.

**Documentation:** [Browse the Reeris UI docs](https://eristavi.github.io/ReerisUI/docs/index.html)

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


## Foundation 0.3

Added the first production layout layer (`l-stack`, `l-cluster`, `l-grid`, `l-sidebar`, `l-split`, `l-center`, `l-cover`), container infrastructure, accessibility/print utilities, logical spacing helpers, and a deliberately curated responsive utility set.

## 0.4.0 — Button vertical slice

The first production component is now implemented in `packages/core/src/components/button.css` with contextual variants, five sizes, outline/ghost/link/gradient treatments, native disabled state, ARIA/Reeris loading states, icon buttons, groups, density/theme/RTL compatibility, reduced-motion behavior, forced-colors support, and public component tokens. See `docs/button.html` for the smoke-test/demo.


## 0.7 Surfaces & Content
Cards, panels, wells, badges, chips, avatars, dividers and reusable content-state patterns are now included.

## 0.11 Tables & Data Presentation
Semantic tables now support striped, hover, bordered, borderless, compact and comfortable presentation; numeric cells; selected rows; sortable-header states; sticky headers/columns; responsive scrolling; opt-in container-aware stacking; and higher-level data-table toolbar/footer composition.


## 0.13 — Application Shell & Dashboard

Adds app shell, sidebar/topbar/workspace composition, toolbars, 12-column dashboard composition and widget containers.

## 0.14 — Sidebar & Advanced Navigation

Adds structured sidebar sections/groups, collapsible navigation presentation, nav rail behavior, secondary navigation, and safe-area-aware mobile bottom navigation with responsive application-shell integration.

## 0.15 — Toolbar, Filters & Search Patterns

Adds page headers, command/filter bars, search-field composition, active filter chips, bulk-action presentation, view controls and container-aware responsive command patterns.

### 0.16.0 — Metrics & Visualization Foundation
Adds metric cards, comparison/trend presentation, CSS bar visualizations, ring/donut presentation, sparklines, legends, and chart containers. Reeris provides presentation and accessibility structure; applications/charting libraries own data and plotting logic.

### 0.17.0 — Stepper, Progress & Workflow Patterns
Adds responsive steppers, vertical process workflows, wizard composition, and compact status flows. Native/ARIA/Reeris state contracts distinguish complete, current, pending, and error states without requiring JavaScript.

### 0.18.0 — Media & Content Presentation
Adds responsive media objects, aspect-ratio frames, semantic figures, galleries, thumbnails, image cards, media placeholders, and native `<dialog>` lightbox presentation. Reeris owns presentation; application content and media behavior remain application-controlled.

### 0.20.0 — Profile, User & Identity Patterns
Adds presence-aware avatars, identity blocks, user rows, profile cards/headers, profile statistics, team/member cards, and account-menu composition. Patterns use semantic/ARIA state where applicable and remain density-, RTL-, container-, and forced-colors-aware.

## 0.20 marketing patterns

Hero sections, feature grids, pricing cards, testimonials, logo clouds, comparison wrappers and CTA compositions are included in the core presentation layer.

### 0.22 — Settings & Preferences
Adds responsive settings layouts, settings navigation, grouped preference rows, account/security patterns, destructive-action zones, and settings action bars.


### 0.22 Authentication & onboarding
Authentication shells, sign-in/registration/reset compositions, verification-code layouts, provider actions, and onboarding progress/choice patterns.

### 0.24 — Notifications & Messaging
Adds notification centers/items, unread state, inbox/message rows, conversation layouts, message bubbles, composers, system messages and typing presentation. Reeris owns presentation and state contracts; applications own transport, persistence and messaging logic.


## 0.24 — File & Upload Presentation
File browser/list/grid patterns, upload queues, drag/drop presentation, attachments, storage meters, progress/error/success states. Upload logic remains application-owned.

### 0.25 — Commerce & Transaction Patterns
Adds product/order rows, cart and checkout composition, order/payment summaries, quantity controls, transaction lists, payment-method presentation, invoices and printable receipts. Reeris owns presentation; applications own pricing, payments, tax, inventory and transaction logic.

### 0.28 — Rating, Selection & Choice Patterns
Adds native-input selectable cards and choice grids, read-only/interactive rating presentation, reactions, and voting controls. Reeris owns presentation and state contracts; applications own persistence, scoring, and business logic.

## 0.29 Core Audit & Hardening

0.29 pauses component expansion to validate Core against the frozen architecture. It fixes public token naming drift, completes missing semantic token aliases, verifies all Reeris custom-property references resolve or provide fallbacks, and adds modular CSS distribution exports. Calendar and other advanced application modules remain outside Core.


## 0.30 — Core Scope Gap Analysis

Core expansion is now bounded against the frozen v1 architecture. The remaining feature gaps are button/action completion, toast presentation, responsive navbar/mega-menu/hover-card compositions, a forms completeness pass, and explicit completion of reusable content states. Advanced modules such as Calendar, Scheduler, Kanban, Gantt and Charts remain outside Core. See `docs/core-scope-0.30.md`.


### 0.32 — Toast & Transient Feedback
Adds safe-area-aware toast regions, semantic success/info/warning/error toast presentation, actions and dismiss controls, density integration, reduced-motion/reduced-transparency behavior, and forced-colors support. Core deliberately does not implement automatic dismissal timers; applications own toast lifecycle and choose appropriate live-region semantics.

### 0.33 — Navigation Completion
Adds native-details responsive navbar composition, mega-menu and hover/focus-card patterns, plus `glide` navigation. Glide uses native CSS anchor positioning to move the indicator between hovered or keyboard-focused items and return it to the active item. Older browsers keep a readable hover style. Add `data-reeris-glide` and the optional `@reeris/js` module when a JavaScript enhancement is desired. Reduced motion removes travel animation.


### 0.34 — Forms Completeness Audit & Completion
Closes the bounded Forms Core gap: textarea sizing now follows the shared five-size control scale; choice groups, responsive horizontal fields and form grids are formalized; loading/busy presentation is control-relative and reduced-motion safe; forced-colors checked states are hardened; and `.select.customizable` adds a progressive native customizable-select path with a normal native fallback. See `docs/forms-audit-0.34.md` and `docs/forms-complete.html`.

### 0.35 — Content States Completion & Core Feature Freeze
Completes the reusable content-state family with explicit empty/default, no-results, error, success, offline, permission-required and maintenance presentations plus compact composition and public component tokens. Accessibility semantics remain application-controlled so live-region urgency matches the actual event. This closes the bounded feature gaps from the 0.30 Core scope audit; Core now enters feature freeze and moves to hardening/testing/documentation rather than new feature families.


### 0.36 — Accessibility Acceptance Audit
Hardens the feature-frozen Core against the WCAG 2.2 AA acceptance contract. Adds explicit increased-contrast behavior and a 24px target token, corrects official semantic/gradient contrast relationships, tightens compact action targets, improves reduced-motion and ARIA-disabled behavior, and audits accessible names across the demos. The automated/static gate passes 51/51 checks. This is not yet a claim of full WCAG conformance; browser, keyboard, screen-reader, zoom/reflow, touch and visual acceptance remain pending. See `docs/accessibility-acceptance-0.36.md`.


### 0.37 — Browser, Keyboard & Reflow Acceptance Harness
Hardens long-content and 200%/400% reflow behavior across buttons, forms, identity, files, trees, messaging, navigation and application shells; removes remaining physical `100vw` sizing in Core; removes inline demo event handlers; and adds a canonical browser/reflow stress fixture plus a 41-check static browser/reflow audit. This is not yet a claim that the manual Chrome/Edge/Firefox/Safari/iOS/Android matrix has passed. See `docs/browser-keyboard-reflow-0.37.md` and `docs/browser-reflow.html`.


### 0.38 — CSS Architecture & Performance Audit
Adds a formal CSS architecture gate and published size budgets, emits `reeris.min.css`, and makes the minified artifact a public package export. The audit found and fixed 17 qualified rules that had escaped the Reeris cascade layers, then verified zero unlayered qualified rules, zero ID selectors, zero exact duplicate rule signatures, a maximum approximate specificity of `0,1,1`, and a 29,602-byte gzip / 24,715-byte Brotli Core bundle. Budgets are machine-readable in `tooling/performance-budgets.json` and enforced by `npm run audit:css` / `npm run audit:all`. See `docs/css-architecture-performance-0.38.md`.


### 0.39 — Documentation Architecture & API Completeness
Adds a documentation home and generated public API reference/manifest, maps every Core CSS source module to a maintained documentation page, inventories 732 actual class selectors, 516 public `--reeris-*` tokens/hooks, 11 Reeris-owned data attributes, 11 package exports and 5 optional-JS exports, and adds `npm run docs:api` / `npm run audit:docs` to the release gate. The selector scanner is now at-rule-aware, correcting earlier approximate class counts that included cascade-layer identifiers. See `docs/documentation-architecture-0.39.md`, `docs/index.html` and `docs/api-reference.html`.


## 0.40 — Official Starters & Integration Acceptance

Adds five official Core-only starter compositions under `examples/starters/`: Dashboard, Data Management, Authentication, Settings, and Marketing. The starters deliberately require no custom starter stylesheet and no JavaScript. `npm run audit:starters` verifies that they use only public Reeris classes/data attributes, no embedded CSS or inline event handlers, and only public `--reeris-*` inline token overrides. See `docs/starters.html` and `docs/starters-integration-0.40.md`.


## 0.41 — Security, CSP & Package Release Hardening

Adds `SECURITY.md`, a strict-CSP fixture, automated unsafe-sink/network/dependency checks for production packages, restricted npm `files` payloads, package-local legal/readme files, export and `npm pack --dry-run` integrity verification, synchronized publish metadata, `CHANGELOG.md`, and SHA-256 release-manifest generation. `npm run release:check` rebuilds the framework, runs the complete quality gate, and writes release evidence without publishing anything. See `docs/security-package-release.html`.

## 0.42 — Build Reproducibility & Source Maps

Production builds now clean the previous distribution, regenerate canonical tokens, traverse sources in deterministic order, emit Source Map v3 files for `reeris.css` and `reeris.min.css`, and publish the mapped CSS modules under `dist/sources/`. `npm run audit:repro` performs two complete builds and requires identical SHA-256 artifact trees while rejecting timestamps and machine-local paths from production artifacts. The complete `npm run release:check` gate includes this reproducibility test. See `docs/build-reproducibility.html`.


## 0.43 — Visual Regression Infrastructure & Native Documentation Theming

Adds a canonical visual-regression matrix covering system/light/dark themes, density modes, LTR/RTL, radius/elevation personalities, narrow/mobile viewports and representative official starters. New `visual:capture`, `visual:compare`, `visual:update`, `visual:test`, and `audit:visual` commands define a browser-specific baseline workflow without making screenshot capture part of static release checks. Documentation and official starters no longer force `data-theme="light"`; they now follow browser/OS preference by default and declare `color-scheme: light dark` to user agents. See `docs/visual-regression.html` and `tests/visual/README.md`.

## RC browser validation

Reeris 0.47 adds a Playwright CI matrix for Chromium, Firefox, WebKit, mobile emulation and Microsoft Edge on Windows. Run `npm run rc:browser:test` after installing Playwright browsers. Screenshot baselines remain an explicit approval gate via `npm run rc:visual:update` / `npm run rc:visual:test`; browser automation does not substitute for real Safari/iOS/Android, screen readers, 400% zoom or Windows High Contrast review.

## Release Lab evidence

Reeris 0.48 adds a structured evidence ledger for the remaining 1.0 and public-publication gates. `npm run audit:evidence` validates the ledger without changing gate state. `npm run evidence:sync` is the explicit reconciliation step that derives `open`/`passed` from approved closing evidence. Playwright/WebKit and mobile-emulation outputs can be normalized as supplemental evidence, but they cannot close real Safari, device, assistive-technology, zoom, forced-colors, or human visual-approval criteria. See `docs/release-lab.html`.
## 0.49 — Local Chromium RC evidence

0.49 executes the first real Release Lab browser evidence run using local Chromium 144 through the Chrome DevTools Protocol. The run passes 15/15 smoke and interaction checks and captures all 14 canonical visual candidates, including dark/light/RTL/mobile-size cases, forced-colors media emulation, and `prefers-contrast: more`. Because this managed environment blocks localhost browser navigation, the runner falls back to DevTools document injection with the exact built Reeris Core and documentation CSS. The resulting evidence is deliberately supplemental: it does not close branded Chrome/Edge/Firefox/Safari, real-device, screen-reader, real zoom/touch, Windows High Contrast, or human-approved baseline criteria. Run `npm run rc:local:chromium` to recollect and `npm run audit:local-browser` to verify the evidence.


## 0.50 — External Release Lab test packs

0.50 turns every remaining Release Lab criterion into a criterion-specific test or decision pack. Run `npm run lab:prepare` to refresh current-version evidence templates and the generated lab documentation, start the fixture server with `node tooling/test-server.mjs`, and open `docs/external-release-lab.html`. The 21 packs live under `tests/release/external-lab/packs/`; completing a pack does not close a gate until hashed evidence is imported, explicitly approved, and reconciled with `npm run evidence:sync`.
