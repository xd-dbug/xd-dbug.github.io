// Site-wide identity and navigation. Edit here; every page reads from this file.

export const site = {
  name: 'Damian Swiney',
  role: 'Software Engineering Student',
  headline: 'I build systems software and cloud backends, from a Rust kernel to event-driven services on AWS.',
  description: 'Damian Swiney, software engineering student. Projects, résumé, and writing.',
  // Leave a link empty to hide it everywhere.
  links: {
    github: 'https://github.com/xd-dbug',
    linkedin: 'https://linkedin.com/in/damian-swiney',
  },
  // Never rendered as plain text: ObfuscatedEmail scrambles it in the HTML and assembles it client-side.
  email: { user: 'damian.swiney1', domain: 'gmail.com' },
};

/** Inner-page navigation (the home page uses its own in-page section nav). */
export const nav = [
  { label: 'projects', href: '/projects/' },
  { label: 'resume', href: '/resume/' },
  { label: 'blog', href: '/blog/' },
  { label: 'contact', href: '/contact/' },
];

/** External profile links that are set, in display order. */
export const elsewhere = Object.entries(site.links)
  .filter(([, href]) => href)
  .map(([label, href]) => ({ label, href }));

/** Build date, shown as "last updated" in footers. Each deploy rebuilds, so this tracks the live site. */
export const lastUpdated = new Date();

/** Content dates are UTC midnight (YYYY-MM-DD in frontmatter), so format in UTC to avoid an off-by-one day. */
export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
