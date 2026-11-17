import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/content';
import { site } from '../data/site';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${site.name} · Blog`,
    description: site.description,
    site: context.site!,
    items: posts.map(({ id, data }) => ({
      title: data.title,
      description: data.description,
      pubDate: data.date,
      categories: data.tags,
      link: `/blog/${id}/`,
    })),
    customData: '<language>en</language>',
  });
}
