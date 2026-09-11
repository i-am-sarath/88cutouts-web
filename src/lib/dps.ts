/**
 * The DP gallery.
 *
 * Every DP is a file a human uploaded through /admin into the `dps` content
 * collection — nothing here is composed at build time. The gallery is curated
 * on purpose: a profile picture is something a person picks, and generated
 * sticker-on-gradient squares were not worth publishing.
 *
 * Collection metadata (copy, FAQ, palettes) lives in src/data/dp-collections.json
 * and exists whether or not anything has been uploaded to it yet, so the
 * landing pages are stable URLs you can fill in over time.
 */
import { getCollection } from 'astro:content';
import collectionsData from '../data/dp-collections.json';
import { inPublic } from './public-images';
import { dpThumbBase } from './thumbs.mjs';

export interface DpFaq {
  q: string;
  a: string;
}

/** A background pair plus accent colours — used by the DP maker's swatches. */
export interface DpPalette {
  bg: [string, string];
  blobs: string[];
}

export interface DpCollectionMeta {
  slug: string;
  name: string;
  /** Page <h1>. */
  h1: string;
  /** <title>, without the site suffix. */
  title: string;
  /** One line, used under the h1 and as the card caption on the hub. */
  blurb: string;
  /** Opening paragraph of the landing page. */
  intro: string;
  /** Sibling collection slugs to cross-link. */
  related: string[];
  faq: DpFaq[];
  palettes: DpPalette[];
}

export interface Dp {
  slug: string;
  collection: string;
  title: string;
  /** Full-size square image — what Copy and Download hand over. */
  image: string;
  /** Prefix for responsive thumbnails: `${thumbBase}-400.webp`. */
  thumbBase: string;
  /** Optional line shown on the detail page and used as its meta description. */
  description?: string;
  tags: string[];
  featured: boolean;
  date: Date;
}

export const dpCollections = collectionsData as unknown as DpCollectionMeta[];

export function getDpCollection(slug: string) {
  return dpCollections.find((c) => c.slug === slug);
}

let cache: Dp[] | null = null;

/**
 * Every DP on the site — featured first, then newest.
 *
 * An entry whose image isn't in the repo (saved from the CMS before the upload
 * finished, or the file deleted since) is left out with a build warning rather
 * than published as a broken page. It appears on the next build once the image
 * is there.
 */
export async function getAllDps(): Promise<Dp[]> {
  if (cache) return cache;

  const entries = await getCollection('dps', (entry) => {
    if (inPublic(entry.data.image)) return true;
    console.warn(`[dps] Skipping "${entry.slug}": ${entry.data.image} does not exist.`);
    return false;
  });

  cache = entries
    .map((entry) => {
      return {
        slug: entry.slug,
        collection: entry.data.collection,
        title: entry.data.title,
        image: entry.data.image,
        thumbBase: dpThumbBase(entry.data.image),
        description: entry.data.description,
        tags: entry.data.tags,
        featured: entry.data.featured,
        date: entry.data.date,
      } satisfies Dp;
    })
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.date.getTime() - a.date.getTime();
    });

  return cache;
}

export async function getDpsIn(collectionSlug: string): Promise<Dp[]> {
  return (await getAllDps()).filter((d) => d.collection === collectionSlug);
}

/**
 * Filler for a collection page that is thin on its own, and the "more like
 * this" row on a detail page. Never returns DPs from the same collection.
 */
export async function getRelatedDps(
  collectionSlug: string,
  limit: number,
  excludeSlug?: string
): Promise<Dp[]> {
  const all = await getAllDps();
  const out: Dp[] = [];

  // Round-robin across the other collections so the row is visually varied
  // instead of six near-identical DPs from whichever one sorts first.
  const others = dpCollections.filter((c) => c.slug !== collectionSlug).map((c) => c.slug);
  for (let i = 0; out.length < limit; i++) {
    let addedThisPass = false;
    for (const other of others) {
      const pool = all.filter((d) => d.collection === other && d.slug !== excludeSlug);
      if (i < pool.length) {
        out.push(pool[i]);
        addedThisPass = true;
        if (out.length === limit) break;
      }
    }
    if (!addedThisPass) break;
  }
  return out;
}
