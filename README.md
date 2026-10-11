# Blog

Astro static site. Math is rendered at build time by MathJax 4 (SVG), so pages ship no math JS.

```sh
bun install          # dependencies (bun.lock)
bun run dev          # http://localhost:4321, drafts included
bun run build        # output in dist/, drafts left out
bun run new <slug>   # start a post (draft) in src/content/posts/<slug>/zh.md; --en for en.md
bun run media:push   # upload videos over 25 MiB to R2 (see plugins/media.mjs)
bun run deploy       # build and publish to https://jczhang.cc
```

## Hosting (Cloudflare)

- Site: Workers static assets, no Worker code (`wrangler.jsonc`), custom domain `jczhang.cc`;
  `www.jczhang.cc` redirects there (zone redirect rule). Asset requests are free and unlimited.
  `bun run deploy` signs wrangler in with the `cf` CLI login (`cf auth login`).
- Videos over 25 MiB: R2 bucket `blog-media` at `media.jczhang.cc` (r2.dev URL off). Zone rules
  for that host keep R2 reads, the only metered item, near zero: edge cache for a year with
  query strings ignored, a WAF rule blocking query strings and non-GET/HEAD, and a rate limit
  of 100 requests per 10 s per IP.
- Budget email alerts at $1, $5 and $8. Cloudflare has no hard spending cap.

## Writing

See [WRITING.md](WRITING.md) (cheat sheet, in Chinese). The sample post
`src/content/posts/hello-math/` uses every feature.

Needs TeX Live (`latex`, `dvisvgm`, tikz-cd) for TikZ diagrams. Compiled diagrams are cached in
`tikz-cache/` (committed), so a build without TeX still has them.

## Files

- `plugins/rehype-mathjax4.mjs`: MathJax pipeline (package list, macro sandbox).
- `plugins/remark-theorems.mjs`: section and theorem numbering, `\label`, `\ref`.
- `plugins/remark-cite.mjs`, `plugins/ams-numeric.csl`: `\cite` and the reference list
  (style from the CSL styles repository, CC BY-SA 3.0).
- `plugins/remark-reading.mjs`: reading time and section count under the title.
- `plugins/rehype-toc.mjs`, `rehype-tables.mjs`, `rehype-footnotes.mjs`: TOC data, table
  wrappers, localised footnote labels.
- `plugins/remark-tikz.mjs`: `tikzcd` / `tikz` code blocks to inline SVG (cache in `tikz-cache/`).
- `plugins/media.mjs`: video embedding, serving in dev, copying into the build; videos listed
  in `src/media-r2.json` (written by `scripts/media-push.mjs`) are served from R2.
- `plugins/shiki-themes.mjs`: Vitesse code themes with token colors raised to 4.5:1 contrast.
- `src/references.bib`: Zotero export (Better BibTeX, collection G.Blog, kept updated); do not
  edit. `src/references-manual.bib`: entries not in Zotero.
- `src/styles/global.css`: all design tokens (colors, fonts) at the top.
- `src/styles/mathjax.css`: generated; rerun `bun scripts/gen-mathjax-css.mjs` after a MathJax upgrade.
- `src/i18n.ts`: site name and UI strings.
