# Sumanth Gumedelli / SDETFlow website draft

Static, dependency-free portfolio site built from the same public release documentation used by the repository.

## Important release toggle

The site currently retains:

```html
<meta name="robots" content="noindex,nofollow">
```

and `robots.txt` disallows crawling. All package and GitHub release links are now public and verified. Search indexing remains disabled only until the final production domain is selected.

Before public deployment:

1. choose the final domain (a free GitHub Pages URL is acceptable);
2. remove `noindex,nofollow`;
3. change `robots.txt` to allow crawling;
4. add canonical URLs and `og:url`;
5. generate sitemap.xml;
6. run Lighthouse/accessibility checks on the deployed host;
7. connect Google Search Console after deployment.

## Local preview

```bash
python3 -m http.server 8080 -d website
```

Then open `http://localhost:8080`.
