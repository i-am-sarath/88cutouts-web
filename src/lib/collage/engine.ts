/**
 * The canvas engine behind the collage maker and the sticker packs.
 *
 * Everything on a collage is an Item: a letter scrap, a sticker, or (for a
 * character with no scrap) a drawn paper tile. Items live in "layout space",
 * where letters are roughly their native 200px scan height, so a transparent
 * export at scale 1 is sharp. The on-screen preview is a 9:16 Story frame; a
 * view transform fits the layout into it. That transform is only recomputed
 * when the collage is rebuilt, never while a sticker is being dragged, or the
 * whole scene would slide around under the finger.
 *
 * Browser-only: this runs inside the pages' <script> tags.
 */

export type ItemKind = 'letter' | 'sticker' | 'glyph';

export interface Crop {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface Item {
  kind: ItemKind;
  /** Image URL; empty for a glyph. */
  src: string;
  /** The character, for letters and glyphs. */
  char?: string;
  /** Centre, in layout space. */
  x: number;
  y: number;
  /** Drawn size of the artwork (not the file), in layout space. */
  w: number;
  h: number;
  /** Radians. */
  angle: number;
  /** Paint order; higher is on top. */
  z: number;
}

export interface View {
  scale: number;
  tx: number;
  ty: number;
}

/** Instagram Story canvas. */
export const STORY_W = 1080;
export const STORY_H = 1920;

// ---- images -----------------------------------------------------------------

const images = new Map<string, Promise<HTMLImageElement | null>>();
const crops = new Map<string, Crop>();

export function loadImage(src: string): Promise<HTMLImageElement | null> {
  let p = images.get(src);
  if (!p) {
    p = new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
    images.set(src, p);
  }
  return p;
}

/** A loaded image, or undefined if it hasn't finished (or failed). */
const ready = new Map<string, HTMLImageElement>();

/**
 * Loads images and returns the ones that actually loaded, in order. Layouts
 * must only use what comes back: a sticker whose file failed would otherwise
 * be placed, take up room, and draw as nothing.
 */
export async function preload(srcs: string[]): Promise<string[]> {
  await Promise.all(
    [...new Set(srcs)].map(async (src) => {
      const img = await loadImage(src);
      if (img) ready.set(src, img);
    })
  );
  return srcs.filter((src) => ready.has(src));
}

/**
 * The tight box around the visible artwork. Sticker files carry a transparent
 * margin (often a third of the canvas), and sizing by the file instead of the
 * artwork would make some stickers look half the size of others. Measured on
 * a small copy, which is plenty accurate for placement and costs well under a
 * millisecond per image.
 */
export function cropOf(src: string): Crop {
  const cached = crops.get(src);
  if (cached) return cached;
  const img = ready.get(src);
  if (!img || !img.naturalWidth) return { sx: 0, sy: 0, sw: 1, sh: 1 };

  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const k = Math.min(1, 160 / Math.max(W, H));
  const cw = Math.max(1, Math.round(W * k));
  const ch = Math.max(1, Math.round(H * k));
  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, cw, ch);

  let crop: Crop = { sx: 0, sy: 0, sw: W, sh: H };
  try {
    const data = ctx.getImageData(0, 0, cw, ch).data;
    let x0 = cw, y0 = ch, x1 = -1, y1 = -1;
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        if (data[(y * cw + x) * 4 + 3] > 12) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 >= 0) {
      // One sample of slack each side so anti-aliased edges aren't clipped.
      const sx = Math.max(0, (x0 - 1) / k);
      const sy = Math.max(0, (y0 - 1) / k);
      crop = {
        sx,
        sy,
        sw: Math.min(W, (x1 + 2) / k) - sx,
        sh: Math.min(H, (y1 + 2) / k) - sy,
      };
    }
  } catch {
    /* tainted canvas — fall back to the whole file */
  }
  crops.set(src, crop);
  return crop;
}

/** Width/height ratio of the visible artwork. */
export function aspectOf(src: string): number {
  const c = cropOf(src);
  return c.sh > 0 ? c.sw / c.sh : 1;
}

// ---- random helpers ---------------------------------------------------------

export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const deg = (d: number) => (d * Math.PI) / 180;

export function shuffled<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- geometry ---------------------------------------------------------------

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Axis-aligned bounds of one rotated item. */
export function itemBox(it: Item): Box {
  const c = Math.abs(Math.cos(it.angle));
  const s = Math.abs(Math.sin(it.angle));
  const hw = (it.w * c + it.h * s) / 2;
  const hh = (it.w * s + it.h * c) / 2;
  return { x0: it.x - hw, y0: it.y - hh, x1: it.x + hw, y1: it.y + hh };
}

