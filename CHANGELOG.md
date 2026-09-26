# Changelog

## Unreleased

- Added a CSS scroll progress indicator driven by the root scroll timeline, with unsupported-browser and reduced-motion fallbacks.
- Added an image card that stacks or splits according to a named container query, and used native CSS nesting for its variant rules.
- Added selective CSS motion: subtle dialog/popover entry scale and disclosure marker/content movement using `@starting-style`, with reduced-motion behavior.
- Fixed inbox sender names and previews collapsing into narrow columns on mobile screens.
- Added a shared theme selector to published demo and documentation headers, with System, Light, Dark, and Glass choices saved across pages by docs-only JavaScript.
- Added a CSS-only Glass theme with translucent semantic surfaces, backdrop blur, a soft canvas, and an opaque reduced-transparency fallback.

- Added CSS-first carousels with scroll snap, responsive card and single-slide layouts, browser-native arrows and slide markers, and a no-JavaScript demo.

- Added an opt-in CSS scroll-state navbar that gains elevation when it sticks, with an unchanged readable surface in browsers without scroll-state queries.
- Made Glide CSS-first with native anchor positioning for hover and keyboard focus; the sticky navbar demo works with JavaScript disabled and retains a hover fallback for older browsers. The existing JavaScript module remains opt-in.
- Added a CSS-only parallax marketing pattern for decorative images, backgrounds, and videos, with subtle (4%), standard (8%), and strong (12%) depth presets plus optional gentle easing.
- Added static fallback behavior for browsers without scroll-driven animations and reduced-motion handling; decorative video examples use a still poster for reduced-motion viewing.
- Documented the HTML pattern, custom travel property, video playback limitation, and browser support fallback on the marketing page.
- Corrected the marketing documentation example to wrap at narrow widths; post-merge browser and documentation CI checks passed.
- Kept conversation contact names and status on readable lines by allowing the header identity to grow; added a browser regression check at phone and desktop widths.
- Versioned the Core stylesheet URL in the hosted documentation so a deployment loads updated component CSS instead of a cached copy.

## 0.52.0 — Identity Reservation & Publication Clearance

- Added a current Reeris identity-reservation report covering the `@reeris` npm scope/package targets, `Eristavi/ReerisUI`, candidate domains, and trademark-clearance boundary.
- Added a machine-readable reservation matrix and release audit.
- Kept the publication naming gate open: public-search absence is not treated as proof of registry/domain availability or legal trademark clearance.
- Added exact account-level actions required to reserve the npm scope/packages, rename/create the GitHub repository, and register preferred domains.

## 0.51.0 — Naming & Publication Clearance Research

- Added a formal naming/publication clearance research pass for the working Reeris UI identity.
- Recorded the canonical repository path supplied by the project owner as `Eristavi/RevaUI`.
- Identified active software-name conflicts: Nabrio Reeris / Reeris Core, active OpenCloud/CS3 Reeris, and historical exact Reeris UI use.
- Recorded current indexed REERIS software/AI trademark activity and explicitly kept legal trademark clearance unresolved.
- Kept npm scope and domain availability unresolved because authoritative live registry/registrar verification is unavailable in this environment.
- Added a rename fallback shortlist led by `Erist UI`; rejected `Tavi UI` after finding active software use and a current software trademark application.
- Added supplemental, non-closing naming research evidence and `audit:naming`; all three publication-name criteria remain open.

## 0.50.0 — External Release Lab Preparation

- Added 21 criterion-specific external Release Lab field procedures covering every remaining closing criterion.
- Added real desktop/mobile browser, assistive-technology, actual zoom/reflow/touch, Windows High Contrast, visual-baseline and public-name/namespace test/decision packs.
- Added a shared results worksheet and matching current-release evidence templates for direct Release Lab import.
- Added a generated browser-native External Release Lab documentation page using Reeris system-native theming.
- Added `lab:generate`, `lab:prepare` and `audit:external-lab` tooling plus a 482-check one-to-one criterion/fixture/template audit.
- Integrated the external-lab audit and catalog/manifest evidence into RC readiness and release-manifest generation without closing any manual gate.

## 0.49.0 — Local Chromium RC Evidence

- Added a dependency-free Chrome DevTools Protocol runner for local Chromium RC evidence.
- Collected 15/15 smoke/interaction checks and 14/14 canonical visual candidate captures in Chromium 144.
- Added hashed supplemental Release Lab records for desktop-browser, keyboard/assistive prerequisite, reflow, forced-colors/contrast, and visual-baseline gates without closing any manual criterion.
- Added a local-browser evidence audit that verifies screenshot hashes, interaction results, release targeting, and the non-closing evidence boundary.
- Corrected the canonical visual fixture to use the documented `.toast-description` public API.
- Updated the browser-infrastructure audit so evidence-derived manual gates may legitimately transition from `open` to `passed` in future releases.
- Recorded the managed-environment limitation: localhost navigation is blocked by administrator policy, so this evidence run uses DevTools document injection with the exact built Core/docs CSS; the evidence remains supplemental only.

