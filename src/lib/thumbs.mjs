/**
 * Where generated WebP thumbnails live.
 *
 * Shared by the thumbnail scripts (which write them) and every template that
 * links one, so the two can't drift apart. Plain .mjs so the Node build
 * scripts can import it without a TypeScript step. Keep it free of Node
 * built-ins: on Cloudflare the pages are bundled for Workers, which can't.
 *
 * Images in their home folder map flat, as they always have:
 *   /stickers/foo.png      -> /stickers/thumbs/foo-400.webp
 *   /dps/uploads/bar.jpg   -> /dps/uploads/thumbs/bar-400.webp
 *
 * An image anywhere else keeps its folder path under thumbs/, so it can't
 * collide with a file of the same name. The CMS media picker lets an upload
 * land in another collection's folder, and there is no setting to stop it —
 * so a sticker saved to /dps/uploads/ has to work, not 404:
 *   /dps/uploads/29.png    -> /stickers/thumbs/dps/uploads/29-400.webp
 */
/** Card srcset widths, plus the detail-page hero size. */
export const THUMB_SIZES = [200, 400, 512];

/** `image` minus its home-folder prefix, leading slash and extension. */
function key(image, home) {
  const rest = image.startsWith(home) ? image.slice(home.length) : image.replace(/^\//, '');
  return rest.replace(/\.\w+$/, '');
}

/**
 * @param {string} image Root-relative path to the full-size image.
 * @param {number} size One of THUMB_SIZES.
 */
export function stickerThumb(image, size) {
  return `/stickers/thumbs/${key(image, '/stickers/')}-${size}.webp`;
}

/**
 * Prefix for a DP's thumbnails: `${dpThumbBase(image)}-400.webp`.
 * @param {string} image Root-relative path to the full-size image.
 */
export function dpThumbBase(image) {
  return `/dps/uploads/thumbs/${key(image, '/dps/uploads/')}`;
}
