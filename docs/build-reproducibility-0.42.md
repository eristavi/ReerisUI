# Reeris UI 0.42 — Build Reproducibility & Source Maps

Reeris 0.42 makes build reproducibility an explicit release requirement.

## Acceptance contract

- Core `dist/` is cleaned before every production build.
- Design-token CSS/JSON/JS is regenerated from the canonical token source during the build.
- CSS and JS source traversal is explicitly sorted.
- Two consecutive clean builds must produce the same file list and byte-identical SHA-256 tree hash.
- Production artifacts must not contain generated timestamps or machine-local absolute paths.
- `reeris.css` and `reeris.min.css` publish Source Map v3 files.
- Both maps resolve to real CSS modules shipped under `dist/sources/`.
- Published source copies must be byte-identical to the canonical Core CSS modules.
- Release evidence and audit reports may contain timestamps; they are not production build artifacts.

Run `npm run audit:repro` to execute the gate independently, or `npm run release:check` for the complete release suite.
