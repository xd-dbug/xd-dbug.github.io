# Damian Swiney: portfolio

Source for [xd-dbug.github.io](https://xd-dbug.github.io): my projects, résumé, and writing.

It's a static site built with [Astro](https://astro.build) and Tailwind CSS. All content lives in Markdown and YAML under `src/`, so updating the site means editing a text file and pushing. Every project write-up follows the same five-section template, and the build fails if one is missing a section. The résumé page and `resume.pdf` are both generated from a single `resume.yaml`.

## Run it locally

Requires Node 26 (see `.nvmrc`). Building the PDF also needs Playwright's Chromium.

```sh
npm install
npx playwright install chromium
npm run dev        # http://localhost:4321
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with live reload. `/resume.pdf` is printed on request. |
| `npm run build` | Production build to `dist/`, then prints `dist/resume.pdf` |
| `npm run preview` | Serves `dist/` locally |
| `npm run check` | Type-checks the code and validates all content against its schema |
| `npm run check:html` | Validates the built HTML (run after `build`) |
| `npm run check:lighthouse` | Lighthouse on key pages: performance ≥ 90, accessibility ≥ 95 (run after `build`) |

## Adding or changing content

See **[CONTENT.md](CONTENT.md)** for how to add a project, blog post, or testimonial, and how to update the résumé.

## Layout

```text
src/
  content/          projects/*.md, blog/*.md, about.md, testimonials.yaml
  data/             resume.yaml, site.ts (name, headline, links, nav)
  content.config.ts content schemas (what fields each file needs)
  lib/content.ts    content queries, drafts, project section check
  pages/            one file per route
  components/       .astro components
  layouts/          BaseLayout (head, theme), PageLayout (header, footer)
  styles/global.css colour tokens (light/dark), prose styles
scripts/            résumé PDF: build step + dev-server middleware
.github/workflows/  build → checks → deploy
```

## Deployment

`.github/workflows/site.yml` runs on every pull request and every push to `main`:

1. **build**: `npm ci`, `astro check`, then `npm run build` (including the PDF).
2. **checks**: HTML validation, a link check ([lychee](https://github.com/lycheeverse/lychee)), and Lighthouse CI. Reports are uploaded as a workflow artifact.
3. **deploy**: pushes to `main` only, and only if every check passes. Publishes `dist/` to GitHub Pages.

One-time setup: in the repo's **Settings → Pages**, set the source to **GitHub Actions**.

### Custom domain (later)

Add `public/CNAME` containing the domain, point DNS at GitHub Pages (A/AAAA records for the apex, or a CNAME for `www`), change `site` in `astro.config.mjs`, then enable **Enforce HTTPS** in the Pages settings.

## License

The code is MIT licensed. The content (writing, résumé, images) is © Damian Swiney, all rights reserved. See [LICENSE](LICENSE).
