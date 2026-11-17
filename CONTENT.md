# Editing the site's content

Everything on the site comes from text files in `src/`. Edit a file, check it with `npm run dev`, and push to `main` to publish. If a required field or section is missing, `npm run check` and `npm run build` stop with an error that names the file and the field.

| What | File |
|---|---|
| Name, role, headline, social links, email | `src/data/site.ts` |
| Home page About section | `src/content/about.md` |
| Résumé (page, PDF, and home page Experience) | `src/data/resume.yaml` |
| Projects | `src/content/projects/<slug>.md` |
| Blog posts | `src/content/blog/<slug>.md` |
| Testimonials | `src/content/testimonials.yaml` |

## Drafts

Projects and posts can have `draft: true` in their frontmatter. Drafts appear in `npm run dev` and are left out of production builds. Remove the line, or set it to `false`, to publish.

## Add a project

1. Copy `src/content/projects/_template.md` to `src/content/projects/<slug>.md`. The filename becomes the URL: `/projects/<slug>/`.
2. Fill in the frontmatter. Required: `title`, `summary` (one line, max 160 characters), `problem`, `stack`, `role`, `repo`, `order`, `date`. Optional: `issues`, `demo`, `license`, `cover` + `coverAlt`, `featured`.
3. Write the body under these five `##` headings, in this order. The build fails if one is missing or out of order:
   1. `## Problem & motivation`
   2. `## Demo`
   3. `## How it works`
   4. `## Run it locally` (5 commands or fewer, then link to the repo's README)
   5. `## What I learned` (anything after the words is fine, e.g. `## What I learned / next steps`)
4. Put images in `src/content/projects/images/` and reference them relative to the file, e.g. `cover: ./images/<slug>-demo.png`. Every `cover` needs a `coverAlt` describing what the image shows. Astro resizes and converts images at build time.
5. To show it on the home page, set `featured: true`. The home page shows the first 3 featured projects, lowest `order` first.
6. If the project is also on the résumé, set `slug: <slug>` on its entry in `resume.yaml` so the résumé links to the write-up.

Write for someone who has never seen the code: what it does and why, a screenshot or a small example, and how to run it.

## Add a blog post

Create `src/content/blog/<slug>.md`:

```markdown
---
title: How I built this site
description: One or two sentences for the post list, RSS, and search results (max 200 characters).
date: 2026-11-20
# updated: 2026-12-01   # optional, shown next to the date
tags: [astro, meta]
---

Post body in Markdown. Code blocks get syntax highlighting.
```

New posts show up on `/blog/`, in `/rss.xml`, and as the latest posts on the home page.

## Update the résumé

Edit `src/data/resume.yaml`. Name, email and links come from `src/data/site.ts`, not this file.

- Dates use `YYYY-MM`, e.g. `2026-06`. Leave out `end` for a current role. A graduation `end` in the future is shown as "Expected …".
- The home page Experience list uses each job's `summary`, or its first highlight if there's no summary.
- `npm run build` prints the résumé to `dist/resume.pdf` and warns if it runs past one page. In dev, `/resume.pdf` is printed fresh on every request, so you can check it as you edit.
- The phone number is deliberately left off the site and the PDF.

## Add a testimonial

Add an entry to `src/content/testimonials.yaml`. Only publish quotes you have permission to use.

```yaml
- id: jane-doe            # unique
  quote: Damian took a vague request and came back with a tool the whole team uses.
  name: Jane Doe
  title: Engineering Manager, Acme
  relationship: Managed Damian on the payments team
  url: https://linkedin.com/in/jane-doe   # optional
  order: 1                                # optional, lower first
```

The `/testimonials` page and its nav link stay hidden until there are at least 2 entries. Remove the `[]` once the first entry is added.

## Keep it current

The footer's "last updated" date is the build date, so every deploy refreshes it. CI checks every link on every push, so a deleted repo or a moved page fails the build instead of quietly breaking.
