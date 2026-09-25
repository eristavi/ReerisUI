# Reeris UI 0.51.0 — Release Candidate Readiness

## Classification

**Ready for RC validation, not ready for 1.0/public publication.**

Core remains feature-frozen and the normalized public API remains pinned to the RC freeze baseline. 0.51 adds naming/publication research only; it does not expand the Core feature surface.

## Naming/publication result

The `public-name-namespace-clearance` gate remains **OPEN**. Research found material conflicts around the current Reeris identity:

- Nabrio actively documents software named Reeris whose main application is called **Reeris Core** and includes a Reeris Web UI.
- OpenCloud/CS3 actively maintains software named **Reeris**.
- **Reeris UI** is the selected pre-1.0 identity; formal trademark similarity clearance, npm reservation and domain/repository clearance remain open publication gates.
- Current indexed U.S. `REERIS` applications cover AI/software and downloadable mobile software.

The recommended next action is a controlled replacement-name review before public publication. `Erist UI` is the leading fallback candidate from the first pass, but it is **not cleared yet**.

Authoritative npm scope reservation and domain availability remain unresolved from this environment, so no `@reeris/*` → replacement namespace migration has been performed.

See `docs/naming-clearance-0.51.md`.

## Current gate status

- External/manual gates: **7 total**
- Gates still blocking 1.0: **6**
- Gate still blocking public publication: **1**
- Public naming criteria passed: **0/3**
- Naming research evidence: **supplemental only**

## Publication boundary

Do not publish npm packages, announce a permanent public brand, or bulk-rename source packages until a final replacement/retention decision passes the same project-name, package-namespace and repository/domain clearance checks.
