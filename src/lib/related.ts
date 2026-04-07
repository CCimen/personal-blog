import { getContentManifest } from './manifest';
import type { AnyEntry } from './collections';

/**
 * Resolve `related: []` references into entries.
 * Each ref is 'collection/canonicalSlug'. Missing refs return null in the array.
 * Pages should show successful resolutions; the build-time content check
 * (scripts/check-content.mjs) is what fails on broken refs.
 */
export async function resolveRelated(refs: string[]): Promise<AnyEntry[]> {
  const manifest = await getContentManifest();
  return refs
    .map((ref) => manifest.byKey.get(ref) ?? null)
    .filter((e): e is AnyEntry => e != null);
}
