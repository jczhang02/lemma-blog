# Agent rules for this repo

## The About page content is private

`src/content/about/` (the About page text, any CV or PDF file in it) is written by the site's author only. Agents never read, search, open, fetch, screenshot, summarize, or change it, and never work around the guards below. The same goes for its copies: `dist/about/`, `dist/en/about/`, the content caches in `.astro/` and `node_modules/.astro/`, `node_modules/.vite/`, and the `/about/` pages on any server except the sample one.

- To work on the About page's layout or code (`src/components/AboutPage.astro`, `plugins/about.mjs`, the About CSS), use the fictitious data in `src/about.sample/`: `bun run dev:sample` serves it on port 4399, and `LEMMA_ABOUT=sample bun run build` builds with it. Never deploy a sample build (`scripts/deploy.mjs` refuses).
- Build with `LEMMA_ABOUT=sample bun run build` to check your work; a plain `bun run build` (and `bun run deploy`) is for when the real site is wanted.
- Do not crawl or link-check a dev server other than the sample one, and do not open the About link in browser scripts on it.
- If a task seems to need the real content (a typo report, a broken entry), say so and let the author handle it.
- Search with `rg` (it skips the content through `.ignore` and `.gitignore`), not `grep -r` over the repo, `src/` or `dist/`.
- Guards: permission deny rules (`.claude/settings.json`, and the author's user settings), a PreToolUse hook that blocks shell commands and scripts that reach the content, and `-diff` in `.gitattributes`, so git output shows no text for it.

## Other

- Writing posts: see `WRITING.md`. Site settings: `lemma.config.mjs`. Visual rules: `DESIGN.md`.
- Commit messages follow Conventional Commits; a commit-msg hook checks them.
