// @ts-check
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';

// Local modules are imported with a hash of their sources (and of the data
// files they read), for two reasons:
// - Node caches imports for the life of the process, and Astro re-imports only
//   this file on change; without the hash a running dev server keeps old plugin code.
// - Astro caches rendered posts until the config changes; the hash is part of
//   the config (plugin options), so an edit re-renders every post.
const MODULES = [
  './plugins/remark-theorems.mjs',
  './plugins/remark-cite.mjs',
  './plugins/rehype-mathjax4.mjs',
  './plugins/rehype-toc.mjs',
  './plugins/rehype-tables.mjs',
  './plugins/rehype-footnotes.mjs',
  './plugins/media.mjs',
  './src/math-macros.mjs',
];
const bibliography = new URL('./src/references.bib', import.meta.url);
const DATA = ['./plugins/ams-numeric.csl', './src/references.bib'];
const LOCAL = [...MODULES, ...DATA];
const version = createHash('sha1')
  .update(LOCAL.map((f) => readFileSync(new URL(f, import.meta.url))).join(''))
  .digest('hex')
  .slice(0, 12);
const [
  { default: remarkTheorems },
  { default: remarkCite },
  { default: rehypeMathJax4 },
  { default: rehypeToc },
  { default: rehypeTables },
  { default: rehypeFootnotes },
  { default: remarkMedia, mediaIntegration },
  { default: macros },
] = await Promise.all(MODULES.map((f) => import(`${f}?v=${version}`)));
const posts = new URL('./src/content/posts/', import.meta.url);

export default defineConfig({
  // TODO: replace with your domain.
  site: 'https://example.com',
  integrations: [
    sitemap(),
    mediaIntegration({ posts }),
    // Restart the dev server when a local plugin or the macros file changes.
    {
      name: 'watch-local-modules',
      hooks: {
        'astro:config:setup': ({ addWatchFile }) => LOCAL.forEach((f) => addWatchFile(new URL(f, import.meta.url))),
      },
    },
  ],
  // Markdown images get a srcset and are scaled down for small screens.
  image: { layout: 'constrained' },
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
      remarkPlugins: [remarkMath, remarkDirective, remarkTheorems, [remarkCite, { bibliography }], [remarkMedia, { posts }]],
      rehypePlugins: [[rehypeMathJax4, { macros, version }], rehypeToc, rehypeTables, rehypeFootnotes],
    }),
    shikiConfig: {
      themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
      defaultColor: false,
    },
  },
});
