import { getCollection } from 'astro:content';

/**
 * The blog guides alone, with lastmod, so they can be submitted and tracked in
 * Search Console apart from the much larger set of sticker pages.
 */
export async function GET({ site }: { site: URL | undefined }) {
  const base = site ?? new URL('https://88cutouts.com');
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const urls = [
    `<url><loc>${new URL('/blog/', base).href}</loc>${
      posts[0] ? `<lastmod>${day(posts[0].data.updated ?? posts[0].data.date)}</lastmod>` : ''
    }</url>`,
    ...posts.map(
      (p) =>
        `<url><loc>${new URL(`/blog/${p.slug}/`, base).href}</loc>` +
        `<lastmod>${day(p.data.updated ?? p.data.date)}</lastmod></url>`
    ),
  ];
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.join('') +
    '</urlset>';
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
