/**
 * Build-time thumbnail generation.
 *
 * The PNGs in public/stickers are the *download* artefacts — full size, PNG,
 * alpha intact, because that is what gets copied to the clipboard and pasted
 * into a Story. Serving those same files as 150px grid thumbnails costs about
 * a megabyte per gallery page, so every sticker also gets small square WebP
 * thumbnails that the grid and detail hero use for display only.
 *
 * Square canvas on purpose: it makes width/height attributes correct for every
 * sticker regardless of its own aspect ratio, which keeps CLS at zero.
 *
 * Runs from `prebuild`. Output is gitignored — Cloudflare regenerates it.
 */
import sharp from 'sharp';
import { globby } from 'globby';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const PUB = path.join(ROOT, 'public/stickers');
const THUMBS = path.join(PUB, 'thumbs');

/** Card srcset widths, plus the detail-page hero size. */
export const SIZES = [200, 400, 512];

await mkdir(THUMBS, { recursive: true });

const files = await globby(['public/stickers/*.png'], { cwd: ROOT, absolute: true });

let written = 0;
let skipped = 0;
let bytes = 0;

for (const file of files) {
  const base = path.basename(file, '.png');
  const srcStat = await stat(file);

  for (const size of SIZES) {
    const out = path.join(THUMBS, `${base}-${size}.webp`);

    // skip if the thumbnail is newer than its source
    try {
      const outStat = await stat(out);
      if (outStat.mtimeMs >= srcStat.mtimeMs) {
        skipped++;
        bytes += outStat.size;
        continue;
      }
    } catch {
      /* not generated yet */
    }

    const buf = await sharp(file)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 82, alphaQuality: 90, effort: 5 })
      .toBuffer();

    await writeFile(out, buf);
    written++;
    bytes += buf.length;
  }
}

console.log(
  `Thumbnails: ${written} written, ${skipped} up to date ` +
    `(${files.length} stickers x ${SIZES.length} sizes, ${(bytes / 1024).toFixed(0)} KB total).`
);