export function boundsOf(items: Item[]): Box {
  const b: Box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  for (const it of items) {
    const ib = itemBox(it);
    b.x0 = Math.min(b.x0, ib.x0);
    b.y0 = Math.min(b.y0, ib.y0);
    b.x1 = Math.max(b.x1, ib.x1);
    b.y1 = Math.max(b.y1, ib.y1);
  }
  if (!isFinite(b.x0)) return { x0: 0, y0: 0, x1: 1, y1: 1 };
  return b;
}

/** Fits the layout into the Story frame, leaving room for Instagram's UI. */
export function fitView(items: Item[], maxW = 980, maxH = 1300): View {
  const b = boundsOf(items);
  const bw = b.x1 - b.x0;
  const bh = b.y1 - b.y0;
  const scale = Math.min(1.6, maxW / bw, maxH / bh);
  return {
    scale,
    tx: STORY_W / 2 - ((b.x0 + b.x1) / 2) * scale,
    ty: STORY_H / 2 - ((b.y0 + b.y1) / 2) * scale,
  };
}

/** Topmost sticker under a layout-space point, or -1. */
export function hitSticker(items: Item[], x: number, y: number): number {
  let best = -1;
  let bestZ = -Infinity;
  items.forEach((it, i) => {
    if (it.kind !== 'sticker') return;
    // Into the item's own rotated frame.
    const dx = x - it.x;
    const dy = y - it.y;
    const c = Math.cos(-it.angle);
    const s = Math.sin(-it.angle);
    const lx = dx * c - dy * s;
    const ly = dx * s + dy * c;
    if (Math.abs(lx) <= it.w / 2 && Math.abs(ly) <= it.h / 2 && it.z >= bestZ) {
      best = i;
      bestZ = it.z;
    }
  });
  return best;
}

// ---- drawing ----------------------------------------------------------------

