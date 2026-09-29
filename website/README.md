# Sumanth Gumedelli / SDETFlow website draft

Static, dependency-free portfolio site built from the same public release documentation used by the repository.

## Important release toggle

The site currently retains:

```html
<meta name="robots" content="noindex,nofollow">
```

and `robots.txt` disallows crawling. All package and GitHub release links are now public and verified. Search indexing remains disabled only until the final production domain is selected.

Production checklist:
1. Enable GitHub Pages for this repository with **GitHub Actions** as the source.
2. Confirm the Pages deployment succeeds.
3. Run Lighthouse/accessibility checks on the deployed host.
4. Add the site to Google Search Console and submit `sitemap.xml`.

## Local preview

```bash
python3 -m http.server 8080 -d website
```

Then open `http://localhost:8080`.
