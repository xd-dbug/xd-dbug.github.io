// Content collections. Schemas fail `astro check` / `astro build` on bad or missing frontmatter.
// How to add content: see CONTENT.md. Project body sections are checked in src/lib/content.ts.
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { yamlDocument } from './lib/yaml-document-loader';

/** "YYYY-MM", e.g. "2025-03". */
const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM, e.g. 2025-03');

const projects = defineCollection({
  // Files starting with "_" (like _template.md) are ignored.
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        /** One line for cards and meta descriptions. */
        summary: z.string().max(160),
        /** What it solves and why you built it. */
        problem: z.string(),
        stack: z.array(z.string()).min(1),
        /** Solo or team, and your contribution. */
        role: z.string(),
        repo: z.url(),
        issues: z.url().optional(),
        demo: z.url().optional(),
        license: z.string().optional(),
        /** Screenshot or diagram. Without one, cards show a terminal-style placeholder. */
        cover: image().optional(),
        coverAlt: z.string().optional(),
        featured: z.boolean().default(false),
        /** Lower comes first. */
        order: z.number().int(),
        date: z.coerce.date(),
        /** Shown in dev, left out of production builds. */
        draft: z.boolean().default(false),
      })
      .refine((d) => !d.cover || d.coverAlt, {
        message: 'A cover image needs coverAlt (describe what the screenshot shows).',
        path: ['coverAlt'],
      }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  loader: file('src/content/testimonials.yaml'),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    /** Their title, e.g. "Engineering Manager, Acme". */
    title: z.string(),
    /** How you worked together, e.g. "Managed Damian on the payments team". */
    relationship: z.string(),
    url: z.url().optional(),
    order: z.number().int().default(0),
  }),
});

const resume = defineCollection({
  loader: yamlDocument('src/data/resume.yaml', 'resume'),
  // Sections render in this order on /resume and the PDF: education, skills, projects, experience, certifications.
  schema: z.object({
    /** Optional one-line summary under the name. Name and links come from src/data/site.ts. */
    summary: z.string().optional(),
    location: z.string().optional(),
    education: z.array(
      z.object({
        school: z.string(),
        degree: z.string(),
        url: z.url().optional(),
        location: z.string().optional(),
        gpa: z.string().optional(),
        start: yearMonth.optional(),
        /** Graduation month. Shown as "Expected …" while it's in the future. */
        end: yearMonth,
        coursework: z.array(z.string()).default([]),
        honors: z.array(z.string()).default([]),
        highlights: z.array(z.string()).default([]),
      }),
    ),
    skills: z.array(z.object({ group: z.string(), items: z.array(z.string()).min(1) })),
    projects: z
      .array(
        z.object({
          name: z.string(),
          /** Slug of the matching src/content/projects entry; links there once it's published. */
          slug: z.string().optional(),
          url: z.url().optional(),
          stack: z.array(z.string()).default([]),
          start: yearMonth,
          /** Omit while ongoing. */
          end: yearMonth.optional(),
          highlights: z.array(z.string()).default([]),
        }),
      )
      .default([]),
    experience: z.array(
      z.object({
        role: z.string(),
        org: z.string(),
        url: z.url().optional(),
        location: z.string().optional(),
        start: yearMonth,
        /** Omit for a current role. */
        end: yearMonth.optional(),
        /** One line for the home page. Defaults to the first highlight. */
        summary: z.string().optional(),
        /** Bullet points; shown on the résumé page/PDF. */
        highlights: z.array(z.string()).default([]),
        tech: z.array(z.string()).default([]),
      }),
    ),
    certifications: z
      .array(z.object({ name: z.string(), issuer: z.string(), date: yearMonth, url: z.url().optional() }))
      .default([]),
  }),
});

export const collections = { projects, blog, testimonials, resume };
