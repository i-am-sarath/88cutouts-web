import { getStickers } from '../lib/stickers';
import { stickerThumb } from '../lib/thumbs.mjs';

/**
 * Powers the header search. Each entry carries its own `url` rather than the
 * consumer assuming one, so other kinds of result can be added later.
 */
export async function GET() {
  const stickers = (await getStickers()).map((i) => ({
    slug: i.slug,
    title: i.data.title,
    category: i.data.category,
    tags: i.data.tags,
    image: i.data.image,
    thumb: stickerThumb(i.data.image, 200),
    url: `/stickers/${i.slug}/`,
    kind: 'sticker' as const,
  }));

  return new Response(JSON.stringify(stickers), {
    headers: { 'Content-Type': 'application/json' },
  });
}
