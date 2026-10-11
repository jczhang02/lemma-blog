// @ts-check
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';

// Every site setting comes from lemma.config.mjs.
//
// Local modules are imported with a hash of their sources (and of the data
// files they read), for two reasons:
// - Node caches imports for the life of the process, and Astro re-imports only
//   this file on change; without the hash a running dev server keeps old plugin code.
// - Astro caches rendered posts until the config changes; the hash is part of
//   the config (plugin options), so an edit re-renders every post.
const read = (f) => (existsSync(new URL(f, import.meta.url)) ? readFileSync(new URL(f, import.meta.url)) : '');
const hash = (files) => createHash('sha1').update(files.map(read).join('')).digest('hex').slice(0, 12);
const CONFIG = './lemma.config.mjs';
const { default: lemma } = await import(`${CONFIG}?v=${hash([CONFIG])}`);
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
  './plugins/lemma-theme.mjs',
];
const DATA = [lemma.bibliography.style, ...lemma.bibliography.files, './src/media-r2.json'];
const LOCAL = [CONFIG, ...MODULES, ...DATA];
const version = hash(LOCAL);
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
  { default: lemmaTheme },
] = await Promise.all(MODULES.map((f) => import(`${f}?v=${version}`)));
const url = (f) => new URL(f, import.meta.url);
const posts = url('./src/content/posts/');
const tikzCache = url('./tikz-cache/');
const manifest = url('./src/media-r2.json');
const { macros, packages } = lemma.math;
const media = { posts, manifest, maxBytes: lemma.media.maxBytes, r2: lemma.media.r2 };
// Code colors are checked against the code block background of each theme.
const themes = await codeThemes(lemma.code.themes, { light: lemma.theme.colors.light.surface, dark: lemma.theme.colors.dark.surface });
// hreflang codes of the supported locales.
const HREFLANG = { zh: 'zh-CN', en: 'en' };

export default defineConfig({
  site: lemma.site.url,
  integrations: [
    // Colors, font stacks, layout tokens and font files from the config.
    lemmaTheme(lemma.theme),
    // hreflang alternates pair /posts/x/ with /en/posts/x/.
    sitemap({
      i18n: {
        defaultLocale: lemma.locales.default,
        locales: Object.fromEntries(lemma.locales.list.map((l) => [l, HREFLANG[l]])),
      },
    }),
    mediaIntegration(media),
    // Restart the dev server when the config, a local plugin or a data file changes.
    {
      name: 'watch-local-modules',
      hooks: {
        'astro:config:setup': ({ addWatchFile }) => LOCAL.forEach((f) => addWatchFile(url(f))),
      },
    },
  ],
  // Markdown images get a srcset and are scaled down for small screens.
  image: { layout: 'constrained' },
  i18n: {
    locales: lemma.locales.list,
    defaultLocale: lemma.locales.default,
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    // Unified (remark/rehype) pipeline, needed for remark-math and MathJax.
    processor: unified({
      // Off: punctuation stays exactly as typed (no curly quotes, no -- to en dash).
      smartypants: false,
      remarkPlugins: [
        remarkMath,
        remarkDirective,
        [remarkTikz, { cache: tikzCache, macros }],
        [remarkTheorems, { labels: lemma.theorems.labels }],
        [remarkReading, lemma.reading],
        [remarkCite, { bibliographies: lemma.bibliography.files.map(url), style: url(lemma.bibliography.style) }],
        [remarkMedia, media],
      ],
      rehypePlugins: [[rehypeMathJax4, { macros, packages, version }], rehypeToc, rehypeTables, rehypeFootnotes],
    }),
    shikiConfig: {
      themes,
      defaultColor: false,
    },
  },
});
