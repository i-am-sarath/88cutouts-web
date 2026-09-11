/**
 * The sticker library, as every page should see it.
 *
 * Use this instead of `getCollection('stickers')`. An entry whose image isn't
 * in the repo — saved from the CMS before the upload finished, or the file
 * deleted since — would otherwise ship a detail page with a broken hero and a
 * hole in every grid it appears in. It is left out with a build warning
 * instead, and appears on the next build once the image is there.
 */
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { inPublic } from './public-images';

let cache: CollectionEntry<'stickers'>[] | null = null;

export async function getStickers(): Promise<CollectionEntry<'stickers'>[]> {
  if (cache) return cache;

  cache = await getCollection('stickers', (entry) => {
    if (inPublic(entry.data.image)) return true;
    console.warn(`[stickers] Skipping "${entry.slug}": ${entry.data.image} does not exist.`);
    return false;
  });

  return cache;
}
