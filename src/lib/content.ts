// Read content through these helpers, not getCollection() directly, so drafts, sorting and
// project-section checks behave the same on every page.
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

type Project = CollectionEntry<'projects'>;
type Post = CollectionEntry<'blog'>;

/** Drafts are visible in `astro dev` only. */
const published = ({ data }: { data: { draft: boolean } }) => import.meta.env.DEV || !data.draft;

/**
 * Required `##` headings in every project write-up, in this order (Write the Docs template).
 * A heading matches if it starts with the text, so "What I learned / next steps" is fine.
 */
export const PROJECT_SECTIONS = ['Problem & motivation', 'Demo', 'How it works', 'Run it locally', 'What I learned'];

export function checkProjectSections(body: string): string | null {
  const headings = [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => m[1]);
  let from = 0;
  for (const required of PROJECT_SECTIONS) {
    const at = headings.findIndex((h, i) => i >= from && h.startsWith(required));
    if (at === -1) {
      return headings.some((h) => h.startsWith(required))
        ? `section "## ${required}" is out of order (expected order: ${PROJECT_SECTIONS.join(' → ')})`
        : `missing section "## ${required}"`;
    }
    from = at + 1;
  }
  return null;
}

export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection('projects', published);
  for (const p of projects) {
    const problem = checkProjectSections(p.body ?? '');
    if (problem) throw new Error(`${p.filePath}: ${problem}. See src/content/projects/_template.md.`);
  }
  return projects.sort((a, b) => a.data.order - b.data.order || b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.data.featured).slice(0, limit);
}

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', published);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** The testimonials page and nav link only appear once there are at least this many. */
export const MIN_TESTIMONIALS = 2;

let testimonialsCache: Promise<CollectionEntry<'testimonials'>[]> | undefined;

export function getTestimonials() {
  const load = async () => (await getCollection('testimonials')).sort((a, b) => a.data.order - b.data.order);
  // Every inner page asks (for the nav link). Cache in production builds so an empty collection
  // warns once, not per page. Dev stays uncached so edits to testimonials.yaml show up.
  if (!import.meta.env.PROD) return load();
  return (testimonialsCache ??= load());
}

export async function getResume() {
  const entry = await getEntry('resume', 'resume');
  if (!entry) throw new Error('src/data/resume.yaml did not load.');
  return entry.data;
}

/** "2025-03" → "Mar 2025". */
export const formatMonth = (ym: string) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/**
 * "2023 — 2025" / "2025 — Present" (year), or "Mar 2023 — Jun 2025" (month).
 * Without a start (e.g. a degree): "Sep 2027", or "Expected Sep 2027" while that date is in the future.
 */
export function formatRange(start: string | undefined, end: string | undefined, precision: 'year' | 'month' = 'year') {
  const fmt = precision === 'year' ? (ym: string) => ym.slice(0, 4) : formatMonth;
  if (!start) {
    if (!end) return '';
    const future = new Date(`${end}-01T00:00:00Z`) > new Date();
    return `${future ? 'Expected ' : ''}${fmt(end)}`;
  }
  if (end && fmt(start) === fmt(end)) return fmt(start); // "2026", not "2026 — 2026"
  return `${fmt(start)} — ${end ? fmt(end) : 'Present'}`;
}
