import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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

export const collections = { posts };
