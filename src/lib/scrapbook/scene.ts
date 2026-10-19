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
export type Frame = 'none' | 'polaroid' | 'border' | 'stamp' | 'film' | 'torn' | 'circle' | 'oval' | 'rounded' | 'scallop';
/** Frames that cut the picture itself into a shape rather than adding a mat around it. */
export const SHAPED: Frame[] = ['circle', 'oval', 'rounded', 'scallop'];
const isShaped = (f?: Frame) => !!f && SHAPED.includes(f);

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

export type TextStyle = 'hand' | 'label' | 'type' | 'symbol' | 'caption' | 'script' | 'outline';

const FONTS: Record<TextStyle, string> = {
  hand: "700 {s}px Gaegu, 'Comic Sans MS', cursive",
  label: "700 {s}px 'Courier New', Courier, monospace",
  type: "700 {s}px Georgia, 'Times New Roman', serif",
  symbol: "{s}px 'Segoe UI Symbol', 'Apple Symbols', 'Noto Sans Symbols 2', 'Segoe UI', system-ui, sans-serif",
  caption: "700 {s}px Quicksand, system-ui, sans-serif",
  script: "600 {s}px 'Dancing Script', 'Brush Script MT', cursive",
  outline: "700 {s}px Quicksand, system-ui, sans-serif",
};

async function loadFont(font: string) {
  try {
    await document.fonts.load(font);
  } catch {
    /* falls back to the next font */
  }
}

/** A colour mixed toward white, for paper that matches its ink. */
function tint(hex: string, k: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * k);
  return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
}

/**
 * Text as a picture: handwriting, a label-maker strip, serif type, or a symbol
 * (including multi-line dot art). Rendered big so it stays sharp when scaled up.
 */
export async function makeText(text: string, style: TextStyle, color = '#2A2522'): Promise<string> {
  const size = style === 'symbol' ? 96 : style === 'outline' ? 150 : 120;
  const font = FONTS[style].replace('{s}', String(size));
  if (style === 'hand' || style === 'script' || style === 'outline') await loadFont(font);
  const lines = text.replace(/\r/g, '').split('\n');
  const probe = document.createElement('canvas').getContext('2d')!;
  probe.font = font;
  const lineH = Math.round(size * (style === 'symbol' ? 1.15 : 1.22));
  const textW = Math.max(1, ...lines.map((l) => probe.measureText(l).width));
  const padX = style === 'label' ? size * 0.55 : style === 'outline' ? size * 0.3 : size * 0.2;
  const padY = style === 'label' ? size * 0.32 : style === 'outline' ? size * 0.28 : size * 0.18;

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
  ctx.lineJoin = 'round';
  if (style === 'outline') {
    // Bubbly display letters: a fat outline, a pale fill and an offset echo.
    const at = (i: number) => padY + lineH * (i + 0.5);
    ctx.lineWidth = size * 0.2;
    ctx.strokeStyle = tint(color, 0.55);
    lines.forEach((l, i) => ctx.strokeText(l, padX + size * 0.05, at(i) + size * 0.06));
    ctx.lineWidth = size * 0.11;
    ctx.strokeStyle = color;
    lines.forEach((l, i) => ctx.strokeText(l, padX, at(i)));
    ctx.fillStyle = '#FFFBF4';
    lines.forEach((l, i) => ctx.fillText(l, padX, at(i)));
    return registerCanvas(c, true);
  }
  lines.forEach((l, i) => ctx.fillText(l, padX, padY + lineH * (i + 0.5)));
  return registerCanvas(c, style !== 'label' && style !== 'caption');
}

/**
 * A line of poetry cut out word by word: every word on its own slip of paper,
 * each slip a little crooked, like a magazine cut-out note.
 */
