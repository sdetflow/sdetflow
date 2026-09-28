# First npm release without local Node.js

Local Node.js is **not required** for the first SDETFlow npm release. GitHub Actions can perform the build, tests, package inspection, and publication.

## One-time bootstrap token

Because npm Trusted Publishing is configured from an existing package's settings, the first version of each brand-new package needs a bootstrap authentication method.

Create a short-lived **granular npm access token**:

- expiration: as short as practical (for example 1 day);
- Packages and scopes permission: **Read and write (publish and stage)**;
- restrict it to the `@sdetflow` scope;
- enable **Bypass 2FA** only for this one-time CI bootstrap publish;
- do not grant unrelated organization-management permissions.

Add it to GitHub as repository secret:

`NPM_TOKEN`

Never paste the token into chat, source code, a GitHub issue, or an Actions input.

## Publish one package at a time

In GitHub:

1. Open **Actions**.
2. Choose **Bootstrap npm Packages**.
3. Click **Run workflow**.
4. Select `playwright`.
5. Wait for the test, dry-run package inspection, publish, and registry verification steps to pass.
6. Repeat for `ai`.
7. Repeat for `insights`.

The workflow publishes:

- `@sdetflow/playwright@0.2.0`
- `@sdetflow/ai@0.2.0`
- `@sdetflow/insights@0.2.0`

## Immediately after bootstrap

For each new package on npm:

1. Open **Settings → Trusted Publisher**.
2. Choose GitHub Actions.
3. Configure:
   - organization/user: `sdetflow`
   - repository: `sdetflow`
   - workflow filename: `npm-publish.yml`
   - environment: `release`
   - allowed action: staged publishing
4. Under publishing access, use the strongest 2FA/token restriction compatible with trusted publishing.
5. Delete/revoke the bootstrap `NPM_TOKEN` in npm.
6. Delete the `NPM_TOKEN` GitHub repository secret.

Future npm releases should use OIDC trusted publishing rather than long-lived tokens.