## 0.48.0 — Release Lab Evidence & Gate Closure

- Added explicit closure criteria for every remaining 1.0/manual/publication release gate.
- Added a versioned release-evidence schema, evidence templates, import/verification tooling, and derived gate-status reconciliation.
- Added conservative CI-browser evidence normalization: Playwright/Edge/mobile-emulation results are recorded as supplemental evidence and cannot impersonate real Safari, real mobile-device, screen-reader, zoom, high-contrast, or human-approved visual evidence.
- Added a Release Lab audit/report and integrated it into the full release and RC-readiness gates.
- Added Release Lab documentation describing evidence capture, review, approval, hashing, and gate closure.

## 0.47.0

- Added Playwright-based RC browser validation infrastructure for Chromium, Firefox, WebKit, mobile emulation and Microsoft Edge CI.
- Added automated keyboard, native dialog/disclosure, glide-navigation and narrow-reflow browser flows.
- Added canonical Playwright visual snapshot generation/comparison commands without auto-approving baselines.
- Added machine-readable RC browser evidence and a dedicated infrastructure audit.
- Added GitHub Actions browser-matrix workflow while keeping real Safari/mobile devices, assistive technology, zoom, forced colors and approved PNG baselines as explicit manual 1.0 gates.

## 0.46.0 — Release Candidate Readiness

- Added a normalized public-API freeze snapshot covering Core classes, public tokens/hooks, Reeris-owned data attributes, package exports, and optional JavaScript API.
- Added an automated RC-readiness audit and a concrete split between automated RC gates and manual/external 1.0 gates.
- Added a formal deprecation lifecycle document and current deprecation registry.
- Added a release-candidate readiness page/checklist and integrated `audit:rc` into the complete release gate.
- Classified the current state as ready for an RC validation cycle when all automated gates pass, while explicitly keeping real-browser/device, assistive-technology, visual-baseline, and public-name/namespace clearance open before 1.0/public launch.

## 0.45.0 — Theme & Design Token Validation

- Added a reusable custom-theme validator for semantic foreground/background pairs and gradient endpoints.
- Added official light/dark theme contrast acceptance and nested/partial custom-theme fixtures.
- Added theme/personality independence checks covering density, radius, elevation and motion contracts.
- Added theme documentation demonstrating system-default theming, partial inheritance, nested dark themes and CLI validation.
- Added `audit:theme` to the complete release gate.

All notable changes to Reeris UI are recorded here. Reeris follows Semantic Versioning for documented Stable APIs; pre-1.0 releases may still refine public contracts as documented in release notes.

## 0.44.0 — RTL, Localization & Internationalization Stress Audit

- Added Arabic, Hebrew, German-expansion, CJK and bidirectional-content stress fixtures.
- Added direction-aware safe-area aliases for logical inline start/end positioning.
- Corrected FAB/toast safe-area positioning under RTL and converted sidebar subnavigation indentation to logical properties.
- Added automated checks for forced direction, physical directional box properties, bidi isolation examples, semantic dates/numbers and directional disclosure behavior.
- Added i18n fixtures to the canonical visual-regression matrix while leaving real browser/device screenshots as a manual/CI gate.

## 0.43.0 — Visual regression infrastructure & native docs theming

- Added canonical visual-regression fixtures, case manifest, capture/compare/update tooling, and visual acceptance audit.
- Documentation and official starters now follow the browser/OS color scheme by default instead of forcing light mode.
- Added `color-scheme` metadata to documentation/starter pages and automated checks preventing root theme forcing or raw docs-theme colors.

## 0.42.0 — Build Reproducibility & Source Maps

- Added deterministic clean builds for Core and optional JavaScript distributions.
- Added Source Map v3 output for both full and minified Core CSS.
- Published byte-identical CSS source modules under `dist/sources/` for DevTools resolution.
- Added a repeat-build SHA-256 reproducibility audit and machine-path/timestamp checks for production artifacts.
- Added source maps and reproducibility evidence to the release-manifest and package-release gates.

## 0.41.0 — Security, CSP & Package Release Hardening

- Added a formal `SECURITY.md` vulnerability-reporting and response policy.
- Added strict-CSP security fixtures and an automated security audit for production packages.
- Restricted npm package payloads to intentional distribution artifacts plus package metadata/legal files.
- Added package/export/pack integrity auditing, including `npm pack --dry-run` verification.
- Added synchronized package metadata, public scoped-package publish configuration, and CDN/style entry metadata for Core.
- Added release manifest generation with SHA-256 hashes and package size evidence.
- Added release-check automation that rebuilds, regenerates documentation, runs every quality gate, and writes the release manifest.

## 0.40.0 — Official Starters & Integration Acceptance

- Added Dashboard, Data Management, Authentication, Settings, and Marketing starters built only from public Reeris Core APIs.
- Added starter integration auditing to the release gate.
