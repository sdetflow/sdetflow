# What is needed from Sumanth for public release

The source build can continue without sharing passwords or API keys in chat. The next external steps require account ownership actions by Sumanth.

## Now — GitHub

Create a GitHub organization named `sdetflow` if the name is available, then create an **empty public repository** named `sdetflow`. Do not initialize it with a README, `.gitignore`, or license because the prepared repository already contains those files.

If the organization name is unavailable, create `sdetflow` under your personal GitHub account; repository URLs can be updated before registry publication.

## After the first push

- enable Actions;
- enable secret scanning/push protection and Dependabot where available;
- run the main CI matrix;
- run the Playwright browser matrix;
- create a protected GitHub environment named `live-ai-contracts` before adding AI-provider secrets.

## Registry ownership

For public package links on the resume/website, create or confirm:

- npm account and `@sdetflow` organization/scope if available;
- RubyGems account;
- Maven Central / Sonatype Central Portal account and namespace ownership for `io.sdetflow`.

## AI provider contract testing

Do not send API keys in chat. Add `OPENAI_API_KEY` and `GEMINI_API_KEY` directly to the protected GitHub environment secrets. Add approved model names as environment variables/variables. The live workflow is intentionally manual to control cost.

## Website

A custom domain is useful but not required for the first resume update. The site can first deploy through GitHub Pages. A domain such as `sumanthgumedelli.com` or `.dev` can be connected afterward.
