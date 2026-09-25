# Reeris UI 0.29 Core Audit & Hardening

This milestone pauses component expansion and checks the existing Core against the frozen Reeris Architecture v1 contract.

## Findings fixed

### Public token naming drift
Early token generation emitted `--reeris-spacing-*`, `--reeris-fluid-spacing-*`, and `--reeris-border-width-*`, while component CSS correctly consumed the frozen public API names `--reeris-space-*`, `--reeris-space-fluid-*`, and `--reeris-border-*`. This left many layout/component values unresolved at runtime.

The generator now emits the frozen public names. Font and line-height groups are likewise explicitly mapped to their public API names.

### Missing semantic aliases
The audit found components consuming semantic tokens that had not yet been defined globally. Core now defines:

- `--reeris-color-background`
- `--reeris-color-surface-subtle`
- `--reeris-color-surface-raised`
- `--reeris-color-on-surface`
- `--reeris-color-on-surface-muted`
- `--reeris-color-primary-subtle`
- `--reeris-dropdown-shadow`
- `--reeris-font-size-base`

After the fixes, automated static analysis reports **zero `var(--reeris-*)` references without either a definition or an explicit fallback**.

### Modular distribution
The build now publishes the full `reeris.css` bundle and copies stable source modules into `dist/` so documented package subpath exports can work without exposing repository-internal paths.

## Audit checks

- Logical directional properties: no physical left/right margin/padding/inset declarations found in Core source.
- `!important`: limited to accessibility/print utility behavior where intentional.
- Cascade layers: retained in the frozen order.
- Component selectors: continue to favor `:where()` for deliberately low specificity.
- Calendar/Scheduler/Charts/Kanban/Gantt: remain outside Reeris Core as post-v1 modules.

## Remaining hardening work

Before 1.0, Reeris still needs browser automation, accessibility automation, visual regression coverage, formal API snapshots, minified/compressed size reporting, and complete documentation coverage. Those are release-gate tasks, not reasons to expand Core scope.
