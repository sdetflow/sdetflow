# GitHub setup

## Recommended structure

For speed and consistent branding, start with **one public monorepo**:

- GitHub organization: `sdetflow` (preferred if available)
- repository: `sdetflow`
- repository URL target: `https://github.com/sdetflow/sdetflow`

A monorepo is preferable for the initial release because all libraries share security policy, documentation, test strategy and branding. Split packages into separate repositories later only if their release cadence or contributor communities diverge materially.

If the `sdetflow` organization name is unavailable, use Sumanth Gumedelli's personal GitHub account with repository `sdetflow` temporarily; package metadata can be updated before registry publication.

## Repository settings

- public repository;
- default branch `main`;
- require pull requests for `main` after first bootstrap push;
- require CI status checks;
- enable secret scanning, push protection and Dependabot alerts where available;
- enable Discussions only after initial documentation is stable;
- use GitHub Pages from the `website/` deployment workflow after public URLs are final.

## First push

Do not commit API keys, registry tokens, employer/client code, internal URLs, production data, screenshots containing customer information, or proprietary test artifacts.

After the repository exists, push the prepared local history and tag the first public release after CI is green.
