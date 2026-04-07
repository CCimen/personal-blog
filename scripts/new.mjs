#!/usr/bin/env node
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const COLLECTIONS = {
  writing:  { dir: 'src/content/writing',  ext: 'mdx', extra: 'tags: []\n' },
  notes:    { dir: 'src/content/notes',    ext: 'mdx', extra: '' },
  guides:   { dir: 'src/content/guides',   ext: 'mdx', extra: 'order: 0\ncategory: General\n' },
  projects: { dir: 'src/content/projects', ext: 'mdx', extra: "status: 'in-progress'\nyear: " + new Date().getFullYear() + '\nstack: []\n' },
};

const [, , collection, ...titleParts] = process.argv;
if (!collection || !COLLECTIONS[collection]) {
  console.error('Usage: node scripts/new.mjs <writing|notes|guides|projects> "Title here"');
  process.exit(1);
}
const title = titleParts.join(' ').trim();
if (!title) { console.error('Title required.'); process.exit(1); }

const slug = title.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const cfg = COLLECTIONS[collection];
const filepath = path.join(cfg.dir, `${slug}.${cfg.ext}`);
if (existsSync(filepath)) { console.error(`Refusing to overwrite ${filepath}`); process.exit(1); }
await mkdir(cfg.dir, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
slug: ${slug}
description: ""
topics: []
pubDate: ${today}
maturity: seed
draft: true
${cfg.extra}---

`;
await writeFile(filepath, frontmatter);
console.log(`Created ${filepath}`);
