#!/usr/bin/env node
/**
 * Validates content invariants before build:
 *  - No two entries in any collection share the same canonical slug
 *  - No alias collides with another entry's canonical path
 *  - No alias collides with another entry's alias
 *  - No alias collides with a built-in static route
 *  - All `related: []` references resolve to existing entries
 *  - Published (non-draft) entries in notes/guides/projects have ≥1 topic
 *  - Topics referenced are valid TopicSlugs
 */
import fg from 'fast-glob';
import matter from 'gray-matter';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Mirror src/config/topics.ts — kept in sync by hand. If this drifts, the Zod schema catches it at build too.
const TOPIC_SLUGS = [
  'ai-coding', 'models-evals', 'workflows', 'team-practices',
  'gpu-infra', 'tools', 'notes-on-building',
];

const COLLECTIONS = ['writing', 'notes', 'guides', 'projects'];
const REQUIRES_TOPIC = new Set(['notes', 'guides', 'projects']);

// Static routes that aliases must NOT collide with.
const RESERVED_PATHS = new Set([
  '/', '/about/', '/writing/', '/notes/', '/guides/', '/projects/', '/topics/',
  ...TOPIC_SLUGS.map((t) => `/topics/${t}/`),
  '/writing/rss.xml',
  '/sitemap-index.xml',
]);

function slugify(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeAlias(a) {
  if (!a.startsWith('/')) a = '/' + a;
  if (!a.endsWith('/') && !a.includes('.')) a += '/';
  return a;
}

const errors = [];
const canonicalPaths = new Map(); // path → 'collection/slug'
const aliasOwners   = new Map(); // path → 'collection/slug'
const allRefs       = new Set(); // 'collection/slug' set for related-resolution

for (const collection of COLLECTIONS) {
  const files = await fg(`src/content/${collection}/**/*.{md,mdx}`, { dot: false });
  for (const file of files) {
    const raw = await readFile(file, 'utf8');
    const { data } = matter(raw);
    const id = path.basename(file, path.extname(file));
    const slug = data.slug ?? id;
    const key = `${collection}/${slug}`;
    const canonical = `/${collection}/${slug}/`;

    // Duplicate canonical slug?
    if (canonicalPaths.has(canonical)) {
      errors.push(`Duplicate canonical path "${canonical}" — owned by ${canonicalPaths.get(canonical)} and ${key}`);
    }
    canonicalPaths.set(canonical, key);
    allRefs.add(key);

    // Topic validity + min(1) for published
    const topics = Array.isArray(data.topics) ? data.topics : [];
    for (const t of topics) {
      if (!TOPIC_SLUGS.includes(t)) {
        errors.push(`${key}: unknown topic "${t}"`);
      }
    }
    if (REQUIRES_TOPIC.has(collection) && data.draft !== true && topics.length === 0) {
      errors.push(`${key}: published ${collection.slice(0, -1)} must have at least one topic`);
    }

    // Aliases — collect for second pass
    const aliases = Array.isArray(data.aliases) ? data.aliases : [];
    for (const raw of aliases) {
      const norm = normalizeAlias(raw);
      if (RESERVED_PATHS.has(norm)) {
        errors.push(`${key}: alias "${norm}" collides with a reserved route`);
      }
      if (aliasOwners.has(norm)) {
        errors.push(`${key}: alias "${norm}" already claimed by ${aliasOwners.get(norm)}`);
      }
      aliasOwners.set(norm, key);
    }
  }
}

// Aliases must not collide with canonical paths.
for (const [aliasPath, owner] of aliasOwners) {
  if (canonicalPaths.has(aliasPath) && canonicalPaths.get(aliasPath) !== owner) {
    errors.push(`Alias "${aliasPath}" (from ${owner}) collides with canonical path of ${canonicalPaths.get(aliasPath)}`);
  }
}

// Second pass: resolve related: [] refs
for (const collection of COLLECTIONS) {
  const files = await fg(`src/content/${collection}/**/*.{md,mdx}`, { dot: false });
  for (const file of files) {
    const raw = await readFile(file, 'utf8');
    const { data } = matter(raw);
    const id = path.basename(file, path.extname(file));
    const slug = data.slug ?? id;
    const key = `${collection}/${slug}`;
    const related = Array.isArray(data.related) ? data.related : [];
    for (const ref of related) {
      if (!allRefs.has(ref)) {
        errors.push(`${key}: related ref "${ref}" does not resolve to any entry`);
      }
    }
  }
}

if (errors.length) {
  console.error(`\n✖ Content check failed (${errors.length}):\n`);
  for (const e of errors) console.error('  - ' + e);
  console.error('');
  process.exit(1);
}
console.log(`✓ Content check passed (${canonicalPaths.size} entries, ${aliasOwners.size} aliases)`);
