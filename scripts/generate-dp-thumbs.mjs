/**
 * Thumbnails for CMS-uploaded DPs.
 *
 * The gallery is curated: every DP in it is a file a human uploaded through
 * /admin into public/dps/uploads. Those originals are the *download* artefact
 * — full size, untouched — so the grid can't serve them directly without
 * pushing a few megabytes into an 18-up page. This makes the small square
 * WebP copies that DpCard and the detail hero display instead.
 *
 * `cover` rather than `contain`: a DP is meant to be seen as a filled circle,
 * so an upload that is slightly off-square should be cropped to the middle,
 * not letterboxed onto bars.
 *
 * Runs from `prebuild` and `dev`. Output is gitignored — Cloudflare
 * regenerates it from the committed originals on every build.
 */
import sharp from 'sharp';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const UPLOADS = path.join(ROOT, 'public/dps/uploads');
const THUMBS = path.join(UPLOADS, 'thumbs');

/** Card srcset widths, plus the detail-page hero size. */
const SIZES = [200, 400, 512];

const FORCE = process.argv.includes('--force');

let files = [];
try {
  files = (await readdir(UPLOADS)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
} catch {
  /* nothing uploaded yet — nothing to do */
}

if (files.length) await mkdir(THUMBS, { recursive: true });

let written = 0;
let skipped = 0;

for (const file of files) {
  const base = file.replace(/\.\w+$/, '');
  const src = path.join(UPLOADS, file);
  const srcStat = await stat(src);

  for (const size of SIZES) {
    const out = path.join(THUMBS, `${base}-${size}.webp`);

    // skip if the thumbnail is newer than its source
    try {
      const outStat = await stat(out);
      if (!FORCE && outStat.mtimeMs >= srcStat.mtimeMs) {
        skipped++;
        continue;
      }
    } catch {
      /* not generated yet */
    }

    const buf = await sharp(src)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82, alphaQuality: 90, effort: 4 })
      .toBuffer();

    await writeFile(out, buf);
    written++;
  }
}

console.log(
  `DP thumbnails: ${written} written, ${skipped} up to date ` +
    `(${files.length} uploaded DP${files.length === 1 ? '' : 's'} x ${SIZES.length} sizes).`
);
