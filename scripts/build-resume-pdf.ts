// Writes dist/resume.pdf after `astro build` (see the "build" script). Node runs this .ts file directly.
// Serves dist/ over HTTP so root-relative asset URLs (/_astro/...) resolve as they do in production.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import type { AddressInfo } from 'node:net';
import { renderResumePdf, countPdfPages } from './resume-pdf.ts';

const DIST = resolve(import.meta.dirname, '../dist');
const OUT = join(DIST, 'resume.pdf');
const MAX_PAGES = 1; // warn (not fail) if the résumé spills onto a second page

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml',
  '.json': 'application/json',
};

const server = createServer(async (req, res) => {
  try {
    let file = normalize(join(DIST, decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname)));
    if (!file.startsWith(DIST)) throw new Error('outside dist');
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
const { port } = server.address() as AddressInfo;

try {
  const pdf = await renderResumePdf(`http://127.0.0.1:${port}`, OUT);
  const pages = countPdfPages(pdf);
  console.log(`resume.pdf: ${pages} page${pages === 1 ? '' : 's'}, ${(pdf.length / 1024).toFixed(0)} KB → dist/resume.pdf`);
  if (pages > MAX_PAGES) console.warn(`resume.pdf: over ${MAX_PAGES} page(s); tighten print styles or trim content.`);
} catch (err) {
  console.error(`resume.pdf: ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
} finally {
  server.close();
}
