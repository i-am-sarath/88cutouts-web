/**
 * Root-relative image paths referenced from content frontmatter.
 *
 * The thumbnail scripts can't just glob their home folder: an entry saved
 * through the CMS can point at an image in some other folder, and that image
 * still needs thumbnails. This reads the paths straight out of the Markdown.
 */
import { globby } from 'globby';
import { readFile } from 'node:fs/promises';

/**
 * @param {string} root Project root.
 * @param {string[]} dirs Content folders relative to root, e.g. `src/content/stickers`.
 * @param {string[]} fields Frontmatter keys holding an image path, e.g. `image`.
 * @returns {Promise<string[]>}
 */
export async function contentImages(root, dirs, fields) {
  const files = await globby(
    dirs.map((d) => `${d}/*.{md,mdx}`),
    { cwd: root, absolute: true }
  );
  // Values may be quoted and may contain spaces ("88cutouts Sticker Batch (1).png").
  const line = new RegExp(`^(?:${fields.join('|')}):\\s*["']?(\\/.+?)["']?\\s*$`, 'm');

  const out = [];
  for (const file of files) {
    const frontmatter = (await readFile(file, 'utf8')).match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const ref = frontmatter?.[1].match(line);
    if (ref) out.push(ref[1]);
  }
  return out;
}
