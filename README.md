# Blog

Astro static site. Math is rendered at build time by MathJax 4 (SVG), so pages ship no math JS.

```sh
pnpm dev      # http://localhost:4321
pnpm build    # output in dist/
```

## Writing

- Posts: `src/content/posts/zh/<slug>.md` and `src/content/posts/en/<slug>.md`.
  The same `<slug>` in both folders links the two versions.
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

## Files

- `plugins/rehype-mathjax4.mjs`: MathJax pipeline (package list, macro sandbox).
- `plugins/remark-theorems.mjs`: theorem environments, numbering, `\ref` to theorems.
- `src/styles/global.css`: all design tokens (colors, fonts) at the top.
- `src/styles/mathjax.css`: generated; rerun `node scripts/gen-mathjax-css.mjs` after a MathJax upgrade.
- `src/i18n.ts`: site name and UI strings.
