import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE = {
  title: 'Chengrui Zhang',
  author: 'Chengrui Zhang',
  // Author as BibTeX expects it ("Last, First"), for the "cite this post" block.
  authorBibtex: 'Zhang, Chengrui',
  email: 'jczhang@live.it',
  github: 'jczhang02',
};

export type Lang = 'zh' | 'en';
export const LANGS: Lang[] = ['zh', 'en'];

export const ui = {
  zh: {
    description: '方程, 模型, 以及其他.',
    posts: '文章',
    noPosts: '还没有文章.',
    email: '邮箱',
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
    keywords: '关键词',
    taggedWith: (tag: string) => `标签: ${tag}`,
    postCount: (n: number) => `${n} 篇`,
    readingTime: (n: number) => `约 ${n} 分钟`,
    sectionCount: (n: number) => `${n} 节`,
  },
  en: {
    description: 'Equations, models, and other things.',
    posts: 'Posts',
    noPosts: 'No posts yet.',
    email: 'Email',
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
    keywords: 'Keywords',
    taggedWith: (tag: string) => `Tagged "${tag}"`,
    postCount: (n: number) => `${n} ${n === 1 ? 'post' : 'posts'}`,
    readingTime: (n: number) => `${n} min read`,
    sectionCount: (n: number) => `${n} ${n === 1 ? 'section' : 'sections'}`,
  },
} as const;

export const otherLang = (lang: Lang): Lang => (lang === 'zh' ? 'en' : 'zh');

/** Locale prefix for URLs: '' for the default locale, '/en' for English. */
export const prefix = (lang: Lang) => (lang === 'zh' ? '' : `/${lang}`);

// Entry ids are "<slug>/<lang>" (from src/content/posts/<slug>/<lang>.md).
export const langOf = (post: CollectionEntry<'posts'>) => post.id.split('/').at(-1) as Lang;
export const slugOf = (post: CollectionEntry<'posts'>) => post.id.split('/').slice(0, -1).join('/');
export const postUrl = (post: CollectionEntry<'posts'>) => `${prefix(langOf(post))}/posts/${slugOf(post)}/`;

export async function getPosts(lang: Lang) {
  const posts = await getCollection('posts', (p) => langOf(p) === lang && (import.meta.env.DEV || !p.data.draft));
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// Chinese dates keep a space between digits and characters: 2026 年 10 月 10 日.
export function formatDate(date: Date, lang: Lang) {
  if (lang === 'zh') return `${date.getUTCFullYear()} 年 ${date.getUTCMonth() + 1} 月 ${date.getUTCDate()} 日`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
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