function drawGlyph(ctx: CanvasRenderingContext2D, it: Item) {
  // A character with no paper scrap still has to look like it belongs: a
  // cream tile with the letter set on it, rather than bare type.
  ctx.fillStyle = '#F4EBDD';
  ctx.fillRect(-it.w / 2, -it.h / 2, it.w, it.h);
  ctx.fillStyle = '#2B2B2B';
  ctx.font = `700 ${Math.round(it.h * 0.72)}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(it.char ?? '', 0, it.h * 0.04);
}

export function drawItems(ctx: CanvasRenderingContext2D, items: Item[], view: View) {
  const order = items.map((it, i) => [it, i] as const).sort((a, b) => a[0].z - b[0].z || a[1] - b[1]);
  for (const [it] of order) {
    ctx.save();
    ctx.translate(view.tx + it.x * view.scale, view.ty + it.y * view.scale);
    ctx.rotate(it.angle);
    ctx.scale(view.scale, view.scale);
    if (it.kind === 'glyph') {
      drawGlyph(ctx, it);
    } else {
      const img = ready.get(it.src);
      if (img) {
        const c = cropOf(it.src);
        ctx.drawImage(img, c.sx, c.sy, c.sw, c.sh, -it.w / 2, -it.h / 2, it.w, it.h);
      }
    }
    ctx.restore();
  }
}

/**
 * The finished PNG.
 *
 * With no background it is trimmed to the artwork, which is what you want to
 * paste into a Story as a sticker: an empty transparent margin would only make
 * it paste in smaller. With a background it is a full 1080x1920 Story, laid out
 * exactly as the preview shows.
 */
export function renderExport(items: Item[], view: View, background: string | null): HTMLCanvasElement {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d')!;
  if (background) {
    c.width = STORY_W;
    c.height = STORY_H;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, c.width, c.height);
    drawItems(ctx, items, view);
    return c;
  }
  const PAD = 16;
  const b = boundsOf(items);
  // Layout space is already near native resolution; only shrink, never blow
  // up, and keep the long side within what Instagram will keep anyway.
  const k = Math.min(1, 1600 / Math.max(b.x1 - b.x0, b.y1 - b.y0));
  c.width = Math.ceil((b.x1 - b.x0) * k + PAD * 2);
  c.height = Math.ceil((b.y1 - b.y0) * k + PAD * 2);
  drawItems(ctx, items, { scale: k, tx: PAD - b.x0 * k, ty: PAD - b.y0 * k });
  return c;
}

// ---- export helpers ---------------------------------------------------------

export function toast(msg: string) {
  let el = document.getElementById('global-toast') as (HTMLElement & { _t?: number }) | null;
  if (!el) {
    el = document.createElement('div');
    el.id = 'global-toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = window.setTimeout(() => el!.classList.remove('show'), 2400);
}

function blobOf(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/png')
  );
}

/**
 * Puts the PNG on the clipboard. Safari needs the ClipboardItem built
 * synchronously inside the tap, with a promise for the data, so that is tried
 * first; Chrome on Android sometimes wants the resolved blob instead.
 */
export async function copyCanvas(canvas: HTMLCanvasElement): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') return false;
  const pending = blobOf(canvas);
  pending.catch(() => {});
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': pending })]);
    return true;
  } catch {
    /* retry below */
  }
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': await pending })]);
    return true;
  } catch {
    return false;
  }
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const a = document.createElement('a');
  a.download = filename;
  a.href = canvas.toDataURL('image/png');
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ---- the interactive stage --------------------------------------------------

export interface StageOptions {
  canvas: HTMLCanvasElement;
  /** Called with the index of a sticker that was tapped (not dragged). */
  onTap?: (index: number) => void;
  onDragEnd?: () => void;
}

/**
 * The preview canvas: draws the scene into the Story frame and lets a sticker
 * be dragged to a new spot, or tapped. Only stickers are movable — letters stay
 * in their line so the message always reads.
 */
export class Stage {
  items: Item[] = [];
  view: View = { scale: 1, tx: 0, ty: 0 };
  background: string | null = null;
  private opts: StageOptions;
  private drag: { i: number; px: number; py: number; ox: number; oy: number; moved: number; t: number } | null = null;

  constructor(opts: StageOptions) {
    this.opts = opts;
    const cv = opts.canvas;
    cv.width = STORY_W;
    cv.height = STORY_H;
    cv.addEventListener('pointerdown', (e) => this.down(e));
    cv.addEventListener('pointermove', (e) => this.move(e));
    cv.addEventListener('pointerup', (e) => this.up(e));
    cv.addEventListener('pointercancel', () => (this.drag = null));
  }

  /** Replaces the scene and refits it to the frame. */
  set(items: Item[]) {
    this.items = items;
    this.view = fitView(items);
    this.draw();
  }

  draw() {
    const ctx = this.opts.canvas.getContext('2d')!;
    ctx.clearRect(0, 0, STORY_W, STORY_H);
    if (this.background) {
      ctx.fillStyle = this.background;
      ctx.fillRect(0, 0, STORY_W, STORY_H);
    }
    drawItems(ctx, this.items, this.view);
  }

  export(): HTMLCanvasElement {
    return renderExport(this.items, this.view, this.background);
  }

  /** Pointer position in layout space. */
  private point(e: PointerEvent) {
    const r = this.opts.canvas.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * STORY_W;
    const sy = ((e.clientY - r.top) / r.height) * STORY_H;
    return { x: (sx - this.view.tx) / this.view.scale, y: (sy - this.view.ty) / this.view.scale };
  }

  private down(e: PointerEvent) {
    const p = this.point(e);
    const i = hitSticker(this.items, p.x, p.y);
    if (i < 0) return;
    e.preventDefault();
    this.opts.canvas.setPointerCapture(e.pointerId);
    // Whatever you pick up comes to the front.
    const top = Math.max(...this.items.map((it) => it.z));
    this.items[i].z = top + 1;
    this.drag = { i, px: p.x, py: p.y, ox: this.items[i].x, oy: this.items[i].y, moved: 0, t: performance.now() };
    this.draw();
  }

  private move(e: PointerEvent) {
    const p = this.point(e);
    if (!this.drag) {
      this.opts.canvas.style.cursor = hitSticker(this.items, p.x, p.y) >= 0 ? 'grab' : 'default';
      return;
    }
    const d = this.drag;
    const it = this.items[d.i];
    it.x = d.ox + (p.x - d.px);
    it.y = d.oy + (p.y - d.py);
    d.moved = Math.max(d.moved, Math.hypot(p.x - d.px, p.y - d.py) * this.view.scale);
    this.draw();
  }

  private up(e: PointerEvent) {
    const d = this.drag;
    this.drag = null;
    if (!d) return;
    try {
      this.opts.canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    // A short, still press is a tap; anything else was a move. 24 story-px is
    // about 8 CSS px on a phone-sized preview.
    if (d.moved < 24 && performance.now() - d.t < 400) this.opts.onTap?.(d.i);
    else this.opts.onDragEnd?.();
  }
}
