---
title: How I built this site
description: Astro, content collections, a résumé generated from one YAML file, and a CI pipeline that won't deploy a page that fails an accessibility check.
date: 2026-11-17
tags: [astro, tailwind, ci, meta]
draft: false
---

While a résumé can tell someone what I've done, it can't show them the work. That's why I wanted one link I could hand to a recruiter or put on an application that leads to my projects, how each one works, how to run it, and a résumé that's always current. I also wanted the site itself to be a showcase of my work.

## The goals

Before writing any code I settled on a few rules:

- **Every project gets real documentation.** From how it works to what I learned, every project is shown in detail and linked to its repo.
- **Content is plain text in Git.** Projects, posts, and the résumé are Markdown and YAML files. Updating the site means editing a file and pushing.
- **One source for the résumé.** The résumé page, the PDF, and the Experience section on the home page all come from the same file, so they can't disagree.
- **It should be fast and accessible, and stay that way.** Checks run on every push, not once at launch.

## The stack

The site is built with [Astro](https://astro.build) and styled with Tailwind CSS. Astro made sense because almost everything here is static: it renders the pages to HTML at build time and ships almost no JavaScript. The only scripts are a few small ones: the theme toggle, the email link, the section highlighting in the home page sidebar, and the cursor spotlight.

It's hosted on GitHub Pages and deployed by GitHub Actions, so there's no server to maintain.

## The look

I prototyped three different home pages, each with its own distinct style, and weighed the pros and cons of each. Ultimately, I went with the terminal look because it was the best mix of personality and polish. The layout borrows ideas from Brittany Chiang's portfolio: a sticky sidebar with my name and navigation on large screens, and a single scrolling column on phones.

Dark mode follows your system setting, and the toggle remembers your choice. The theme is set before the page draws, so it never flashes white on a dark-mode visit.

## Projects that can't skip the docs

Each project is a Markdown file in a content collection. Astro checks its frontmatter against a schema, so a missing repo link or a cover image without alt text stops the build.

The body has to follow a template: five headings, in order (Problem & motivation, Demo, How it works, Run it locally, What I learned). A schema can't see the body, so a small check runs when the site loads its projects. If I forget a section, the build fails and tells me which one:

```text
src/content/projects/sealos.md: missing section "## Demo". See src/content/projects/_template.md.
```

That turns "I'll write the docs later" into "the site won't build until I do."

## One YAML file, two résumés

My résumé lives in `resume.yaml`. The `/resume` page renders it as HTML with a separate print stylesheet. After the site builds, a script opens that page in headless Chromium with Playwright and prints it to `resume.pdf`:

```ts
const page = await browser.newPage();
await page.goto(`${origin}/resume/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path, preferCSSPageSize: true, printBackground: true, tagged: true });
```

The page size and margins come from the page's own CSS, so the PDF is exactly what the browser prints. The script also counts the pages and warns me if the résumé spills onto a second one. It took a few rounds of print-only CSS to fit everything on one US Letter page without changing how the web version looks.

In development, the same code runs on request, so clicking "Download PDF" on my local dev server always prints my latest edits.

## Small details

- **No plain-text email address.** The address is stored reversed in the HTML and put back together in the browser, which keeps it away from simple scrapers.
- **Testimonials appear automatically.** The page and its nav link only exist once there are at least two.
- **Drafts.** Posts and projects marked as drafts show up on my machine but never in the production build.

## CI that blocks a bad deploy

Every push runs one GitHub Actions workflow in three stages:

1. **Build:** type-check the code, validate all the content, build the site, and print the PDF.
2. **Check:** validate the HTML, check every link, and run Lighthouse on the main pages. A performance score under 90 or an accessibility score under 95 fails the run.
3. **Deploy:** only for pushes to `main`, and only if every check passed.

The Lighthouse check paid off right away. On its first run it caught two accessibility problems I hadn't noticed: the green tag pills didn't have enough contrast in light mode, and the project titles on the projects page skipped a heading level, which confuses screen readers. Both were quick fixes, and now every checked page scores 100. Without the check, I would have shipped both bugs.

## What's next

- A custom domain
- More write-ups as I finish projects, and a full SealOS write-up once my capstone is done
- Testimonials, once I have a couple to share

The source is on [GitHub](https://github.com/xd-dbug/xd-dbug.github.io) if you want to see how any of it works.
