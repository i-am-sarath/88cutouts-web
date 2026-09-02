import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
});
