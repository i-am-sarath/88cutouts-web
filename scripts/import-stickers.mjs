/**
 * Bulk importer for the `stickers/` drop folder.
 *
 * Daily workflow: drop new transparent PNGs into `stickers/`, run
 * `npm run import`. Each new file is de-duplicated, converted to PNG, moved
 * into `public/stickers/`, and given a content entry in
 * `src/content/stickers/`. Anything it can't name for you is listed at the end
 * so you can fill in the title/category/tags — in `/admin` or by hand.
 *
 * Nothing is ever deleted: duplicates go to `stickers/_duplicates/`.
 *
 * Flags:
 *   --dry    report what would happen, change nothing
 */
import sharp from 'sharp';
import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSticker } from './normalize-sticker.mjs';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const DROP = path.join(ROOT, 'stickers');
const PUB = path.join(ROOT, 'public/stickers');
const CONTENT = path.join(ROOT, 'src/content/stickers');
const DUPES = path.join(DROP, '_duplicates');
/** Untouched source files are kept here — normalisation is lossy, so never delete them. */
const ORIGINALS = path.join(DROP, '_originals');

const DRY = process.argv.includes('--dry');
const IMAGE_RE = /\.(png|webp|jpe?g|avif)$/i;

/** Perceptual fingerprint: trim to content, 16x16, grey * alpha + alpha. */
async function fingerprint(buf) {
  const img = sharp(buf).ensureAlpha();
  let trimmed;
  try {
    trimmed = await img.trim({ threshold: 1 }).toBuffer();
  } catch {
    trimmed = await img.toBuffer();
  }
  const { data } = await sharp(trimmed).resize(16, 16, { fit: 'fill' }).raw().toBuffer({
    resolveWithObject: true,
  });
  const gray = [];
  const alpha = [];
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] / 255;
    gray.push(((data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255) * a);
    alpha.push(a);
  }
  return { gray, alpha };
}

function distance(a, b) {
  let g = 0;
  let al = 0;
  for (let i = 0; i < a.gray.length; i++) {
    g += (a.gray[i] - b.gray[i]) ** 2;
    al += (a.alpha[i] - b.alpha[i]) ** 2;
  }
  return Math.sqrt(g / a.gray.length) + Math.sqrt(al / a.alpha.length);
}

const NEAR_DUPE = 0.14;

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/-?removebg-?preview/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'sticker';

const titleize = (slug) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

await mkdir(DROP, { recursive: true });
await mkdir(DUPES, { recursive: true });
await mkdir(ORIGINALS, { recursive: true });

const incoming = (await readdir(DROP, { withFileTypes: true }))
  .filter((d) => d.isFile() && IMAGE_RE.test(d.name))
  .map((d) => d.name)
  .sort();

if (incoming.length === 0) {
  console.log('Nothing new in stickers/ — drop some PNGs in there first.');
  process.exit(0);
}

// Fingerprint what's already published so re-drops are caught.
const existingFiles = (await readdir(PUB)).filter((f) => IMAGE_RE.test(f));
const existing = [];
for (const f of existingFiles) {
  const buf = await readFile(path.join(PUB, f));
  existing.push({
    name: f,
    sha: createHash('sha256').update(buf).digest('hex'),
    fp: await fingerprint(buf),
  });
}

const existingSlugs = new Set(
  (await readdir(CONTENT)).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
);

const accepted = [];
const skipped = [];

for (const name of incoming) {
  const buf = await readFile(path.join(DROP, name));
  const sha = createHash('sha256').update(buf).digest('hex');
  const fp = await fingerprint(buf);

  const exact = existing.find((e) => e.sha === sha) || accepted.find((a) => a.sha === sha);
  if (exact) {
    skipped.push([name, `identical to ${exact.name}`]);
    continue;
  }

  const near =
    existing.find((e) => distance(e.fp, fp) < NEAR_DUPE) ||
    accepted.find((a) => distance(a.fp, fp) < NEAR_DUPE);
  if (near) {
    skipped.push([name, `near-duplicate of ${near.name}`]);
    continue;
  }

  let slug = slugify(name);
  let n = 2;
  while (existingSlugs.has(slug)) slug = `${slugify(name)}-${n++}`;
  existingSlugs.add(slug);

  const meta = await sharp(buf).metadata();
  accepted.push({ name, slug, sha, fp, buf, alpha: meta.hasAlpha, w: meta.width, h: meta.height });
}

const today = new Date().toISOString().slice(0, 10);

for (const item of accepted) {
  if (DRY) continue;
  const { buffer } = await normalizeSticker(item.buf);
  await writeFile(path.join(PUB, `${item.slug}.png`), buffer);
  await writeFile(
    path.join(CONTENT, `${item.slug}.md`),
    `---\n` +
      `title: ${JSON.stringify(titleize(item.slug))}\n` +
      `image: "/stickers/${item.slug}.png"\n` +
      `type: "sticker"\n` +
      `category: "general"\n` +
      `tags: []\n` +
      `featured: false\n` +
      `date: ${today}\n` +
      `---\n`
  );
  await rename(path.join(DROP, item.name), path.join(ORIGINALS, item.name)).catch(() => {});
}

if (!DRY) {
  for (const [name] of skipped) {
    await rename(path.join(DROP, name), path.join(DUPES, name)).catch(() => {});
  }
}

console.log(`${DRY ? '[dry run] ' : ''}imported ${accepted.length}, skipped ${skipped.length}\n`);

if (skipped.length) {
  console.log('skipped (moved to stickers/_duplicates/):');
  for (const [name, why] of skipped) console.log(`  ${name.padEnd(38)} ${why}`);
  console.log('');
}

const noAlpha = accepted.filter((a) => !a.alpha);
if (noAlpha.length) {
  console.log('WARNING — no transparency, these will paste with a solid box:');
  for (const a of noAlpha) console.log(`  ${a.name}`);
  console.log('');
}

if (accepted.length) {
  console.log('Fill in title / category / tags for these (in /admin or the .md directly):');
  for (const a of accepted) console.log(`  src/content/stickers/${a.slug}.md`);
}
