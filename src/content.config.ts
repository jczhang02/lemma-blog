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

const posts = defineCollection({
  loader: glob({ pattern: '**/{zh,en}.md', base: './src/content/posts' }),
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
