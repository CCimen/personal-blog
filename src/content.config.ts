import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { TOPIC_SLUGS } from './config/topics';

const topicEnum = z.enum(TOPIC_SLUGS as [string, ...string[]]);

const sharedFields = {
  title: z.string(),
  description: z.string(),
  topics: z.array(topicEnum).default([]),
  slug: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  pinned: z.boolean().default(false),
  pinnedOrder: z.number().optional(),
  featured: z.boolean().default(false),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  lastReviewed: z.coerce.date().optional(),
  maturity: z.enum(['seed', 'growing', 'stable', 'archived']).optional(),
  related: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
};

/** Refines a schema to require ≥1 topic UNLESS the entry is a draft. */
const requireTopicsWhenPublished = <T extends z.ZodObject<any>>(schema: T) =>
  schema.refine(
    (data: any) => data.draft || (Array.isArray(data.topics) && data.topics.length >= 1),
    { message: 'Published entries must have at least one topic', path: ['topics'] },
  );

const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.{md,mdx}' }),
  // Writing can be meta with no topics; no min(1) refine.
  schema: z.object({
    ...sharedFields,
    tags: z.array(z.string()).default([]),
  }),
});

const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
  schema: requireTopicsWhenPublished(z.object({ ...sharedFields })),
});

const guides = defineCollection({
  loader: glob({ base: './src/content/guides', pattern: '**/*.{md,mdx}' }),
  schema: requireTopicsWhenPublished(
    z.object({
      ...sharedFields,
      order: z.number().optional(),
      category: z.string().optional(),
    }),
  ),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: requireTopicsWhenPublished(
    z.object({
      ...sharedFields,
      status: z.enum(['in-progress', 'shipped', 'archived']),
      year: z.number(),
      stack: z.array(z.string()).default([]),
      repo: z.string().url().optional(),
      link: z.string().url().optional(),
      cover: z.string().optional(),
    }),
  ),
});

export const collections = { writing, notes, guides, projects };
