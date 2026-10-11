/**
 * The scrapbook page: what is on it, and how it is drawn.
 *
 * A page is a fixed-size canvas in export pixels (1080 wide), so what you see
 * is exactly what downloads. Everything placed on it is an element: artwork
 * (a sticker, a word in cut-out letters, handwriting, a symbol, a strip of
 * washi tape — all drawn from an image), a photo, or an empty photo slot from
 * a template. Nothing is saved anywhere; the page lives only in this tab.
 *
 * Browser-only: runs inside the scrapbook page's <script>.
 */
import { loadImage, preload, cropOf, renderExport, type Crop } from '../collage/engine';
import { syncSlots, layoutLetters, type Manifest } from '../collage/layout';

// ---- formats and papers -----------------------------------------------------

export const FORMATS = {
  story: { w: 1080, h: 1920, label: 'Story' },
  post: { w: 1080, h: 1350, label: 'Post' },
  square: { w: 1080, h: 1080, label: 'Square' },
} as const;
export type Format = keyof typeof FORMATS;

export interface Paper {
  id: string;
  label: string;
  /** Empty for a transparent page. */
  color: string;
  pattern?: 'grid' | 'lines' | 'dots' | 'kraft';
  /** Line colour for patterned papers. */
  line?: string;
}

export const PAPERS: Paper[] = [
  { id: 'cream', label: 'Cream', color: '#F6EFE3' },
  { id: 'kraft', label: 'Kraft', color: '#C9A57A', pattern: 'kraft' },
  { id: 'grid', label: 'Grid', color: '#FBF7EF', pattern: 'grid', line: 'rgba(120, 150, 190, 0.28)' },
  { id: 'lined', label: 'Lined', color: '#FFFFFF', pattern: 'lines', line: 'rgba(110, 150, 200, 0.35)' },
  { id: 'dots', label: 'Dotted', color: '#FBEDEB', pattern: 'dots', line: 'rgba(150, 90, 90, 0.3)' },
  { id: 'blush', label: 'Blush', color: '#F7D9DA' },
  { id: 'sage', label: 'Sage', color: '#DCE5D2' },
  { id: 'sky', label: 'Sky', color: '#DAE6F1' },
  { id: 'butter', label: 'Butter', color: '#F8EDC4' },
  { id: 'white', label: 'White', color: '#FFFFFF' },
  { id: 'black', label: 'Black', color: '#1C1A19' },
  { id: 'none', label: 'Clear', color: '' },
];

export const paperOf = (id: string) => PAPERS.find((p) => p.id === id) ?? PAPERS[0];

// ---- elements -----------------------------------------------------------------

export type Kind = 'art' | 'photo' | 'slot';
export type Frame = 'none' | 'polaroid' | 'border' | 'stamp' | 'film' | 'torn';

