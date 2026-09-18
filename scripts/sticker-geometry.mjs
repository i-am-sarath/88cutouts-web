/**
 * Measures where the artwork actually sits inside each sticker PNG and writes
 * src/data/sticker-geometry.json.
 *
 * Why this exists: more than half the library ships with a large transparent
 * margin around the artwork — a 720x900 file whose cutout is only 204x417.
 * The canvas size is what you download, but the *artwork* size is what decides
 * how big the thing looks once it is pasted into a Story and how far it can be
 * scaled before it softens. Pages need both, and they can't measure it
 * themselves: on Cloudflare they're bundled for Workers, with no `node:fs` and
 * no sharp. So it's measured here, at build time, into a plain JSON file the
 * pages can import.
 *
 * Runs in `prebuild`, next to the thumbnail scripts. Safe to re-run; it
 * rewrites the file from scratch each time.
 */
import sharp from 'sharp';
import { globby } from 'globby';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = path.join(ROOT, 'src/data/sticker-geometry.json');

/** Tight bounding box of everything above a low alpha threshold. */
async function artworkBox(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let x0 = info.width;
  let y0 = info.height;
  let x1 = -1;
  let y1 = -1;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      // 8 rather than 0: anti-aliased edges leave a few near-zero pixels that
      // would otherwise count as artwork and defeat the whole measurement.
      if (data[(y * info.width + x) * info.channels + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }

  if (x1 < 0) return null; // fully transparent
  return { w: info.width, h: info.height, aw: x1 - x0 + 1, ah: y1 - y0 + 1 };
}

// A sticker's image can land in either folder: the CMS media picker lets an
// upload go to /dps/uploads, and there is no setting to stop it.
const files = await globby(
  ['public/stickers/**/*.png', 'public/dps/uploads/**/*.png', '!**/thumbs/**'],
  { cwd: ROOT }
);
const out = {};

for (const rel of files) {
  const box = await artworkBox(path.join(ROOT, rel));
  if (box) out['/' + rel.replace(/^public\//, '')] = box;
}

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(out, null, 0) + '\n', 'utf8');

const loose = Object.values(out).filter((b) => (b.aw * b.ah) / (b.w * b.h) < 0.75).length;
console.log(
  `[sticker-geometry] ${Object.keys(out).length} stickers measured, ` +
    `${loose} with a transparent margin over 25% of the canvas`
);
