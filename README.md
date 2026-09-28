# Reeris UI

**Current source version: 0.55.0**

Reeris UI is a native-web UI framework built around semantic HTML and CSS. The Core stylesheet requires no JavaScript and no consumer build step. Optional JavaScript adds behavior only where an application needs it.

[Documentation](https://eristavi.github.io/ReerisUI/docs/index.html) · [API reference](https://eristavi.github.io/ReerisUI/docs/api-reference.html) · [Examples and starters](https://eristavi.github.io/ReerisUI/docs/starters.html) · [Changelog](CHANGELOG.md)

## Philosophy

- **Start with the platform.** Use native controls, semantic markup, CSS layout, container queries, scroll snap, and progressive CSS features before adding script.
- **Keep behavior in the right place.** Core provides presentation and state styling; applications control data, media playback, persistence, and business logic. `@reeris/js` is optional.
- **Adapt to context.** Components respond to their containers, system color preference, density, direction, and user motion or contrast preferences.
- **Make access part of the design.** Keyboard focus, reduced motion, forced colors, reflow, and readable content are built into the component contracts. WCAG 2.2 AA is the acceptance target; full conformance is not yet claimed.
- **Keep the public surface deliberate.** Design tokens, documented classes, source maps, and reproducible builds support customization and review.

## Current features

| Area | Included today | Explore |
| --- | --- | --- |
| Foundations | Semantic tokens, system/light/dark/Glass themes, density, layout primitives, RTL support, typography roles and heading scale | [Foundation](https://eristavi.github.io/ReerisUI/docs/foundation.html) · [Typography](https://eristavi.github.io/ReerisUI/docs/typography.html) · [Themes](https://eristavi.github.io/ReerisUI/docs/themes.html) |
| Controls and feedback | Buttons, native-first forms, select styling, focus states, alerts, progress, toasts, dialogs, and content states | [Forms](https://eristavi.github.io/ReerisUI/docs/forms-complete.html) · [Feedback](https://eristavi.github.io/ReerisUI/docs/feedback.html) · [Content states](https://eristavi.github.io/ReerisUI/docs/content-states.html) |
| Application patterns | Navigation, app shells, sidebars, tables, dashboards, messaging, notifications, files, settings, and commerce presentation | [Navigation](https://eristavi.github.io/ReerisUI/docs/navigation.html) · [Tables](https://eristavi.github.io/ReerisUI/docs/tables.html) · [Messaging](https://eristavi.github.io/ReerisUI/docs/messaging.html) |
| CSS motion and media | CSS-first Glide navigation, scroll-state styling, scroll progress, image/video parallax presentation, scroll-snap carousels, and selective entry transitions | [Navigation](https://eristavi.github.io/ReerisUI/docs/navigation-completion.html) · [Marketing and parallax](https://eristavi.github.io/ReerisUI/docs/marketing.html) · [Carousel](https://eristavi.github.io/ReerisUI/docs/carousel.html) |
| Integration | Modular Core CSS, optional vanilla-JS enhancements, public API reference, and five Core-only starters | [API reference](https://eristavi.github.io/ReerisUI/docs/api-reference.html) · [Starters](https://eristavi.github.io/ReerisUI/docs/starters.html) |

New CSS features use readable fallbacks in browsers without support. Parallax moves the media presentation with scroll; it does not seek video frames. Carousels use native scrolling, while video playback stays under the user's control.

## Get started

Download the [built Core stylesheet](https://eristavi.github.io/ReerisUI/docs/assets/reeris.css) and include it in a page:

```html
<link rel="stylesheet" href="reeris.css">
<button class="btn primary">Continue</button>
```

The documentation includes [live component examples with Preview and HTML views](https://eristavi.github.io/ReerisUI/docs/index.html) and [five starter compositions](https://eristavi.github.io/ReerisUI/docs/starters.html). The `@reeris/core` and `@reeris/js` package sources are in this repository; npm publication is pending identity and namespace clearance. Do not assume these packages are available in the registry yet.

For local development, use Node.js 20 or later:

```sh
npm install
npm run build
npm run audit:all
```

## Repository map

- `packages/core` — canonical CSS framework
- `packages/js` — optional vanilla-JS enhancements
- `tokens` — typed design-token source
- `docs`, `examples`, `tests`, `tooling` — documentation, examples, acceptance fixtures, and release tooling

## Release status

Version 0.55.0 is the current source version. Core remains feature-frozen against its release-candidate API baseline, with its 0.55.0 public API snapshot locked after the source audit. The [0.55 audit status](docs/release-candidate-readiness-0.55.0.md) records the missing current browser evidence and open manual gates. Public package publication remains gated on identity and namespace clearance. See the [changelog](CHANGELOG.md) for the version history and newer unreleased work.

MIT licensed. See [LICENSE](LICENSE).
