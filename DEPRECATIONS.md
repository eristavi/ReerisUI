# Reeris UI Deprecation Policy

Reeris treats its documented public interfaces as a versioned contract. Public interfaces include documented component and part classes, contextual modifiers, public `--reeris-*` tokens/hooks, `data-reeris-*` attributes, package exports, documented markup contracts, optional JavaScript APIs, and framework-adapter APIs when those adapters become Stable.

## Lifecycle

A Stable public API follows this lifecycle:

1. **Supported** — documented and covered by the current compatibility contract.
2. **Deprecated** — remains functional; documentation identifies the replacement and migration path.
3. **Migration period** — the deprecated API remains available through the remainder of the current major line where practical.
4. **Removed** — eligible for removal in the next major version.

Security-critical, fundamentally broken, or platform-invalid APIs may require an accelerated exception. Such exceptions must be documented prominently in release notes with a migration path whenever one exists.

## Release-candidate freeze

Beginning with the 0.46 release-candidate readiness baseline, Reeris records a normalized snapshot of the public Core and optional-JS API. Changes to that snapshot during the RC cycle must be intentional, reviewed, documented in the changelog, and accompanied by a migration note when they invalidate existing usage.

After Reeris 1.0, removal of a Stable public API is a major-version change under Semantic Versioning.

## Warnings

Reeris does not emit noisy runtime warnings from CSS. Optional JavaScript tooling may expose development-time migration diagnostics where they are useful, but normal production operation must remain quiet and CSP-friendly.

## Current deprecated APIs

**None.**
