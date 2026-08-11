import { getCollection } from 'astro:content';

export async function GET() {
  const files = await getCollection('ransomLetters');
  const data = files[0]?.data.letters ?? [];
  const manifest: Record<string, string[]> = {};
  for (const entry of data) {
    const key = entry.character.toLowerCase();
    (manifest[key] ??= []).push(entry.image);
  }
  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/json' },
  });
}
