/**
 * `/sitemap.xml` is the address Search Console and most crawlers try first,
 * but @astrojs/sitemap only writes `/sitemap-index.xml` and `/sitemap-N.xml`.
 * This index lists both: the blog sitemap on its own, so Search Console
 * reports how many guides are indexed separately from the sticker pages, and
 * the full sitemap the integration generates.
 */
export function GET({ site }: { site: URL | undefined }) {
  const base = site ?? new URL('https://88cutouts.com');
  const maps = ['/sitemap-blog.xml', '/sitemap-0.xml'];
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    maps.map((m) => `<sitemap><loc>${new URL(m, base).href}</loc></sitemap>`).join('') +
    '</sitemapindex>';
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
