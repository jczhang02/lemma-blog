# Blog

Astro static site. Math is rendered at build time by MathJax 4 (SVG), so pages ship no math JS.

```sh
bun install   # dependencies (bun.lock)
bun run dev   # http://localhost:4321
bun run build # output in dist/
```

## Writing

- One folder per post: `src/content/posts/<slug>/zh.md` and `en.md` (either may be
  missing), with the post's images and videos in the same folder. URLs are
  `/posts/<slug>/` and `/en/posts/<slug>/`.
- Images: `![alt](./fig.png)`. Astro makes WebP versions in several widths at build time.
  Keep originals under about 2 MB; prefer SVG for line art.
- Video: `![caption](./clip.mp4)` becomes a `<video>`, served from `/media/posts/<slug>/`.
  Keep clips under about 20 MB (Cloudflare's per-file limit is 25 MiB); longer videos
  belong in object storage, not in the repository.
- Numbered figures and tables (`\ref{fig:...}`, `\ref{tab:...}`); caption below a figure,
  above a table. `.invert-dark` inverts line art on transparent background in dark mode:

  ```md
  :::figure{#fig:hom .invert-dark}
  ![Homomorphism](./homomorphism.png)

  The homomorphism $\varphi\colon G \to H$.
  :::
  ```
- Use `.md`, not `.mdx`: MDX treats `{`, `}` and `<` as JSX and breaks TeX.
- Math: `$...$` inline, `$$...$$` display. `\label` / `\eqref` work, also bare in prose.
- Macros: site-wide in `src/math-macros.mjs`; per post under `macros:` in frontmatter.
  `\newcommand` inside a post stays in that post.
- The build prints `[mathjax] <file>: <error>` for TeX errors and undefined macros.
- Theorem-like environments (theorem, lemma, proposition, corollary, definition,
  example, remark, proof). Numbered kinds share one counter per post:

  ```md
  :::theorem[Lagrange]{#thm:lagrange}
  Statement.
  :::

  :::proof
  By Theorem \ref{thm:lagrange}, ...
  :::
  ```

  `\ref{id}` of a theorem becomes a link with its number (write "定理 \ref{..}" as in LaTeX).
  Other `\ref` / `\eqref` go to MathJax. `:::proof[Proof of ...]` replaces the proof head.
  Write theorem `\ref` in prose, not inside `$...$`: MathJax only knows equation labels.
  Forward references work.
- Sections: h2/h3 are numbered (1, 1.1) and theorems restart in each section (2.1).
  Label a section with `## Title \label{sec:intro}`, refer to it with `\ref{sec:intro}`.
  `numbering: false` in frontmatter turns section numbers off.
- Citations: `\cite{key}`, `\cite{a,b}`, `\cite[Thm.~3]{key}`, keys from `src/references.bib`
  (export from Zotero with Better BibTeX). Cited entries are listed at the end of the
  post in AMS style, numbered in order of first citation. Unknown keys print `[cite]` warnings.
- `description` in frontmatter is shown as the abstract under the title.
- Footnotes: `text[^id]` and `[^id]: note`. Tables use booktabs rules by default.

## Files

- `plugins/rehype-mathjax4.mjs`: MathJax pipeline (package list, macro sandbox).
- `plugins/remark-theorems.mjs`: section and theorem numbering, `\label`, `\ref`.
- `plugins/remark-cite.mjs`, `plugins/ams-numeric.csl`: `\cite` and the reference list
  (style from the CSL styles repository, CC BY-SA 3.0).
- `plugins/rehype-toc.mjs`, `rehype-tables.mjs`, `rehype-footnotes.mjs`: TOC data, table
  wrappers, localised footnote labels.
- `plugins/media.mjs`: video embedding, serving in dev, copying into the build.
- `src/styles/global.css`: all design tokens (colors, fonts) at the top.
- `src/styles/mathjax.css`: generated; rerun `bun scripts/gen-mathjax-css.mjs` after a MathJax upgrade.
- `src/i18n.ts`: site name and UI strings.
