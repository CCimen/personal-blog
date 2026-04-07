import { getCollection, type CollectionEntry } from 'astro:content';
import type { TopicSlug } from '../config/topics';

export type AnyEntry =
  | CollectionEntry<'writing'>
  | CollectionEntry<'notes'>
  | CollectionEntry<'guides'>
  | CollectionEntry<'projects'>;

export type CollectionName = AnyEntry['collection'];

/** Canonical slug for an entry. Explicit `slug` frontmatter wins over filename `id`. */
export function entrySlug(entry: AnyEntry): string {
  return (entry.data as any).slug ?? entry.id;
}

/** Canonical public href for any entry — single source of truth for internal links. */
export function entryHref(entry: AnyEntry): string {
  return `/${entry.collection}/${entrySlug(entry)}/`;
}

/** Filter to non-drafts. */
export function published<T extends AnyEntry>(entries: T[]): T[] {
  return entries.filter((e) => !e.data.draft);
}

/** Filter by topic membership. */
export function byTopic<T extends AnyEntry>(entries: T[], topic: TopicSlug): T[] {
  return entries.filter((e) => (e.data.topics as TopicSlug[]).includes(topic));
}

/** Sort by pubDate descending. */
export function byNewest<T extends AnyEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Sort by pinnedOrder ascending; undefined sorts last; ties broken by pubDate desc. */
export function byPinnedOrder<T extends AnyEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const ao = (a.data as any).pinnedOrder;
    const bo = (b.data as any).pinnedOrder;
    if (ao != null && bo != null) return ao - bo;
    if (ao != null) return -1;
    if (bo != null) return 1;
    return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
  });
}

/** Raw — includes drafts. Use for build-time validation, NOT user-facing pages. */
export async function getAllEntries(): Promise<AnyEntry[]> {
  const [w, n, g, p] = await Promise.all([
    getCollection('writing'),
    getCollection('notes'),
    getCollection('guides'),
    getCollection('projects'),
  ]);
  return [...w, ...n, ...g, ...p];
}

/** Safe — filters drafts. Use this from every public page. */
export async function getAllPublishedEntries(): Promise<AnyEntry[]> {
  return published(await getAllEntries());
}
