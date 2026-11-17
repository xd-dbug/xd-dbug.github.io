// Everything about /resume.pdf in one place:
//  - renderResumePdf(): prints a running site's /resume/ page with headless Chromium.
//  - resumePdfDev(): Astro integration so `astro dev` serves /resume.pdf live (the build writes a real file instead,
//    see build-resume-pdf.ts).
// The page's print styles and @page rule control the layout, so edit src/pages/resume/index.astro, not this.
import type { AstroIntegration } from 'astro';

/** Print `${origin}/resume/` to a PDF. Throws if Playwright or its Chromium is missing. */
export async function renderResumePdf(origin: string, path?: string): Promise<Buffer> {
  let chromium: typeof import('playwright').chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    throw new Error('Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium');
  }
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const response = await page.goto(`${origin}/resume/`, { waitUntil: 'networkidle' });
    if (!response?.ok()) throw new Error(`${origin}/resume/ returned ${response?.status()}`);
    await page.evaluate(() => document.fonts.ready);
    return await page.pdf({ path, preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
  } finally {
    await browser.close();
  }
}

/** Page count of a PDF (counts page objects; good enough for our own Chromium output). */
export const countPdfPages = (pdf: Buffer) => pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length ?? 0;

/** Dev only: answer /resume.pdf by printing the dev server's own /resume/ page (takes a second or two). */
export function resumePdfDev(): AstroIntegration {
  return {
    name: 'resume-pdf-dev',
    hooks: {
      'astro:server:setup': ({ server, logger }) => {
        server.middlewares.use('/resume.pdf', async (req, res) => {
          try {
            const pdf = await renderResumePdf(`http://${req.headers.host}`);
            res.writeHead(200, { 'content-type': 'application/pdf', 'cache-control': 'no-store' });
            res.end(pdf);
          } catch (err) {
            logger.error(String(err));
            res.writeHead(500, { 'content-type': 'text/plain' }).end(`resume.pdf: ${err}`);
          }
        });
      },
    },
  };
}
