# Publishing SDETFlow

## Current release gates

1. GitHub monorepo is public and CI is green.
2. Chromium/Firefox/WebKit Playwright matrix is green.
3. Live OpenAI and Gemini provider contracts have passed with repository secrets masked in logs.
4. Registry ownership and first-publish bootstrap remain.

## Release order

1. Bootstrap the three npm packages under the `@sdetflow` scope.
2. Configure npm Trusted Publishing to use `.github/workflows/npm-publish.yml` and the `release` environment.
3. Configure a RubyGems pending Trusted Publisher and publish `sdet_flow` through `.github/workflows/ruby-gem-release.yml`.
4. Finalize the Maven Central namespace, signing, source/Javadoc artifacts, and Central Publishing Maven Plugin before publishing `sdetflow-api`.
5. Create a GitHub Release/tag matching the public package version.
6. Add canonical package links to README and website.
7. Remove website `noindex` only after public links and career chronology are correct.

See `docs/REGISTRY-SETUP.md` for the exact maintainer steps.

## Security

Prefer OIDC trusted publishing over long-lived registry tokens wherever supported. Keep all credentials out of source files and CI logs.

## Resume rule

Use wording such as "published" or "maintainer of" only after the package is publicly accessible at the referenced registry URL. Do not state download/adoption metrics until those metrics exist.
