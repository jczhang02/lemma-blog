// @ts-check
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';

// Local modules are imported with a hash of their sources, for two reasons:
// - Node caches imports for the life of the process, and Astro re-imports only
//   this file on change; without the hash a running dev server keeps old plugin code.
// - Astro caches rendered posts until the config changes; the hash is part of
//   the config (plugin options), so an edit re-renders every post.
const LOCAL = ['./plugins/remark-theorems.mjs', './plugins/rehype-mathjax4.mjs', './plugins/rehype-toc.mjs', './plugins/rehype-tables.mjs', './src/math-macros.mjs'];
const version = createHash('sha1')
  .update(LOCAL.map((f) => readFileSync(new URL(f, import.meta.url))).join(''))
  .digest('hex')
  .slice(0, 12);
const [remarkTheorems, rehypeMathJax4, rehypeToc, rehypeTables, macros] = await Promise.all(
  LOCAL.map(async (f) => (await import(`${f}?v=${version}`)).default),
);

export default defineConfig({
  // TODO: replace with your domain.
  site: 'https://example.com',
  integrations: [
    sitemap(),
    // Restart the dev server when a local plugin or the macros file changes.
    {
      name: 'watch-local-modules',
      hooks: {
        'astro:config:setup': ({ addWatchFile }) => LOCAL.forEach((f) => addWatchFile(new URL(f, import.meta.url))),
      },
    },
  ],
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    // Unified (remark/rehype) pipeline, needed for remark-math and MathJax.
    processor: unified({
      // Off: punctuation stays exactly as typed (no curly quotes, no -- to en dash).
      smartypants: false,
      remarkPlugins: [remarkMath, remarkDirective, remarkTheorems],
      rehypePlugins: [[rehypeMathJax4, { macros, version }], rehypeToc, rehypeTables],
    }),
    shikiConfig: {
      themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
      defaultColor: false,
    },
  },
});
