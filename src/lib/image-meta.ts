/**
 * Real dimensions and file size for a sticker PNG.
 *
 * `w`/`h` are the canvas -- the file you download. `aw`/`ah` are the artwork
 * inside it, which is often much smaller: more than half the library ships
 * with a wide transparent margin, and it is the artwork box that decides how
 * big a cutout looks once it is pasted and how far it can be scaled before it
 * softens. Saying 720 x 900 when the cutout is 204 x 417 overstates it.
 *
 * Canvas and file size come from the `image-meta` Vite plugin in
 * astro.config.mjs; the artwork box is measured by scripts/sticker-geometry.mjs
 * during `prebuild`. Both run in Node because the pages cannot: on Cloudflare
 * they are bundled for Workers, where `node:fs` does not exist.
 */
import imageMeta from 'virtual:image-meta';
import geometry from '../data/sticker-geometry.json';

export interface ImageMeta {
  /** Canvas width -- the PNG you download. */
  w: number;
  /** Canvas height. */
  h: number;
  bytes: number;
  /** Artwork width inside the canvas; falls back to the canvas. */
  aw: number;
  /** Artwork height inside the canvas. */
  ah: number;
  /** Share of the canvas the artwork covers, 0-1. */
  fill: number;
}

type Raw = { w: number; h: number; bytes: number };
type Box = { w: number; h: number; aw: number; ah: number };

export function getImageMeta(image: string): ImageMeta | null {
  const raw = (imageMeta as Record<string, Raw>)[image];
  if (!raw) return null;
  const box = (geometry as Record<string, Box>)[image];
  const aw = box?.aw ?? raw.w;
  const ah = box?.ah ?? raw.h;
  return {
    w: raw.w,
    h: raw.h,
    bytes: raw.bytes,
    aw,
    ah,
    fill: (aw * ah) / (raw.w * raw.h),
  };
}

/** "84 KB", or "1.2 MB" once it gets there. */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}
