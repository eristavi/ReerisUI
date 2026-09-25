# Reeris UI 0.46 — Release Candidate Readiness

## Status

Reeris Core is feature-frozen and the public Core/optional-JS API has an RC freeze baseline. A build may be classified **ready for RC validation** only when every automated release gate passes.

This status is intentionally narrower than “ready for 1.0”. Manual browser/device, assistive-technology, zoom/reflow, forced-colors, and visual-baseline evidence remains required before 1.0. Public name/package/repository clearance remains required before public publication.

## Public API freeze

- Baseline: `tests/release/public-api-freeze.json`
- Baseline version: `0.46.0`
- API SHA-256: `922fe1f1f74e301234b25ea3915004dd98f2f088801f7a648ce1b7e449569808`
- Classes: 732
- Public tokens/hooks: 518
- Reeris-owned data attributes: 11
- Package exports: 14
- Optional JavaScript API entries: 5

## Deprecation policy

`DEPRECATIONS.md` records Reeris’s formal lifecycle: Supported → Deprecated → Migration period → removal in the next major version. No APIs are currently deprecated.


## Automated release evidence

The complete 0.46 release gate passed before packaging:

- RC readiness: 79/79
- Accessibility: 51/51
- Browser/reflow prerequisites: 41/41
- Forms: 32/32
- Content states: 28/28
- CSS architecture: 14/14
- Visual/docs-theme: 163/163
- RTL/i18n: 22/22
- Theme validation: 114/114
- Documentation/API: 1528/1528
- Starter integration: 104/104
- Security/CSP: 399/399
- Package/release: 82/82
- Build reproducibility: 286/286
- Deterministic build tree hash: `0e4f4ed0953ca969a0b13285b6df8ad259b63343e65c39c9826071172a2afe63`

## Open manual / external gates

The authoritative registry is `tests/release/manual-gates.json`.

- Desktop browser matrix — open; blocks 1.0.
- Mobile browser/device matrix — open; blocks 1.0.
- Assistive technology / keyboard review — open; blocks 1.0.
- Real-browser zoom/reflow/touch review — open; blocks 1.0.
- Forced colors / high contrast — open; blocks 1.0.
- Approved visual-regression PNG baselines — open; blocks 1.0.
- Public project/package/repository naming and appropriate conflict/trademark clearance — open; blocks public publication.

## Release command

```sh
npm run release:check
```

The command must remain non-publishing. It builds, audits and writes release evidence only.
