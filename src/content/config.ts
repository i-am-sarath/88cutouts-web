import { defineCollection, z } from 'astro:content';

const stickers = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    image: z.string(),                 // path under /stickers
    type: z.enum(['sticker', 'frame']).default('sticker'),
    category: z.string().default('general'),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    date: z.date(),
  }),
});

const ransomLetters = defineCollection({
  type: 'data',
  schema: z.object({
    letters: z.array(
      z.object({
        character: z.string(),         // single char this image represents: A, a, 7, !, etc.
        image: z.string(),             // path under /ransom-letters
      })
    ),
  }),
});

/**
 * DPs uploaded through /admin. The whole gallery comes from here — a DP is
 * picked by a person, not composed by a script, so there is no generated
 * source to merge with. Drop a square image in, choose its collection, and it
 * appears on /dp/<collection>/ on the next build.
 */
const dps = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    image: z.string(),                 // path under /dps/uploads
    collection: z.string(),            // a slug from src/data/dp-collections.json
    description: z.string().optional(), // one line, used as the page meta description
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    date: z.date(),
  }),
});

/**
 * Long-form guides. These are written by hand, not generated — each one is a
 * real answer to a question people arrive with (how do I paste a sticker into
 * a Story, why did my PNG go grey, what size should a DP be) rather than a
 * thin wrapper around the gallery. Body is Markdown; `faq` is rendered both as
 * visible Q&A at the foot of the post and as FAQPage JSON-LD.
 */
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    updated: z.date().optional(),
    category: z.enum(['guides', 'aesthetics', 'technical', 'instagram', 'whatsapp']).default('guides'),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),          // path under /stickers, shown on the card
    featured: z.boolean().default(false),
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .default([]),
  }),
});

export const collections = { stickers, ransomLetters, dps, blog };
