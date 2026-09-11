/**
 * Whether an image path actually exists in public/.
 *
 * The file list is collected by the `public-images` Vite plugin in
 * astro.config.mjs, which runs in Node. Pages can't check the disk themselves:
 * Cloudflare builds them with its adapter, bundled for Workers, where
 * `node:fs` doesn't exist.
 */
import publicImages from 'virtual:public-images';

/** True if a root-relative path like `/stickers/foo.png` exists in public/. */
export function inPublic(image: string): boolean {
  return publicImages.has(image);
}
