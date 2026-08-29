import { getCollection } from 'astro:content';
import { getAllDps, getDpCollection } from '../lib/dps';

/**
 * Powers the header search. Stickers and DPs live at different URL shapes, so
 * each entry carries its own `url` rather than the consumer assuming one.
 *
 * The DP maker also reads this endpoint for its sticker picker, which is why
 * the sticker entries keep their original field names.
 */
export async function GET() {
  const stickers = (await getCollection('stickers')).map((i) => ({
    slug: i.slug,
    title: i.data.title,
    category: i.data.category,
    tags: i.data.tags,
    image: i.data.image,
    url: `/stickers/${i.slug}/`,
    kind: 'sticker' as const,
  }));

  const dps = (await getAllDps()).map((d) => ({
    slug: d.slug,
    title: d.title,
    category: getDpCollection(d.collection)?.name ?? d.collection,
    tags: d.tags,
    image: `${d.thumbBase}-200.webp`,
    url: `/dp/${d.collection}/${d.slug}/`,
    kind: 'dp' as const,
  }));

  return new Response(JSON.stringify([...stickers, ...dps]), {
    headers: { 'Content-Type': 'application/json' },
  });
}
