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
 * Only images a DP entry actually uses get thumbnails — wherever the CMS saved
 * them. Anything else in uploads/ (a sticker dropped in the wrong folder) is
 * not a DP and doesn't need cover-cropped copies. Paths come from
 * src/lib/thumbs.mjs, which src/lib/dps.ts also uses.
 *
 * Runs from `prebuild` and `dev`. Output is gitignored — Cloudflare
 * regenerates it from the committed originals on every build.
 */
import sharp from 'sharp';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { THUMB_SIZES as SIZES, dpThumbBase } from '../src/lib/thumbs.mjs';
import { contentImages } from './content-images.mjs';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const PUBLIC = path.join(ROOT, 'public');

const FORCE = process.argv.includes('--force');

const images = [...new Set(await contentImages(ROOT, ['src/content/dps'], ['image']))];

let written = 0;
let skipped = 0;
let missing = 0;

for (const image of images) {
  const src = path.join(PUBLIC, image);
  let srcStat;
  try {
    srcStat = await stat(src);
  } catch {
    // src/lib/dps.ts leaves the entry out of the build for the same reason.
    console.warn(`DP thumbnails: ${image} is referenced in content but does not exist.`);
    missing++;
    continue;
  }

  for (const size of SIZES) {
    const out = path.join(PUBLIC, `${dpThumbBase(image)}-${size}.webp`);
    await mkdir(path.dirname(out), { recursive: true });

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
    `(${images.length - missing} DP${images.length - missing === 1 ? '' : 's'} x ${SIZES.length} sizes).`
);
