/// <reference path="../.astro/types.d.ts" />

/** Root-relative paths of every image in public/ — see astro.config.mjs. */
declare module 'virtual:public-images' {
  const images: Set<string>;
  export default images;
}