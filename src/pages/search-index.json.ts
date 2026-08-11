import { getCollection } from 'astro:content';

export async function GET() {
  const items = await getCollection('stickers');
  const index = items.map((i) => ({
    slug: i.slug,
    title: i.data.title,
    category: i.data.category,
    tags: i.data.tags,
    image: i.data.image,
  }));
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
}
