import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE, getPosts, postUrl, ui, type Lang } from './i18n';

export const rssFeed = (lang: Lang) => async (context: APIContext) => {
  const posts = await getPosts(lang);
  return rss({
    title: SITE.title,
    description: ui[lang].description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postUrl(post),
    })),
  });
};
