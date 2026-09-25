# Reeris UI 0.51 — Naming Selection & Publication Clearance

Date: 2026-09-25

## Decision

The project owner selected **Reeris UI** as the new public-facing framework name, with **Reeris** as the short brand.

The name is founder-derived from **RE**vaz + **ERIS**tavi.

Canonical identifiers selected for the pre-1.0 codebase:

- Project: **Reeris UI**
- Short brand: **Reeris**
- Repository: **`Eristavi/ReerisUI`**
- Intended npm scope: **`@reeris`**
- Core package: **`@reeris/core`**
- Optional JavaScript: **`@reeris/js`**
- Future icons package: **`@reeris/icons`**
- Main stylesheet: **`reeris.css`**
- Public CSS custom-property prefix: **`--reeris-*`**
- Reeris-owned data attributes: **`data-reeris-*`**

## Public research result

The public research pass did **not** surface a material exact-match software framework, design system, developer platform, SaaS product or technology company using the exact **Reeris UI / ReerisUI** identity.

No material exact **REERIS UI** software trademark surfaced in the public sources reviewed during the research pass. This is encouraging, but it is **not legal advice and not a formal trademark clearance opinion**. Similarity searches in the relevant jurisdictions and software/technology classes remain a publication requirement.

## Package namespace

Public indexing did not surface established packages using the intended ecosystem names such as:

- `@reeris/core`
- `@reeris/icons`
- `@reeris/js`
- `@reeris/react`
- `@reeris/vue`
- `@reeris/svelte`

However, search-engine absence is **not proof of availability**. The `@reeris` scope and intended package names remain open until successfully verified/reserved through npm itself.

## Repository

The intended canonical repository is:

`Eristavi/ReerisUI`

The repository rename/reservation is an owner-controlled operational step. The Release Lab does not infer repository ownership from search indexing.

## Domains

Preferred identities to verify/reserve live include:

- `reeris.dev`
- `reerisui.dev`
- `reeris.com`
- `reerisui.com`
- `reeris.io`

Do **not** treat any of these as available until successfully checked and reserved through an authoritative registrar/RDAP source.

## Publication gate

**The public-name/namespace gate remains OPEN.**

The rename may proceed in the pre-1.0 source tree, but public publication should wait until all three closure criteria have approved evidence:

1. project-name / trademark clearance;
2. npm package namespace reservation;
3. repository/domain clearance.

## Rename policy

Because Reeris UI is still pre-1.0 and the old Reva UI packages were not treated as a stable public release contract, 0.51 performs a clean ecosystem rename rather than maintaining permanent duplicate API prefixes.

The public contract changes from:

- `@reva/*` → `@reeris/*`
- `--reva-*` → `--reeris-*`
- `data-reva-*` → `data-reeris-*`
- `reva.css` → `reeris.css`
- `Reva` JavaScript namespace → `Reeris`

Historical release notes may refer to the previous working name where needed for migration context.
