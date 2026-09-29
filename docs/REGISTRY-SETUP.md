# Registry setup for SDETFlow

This document records the human-owned registry setup required before SDETFlow's first public package releases. Never commit registry passwords, API tokens, OpenAI keys, Gemini keys, GPG private keys, or recovery codes.

## 1. npm — @sdetflow

Packages:
- @sdetflow/playwright
- @sdetflow/ai
- @sdetflow/insights

### First publish

The @sdetflow scope must exist on npm under an account/organization controlled by Sumanth Gumedelli. Enable 2FA before publishing.

Because npm trusted-publisher settings are configured on package settings, bootstrap each new package with an authenticated first publish from a maintainer workstation:

```bash
npm login

cd packages/playwright
npm publish --access public

cd ../ai
npm publish --access public

cd ../insights
npm publish --access public
```

Before pressing Enter on any publish, run `npm pack --dry-run` and confirm the package name, version, files, license, repository URL, and author.

### Future publishes — trusted/staged

After each package exists on npm, configure its Trusted Publisher:

- Provider: GitHub Actions
- Organization/user: sdetflow
- Repository: sdetflow
- Workflow filename: npm-publish.yml
- Environment: release
- Allowed action: stage publishing

The repository workflow `.github/workflows/npm-publish.yml` stages releases using OIDC. Review and approve the stage on npm before it becomes public. No long-lived npm publish token should be stored in GitHub.

## 2. RubyGems — sdet_flow

Create/sign in to RubyGems.org and enable MFA.

For the first release, create a **Pending Trusted Publisher**:

- Gem name: sdet_flow
- Repository owner: sdetflow
- Repository name: sdetflow
- Workflow filename: ruby-gem-release.yml
- Environment: release
- Workflow repository owner/name: leave blank

Then push tag `ruby-v0.2.0` or manually dispatch `.github/workflows/ruby-gem-release.yml`. RubyGems should convert the pending publisher into a normal trusted publisher after the first successful push.

## 3. Maven Central — Java SDK

Artifact currently planned:
- groupId: io.sdetflow
- artifactId: sdetflow-api
- version: 0.2.0

Do not publish until the namespace is verified.

Central Portal can automatically provision a personal `io.github.<github-user>` namespace when signup is performed through GitHub. The SDETFlow-branded `io.sdetflow` namespace requires independent namespace verification (normally control of the corresponding DNS domain). Decide whether to:

1. acquire/control `sdetflow.io` and keep `io.sdetflow`, or
2. use the GitHub-personal namespace granted by Central Portal and update the POM before first release.

After the namespace decision, add source JAR, Javadoc JAR, GPG signing, Central Publishing Maven Plugin, and release credentials through a protected GitHub environment.

## 4. GitHub release environment

Create a GitHub Actions environment named `release`.

Recommended:
- restrict deployment to the `main` branch and release tags;
- require maintainer approval where the plan supports it;
- do not place npm or RubyGems long-lived publish tokens in repository secrets when OIDC trusted publishing is available.

## Release rule

A package is described as **published** in Sumanth Gumedelli's resume, LinkedIn, or website only after its canonical registry page is publicly reachable.
