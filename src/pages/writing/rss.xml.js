import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { entrySlug } from '../../lib/collections';

export async function GET(context) {
  const posts = (await getCollection('writing', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  return rss({
    title: 'Çagri Cimen — Writing',
    description: 'Essays, reflections, and learning in public.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/writing/${entrySlug(post)}/`,
    })),
  });
}
