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

export const collections = { stickers, ransomLetters };
