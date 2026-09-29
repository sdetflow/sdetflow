# RubyGems first release

SDETFlow publishes the Ruby package as `sdet_flow`.

## Security model

Use RubyGems Trusted Publishing with GitHub Actions OIDC. Do not create or store a long-lived RubyGems API key for CI.

The gemspec sets `rubygems_mfa_required = true` so new releases require MFA protection.

## One-time RubyGems setup

1. Sign in to https://rubygems.org.
2. Enable MFA on the RubyGems account.
3. Open the Pending Trusted Publishers page:
   https://rubygems.org/profile/oidc/pending_trusted_publishers
4. Create a pending publisher with:
   - Gem name: `sdet_flow`
   - Repository owner: `sdetflow`
   - Repository name: `sdetflow`
   - Workflow filename: `ruby-gem-release.yml`
   - Environment: `release`
   - Workflow Repository Owner: leave blank
   - Workflow Repository Name: leave blank

After the first successful push, RubyGems converts the pending publisher to a normal trusted publisher and the account becomes an owner of the gem.

## Release workflow

The repository already contains:

`.github/workflows/ruby-gem-release.yml`

It:
- checks out source;
- sets up Ruby;
- runs the Ruby test suite;
- builds the gem;
- publishes with `rubygems/release-gem@v1` using OIDC.

## First release

After the pending trusted publisher exists, run the workflow manually or create the matching release tag.

Expected public package:
`sdet_flow 0.2.0`

## Post-release verification

Verify the canonical RubyGems page and then run a clean consumer installation:

```bash
gem install sdet_flow -v 0.2.0
ruby -e "require 'sdet_flow'; puts SdetFlow::VERSION"
```

Expected version output:
`0.2.0`

Do not describe the gem as publicly published until the RubyGems package page resolves.