/** One physical print can hold several independently replaceable photos. */
export function makeMount(w: number, h: number, style: 'strip' | 'stamp' | 'film' | 'contact'): string {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w); canvas.height = Math.round(h);
  const ctx = canvas.getContext('2d')!;
  const dark = style === 'film';
  ctx.fillStyle = dark ? '#201C19' : '#F7F5ED';
  ctx.fillRect(0, 0, w, h);
  if (style === 'stamp') {
    ctx.globalCompositeOperation = 'destination-out';
    const radius = Math.max(9, Math.min(w,h)*.025);
    for (let x = radius*1.5; x < w; x += radius*3) {
      for (const y of [0,h]) { ctx.beginPath(); ctx.arc(x,y,radius,0,Math.PI*2); ctx.fill(); }
    }
    for (let y = radius*1.5; y < h; y += radius*3) {
      for (const x of [0,w]) { ctx.beginPath(); ctx.arc(x,y,radius,0,Math.PI*2); ctx.fill(); }
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  // Restrained print grain, reproducible and always under the photos.
  let seed = 17;
  for (let i=0; i<w*h/35; i++) {
    seed = (seed*16807)%2147483647; const x=seed%w;
    seed = (seed*16807)%2147483647; const y=seed%h;
    ctx.fillStyle = dark ? 'rgba(255,230,190,.05)' : 'rgba(74,61,45,.065)';
    ctx.fillRect(x,y,1.5,1.5);
  }
  if (dark) {
    ctx.fillStyle = '#DFCCA5';
    for (let y=16;y<h-14;y+=38) {
      ctx.fillRect(9,y,15,20); ctx.fillRect(w-24,y,15,20);
    }
  }
  ctx.fillStyle = dark ? '#D0B888' : '#877E70';
  ctx.font = '12px monospace';
  ctx.textAlign='center';
  if (style === 'strip') ctx.fillText('PHOTO BOOTH  •  KEEP FOREVER',w/2,h-13);
  if (style === 'contact') ctx.fillText('MEMORIES / CONTACT SHEET',w/2,h-13);
  return registerCanvas(canvas);
}

export interface El {
  id: number;
  kind: Kind;
  /** Source key (see `sources`); empty for a slot. */
  src: string;
  /** Centre and drawn size of the picture itself (frames are added outside). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Radians. */
  angle: number;
  /** Paint order; higher is on top. */
  z: number;
  flip?: boolean;
  shadow?: boolean;
  /** Photos and slots. */
  frame?: Frame;
  /** Photos: the part of the image shown, so a photo can fill a slot's shape. */
  crop?: Crop;
  filter?: 'mono' | 'warm';
  /** Shared print mount; moving a photo keeps its whole strip together. */
  group?: string;
}

export interface Doc {
  format: Format;
  paper: string;
  els: El[];
  background?: string;
}

// ---- image sources ------------------------------------------------------------

/**
 * Everything drawable, keyed by a string. URLs (stickers, letter scraps) load
 * from the network; generated artwork (a word, a tape strip) and photos are
 * canvases registered under `gen:` keys. Elements only hold the key, so undo
 * snapshots stay small.
 */
export interface Source {
  img: CanvasImageSource;
  w: number;
  h: number;
  /** Tight box around the visible artwork. */
  crop: Crop;
}

const sources = new Map<string, Source>();
let genId = 0;

export const sourceOf = (key: string) => sources.get(key);

export async function loadUrl(src: string): Promise<Source | null> {
  const have = sources.get(src);
  if (have) return have;
  const [ok] = await preload([src]);
  if (!ok) return null;
  const img = await loadImage(src);
  if (!img) return null;
  const s: Source = { img, w: img.naturalWidth, h: img.naturalHeight, crop: cropOf(src) };
  sources.set(src, s);
  return s;
}

export function registerCanvas(c: HTMLCanvasElement, trim = false): string {
  const key = `gen:${++genId}`;
  sources.set(key, { img: c, w: c.width, h: c.height, crop: trim ? trimBox(c) : { sx: 0, sy: 0, sw: c.width, sh: c.height } });
  return key;
}

/** The visible box of a generated canvas, so selection hugs the artwork. */
function trimBox(c: HTMLCanvasElement): Crop {
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  const { width: W, height: H } = c;
  const data = ctx.getImageData(0, 0, W, H).data;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (data[(y * W + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return { sx: 0, sy: 0, sw: W, sh: H };
  const sx = Math.max(0, x0 - 2), sy = Math.max(0, y0 - 2);
  return { sx, sy, sw: Math.min(W, x1 + 3) - sx, sh: Math.min(H, y1 + 3) - sy };
}

/**
 * A photo from the device. It never leaves the browser: it is decoded, scaled
 * down to at most 2000px (plenty for a 1080-wide page, and it keeps memory in
 * check on phones with 48 MP cameras), and kept as a canvas.
 */
export async function loadPhoto(file: File, trim = false): Promise<string | null> {
  let bmp: ImageBitmap | HTMLImageElement | null = null;
  let url = '';
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
  } catch {
    url = URL.createObjectURL(file);
    bmp = await loadImage(url);
  }
  if (!bmp) return null;
  const bw = 'naturalWidth' in bmp ? bmp.naturalWidth : bmp.width;
  const bh = 'naturalHeight' in bmp ? bmp.naturalHeight : bmp.height;
  if (!bw || !bh) return null;
  const k = Math.min(1, 2000 / Math.max(bw, bh));
  const c = document.createElement('canvas');
  c.width = Math.round(bw * k);
  c.height = Math.round(bh * k);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  if ('close' in bmp) bmp.close();
  if (url) URL.revokeObjectURL(url);
  return registerCanvas(c, trim);
}

// ---- generated artwork ----------------------------------------------------------

export type TextStyle = 'hand' | 'label' | 'type' | 'symbol' | 'caption';

const FONTS: Record<TextStyle, string> = {
  hand: "700 {s}px Gaegu, 'Comic Sans MS', cursive",
  label: "700 {s}px 'Courier New', Courier, monospace",
  type: "700 {s}px Georgia, 'Times New Roman', serif",
  symbol: "{s}px 'Segoe UI Symbol', 'Apple Symbols', 'Noto Sans Symbols 2', 'Segoe UI', system-ui, sans-serif",
  caption: "700 {s}px Quicksand, system-ui, sans-serif",
};

/**
 * Text as a picture: handwriting, a label-maker strip, serif type, or a symbol
 * (including multi-line dot art). Rendered big so it stays sharp when scaled up.
 */
export async function makeText(text: string, style: TextStyle, color = '#2A2522'): Promise<string> {
  const size = style === 'symbol' ? 96 : 120;
  const font = FONTS[style].replace('{s}', String(size));
  if (style === 'hand') {
    try {
      await document.fonts.load(font);
    } catch {
      /* falls back to the next font */
    }
  }
  const lines = text.replace(/\r/g, '').split('\n');
  const probe = document.createElement('canvas').getContext('2d')!;
  probe.font = font;
  const lineH = Math.round(size * (style === 'symbol' ? 1.15 : 1.22));
  const textW = Math.max(1, ...lines.map((l) => probe.measureText(l).width));
  const padX = style === 'label' ? size * 0.55 : size * 0.2;
  const padY = style === 'label' ? size * 0.32 : size * 0.18;

  const c = document.createElement('canvas');
  c.width = Math.ceil(textW + padX * 2);
  c.height = Math.ceil(lines.length * lineH + padY * 2);
  const ctx = c.getContext('2d')!;
  if (style === 'caption') {
    ctx.fillStyle = '#151515';
    ctx.beginPath();
    ctx.roundRect(0, 0, c.width, c.height, 24);
    ctx.fill();
    color = '#FFFFFF';
  }
  if (style === 'label') {
    // A strip of label tape: cream, slightly uneven ends.
    ctx.fillStyle = '#FFFDF6';
    ctx.beginPath();
    ctx.moveTo(6, 4);
    ctx.lineTo(c.width - 4, 0);
    ctx.lineTo(c.width, c.height - 6);
    ctx.lineTo(2, c.height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  lines.forEach((l, i) => ctx.fillText(l, padX, padY + lineH * (i + 0.5)));
  return registerCanvas(c, style !== 'label' && style !== 'caption');
}

/** A word in cut-out paper letters, from the scanned letter scraps. */
export async function makeLetters(text: string, manifest: Manifest): Promise<string | null> {
  const clean = text.replace(/[^\S\n]+/g, ' ').trim().slice(0, 60);
  if (!clean) return null;
  const slots = syncSlots([], clean, manifest);
  const loaded = new Set(await preload(slots.map((s) => s.src).filter((s): s is string => !!s)));
  for (const s of slots) if (s.src && !loaded.has(s.src)) s.src = null;
  const { items } = layoutLetters(slots, [0, 0.15, -0.1, 0.1]);
  if (!items.length) return null;
  const c = renderExport(items, { scale: 1, tx: 0, ty: 0 }, null);
  return registerCanvas(c);
}

export interface Tape {
  id: string;
  label: string;
  base: string;
  ink: string;
  kind: 'stripes' | 'dots' | 'grid' | 'plain' | 'hearts' | 'stars' | 'check';
}

export const TAPES: Tape[] = [
  { id: 'pink-stripe', label: 'Pink stripe', base: '#F4B6C2', ink: '#FFFFFF', kind: 'stripes' },
  { id: 'mint-dot', label: 'Mint dots', base: '#BFE0CF', ink: '#FFFFFF', kind: 'dots' },
  { id: 'kraft', label: 'Kraft', base: '#D8BE94', ink: '#C4A57A', kind: 'plain' },
  { id: 'lilac-grid', label: 'Lilac grid', base: '#CFC3EA', ink: '#FFFFFF', kind: 'grid' },
  { id: 'butter-check', label: 'Gingham', base: '#F6E3A1', ink: '#E9C95B', kind: 'check' },
  { id: 'red-heart', label: 'Hearts', base: '#FBE0DE', ink: '#D9534F', kind: 'hearts' },
  { id: 'night-star', label: 'Stars', base: '#2F3A5A', ink: '#F6E3A1', kind: 'stars' },
  { id: 'clear', label: 'Clear', base: '#F3F3F0', ink: '#FFFFFF', kind: 'plain' },
];

/** A strip of washi tape: translucent, patterned, with torn zig-zag ends. */
export function makeTape(id: string): string {
  const t = TAPES.find((x) => x.id === id) ?? TAPES[0];
  const W = 460, H = 96, tooth = 9;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  ctx.beginPath();
  ctx.moveTo(tooth, 0);
  ctx.lineTo(W - tooth, 0);
  for (let y = 0, i = 0; y <= H; y += H / 8, i++) ctx.lineTo(W - (i % 2 ? 0 : tooth), y);
  ctx.lineTo(tooth, H);
  for (let y = H, i = 0; y >= 0; y -= H / 8, i++) ctx.lineTo(i % 2 ? 0 : tooth, y);
  ctx.closePath();
  ctx.clip();
  ctx.globalAlpha = t.id === 'clear' ? 0.55 : 0.88;
  ctx.fillStyle = t.base;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = t.ink;
  ctx.strokeStyle = t.ink;
  switch (t.kind) {
    case 'grid':
      ctx.lineWidth = 3;
      for (let x = 0; x < W; x += 24) ctx.fillRect(x, 0, 3, H);
      for (let y = 0; y < H; y += 24) ctx.fillRect(0, y, W, 3);
      break;
    case 'check':
      ctx.globalAlpha = 0.5;
      for (let x = 0; x < W; x += 32) ctx.fillRect(x, 0, 16, H);
      for (let y = 0; y < H; y += 32) ctx.fillRect(0, y, W, 16);
      break;
    case 'hearts':
    case 'stars':
      ctx.font = "34px 'Segoe UI Symbol', 'Apple Symbols', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let x = 26, i = 0; x < W; x += 52, i++) ctx.fillText(t.kind === 'hearts' ? '♥' : '★', x, i % 2 ? 30 : 66);
      break;
    case 'plain':
      ctx.globalAlpha = 0.25;
      for (let i = 0; i < 260; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
      break;
  }
  return registerCanvas(c);
}

// ---- geometry -------------------------------------------------------------------

/** Extra space a photo frame adds outside the picture. */
export function framePad(el: El) {
  if ((el.kind !== 'photo' && el.kind !== 'slot') || !el.frame || el.frame === 'none') return { l: 0, t: 0, r: 0, b: 0 };
  if (el.frame === 'stamp' || el.frame === 'torn' || el.frame === 'film') {
    const p = Math.min(el.w, el.h) * (el.frame === 'stamp' ? 0.09 : 0.06);
    return { l: p, t: p, r: p, b: p };
  }
  if (el.frame === 'border') {
    const p = Math.min(el.w, el.h) * 0.045;
    return { l: p, t: p, r: p, b: p };
  }
  const p = Math.min(el.w, el.h) * 0.06;
  return { l: p, t: p, r: p, b: p * 3.6 };
}

/** The element's full box (picture + frame) in its own frame, centred on x,y. */
export function outerBox(el: El) {
  const p = framePad(el);
  return {
    x0: -el.w / 2 - p.l,
    y0: -el.h / 2 - p.t,
    x1: el.w / 2 + p.r,
    y1: el.h / 2 + p.b,
  };
}

/** A page point in the element's own (unrotated) frame. */
export function toLocal(el: El, x: number, y: number) {
  const dx = x - el.x;
  const dy = y - el.y;
  const c = Math.cos(-el.angle);
  const s = Math.sin(-el.angle);
  return { x: dx * c - dy * s, y: dx * s + dy * c };
}

/** A point in the element's own frame, back on the page. */
export function toPage(el: El, lx: number, ly: number) {
  const c = Math.cos(el.angle);
  const s = Math.sin(el.angle);
  return { x: el.x + lx * c - ly * s, y: el.y + lx * s + ly * c };
}

export function hitTest(els: El[], x: number, y: number, prefer?: number | null): El | null {
  const inside = (el: El) => {
    const p = toLocal(el, x, y);
    const b = outerBox(el);
    return p.x >= b.x0 && p.x <= b.x1 && p.y >= b.y0 && p.y <= b.y1;
  };
  // The selected element wins, so it can be dragged even from under another.
  const sel = prefer != null ? els.find((e) => e.id === prefer) : undefined;
  if (sel && !(sel.kind==='art'&&sel.group) && inside(sel)) return sel;
  let best: El | null = null;
  for (const el of els) if (inside(el) && (!best || el.z >= best.z)) best = el;
  return best;
}

/** Fits a picture of aspect `a` (w/h) inside `max` on its long side. */
export function fitSize(a: number, max: number) {
  return a >= 1 ? { w: max, h: max / a } : { w: max * a, h: max };
}

/** The part of an image that fills a box of aspect `a`, cropped from the centre. */
export function coverCrop(s: Source, a: number): Crop {
  const ia = s.w / s.h;
  if (ia > a) {
    const sw = s.h * a;
    return { sx: (s.w - sw) / 2, sy: 0, sw, sh: s.h };
  }
  const sh = s.w / a;
  return { sx: 0, sy: (s.h - sh) / 2, sw: s.w, sh };
}

// ---- drawing --------------------------------------------------------------------

let noise: HTMLCanvasElement | null = null;
function noiseTile() {
  if (noise) return noise;
  noise = document.createElement('canvas');
  noise.width = noise.height = 160;
  const ctx = noise.getContext('2d')!;
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(80, 50, 20, 0.16)' : 'rgba(255, 245, 225, 0.2)';
    ctx.fillRect(Math.random() * 160, Math.random() * 160, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  return noise;
}

export function drawPaper(ctx: CanvasRenderingContext2D, paper: Paper, W: number, H: number) {
  if (!paper.color) return;
  ctx.fillStyle = paper.color;
  ctx.fillRect(0, 0, W, H);
  const gap = W / 20;
  ctx.fillStyle = paper.line ?? 'transparent';
  switch (paper.pattern) {
    case 'grid':
      for (let x = gap; x < W; x += gap) ctx.fillRect(Math.round(x), 0, 2, H);
      for (let y = gap; y < H; y += gap) ctx.fillRect(0, Math.round(y), W, 2);
      break;
    case 'lines':
      for (let y = gap * 2.5; y < H; y += gap * 1.3) ctx.fillRect(0, Math.round(y), W, 2);
      ctx.fillStyle = 'rgba(220, 90, 90, 0.4)';
      ctx.fillRect(Math.round(gap * 2.2), 0, 3, H);
      break;
    case 'dots':
      for (let y = gap; y < H; y += gap) for (let x = gap; x < W; x += gap) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'kraft': {
      const pat = ctx.createPattern(noiseTile(), 'repeat');
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, W, H);
      }
      break;
    }
  }
  if (paper.pattern !== 'kraft') {
    const grain = ctx.createPattern(noiseTile(), 'repeat');
    if (grain) { ctx.fillStyle = grain; ctx.globalAlpha = .35; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }
}

/** Paper edges are shared by empty placeholders, filled photos and exports. */
function framePath(ctx: CanvasRenderingContext2D, el: El) {
  const b = outerBox(el);
  ctx.beginPath();
  ctx.rect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
  if (el.frame === 'stamp') {
    const r = Math.min(el.w, el.h) * .025;
    for (let x = b.x0 + r; x < b.x1; x += r * 3) {
      for (const y of [b.y0, b.y1]) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }
    }
    for (let y = b.y0 + r; y < b.y1; y += r * 3) {
      for (const x of [b.x0, b.x1]) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }
    }
  } else if (el.frame === 'torn') {
    ctx.beginPath();
    const edges = [[b.x0,b.y0,b.x1,b.y0], [b.x1,b.y0,b.x1,b.y1], [b.x1,b.y1,b.x0,b.y1], [b.x0,b.y1,b.x0,b.y0]];
    edges.forEach(([x0,y0,x1,y1], edge) => {
      const steps = Math.ceil(Math.hypot(x1-x0,y1-y0) / 10);
      for (let i=0; i<=steps; i++) {
        const jitter = Math.sin(i * 12.7 + edge * 4) * 4;
        const x = x0+(x1-x0)*i/steps + (x0===x1 ? jitter : 0);
        const y = y0+(y1-y0)*i/steps + (y0===y1 ? jitter : 0);
        if (!edge && !i) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
    });
    ctx.closePath();
  }
}

function fillFrame(ctx: CanvasRenderingContext2D, el: El) {
  ctx.save();
  // Perforations cut inward; their outside halves are never paper.
  if (el.frame === 'stamp') {
    const b = outerBox(el); ctx.beginPath(); ctx.rect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0); ctx.clip();
  }
  framePath(ctx, el); ctx.fill('evenodd'); ctx.restore();
}

function drawEl(ctx: CanvasRenderingContext2D, el: El, exporting: boolean) {
  const s = el.src ? sources.get(el.src) : undefined;
  if (el.kind === 'slot' && exporting) return;
  if (el.kind !== 'slot' && !s) return;

  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.rotate(el.angle);
  const b = outerBox(el);

  if (el.kind === 'slot') {
    ctx.fillStyle = el.frame === 'film' ? '#252323' : '#FFFEFA';
    fillFrame(ctx, el);
    ctx.fillStyle = '#D3CBBF'; ctx.fillRect(-el.w/2, -el.h/2, el.w, el.h);
    ctx.setLineDash([18, 12]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(42, 37, 34, 0.45)';
    ctx.strokeRect(-el.w / 2, -el.h / 2, el.w, el.h);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(42, 37, 34, 0.6)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fs = Math.max(26, Math.min(el.w, el.h) * 0.11);
    ctx.font = `700 ${fs * 1.8}px Quicksand, system-ui, sans-serif`;
    ctx.fillText('+', 0, -fs * 0.7);
    ctx.font = `700 ${fs}px Quicksand, system-ui, sans-serif`;
    ctx.fillText('Add photo', 0, fs * 0.9);
    ctx.restore();
    return;
  }

  if (el.shadow) {
    ctx.shadowColor = 'rgba(40, 25, 10, 0.22)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
  }
  if (el.kind === 'photo' && el.frame && el.frame !== 'none') {
    ctx.fillStyle = el.frame === 'film' ? '#252323' : '#FFFEFA';
    fillFrame(ctx, el);
    ctx.shadowColor = 'transparent';
    if (el.frame === 'film') {
      ctx.fillStyle = '#E7DECB';
      for (let y = b.y0 + 10; y < b.y1 - 10; y += 25) {
        ctx.fillRect(b.x0 + 4, y, Math.max(3, (-el.w/2-b.x0)-8), 12);
        ctx.fillRect(el.w/2+4, y, Math.max(3, (b.x1-el.w/2)-8), 12);
      }
    }
  }
  if (el.flip) ctx.scale(-1, 1);
  const c = el.kind === 'photo' ? el.crop ?? { sx: 0, sy: 0, sw: s!.w, sh: s!.h } : s!.crop;
  if (el.filter === 'mono') ctx.filter = 'grayscale(1) contrast(1.08)';
  if (el.filter === 'warm') ctx.filter = 'sepia(.25) saturate(.85) contrast(1.05)';
  ctx.drawImage(s!.img, c.sx, c.sy, c.sw, c.sh, -el.w / 2, -el.h / 2, el.w, el.h);
  ctx.restore();
}

export interface DrawOptions {
  selected?: number | null;
  /** Canvas pixels per CSS pixel, so handles stay finger-sized on screen. */
  px?: number;
  exporting?: boolean;
}

export const HANDLE_CSS = 15;

export function drawDoc(ctx: CanvasRenderingContext2D, doc: Doc, opts: DrawOptions = {}) {
  const { w: W, h: H } = FORMATS[doc.format];
  ctx.clearRect(0, 0, W, H);
  drawPaper(ctx, paperOf(doc.paper), W, H);
  const bg = doc.background && sourceOf(doc.background);
  if (bg) { const c = coverCrop(bg, W / H); ctx.drawImage(bg.img, c.sx, c.sy, c.sw, c.sh, 0, 0, W, H); }
  const order = doc.els.slice().sort((a, b) => a.z - b.z);
  for (const el of order) drawEl(ctx, el, !!opts.exporting);

  const sel = opts.selected != null ? doc.els.find((e) => e.id === opts.selected) : undefined;
  if (sel && !opts.exporting) drawSelection(ctx, sel, opts.px ?? 1);
}

/** Where the corner handles sit, in page space. */
export function handles(el: El, px: number) {
  const b = outerBox(el);
  const m = 6 * px;
  return {
    remove: toPage(el, b.x0 - m, b.y0 - m),
    resize: toPage(el, b.x1 + m, b.y1 + m),
  };
}

function drawSelection(ctx: CanvasRenderingContext2D, el: El, px: number) {
  const b = outerBox(el);
  const m = 6 * px;
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.rotate(el.angle);
  ctx.lineWidth = 2 * px;
  ctx.setLineDash([7 * px, 5 * px]);
  ctx.strokeStyle = '#2A2522';
  ctx.strokeRect(b.x0 - m, b.y0 - m, b.x1 - b.x0 + m * 2, b.y1 - b.y0 + m * 2);
  ctx.setLineDash([]);
  ctx.restore();

  const h = handles(el, px);
  const r = HANDLE_CSS * px;
  const dot = (p: { x: number; y: number }, fill: string, glyph: 'x' | 'arrows') => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 6 * px;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.2 * px;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const k = r * 0.42;
    if (glyph === 'x') {
      ctx.moveTo(p.x - k, p.y - k);
      ctx.lineTo(p.x + k, p.y + k);
      ctx.moveTo(p.x + k, p.y - k);
      ctx.lineTo(p.x - k, p.y + k);
    } else {
      ctx.arc(p.x, p.y, k, Math.PI * 0.15, Math.PI * 1.55);
    }
    ctx.stroke();
    ctx.restore();
  };
  dot(h.remove, '#D2504A', 'x');
  dot(h.resize, '#2A2522', 'arrows');
}