export function makeWords(text: string, color = '#2A2522'): string {
  const size = 84;
  const fonts = [`italic 400 ${size}px Georgia, 'Times New Roman', serif`, `400 ${size}px Georgia, 'Times New Roman', serif`, `700 ${size * 0.9}px 'Courier New', Courier, monospace`];
  const paper = color.toUpperCase() === '#FFFFFF' ? '#2A2522' : tint(color, 0.86);
  const probe = document.createElement('canvas').getContext('2d')!;
  const maxW = size * 16;
  let seed = [...text].reduce((a, ch) => a + ch.charCodeAt(0), 7);
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  type Slip = { word: string; font: string; w: number; x: number; y: number; a: number };
  const slips: Slip[] = [];
  const padX = size * 0.28, gap = size * 0.24, lineH = size * 1.55;
  let x = 0, y = 0, width = 0;
  for (const [li, line] of text.replace(/\r/g, '').split('\n').entries()) {
    if (li) { x = 0; y += lineH; }
    for (const word of line.split(/\s+/).filter(Boolean)) {
      const font = fonts[Math.floor(rnd() * 2)];
      probe.font = font;
      const w = probe.measureText(word).width + padX * 2;
      if (x > 0 && x + w > maxW) { x = 0; y += lineH; }
      slips.push({ word, font, w, x, y, a: (rnd() - 0.5) * 0.09 });
      x += w + gap;
      width = Math.max(width, x - gap);
    }
  }
  const slipH = size * 1.2, margin = size * 0.4;
  const c = document.createElement('canvas');
  c.width = Math.ceil(width + margin * 2);
  c.height = Math.ceil(y + slipH + margin * 2);
  const ctx = c.getContext('2d')!;
  ctx.textBaseline = 'middle';
  for (const s of slips) {
    ctx.save();
    ctx.translate(margin + s.x + s.w / 2, margin + s.y + slipH / 2);
    ctx.rotate(s.a);
    ctx.shadowColor = 'rgba(40, 25, 10, 0.25)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = paper;
    ctx.beginPath();
    // Scissor-cut edges: never quite square.
    ctx.moveTo(-s.w / 2 + rnd() * 4, -slipH / 2 + rnd() * 4);
    ctx.lineTo(s.w / 2 - rnd() * 4, -slipH / 2 + rnd() * 4);
    ctx.lineTo(s.w / 2 - rnd() * 4, slipH / 2 - rnd() * 4);
    ctx.lineTo(-s.w / 2 + rnd() * 4, slipH / 2 - rnd() * 4);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = paper === '#2A2522' ? '#FFFFFF' : color;
    ctx.font = s.font;
    ctx.textAlign = 'center';
    ctx.fillText(s.word, 0, size * 0.04);
    ctx.restore();
  }
  return registerCanvas(c, true);
}

// ---- doodles ------------------------------------------------------------------

export type DoodleKind = 'squiggle' | 'spiral' | 'burst' | 'sparkle' | 'wave' | 'heart' | 'underline' | 'arrow' | 'loop';
export const DOODLES: { id: DoodleKind; label: string }[] = [
  { id: 'squiggle', label: 'Squiggle' },
  { id: 'spiral', label: 'Spiral' },
  { id: 'burst', label: 'Starburst' },
  { id: 'sparkle', label: 'Sparkle' },
  { id: 'wave', label: 'Wave' },
  { id: 'heart', label: 'Heart' },
  { id: 'underline', label: 'Underline' },
  { id: 'arrow', label: 'Arrow' },
  { id: 'loop', label: 'Circle' },
];

/**
 * A crayon stroke: the path is drawn several times with a little drift, so the
 * edge is ragged and the colour slightly uneven, like a real marker on paper.
 */
