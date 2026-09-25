# Reeris UI 0.35 — Content States Completion

Reeris Core now has one explicit, reusable content-state API rather than separate components for each application situation.

## Stable family

- `.content-state` — default empty state
- `.content-state.no-results`
- `.content-state.error`
- `.content-state.success`
- `.content-state.offline`
- `.content-state.permission-required`
- `.content-state.maintenance`
- `.content-state.compact` — density of the content-state composition, independent of semantic meaning

Public parts remain `.content-state-icon`, `.content-state-title`, `.content-state-description`, and `.content-state-actions`.

## Accessibility boundary

The modifier is visual/contextual and does not inject ARIA semantics. Static states generally require no live-region role. Applications choose `role="status"` for polite dynamic updates and reserve `role="alert"` for urgent errors. Icons are decorative when the same meaning is expressed in the title/body and should be hidden from assistive technology.

## Core boundary

Reeris owns the presentation and accessible markup contract. Applications own the condition that produced the state, retry logic, permission workflows, connectivity detection, maintenance status, and live-region urgency.

This closes the final bounded Core feature gap identified by the 0.30 scope audit. Reeris Core now enters feature freeze; subsequent Core work is hardening, testing, documentation, packaging, starter applications, and release-quality validation rather than expansion into advanced modules.
