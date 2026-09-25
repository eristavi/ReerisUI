# Reeris UI Security Policy

Reeris UI treats security as part of the public release contract.

## Supported versions

Until Reeris UI reaches 1.0, security fixes are applied to the latest published `0.x` release line. After 1.0, the project will publish a supported-version matrix here and in release notes.

## Reporting a vulnerability

Please do **not** publish exploitable security details in a public issue.

When the public repository is available, use its private security-advisory/reporting channel (for example, the repository Security tab). Before that channel exists, disclose the issue privately to the project maintainer through the project's published maintainer contact rather than posting reproduction details publicly.

Include, when possible:

- affected Reeris package and version;
- affected browser/runtime;
- minimal reproduction;
- security impact;
- any known workaround.

## Response process

Maintainers will validate the report, determine affected versions, prepare a fix, and coordinate disclosure. Security fixes may be released outside the normal release cadence. A security issue may justify an earlier API change when keeping the existing behavior would leave users exposed.

## Security architecture

Reeris Core has zero production dependencies and requires no JavaScript. Optional `@reeris/js` uses native DOM APIs and is designed to work without `eval`, `new Function`, inline event handlers, or unsafe HTML insertion. Reeris does not treat application/user content as trusted HTML.

Normal Reeris operation is designed to be compatible with a strict Content Security Policy without requiring `unsafe-eval` or `unsafe-inline`. Applications remain responsible for CSP configuration, sanitizing application-generated HTML, server security, authentication, authorization, and business data.
