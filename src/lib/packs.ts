/**
 * Sticker packs, resolved against the library. See src/data/packs.ts.
 */
import type { CollectionEntry } from 'astro:content';
import { packs, type PackData } from '../data/packs';
import { getStickers } from './stickers';

export interface Pack extends PackData {
  entries: CollectionEntry<'stickers'>[];
}

let cache: Pack[] | null = null;

/**
 * Every pack with its stickers looked up. A slug that no longer resolves is
 * dropped with a warning, and a pack left with fewer than three stickers is
 * not published at all: two stickers aren't a pack.
 */
export async function getPacks(): Promise<Pack[]> {
  if (!cache) {
    const bySlug = new Map((await getStickers()).map((s) => [s.slug, s]));
    cache = packs
      .map((p) => {
        const entries = p.stickers.flatMap((slug) => {
          const s = bySlug.get(slug);
          if (!s) console.warn(`[packs] "${p.slug}": sticker "${slug}" not found, skipped.`);
          return s ? [s] : [];
        });
        return { ...p, entries };
      })
      .filter((p) => {
        if (p.entries.length >= 3) return true;
        console.warn(`[packs] "${p.slug}" has fewer than 3 stickers and was left out.`);
        return false;
      });
  }
  return cache;
}
