import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export default defineConfig({
  site: 'https://cagricimen.dev',
  base: '/',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      // Vitesse by Anthony Fu — warm, low-chroma syntax themes that
      // match the Editorial Warm Paper palette. Dual themes get swapped
      // automatically by Astro via the html[data-theme="dark"] selector
      // (we wire that up in global.css with a tiny CSS rule).
      themes: {
        light: 'vitesse-light',
        dark: 'vitesse-dark',
      },
      defaultColor: false, // emit CSS variables for both themes
      wrap: true,          // long lines wrap instead of horizontal scroll
    },
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: 'append',
        properties: { className: ['heading-anchor'], 'aria-label': 'Permalink' },
        content: { type: 'text', value: '#' },
      }],
    ],
  },
});
