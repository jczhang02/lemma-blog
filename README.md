<div align="center">
  <h1>Lemma</h1>
  <p><b>A quiet Astro theme for math-heavy writing: real LaTeX, numbered theorems, citations, sidenotes and link previews, in Chinese and English.</b></p>
  <p>The theme behind <a href="https://jczhang.cc">jczhang.cc</a>, and the source of that blog.</p>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-b5532f?style=flat-square" alt="License"></a>
  <a href="https://astro.build"><img src="https://img.shields.io/badge/Astro-7-191917?style=flat-square&logo=astro" alt="Astro 7"></a>
  <a href="https://www.mathjax.org"><img src="https://img.shields.io/badge/MathJax-4-191917?style=flat-square" alt="MathJax 4"></a>
  <a href="https://jczhang.cc"><img src="https://img.shields.io/badge/live-jczhang.cc-6b6a64?style=flat-square" alt="Live site"></a>
</div>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/img/hero-dark.webp">
    <img src="docs/img/hero-light.webp" alt="A post in the Lemma theme on desktop and phone" width="1000">
  </picture>
</p>

> 💡 This repository is a working personal blog and a theme at the same time. To use the theme, fork it, change the settings in [Make it yours](#make-it-yours), and replace the posts. The sample post `src/content/posts/hello-math/` (a draft) uses every feature.

## Features

- **Real LaTeX, rendered at build time**: MathJax 4 turns formulas into SVG, so pages ship no math JavaScript. AMS environments, `physics`, `mathtools`, `mhchem`, `cases`, blackboard and script alphabets; site-wide and per-post macros; build warnings for any TeX error or undefined macro.
- **Paper structure**: numbered sections, theorem-like environments numbered per section, proofs with ∎, `\label` / `\ref` / `\eqref` with forward references, numbered figures and tables with captions where print puts them, booktabs tables.
- **Citations from BibTeX**: `\cite{key}` becomes a numbered link and an AMS-style reference list; entries come from a Zotero export.
- **Read in place**: footnotes become sidenotes in the margin on wide screens; citations, cross-references and notes open a preview card on hover, focus or tap.
- **Diagrams**: `tikzcd` and `tikz` code blocks are compiled by LaTeX into inline SVG that follows the text color.
- **Bilingual**: Chinese at `/`, English at `/en/`, translations linked both ways, careful CJK typesetting (mixed-script spacing, justified Chinese).
- **Comfortable to read**: a tick-mark table of contents with section cards, light and dark themes with no flash, reading time, copy buttons, edge fades on wide content, 44px tap targets, WCAG AA contrast.
- **Static and private**: no trackers, no third-party scripts; deploys as static files.

## Quick Start

Needs [Bun](https://bun.sh) 1.2+ (or Node 22.12+). TikZ diagrams also need TeX Live (`latex`, `dvisvgm`, `tikz-cd`).

```bash
git clone https://github.com/jczhang02/lemma-blog.git && cd lemma-blog
bun install
bun run dev              # http://localhost:4321, drafts included
```

```bash
bun run new my-post      # src/content/posts/my-post/zh.md, a draft; --en for en.md
bun run build            # static site in dist/, drafts left out
bun run deploy           # build and upload to Cloudflare (see Deploying)
bun run media:push       # upload videos over 25 MiB to R2
```

## Make it yours

Everything specific to this blog lives in the files below; the rest is theme.

| What | Where | Notes |
| --- | --- | --- |
| Name, author, email, GitHub | `src/i18n.ts` → `SITE` | `authorBibtex` is used in the "cite this post" block |
| Tagline and UI text | `src/i18n.ts` → `ui.zh`, `ui.en` | |
| Domain | `astro.config.mjs` → `site` | canonical URLs, Open Graph, sitemap, RSS |
| Colors, widths | `src/styles/global.css` → `:root` | light and dark tokens; the system is described in [`DESIGN.md`](DESIGN.md) |
| Fonts | `src/layouts/Base.astro` (imports), `--font-*` in `global.css` | serif text, sans UI, LXGW WenKai for Chinese theorem statements |
| Code colors | `astro.config.mjs` → `codeThemes(...)`, `plugins/shiki-themes.mjs` | pass your code background colors; low-contrast tokens are raised to 4.5:1 |
| Avatar and icons | `src/assets/avatar.jpg`, `public/favicon.ico`, `public/icon-192.png`, `public/apple-touch-icon.png` | |
| Math macros | `src/math-macros.mjs`; `macros:` in a post's frontmatter | |
| MathJax packages | `plugins/rehype-mathjax4.mjs` | |
| Bibliography | `src/references.bib`, `src/references-manual.bib`, `plugins/ams-numeric.csl` | see below |
| Theorem names | `plugins/remark-theorems.mjs` → `LABELS` | Chinese and English labels for each kind |
| Large videos | `plugins/media.mjs` → `R2` | bucket name and public origin |
| Deployment | `wrangler.jsonc` | Worker name, account ID, custom domain |

**Bibliography.** `src/references.bib` is written by Zotero: with [Better BibTeX](https://retorque.re/zotero-better-bibtex/), export a collection to that path and tick *Keep updated*. That setting lives in your Zotero, not in this repository. Entries you keep outside Zotero go in `src/references-manual.bib`; a key in both files is taken from the first.

## Writing

A post is a folder: `src/content/posts/<slug>/zh.md` and/or `en.md`, with its images and videos next to it.

```markdown
---
title: Neural operators for Burgers' equation
description: "One or two sentences, shown as the abstract. Quote it if it contains a colon."
date: 2026-10-10
tags: [PDE, operator learning]
draft: true
macros:
  Lap: '\Delta'
---

## Setting \label{sec:setting}

$$
\begin{equation}
  u_t + u u_x = \nu u_{xx} \label{eq:burgers}
\end{equation}
$$

:::theorem[Existence]{#thm:exist}
For smooth initial data, \eqref{eq:burgers} has a unique smooth solution.
:::

:::proof
See \cite{evans2010}.
:::

As Theorem \ref{thm:exist} shows in Section \ref{sec:setting}, ...[^1]

[^1]: Footnotes become sidenotes on wide screens.
```

| Element | Syntax |
| --- | --- |
| Math | `$...$`, `$$...$$`, any AMS environment; `\label`, `\eqref` |
| Sections | `## Title \label{sec:x}`; h2/h3 are numbered (`numbering: false` turns it off) |
| Theorems | `:::theorem[Name]{#thm:x}` … `:::` — also `lemma`, `proposition`, `corollary`, `definition`, `example`, `remark`, `proof` |
| References | `\ref{thm:x}`, `\ref{fig:x}`, `\ref{sec:x}`, `\eqref{eq:x}`, written in prose |
| Citations | `\cite{key}`, `\cite{a,b}`, `\cite[Thm.~3]{key}` |
| Figures, tables | `:::figure{#fig:x .invert-dark}` / `:::table{#tab:x}` around an image or table and a caption paragraph |
| Diagrams | a ` ```tikzcd ` or ` ```tikz ` code block (cached in `tikz-cache/`, commit it) |
| Video | `![caption](./clip.mp4)` |
| Footnotes | `text[^1]` and `[^1]: note` |

Write `.md`, not `.mdx`: MDX reads `{`, `}` and `<` as JSX and breaks TeX. The build prints `[mathjax]`, `[cite]`, `[theorems]`, `[tikz]` and `[media]` warnings with the file name; drafts are checked too. A longer cheat sheet, in Chinese, is in [`WRITING.md`](WRITING.md).

## Features in detail

### Sidenotes

From 1200px wide, footnotes sit in the right margin, each on the baseline of its reference; notes that would overlap stack downward, and the text shifts left when the margin is short. Narrower screens keep the notes at the end of the post, and the reference opens a preview card instead.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/sidenotes-dark.webp">
  <img src="docs/img/sidenotes-light.webp" alt="Theorems with sidenotes in the margin" width="1000">
</picture>

### Link previews

Citations, `\ref`, `\eqref` and notes show their target in a card: the reference entry, the full theorem statement, a figure with its caption, the equation, or a section's opening. Hover (after 200ms) or keyboard focus opens it on desktop; on touch screens the first tap opens it and the second follows the link.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/preview-dark.webp">
  <img src="docs/img/preview-light.webp" alt="A preview card showing a theorem" width="900">
</picture>

### Table of contents

A column of ticks in the left margin, one per section, the current one long and dark. Each tick shows its section's title and first lines on hover or focus.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/toc-dark.webp">
  <img src="docs/img/toc-light.webp" alt="TOC ticks with a section card" width="480">
</picture>

### Diagrams and code

TikZ diagrams use the same fonts and size as the formulas around them and switch color with the theme. Code is highlighted at build time, with a copy button.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/diagram-dark.webp">
  <img src="docs/img/diagram-light.webp" alt="A tikz-cd pullback diagram with a numbered caption" width="900">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/code-dark.webp">
  <img src="docs/img/code-light.webp" alt="A code block with a copy button" width="800">
</picture>

<details>
<summary><strong>Deploying</strong></summary>

`bun run deploy` builds the site and uploads `dist/` with wrangler as Cloudflare Workers static assets (no Worker code, so requests are free and unlimited). It signs in with the `cf` CLI login (`cf auth login`); with plain wrangler, run `bunx wrangler login` once and `bunx wrangler deploy` after `bun run build`. Set your Worker name, account ID and domain in `wrangler.jsonc`.

Any static host works too: the output in `dist/` is plain HTML, CSS and fonts. Files over 25 MiB are not accepted by Cloudflare, which is why large videos go to R2 with `bun run media:push`: it uploads them under a content hash, records them in `src/media-r2.json`, and keeps them out of git.

On jczhang.cc, the R2 host has edge caching for a year (query strings ignored), a WAF rule that blocks query strings and non-GET/HEAD requests, and a rate limit of 100 requests per 10 seconds per IP, so the only metered item stays near zero.

</details>

<details>
<summary><strong>How it works</strong></summary>

Markdown goes through Astro's unified pipeline with local plugins:

- `plugins/remark-tikz.mjs`: TikZ code blocks to SVG through `latex` and `dvisvgm`, cached by content hash.
- `plugins/remark-theorems.mjs`: section and theorem numbering, figures and tables, `\label` / `\ref`.
- `plugins/remark-reading.mjs`: reading time and section count.
- `plugins/remark-cite.mjs`: `\cite` and the reference list (citation-js, AMS numeric CSL).
- `plugins/media.mjs`: video embedding, dev serving, build copy, R2 URLs.
- `plugins/rehype-mathjax4.mjs`: MathJax 4 to SVG, per-post macro sandbox, forward references.
- `plugins/rehype-toc.mjs`: TOC entries with rendered math and section previews.
- `plugins/rehype-tables.mjs`, `plugins/rehype-footnotes.mjs`: table wrappers, localized footnotes.

Client-side code is small and lives in `src/components/` (TOC, sidenotes, previews, copy buttons). `astro.config.mjs` imports the plugins with a hash of their sources, so editing a plugin re-renders every post in a running dev server.

</details>

## License

The code is [MIT](LICENSE). The posts, the avatar and the site icons are mine and not covered by it; `plugins/ams-numeric.csl` comes from the [CSL styles repository](https://github.com/citation-style-language/styles) under CC BY-SA 3.0.