function crayon(ctx: CanvasRenderingContext2D, pts: [number, number][], width: number, color: string) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  let seed = pts.length * 31 + 5;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
  for (let pass = 0; pass < 5; pass++) {
    ctx.globalAlpha = pass ? 0.35 : 0.9;
    ctx.lineWidth = width * (pass ? 0.55 + rnd() * 0.3 : 1);
    const dx = rnd() * width * 0.25, dy = rnd() * width * 0.25;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x + dx, y + dy) : ctx.moveTo(x + dx, y + dy)));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function makeDoodle(kind: DoodleKind, color = '#E8743B'): string {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d')!;
  const pts: [number, number][] = [];
  const line = (w = 26) => crayon(ctx, pts, w, color);
  switch (kind) {
    case 'squiggle': {
      // A curly ribbon: a stretched-out cycloid, so each wave turns into a loop.
      c.width = 900; c.height = 360;
      const turns = 3, r = 720 / (turns * Math.PI * 2), d = r * 2.3;
      for (let th = 0; th <= turns * Math.PI * 2; th += 0.03) pts.push([90 + r * th - d * Math.sin(th), 180 - d * Math.cos(th)]);
      line(28);
      break;
    }
    case 'spiral': {
      c.width = c.height = 620;
      for (let t = 0; t <= Math.PI * 7; t += 0.03) pts.push([310 + Math.cos(t) * t * 12.5, 310 + Math.sin(t) * t * 12.5]);
      line(28);
      break;
    }
    case 'burst': {
      c.width = c.height = 620;
      ctx.fillStyle = color;
      ctx.beginPath();
      const n = 12;
      for (let i = 0; i <= n * 2; i++) {
        const r = i % 2 ? 140 + (i % 4 === 1 ? 10 : -10) : 290 - (i % 6) * 6;
        const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
        const p: [number, number] = [310 + Math.cos(a) * r, 310 + Math.sin(a) * r];
        i ? ctx.lineTo(...p) : ctx.moveTo(...p);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'sparkle': {
      // Four points pulled in toward the middle, the classic twinkle.
      c.width = c.height = 520;
      ctx.fillStyle = color;
      const tip = (i: number): [number, number] => {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
        return [260 + Math.cos(a) * 240, 260 + Math.sin(a) * 240];
      };
      ctx.beginPath();
      ctx.moveTo(...tip(0));
      for (let i = 1; i <= 4; i++) ctx.quadraticCurveTo(260, 260, ...tip(i));
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'wave': {
      c.width = 1000; c.height = 220;
      for (let x = 40; x <= 960; x += 4) pts.push([x, 110 + Math.sin(((x - 40) / 920) * Math.PI * 5) * 55]);
      line(26);
      break;
    }
    case 'heart': {
      c.width = 620; c.height = 580;
      for (let t = 0; t <= Math.PI * 2.15; t += 0.02) {
        const x = 16 * Math.sin(t) ** 3;
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        pts.push([310 + x * 16, 270 - y * 16]);
      }
      line(24);
      break;
    }
    case 'underline': {
      c.width = 900; c.height = 200;
      for (let x = 50; x <= 850; x += 8) pts.push([x, 70 + Math.sin(x / 40) * 6]);
      for (let x = 820; x >= 120; x -= 8) pts.push([x, 130 + Math.sin(x / 35) * 6]);
      line(22);
      break;
    }
    case 'arrow': {
      c.width = 760; c.height = 460;
      for (let t = 0; t <= 1; t += 0.01) pts.push([60 + t * 600, 380 - Math.sin(t * Math.PI) * 260 + t * 40]);
      line(22);
      pts.length = 0;
      pts.push([560, 330], [665, 420], [690, 290]);
      line(22);
      break;
    }
    case 'loop': {
      c.width = 820; c.height = 560;
      for (let t = 0; t <= Math.PI * 2.25; t += 0.02) pts.push([410 + Math.cos(t) * (350 - t * 6), 280 + Math.sin(t) * (220 - t * 4)]);
      line(20);
      break;
    }
  }
  return registerCanvas(c, true);
}

// ---- phone cards ----------------------------------------------------------------

export type CardKind = 'lyrics' | 'bubble' | 'player';
export const CARDS: { id: CardKind; label: string }[] = [
  { id: 'lyrics', label: 'Lyric card' },
  { id: 'bubble', label: 'Text bubble' },
  { id: 'player', label: 'Music player' },
];

/** Wraps text to a width, on the given context's current font. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const w of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${w}` : w;
      if (line && ctx.measureText(next).width > maxW) { out.push(line); line = w; } else line = next;
    }
    out.push(line);
  }
  return out;
}

/**
 * The bits of a phone screen people screenshot into scrapbooks: a song's lyric
 * card, a message bubble, a now-playing bar. Generic shapes, no app branding.
 */
export async function makeCard(kind: CardKind, text: string, color = '#C9826B'): Promise<string> {
  await loadFont('700 40px Quicksand');
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d')!;
  const probe = document.createElement('canvas').getContext('2d')!;
  if (kind === 'bubble') {
    probe.font = '600 64px Quicksand, system-ui, sans-serif';
    const lines = wrap(probe, text, 760);
    const tw = Math.max(...lines.map((l) => probe.measureText(l).width));
    const W = tw + 100, H = lines.length * 80 + 64;
    c.width = W + 40; c.height = H + 30;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(10, 10, W, H, 48);
    ctx.fill();
    // The little tail at the bottom right.
    ctx.beginPath();
    ctx.moveTo(W - 30, H - 10);
    ctx.quadraticCurveTo(W + 6, H + 24, W + 30, H + 18);
    ctx.quadraticCurveTo(W + 4, H + 4, W + 6, H - 34);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = probe.font;
    ctx.textBaseline = 'middle';
    lines.forEach((l, i) => ctx.fillText(l, 60, 10 + 32 + 40 + i * 80));
    return registerCanvas(c, true);
  }
  if (kind === 'player') {
    const W = 980, H = 300;
    c.width = W; c.height = H;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.roundRect(10, 10, W - 20, H - 20, 44); ctx.fill();
    ctx.shadowColor = 'transparent';
    const art = ctx.createLinearGradient(40, 40, 190, 190);
    art.addColorStop(0, tint(color, 0.3)); art.addColorStop(1, color);
    ctx.fillStyle = art;
    ctx.beginPath(); ctx.roundRect(40, 40, 150, 150, 22); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 72px Quicksand, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('♪', 115, 118);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1F1B18';
    ctx.font = '700 50px Quicksand, system-ui, sans-serif';
    probe.font = ctx.font;
    let title = text.split('\n')[0];
    while (title.length > 1 && probe.measureText(title).width > 700) title = title.slice(0, -2);
    ctx.fillText(title !== text.split('\n')[0] ? `${title}…` : title, 225, 82);
    ctx.fillStyle = '#8A817A';
    ctx.font = '600 34px Quicksand, system-ui, sans-serif';
    ctx.fillText(text.split('\n')[1] ?? 'on repeat', 225, 135);
    // Progress bar and buttons.
    ctx.fillStyle = '#E4DED8'; ctx.beginPath(); ctx.roundRect(225, 180, 700, 10, 5); ctx.fill();
    ctx.fillStyle = '#1F1B18'; ctx.beginPath(); ctx.roundRect(225, 180, 290, 10, 5); ctx.fill();
    ctx.beginPath(); ctx.arc(515, 185, 14, 0, Math.PI * 2); ctx.fill();
    const by = 238;
    const tri = (x: number, dir: 1 | -1, s = 18) => { ctx.beginPath(); ctx.moveTo(x, by - s); ctx.lineTo(x + dir * s * 1.4, by); ctx.lineTo(x, by + s); ctx.fill(); };
    tri(545, 1, 24); // play
    tri(470, -1); ctx.fillRect(438, by - 18, 6, 36);
    tri(640, 1); ctx.fillRect(667, by - 18, 6, 36);
    ctx.font = '600 26px Quicksand, system-ui, sans-serif';
    ctx.fillStyle = '#8A817A';
    ctx.fillText('1:12', 225, 238);
    ctx.textAlign = 'right';
    ctx.fillText('3:04', 925, 238);
    return registerCanvas(c, true);
  }
  // Lyric card: a warm coloured card, a little cover square, big bold lines.
  const W = 900;
  ctx.font = '700 66px Quicksand, system-ui, sans-serif';
  probe.font = ctx.font;
  const [lyric, ...rest] = text.split('\n');
  const lines = wrap(probe, lyric, W - 120).slice(0, 6);
  const H = 210 + lines.length * 82 + 50;
  c.width = W; c.height = H;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(0, 0, W, H, 36); ctx.fill();
  ctx.fillStyle = tint(color, 0.45);
  ctx.beginPath(); ctx.roundRect(60, 56, 96, 96, 14); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 54px Quicksand, system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('♪', 108, 106);
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = '700 38px Quicksand, system-ui, sans-serif';
  ctx.fillText(rest[0] ?? 'our song', 186, 88);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '600 32px Quicksand, system-ui, sans-serif';
  ctx.fillText(rest[1] ?? 'on repeat', 186, 130);
  ctx.fillStyle = '#2B1F1A';
  ctx.font = '700 66px Quicksand, system-ui, sans-serif';
  lines.forEach((l, i) => ctx.fillText(l, 60, 240 + i * 82));
  return registerCanvas(c);
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
  if (el.frame === 'scallop') {
    const p = Math.min(el.w, el.h) * 0.05;
    return { l: p, t: p, r: p, b: p };
  }
  if (isShaped(el.frame)) return { l: 0, t: 0, r: 0, b: 0 };
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

/** The outline a shaped frame cuts the picture to, centred on 0,0. */
function shapePath(ctx: CanvasRenderingContext2D, frame: Frame, w: number, h: number) {
  ctx.beginPath();
  if (frame === 'circle') {
    ctx.arc(0, 0, Math.min(w, h) / 2, 0, Math.PI * 2);
  } else if (frame === 'oval') {
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (frame === 'rounded') {
    ctx.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) * 0.12);
  } else {
    ctx.rect(-w / 2, -h / 2, w, h);
  }
}

/** A scalloped mat: a wavy-edged card behind the picture. */
function scallopPath(ctx: CanvasRenderingContext2D, b: { x0: number; y0: number; x1: number; y1: number }) {
  const W = b.x1 - b.x0, H = b.y1 - b.y0;
  const r = Math.min(W, H) * 0.045;
  ctx.beginPath();
  ctx.rect(b.x0 + r, b.y0 + r, W - r * 2, H - r * 2);
  const nx = Math.max(3, Math.round((W - r * 2) / (r * 2))), ny = Math.max(3, Math.round((H - r * 2) / (r * 2)));
  for (let i = 0; i < nx; i++) {
    const cx = b.x0 + r + ((i + 0.5) * (W - r * 2)) / nx;
    for (const cy of [b.y0 + r, b.y1 - r]) { ctx.moveTo(cx + r * 1.15, cy); ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2); }
  }
  for (let i = 0; i < ny; i++) {
    const cy = b.y0 + r + ((i + 0.5) * (H - r * 2)) / ny;
    for (const cx of [b.x0 + r, b.x1 - r]) { ctx.moveTo(cx + r * 1.15, cy); ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2); }
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
  if (el.frame === 'scallop') { scallopPath(ctx, outerBox(el)); ctx.fill('nonzero'); ctx.restore(); return; }
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
    const shaped = isShaped(el.frame);
    if (!shaped || el.frame === 'scallop') {
      ctx.fillStyle = el.frame === 'film' ? '#252323' : '#FFFEFA';
      fillFrame(ctx, el);
    }
    ctx.fillStyle = '#D3CBBF';
    if (shaped) { shapePath(ctx, el.frame!, el.w, el.h); ctx.fill(); } else ctx.fillRect(-el.w/2, -el.h/2, el.w, el.h);
    ctx.setLineDash([18, 12]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(42, 37, 34, 0.45)';
    if (shaped) { shapePath(ctx, el.frame!, el.w, el.h); ctx.stroke(); } else ctx.strokeRect(-el.w / 2, -el.h / 2, el.w, el.h);
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
  const shaped = el.kind === 'photo' && isShaped(el.frame);
  if (shaped && el.frame !== 'scallop') {
    // The shadow belongs to the shape, so paint the shape once underneath.
    ctx.fillStyle = '#FFFEFA';
    shapePath(ctx, el.frame!, el.w, el.h);
    ctx.fill();
    ctx.shadowColor = 'transparent';
  }
  if (el.kind === 'photo' && el.frame && el.frame !== 'none' && (!shaped || el.frame === 'scallop')) {
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
  if (shaped) { shapePath(ctx, el.frame === 'scallop' ? 'rounded' : el.frame!, el.w, el.h); ctx.clip(); }
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
