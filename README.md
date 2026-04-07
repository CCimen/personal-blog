# personalblog

The personal site of Çagri Cimen — notes, learnings, and writings on AI, engineering workflows, and personal projects.

Lives at [cagricimen.dev](https://cagricimen.dev). Built with [Astro](https://astro.build) + [bun](https://bun.sh), deployed via GitHub Pages.

## Structure

Four content modes, one shared topic taxonomy:

- **Writing** — chronological essays. `src/content/writing/`
- **Notes** — evergreen topic notes. `src/content/notes/`
- **Guides** — structured how-tos. `src/content/guides/`
- **Projects** — case studies. `src/content/projects/`

Topic taxonomy is the single source of truth at `src/config/topics.ts`. Every entry is tagged via `topics: []` and surfaces on the matching `/topics/<topic>/` hub page.

## Local development

```bash
bun install
bun run dev       # dev server at http://localhost:4321
bun run check     # validate content invariants (slugs, aliases, related refs, topics)
bun run build     # full build: check → astro → pagefind → alias stubs
bun run preview   # serve the built dist/ (required to test Pagefind search)
```

Note: Pagefind search only works after `bun run build`, not in `bun run dev`.

## Authoring

Use the scaffolder scripts — they create a file with frontmatter pre-filled (draft, today's date, empty topics).

```bash
bun run new:writing -- "Title here"
bun run new:note    -- "Title here"
bun run new:guide   -- "Title here"
bun run new:project -- "Title here"
```

Before publishing, edit the frontmatter:
- Set `draft: false`
- Add at least one valid topic from `src/config/topics.ts` (required for notes/guides/projects)
- Fill in `description`
- For guides: set `category` and `order`
- For projects: set `status` (`in-progress` | `shipped` | `archived`), `year`, `stack[]`

## Content metadata

All collections share these frontmatter fields:

- `slug` — explicit URL slug. Changing the filename never breaks the URL.
- `aliases` — old paths that should redirect here. Generates meta-refresh stubs in `dist/`.
- `pinned` + `pinnedOrder` — homepage curation.
- `featured` — surfaces as a "core" entry on matching topic hubs.
- `maturity` — `seed` | `growing` | `stable` | `archived`, renders as a badge so readers know if they're reading a rough note or a mature guide.
- `related` — manual cross-references in `collection/slug` form. Validated by the content check script.
- `updatedDate`, `lastReviewed` — content freshness.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds with bun and deploys to GitHub Pages. Custom domain `cagricimen.dev` is configured via `public/CNAME`.

## Status

Currently in active build. The site is live once DNS propagates and GitHub Pages is wired up.
