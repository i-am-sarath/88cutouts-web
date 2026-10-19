/**
 * Saves a filled-in picture of every scrapbook template, for the homepage hero
 * and the template cards. Each template's own page already draws its preview
 * (with sample photos in the frames), so this just opens those pages in a
 * headless browser and keeps what the canvas drew.
 *
 * Run after changing a template:
 *   npm run build && npx astro preview --port 4329 &
 *   node scripts/render-template-previews.mjs
 *
 * Needs Playwright (`npm i -g playwright`); it is not a build dependency.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const OUT = path.join(ROOT, 'public/scrapbook/previews');
const BASE = process.env.PREVIEW_URL ?? 'http://localhost:4329';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
}

const source = await import('node:fs/promises').then((fs) => fs.readFile(path.join(ROOT, 'src/data/scrapbook-templates.ts'), 'utf8'));
const slugs = [...source.matchAll(/^\s*(?:dump|sheet)\('([a-z0-9-]+)'/gm)].map((m) => m[1]);

await mkdir(OUT, { recursive: true });
const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
for (const slug of slugs) {
  await page.goto(`${BASE}/scrapbook/${slug}/`, { waitUntil: 'networkidle' });
  await page.locator('#tpl-canvas').scrollIntoViewIfNeeded();
  // The preview draws once everything it needs has loaded.
  await page.waitForTimeout(4000);
  const data = await page.evaluate(() => {
    const src = document.getElementById('tpl-canvas');
    const c = document.createElement('canvas');
    c.width = 540;
    c.height = 960;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, 0, 0, 540, 960);
    return c.toDataURL('image/webp', 0.84);
  });
  await writeFile(path.join(OUT, `${slug}.webp`), Buffer.from(data.split(',')[1], 'base64'));
  console.log(`  ${slug}.webp`);
}
await browser.close();
