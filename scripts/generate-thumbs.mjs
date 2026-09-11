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
 * Every PNG in public/stickers gets thumbnails, and so does any sticker or blog
 * cover whose frontmatter points somewhere else — the CMS can drop an upload
 * into another collection's folder, and its page still needs a thumbnail.
 * Paths come from src/lib/thumbs.mjs, which the templates also use.
 *
 * Runs from `prebuild`. Output is gitignored — Cloudflare regenerates it.
 */
import sharp from 'sharp';
import { globby } from 'globby';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { THUMB_SIZES as SIZES, stickerThumb } from '../src/lib/thumbs.mjs';
import { contentImages } from './content-images.mjs';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const PUBLIC = path.join(ROOT, 'public');

/** Root-relative image paths, e.g. `/stickers/foo.png`. */
const images = new Set([
  ...(await globby(['public/stickers/*.png'], { cwd: ROOT })).map((f) => f.replace(/^public/, '')),
  ...(await contentImages(ROOT, ['src/content/stickers', 'src/content/blog'], ['image', 'cover'])),
]);

let written = 0;
let skipped = 0;
let missing = 0;
let bytes = 0;

for (const image of images) {
  const file = path.join(PUBLIC, image);
  let srcStat;
  try {
    srcStat = await stat(file);
  } catch {
    // src/lib/stickers.ts leaves the entry out of the build for the same reason.
    console.warn(`Thumbnails: ${image} is referenced in content but does not exist.`);
    missing++;
    continue;
  }

  for (const size of SIZES) {
    const out = path.join(PUBLIC, stickerThumb(image, size));
    await mkdir(path.dirname(out), { recursive: true });

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
    `(${images.size - missing} images x ${SIZES.length} sizes, ${(bytes / 1024).toFixed(0)} KB total).`
);
