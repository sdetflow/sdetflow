# First npm release

This is the controlled bootstrap procedure for the first public SDETFlow npm packages.

Packages:
- `@sdetflow/playwright@0.2.0`
- `@sdetflow/ai@0.2.0`
- `@sdetflow/insights@0.2.0`

## Preconditions

- npm account owned by Sumanth Gumedelli
- npm organization/scope `@sdetflow`
- account 2FA enabled
- GitHub repository `sdetflow/sdetflow` public
- main CI green
- Playwright browser matrix green
- live OpenAI/Gemini contract validation green

## Clone and verify

```bash
git clone https://github.com/sdetflow/sdetflow.git
cd sdetflow

./scripts/verify-all.sh
./scripts/verify-release.sh
```

Both commands must finish successfully before publication.

## Authenticate

```bash
npm login
npm whoami
```

Confirm `npm whoami` shows the maintainer account that owns or can publish to the `@sdetflow` scope.

## Inspect package contents

Run this for all three packages:

```bash
cd packages/playwright
npm pack --dry-run

cd ../ai
npm pack --dry-run

cd ../insights
npm pack --dry-run
```

Verify the output contains only intended release files and does not contain environment files, API keys, test artifacts, local logs, or credentials.

## Publish

Publish deliberately one package at a time:

```bash
cd packages/playwright
npm publish --access public

cd ../ai
npm publish --access public

cd ../insights
npm publish --access public
```

Complete any npm 2FA prompt locally. Never paste OTPs, recovery codes, passwords, or tokens into chat, source control, or GitHub issues.

## Verify after publication

```bash
npm view @sdetflow/playwright version
npm view @sdetflow/ai version
npm view @sdetflow/insights version
```

Each should return `0.2.0`.

Then install from a clean temporary project:

```bash
mkdir -p /tmp/sdetflow-npm-smoke
cd /tmp/sdetflow-npm-smoke
npm init -y
npm install @sdetflow/ai @sdetflow/insights
npm install -D @playwright/test @sdetflow/playwright
```

## After bootstrap

Configure npm Trusted Publishing for each package to use:

- GitHub organization: `sdetflow`
- repository: `sdetflow`
- workflow: `npm-publish.yml`
- environment: `release`

Future releases should use OIDC trusted publishing instead of a long-lived npm automation token.

## Resume / LinkedIn rule

Do not describe these packages as publicly published until all three canonical npm package pages resolve successfully.
