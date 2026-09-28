# SDETFlow v0.2.0 Public Release Checklist

## Repository
- [ ] Create GitHub organization `sdetflow` if available.
- [ ] Create public repository `sdetflow` with no auto-generated README/license (the repository already contains them).
- [ ] Bootstrap-push the prepared local history.
- [ ] Enable branch protection after the bootstrap push.
- [ ] Enable secret scanning / push protection / Dependabot where available.
- [ ] CI green on Node 20/22, Java 17/21, Ruby 3.1/3.3.

## Playwright
- [ ] Chromium real-browser integration green.
- [ ] Firefox real-browser integration green.
- [ ] WebKit real-browser integration green.
- [ ] `testInfo.attach` diagnostic integration green.

## AI
- [ ] Add OpenAI API key as protected environment secret.
- [ ] Add Gemini API key as protected environment secret.
- [ ] Set approved test model variables.
- [ ] Keep strict per-call provider budgets.
- [ ] Live OpenAI contract green.
- [ ] Live Gemini contract green.

## Registry publication
- [ ] Confirm npm `@sdetflow` scope ownership and public access.
- [ ] Publish `@sdetflow/playwright@0.2.0`.
- [ ] Publish `@sdetflow/ai@0.2.0`.
- [ ] Publish `@sdetflow/insights@0.2.0`.
- [ ] Publish `sdet_flow` 0.2.0 to RubyGems.
- [ ] Configure `io.sdetflow` namespace/signing in Maven Central and publish `sdetflow-api` 0.2.0.

## Portfolio/resume
- [ ] Add actual GitHub/registry URLs to website.
- [ ] Remove `noindex,nofollow` and generate final sitemap/canonical URL.
- [ ] Add public links to LinkedIn Featured section.
- [ ] Add only actually published package claims to resume.
- [ ] Do not state download/adoption counts until real metrics exist.
