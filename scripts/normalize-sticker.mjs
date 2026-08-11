/**
 * Shared sticker normalisation.
 *
 * Source cutouts routinely arrive as a 500x500 canvas with the subject filling
 * only ~20% of it. That dead transparent margin makes the sticker look tiny in
 * the gallery and, worse, pastes into a Story at a fraction of the size the
 * user expects. So: trim the transparent margin, add a small breathing gap,
 * and scale the result up to a consistent size.
 *
 * Not part of `prebuild` on purpose — it is not idempotent (the padding would
 * compound on every build). Run it at import time, or manually via
 * `npm run normalize`.
 */
import sharp from 'sharp';

/** Longest edge of the normalised output. */
export const TARGET = 512;
/** Transparent breathing room added back after trimming, as a fraction of the longest edge. */
const PAD_RATIO = 0.03;

/**
 * @param {Buffer} input  raw image bytes
 * @returns {Promise<{buffer: Buffer, before: string, after: string, fillBefore: number}>}
 */
export async function normalizeSticker(input) {
  const meta = await sharp(input).metadata();

  let trimmed;
  let info;
  try {
    const r = await sharp(input)
      .ensureAlpha()
      .trim({ threshold: 1 })
      .toBuffer({ resolveWithObject: true });
    trimmed = r.data;
    info = r.info;
  } catch {
    // fully transparent or already tight — leave it alone
    trimmed = input;
    info = { width: meta.width, height: meta.height };
  }

  const fillBefore = (info.width * info.height) / (meta.width * meta.height);

  const longest = Math.max(info.width, info.height);
  const scale = TARGET / longest;
  const w = Math.max(1, Math.round(info.width * scale));
  const h = Math.max(1, Math.round(info.height * scale));
  const pad = Math.round(TARGET * PAD_RATIO);

  const buffer = await sharp(trimmed)
    .resize(w, h, { fit: 'fill', kernel: 'lanczos3' })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

  return {
    buffer,
    before: `${meta.width}x${meta.height}`,
    after: `${w + pad * 2}x${h + pad * 2}`,
    fillBefore,
  };
}
