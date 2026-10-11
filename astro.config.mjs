// @ts-check
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
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
  './plugins/remark-tikz.mjs',
  './plugins/remark-theorems.mjs',
  './plugins/remark-reading.mjs',
  './plugins/remark-cite.mjs',
  './plugins/rehype-mathjax4.mjs',
  './plugins/rehype-toc.mjs',
  './plugins/rehype-tables.mjs',
  './plugins/rehype-footnotes.mjs',
  './plugins/media.mjs',
  './plugins/shiki-themes.mjs',
  './src/math-macros.mjs',
];
// references.bib is exported by Zotero (Better BibTeX, kept updated): do not
// edit it. Entries not in Zotero go in references-manual.bib.
const BIB = ['./src/references.bib', './src/references-manual.bib'];
const bibliographies = BIB.map((f) => new URL(f, import.meta.url));
const DATA = ['./plugins/ams-numeric.csl', ...BIB, './src/media-r2.json'];
const LOCAL = [...MODULES, ...DATA];
const version = createHash('sha1')
  .update(LOCAL.map((f) => (existsSync(new URL(f, import.meta.url)) ? readFileSync(new URL(f, import.meta.url)) : '')).join(''))
  .digest('hex')
  .slice(0, 12);
const [
  { default: remarkTikz },
  { default: remarkTheorems },
  { default: remarkReading },
  { default: remarkCite },
  { default: rehypeMathJax4 },
  { default: rehypeToc },
  { default: rehypeTables },
  { default: rehypeFootnotes },
  { default: remarkMedia, mediaIntegration },
  { default: codeThemes },
  { default: macros },
] = await Promise.all(MODULES.map((f) => import(`${f}?v=${version}`)));
const posts = new URL('./src/content/posts/', import.meta.url);
const tikzCache = new URL('./tikz-cache/', import.meta.url);
const manifest = new URL('./src/media-r2.json', import.meta.url);
// The code block backgrounds (--surface in src/styles/global.css); keep in sync.
const themes = await codeThemes({ light: '#f2f0e8', dark: '#201f1c' });

export default defineConfig({
  site: 'https://jczhang.cc',
  integrations: [
    // hreflang alternates pair /posts/x/ with /en/posts/x/.
    sitemap({ i18n: { defaultLocale: 'zh', locales: { zh: 'zh-CN', en: 'en' } } }),
    mediaIntegration({ posts, manifest }),
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
      remarkPlugins: [remarkMath, remarkDirective, [remarkTikz, { cache: tikzCache, macros }], remarkTheorems, remarkReading, [remarkCite, { bibliographies }], [remarkMedia, { posts, manifest }]],
      rehypePlugins: [[rehypeMathJax4, { macros, version }], rehypeToc, rehypeTables, rehypeFootnotes],
    }),
    shikiConfig: {
      themes,
      defaultColor: false,
    },
  },
});
