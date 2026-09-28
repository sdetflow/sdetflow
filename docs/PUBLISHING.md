# Publishing SDETFlow

## Order

1. Push the monorepo to GitHub and make all CI green.
2. Validate `@sdetflow` npm scope ownership, then publish `@sdetflow/playwright`, `@sdetflow/ai`, and `@sdetflow/insights`.
3. Publish `sdet_flow` to RubyGems.
4. Configure Sonatype Central Portal namespace/signing for `io.sdetflow` and publish `sdetflow-api`.
5. Create a GitHub Release and tag matching the public version.
6. Activate package links on the portfolio website and remove `noindex` only when the public links and career chronology are correct.

## Required secrets

Use GitHub Actions repository/environment secrets; never paste secrets into source files.

- npm automation token or trusted publishing configuration;
- RubyGems API key or trusted publishing configuration;
- Maven Central credentials/signing material;
- OpenAI/Gemini keys only for isolated live-contract CI with strict spending limits.

## Resume rule

Use wording such as "published" or "maintainer of" only after the package is publicly accessible at the referenced registry URL. Do not state download/adoption metrics until those metrics exist.
