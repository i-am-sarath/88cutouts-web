/// <reference path="../.astro/types.d.ts" />

/** Root-relative paths of every image in public/ — see astro.config.mjs. */
declare module 'virtual:public-images' {
  const images: Set<string>;
  export default images;
}
/** Dimensions and byte size of every sticker PNG — see astro.config.mjs. */
declare module 'virtual:image-meta' {
  const meta: Record<string, { w: number; h: number; bytes: number }>;
  export default meta;
}
