# Sumanth Gumedelli / SDETFlow website draft

Static, dependency-free portfolio draft built from the same documentation source used by the repository.

## Important release toggle

The draft intentionally contains:

```html
<meta name="robots" content="noindex,nofollow">
```

and `robots.txt` disallows crawling. This prevents premature indexing before public package links, GitHub URLs, domain, and career chronology are verified.

Before public deployment:

1. choose/register the final domain;
2. publish/verify GitHub and package registry links;
3. validate all public claims;
4. remove `noindex,nofollow`;
5. change `robots.txt` to allow crawling;
6. add canonical URLs and `og:url`;
7. generate sitemap.xml;
8. run Lighthouse/accessibility checks on the deployed host;
9. connect Google Search Console after deployment.

## Local preview

```bash
python3 -m http.server 8080 -d website
```

Then open `http://localhost:8080`.
