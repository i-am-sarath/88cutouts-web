import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { globbySync } from 'globby';
import { fileURLToPath } from 'node:url';

/**
 * `virtual:public-images` — a Set of every image path in public/, e.g.
 * `/stickers/foo.png`, so pages can leave out a CMS entry whose image is
 * missing (src/lib/public-images.ts). It is collected here because this file
 * runs in Node; the pages themselves can't read the disk — Cloudflare adds its
 * adapter at deploy time and bundles them for Workers, where there is no fs.
 * Generated thumbnails are skipped. In dev, restart to pick up new files.
 */
function publicImages() {
  const id = 'virtual:public-images';
  const resolved = '\0' + id;
  return {
    name: 'public-images',
    resolveId: (source) => (source === id ? resolved : undefined),
    load(source) {
      if (source !== resolved) return;
      const files = globbySync(['**/*.{png,jpg,jpeg,webp,gif,svg}', '!**/thumbs/**'], {
        cwd: fileURLToPath(new URL('./public', import.meta.url)),
      });
      return `export default new Set(${JSON.stringify(files.map((f) => '/' + f))});`;
    },
  };
}

/**
 * Blog tables can be wider than the 68ch article column on a phone. Wrapping
 * each one in a scroll container keeps the page itself from scrolling
 * sideways. Written by hand rather than pulling in unist-util-visit for it.
 */
function rehypeWrapTables() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        walk(child);
        if (child.type === 'element' && child.tagName === 'table') {
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['post-table-wrap'] },
            children: [child],
          };
        }
        return child;
      });
    };
    walk(tree);
  };
}

export default defineConfig({
  site: 'https://88cutouts.com',
  build: { format: 'directory' },
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [rehypeWrapTables],
  },
  vite: {
    plugins: [publicImages()],
  },
});
