# Reva UI → Reeris UI migration (0.51)

Reeris UI 0.51 adopts the final selected pre-1.0 identity **Reeris UI**.

For code written against development snapshots before 0.51, rename the public integration points:

```text
@reva/core       → @reeris/core
@reva/js         → @reeris/js
@reva/icons      → @reeris/icons (future package)
reva.css         → reeris.css
--reva-*         → --reeris-*
data-reva-*      → data-reeris-*
Reva.init(...)   → Reeris.init(...)
```

Component class names such as `.btn`, `.card`, `.alert`, `.nav`, `.input`, `.app-shell` and `.content-state` are unchanged.

This is intentionally a pre-1.0 breaking rename and is not carried as a permanent compatibility alias layer.
