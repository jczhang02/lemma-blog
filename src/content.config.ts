import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { ABOUT_DIR, TEMPLATE } from '../plugins/about.mjs';

// One folder per post: src/content/posts/<slug>/{zh,en}.md, with the post's
// images and videos next to them. zh.md and en.md are translations of each other.
const macro = z.union([
  z.string(),
  z.tuple([z.string(), z.number()]),
  z.tuple([z.string(), z.number(), z.string()]),
]);

const files = glob({ pattern: '**/{zh,en}.md', base: './src/content/posts' });

const posts = defineCollection({
  // A build leaves drafts out of the store, so their images are not bundled
  // either (pages already skip them). The dev server keeps them for preview.
  loader: {
    name: 'posts',
    load: async (context) => {
      await files.load(context);
      if (!import.meta.env.PROD) return;
      for (const [id, entry] of context.store.entries()) if (entry.data.draft) context.store.delete(id);
    },
  },
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Read by plugins/rehype-mathjax4.mjs, not by templates.
    macros: z.record(z.string(), macro).optional(),
    // Section numbers (1, 1.1) and theorem numbers per section (2.1); see plugins/remark-theorems.mjs.
    numbering: z.boolean().default(true),
  }),
});

// The about page: {zh,en}.md in src/content/about/ (src/about.sample/ with
// LEMMA_ABOUT=sample; see plugins/about.mjs). A language without a file has
// no about page. The body is the bio; the rest is structured data.
const link = z.object({ label: z.string(), href: z.string() });
// A top-level list left empty (`links:` with nothing under it) is null: no entries.
const list = <T extends z.ZodType>(entry: T) => z.array(entry).nullish().transform((v) => v ?? []);
// `when: 2024` is a YAML number and `when: 2024-09-01` a date; both are shown as written.
const when = z.union([z.string(), z.number(), z.date()]).transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v)));
// Entries and sections are strict: a misspelt key is an error, not a field quietly dropped.
const item = z
  .object({
    when: when.optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    note: z.string().optional(),
    href: z.string().optional(),
    links: z.array(link).default([]),
  })
  .strict();
// A paper, written as it should print. arxiv and doi take an id or a URL; url
// is the paper's own page (linked from the title); pdf may be a file in the
// about folder. The BibTeX copy button appears when bibtex is given.
const publication = z
  .object({
    title: z.string(),
    authors: z.array(z.string()).default([]),
    venue: z.string().optional(),
    year: z.number().int().optional(),
    note: z.string().optional(),
    selected: z.boolean().default(false),
    url: z.string().optional(),
    pdf: z.string().optional(),
    // A string: unquoted, YAML reads 2505.10230 as a number and drops the last 0.
    arxiv: z.string().optional(),
    doi: z.string().optional(),
    links: z.array(link).default([]),
    bibtex: z.string().optional(),
  })
  .strict();
// selectedOnly: only the papers marked `selected: true`. A selectedOnly
// section without a list of its own takes them from the other publications
// sections of the file, so 代表论文 and 全部论文 share one list.
const publications = z
  .object({
    kind: z.literal('publications'),
    heading: z.string(),
    publications: z.array(publication).nullish(),
    selectedOnly: z.boolean().default(false),
  })
  .strict()
  .refine((s) => s.publications !== undefined || s.selectedOnly, 'a section needs `items`, `publications` or `selectedOnly: true`');
// The first template's `publications: true` (papers from a .bib) still
// validates, with the other keys it had, so an old file builds; it shows
// nothing, with a warning.
const legacyPublications = z
  .object({
    kind: z.literal('legacy'),
    heading: z.string().optional(),
    publications: z.literal(true),
    selectedOnly: z.unknown().optional(),
    links: z.unknown().optional(),
  })
  .strict();
const items = z
  .object({
    kind: z.literal('items'),
    heading: z.string(),
    // `items:` with nothing under it is null: an empty section, left out.
    items: z.array(item).nullable().transform((v) => v ?? []),
  })
  .strict();
// A section's kind follows from its keys, and the section is checked as that
// kind only. A union would try each kind in turn: a paper with a bad field
// then made the section pass as an empty list of items, and vanish.
const sectionKind = (s: Record<string, unknown>) => ('items' in s ? 'items' : s.publications === true ? 'legacy' : 'publications');
const section = z.preprocess(
  (s) => (s && typeof s === 'object' && !Array.isArray(s) ? { ...s, kind: sectionKind(s as Record<string, unknown>) } : s),
  z.discriminatedUnion('kind', [items, publications, legacyPublications]),
);

const aboutFiles = glob({ pattern: '{zh,en}.md', base: ABOUT_DIR });

const about = defineCollection({
  // A build leaves out a file that still holds the template's marker, so
  // the placeholder page never goes live; the dev server shows it.
  loader: {
    name: 'about',
    load: async (context) => {
      await aboutFiles.load(context);
      // Leftovers of the first template; files are named, never read.
      if (existsSync(join(ABOUT_DIR, 'publications.bib'))) context.logger.warn(`${ABOUT_DIR.slice(2)}/publications.bib is ignored: list the papers in YAML (see WRITING.md)`);
      for (const [id, entry] of context.store.entries())
        if ((entry.data.sections as { kind: string }[] | undefined)?.some((s) => s.kind === 'legacy'))
          context.logger.warn(`${id}.md: a section with \`publications: true\` shows nothing; list the papers in YAML (see WRITING.md)`);
      if (!import.meta.env.PROD) return;
      for (const [id, entry] of context.store.entries()) {
        if (!`${entry.body}${JSON.stringify(entry.data)}`.includes(TEMPLATE)) continue;
        context.store.delete(id);
        context.logger.warn(`${id}.md still holds the template marker ${TEMPLATE}: its about page is not built until the marker is gone`);
      }
    },
  },
  schema: z.object({
    title: z.string(),
    name: z.string(),
    tagline: z
      .string()
      .nullish()
      .transform((v) => v ?? undefined),
    links: list(link),
    // Forms of the owner's name to set in bold in author lists; by default
    // (also when left empty) site.authorBibtex from lemma.config.mjs.
    self: z
      .array(z.string())
      .nullish()
      .transform((v) => v ?? undefined),
    sections: list(section),
  }),
});

export const collections = { posts, about };
