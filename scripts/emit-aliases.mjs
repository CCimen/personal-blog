#!/usr/bin/env node
import fg from 'fast-glob';
import matter from 'gray-matter';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const COLLECTIONS = ['writing', 'notes', 'guides', 'projects'];
const DIST = 'dist';

function normalizeAlias(a) {
  if (!a.startsWith('/')) a = '/' + a;
  if (!a.endsWith('/') && !a.includes('.')) a += '/';
  return a;
}

const stubTemplate = (canonical) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="canonical" href="${canonical}">
    <meta http-equiv="refresh" content="0; url=${canonical}">
    <title>Redirecting…</title>
  </head>
  <body>
    <p>Redirecting to <a href="${canonical}">${canonical}</a></p>
    <script>location.replace(${JSON.stringify(canonical)});</script>
  </body>
</html>
`;

let count = 0;
for (const collection of COLLECTIONS) {
  const files = await fg(`src/content/${collection}/**/*.{md,mdx}`);
  for (const file of files) {
    const { data } = matter(await readFile(file, 'utf8'));
    if (data.draft === true) continue;
    const id = path.basename(file, path.extname(file));
    const slug = data.slug ?? id;
    const canonical = `/${collection}/${slug}/`;
    const aliases = Array.isArray(data.aliases) ? data.aliases : [];
    for (const raw of aliases) {
      const norm = normalizeAlias(raw);
      const outPath = path.join(DIST, norm.replace(/^\/+/, ''), 'index.html');
      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, stubTemplate(canonical));
      count++;
    }
  }
}
console.log(`✓ Emitted ${count} alias redirect stub(s)`);
