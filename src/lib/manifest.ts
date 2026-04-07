import { entrySlug, getAllEntries, type AnyEntry, type CollectionName } from './collections';

export interface ContentManifest {
  /** 'collection/canonicalSlug' → entry. Includes drafts; filter at the call site if needed. */
  byKey: Map<string, AnyEntry>;
  /** Collection name → list of entries (raw, includes drafts). */
  byCollection: Map<CollectionName, AnyEntry[]>;
}

let cache: Promise<ContentManifest> | null = null;

export function getContentManifest(): Promise<ContentManifest> {
  if (cache) return cache;
  cache = (async () => {
    const all = await getAllEntries();
    const byKey = new Map<string, AnyEntry>();
    const byCollection = new Map<CollectionName, AnyEntry[]>();
    for (const entry of all) {
      const key = `${entry.collection}/${entrySlug(entry)}`;
      if (byKey.has(key)) {
        throw new Error(
          `Duplicate canonical slug detected: "${key}". ` +
          `Both ${byKey.get(key)!.id} and ${entry.id} resolve to it.`,
        );
      }
      byKey.set(key, entry);
      const list = byCollection.get(entry.collection) ?? [];
      list.push(entry);
      byCollection.set(entry.collection, list);
    }
    return { byKey, byCollection };
  })();
  return cache;
}
