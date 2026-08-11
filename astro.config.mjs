import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://88cutouts.com',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
