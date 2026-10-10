import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE = {
  // TODO: your name / site name.
  title: 'JC Zhang',
  author: 'JC Zhang',
  // Author as BibTeX expects it ("Last, First"), for the "cite this post" block.
  authorBibtex: 'Zhang, JC',
};

export type Lang = 'zh' | 'en';
export const LANGS: Lang[] = ['zh', 'en'];

export const ui = {
  zh: {
    description: '数学, 以及其他.',
    posts: '文章',
    about: '关于',
    rss: 'RSS',
    readIn: 'Read in English',
    updated: '更新于',
    toggleTheme: '切换深色模式',
    allPosts: '全部文章',
    toc: '目录',
    skipToContent: '跳到正文',
    abstract: '摘要',
    citeThis: '引用本文',
    copy: '复制',
    copied: '已复制',
    tags: '标签',
    taggedWith: (tag: string) => `标签: ${tag}`,
    postCount: (n: number) => `${n} 篇`,
  },
  en: {
    description: 'Mathematics, and other things.',
    posts: 'Posts',
    about: 'About',
    rss: 'RSS',
    readIn: '阅读中文版',
    updated: 'Updated',
    toggleTheme: 'Toggle dark mode',
    allPosts: 'All posts',
    toc: 'Contents',
    skipToContent: 'Skip to content',
    abstract: 'Abstract',
    citeThis: 'Cite this post',
    copy: 'Copy',
    copied: 'Copied',
    tags: 'Tags',
    taggedWith: (tag: string) => `Tagged "${tag}"`,
    postCount: (n: number) => `${n} ${n === 1 ? 'post' : 'posts'}`,
  },
} as const;

export const otherLang = (lang: Lang): Lang => (lang === 'zh' ? 'en' : 'zh');

/** Locale prefix for URLs: '' for the default locale, '/en' for English. */
export const prefix = (lang: Lang) => (lang === 'zh' ? '' : `/${lang}`);

export const langOf = (post: CollectionEntry<'posts'>) => post.id.split('/')[0] as Lang;
export const slugOf = (post: CollectionEntry<'posts'>) => post.id.split('/').slice(1).join('/');
export const postUrl = (post: CollectionEntry<'posts'>) => `${prefix(langOf(post))}/posts/${slugOf(post)}/`;

export async function getPosts(lang: Lang) {
  const posts = await getCollection('posts', (p) => langOf(p) === lang && (import.meta.env.DEV || !p.data.draft));
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date, lang: Lang) {
  return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

/** URL segment for a tag: lowercase, spaces to hyphens ("Number Theory" -> "number-theory"). */
export const tagSlug = (tag: string) => tag.trim().toLowerCase().replace(/\s+/g, '-');
export const tagUrl = (lang: Lang, tag: string) => `${prefix(lang)}/tags/${tagSlug(tag)}/`;

/** Tags of one language with their posts, most used first. */
export async function getTags(lang: Lang) {
  const tags = new Map<string, { name: string; posts: CollectionEntry<'posts'>[] }>();
  for (const post of await getPosts(lang)) {
    for (const name of post.data.tags) {
      const slug = tagSlug(name);
      if (!tags.has(slug)) tags.set(slug, { name, posts: [] });
      tags.get(slug)!.posts.push(post);
    }
  }
  return [...tags.entries()]
    .map(([slug, t]) => ({ slug, ...t }))
    .sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name, lang));
}
