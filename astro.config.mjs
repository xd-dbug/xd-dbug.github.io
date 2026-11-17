// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { resumePdfDev } from './scripts/resume-pdf.ts';

// https://astro.build/config
export default defineConfig({
  // Launch URL. Swap for the custom domain once it's bought (PLAN.md step 10).
  site: 'https://xd-dbug.github.io',
  // Self-hosted at build time; used via <Font /> in BaseLayout and --font-sans/--font-mono in global.css.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: [400, 500, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  markdown: {
    // Light colours inline; global.css swaps to --shiki-dark in the dark theme.
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  // resumePdfDev: `astro dev` serves /resume.pdf live; `npm run build` writes dist/resume.pdf instead.
  integrations: [sitemap(), resumePdfDev()],
});
