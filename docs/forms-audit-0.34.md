# Reeris UI 0.34 — Forms Completeness Audit

This release closes the bounded Forms gap identified during the Core scope audit.

## Completed in 0.34

- Five-size treatment is now consistent for text inputs, selects, and textareas.
- Choice groups now have official stacked and inline layouts while retaining native checkbox/radio semantics.
- Horizontal field and 12-column form composition primitives are available and container-aware.
- Busy/loading presentation recognizes both `data-reeris-state="loading"` and `aria-busy="true"`, with control-relative positioning rather than relying on the full field box.
- Reduced-motion users receive a static busy indicator instead of a continuously rotating spinner.
- Forced-colors mode now gives checked checkbox/radio/switch states explicit system-color treatment.
- Native `<select>` gains an opt-in `.customizable` progressive path using `appearance: base-select`/`::picker(select)` where the browser supports it; unsupported browsers retain the existing native select behavior.
- Existing advanced controls remain covered: search/password composition, date/time, file, drop zone, range, color, OTP/PIN, password-strength presentation, validation feedback, floating labels, input groups, prefixes/suffixes, and fieldsets.

## Boundary

Reeris Core styles form controls and exposes semantic state/presentation contracts. Validation/business rules, password visibility behavior, remote autocomplete/search, upload transport, OTP advancement, and application data remain outside Core and may be implemented by the application or optional `@reeris/js` enhancements.
