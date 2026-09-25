/**
 * Arrangements for the collage engine: a message in letter scraps, stickers
 * scattered around it, and a loose cluster for a sticker pack.
 *
 * Every function here expects its images to be preloaded already (see
 * engine.preload), because sizes come from each image's measured artwork.
 */
import { aspectOf, boundsOf, deg, pick, rand, shuffled, type Item } from './engine';

// ---- letters ----------------------------------------------------------------

/** One character's scrap, kept across renders so typing doesn't reshuffle. */
export interface Slot {
  char: string;
  src: string | null;
  angle: number;
  /** Vertical jitter as a fraction of the letter height. */
  jy: number;
}

export type Manifest = Record<string, string[]>;

export function makeSlot(char: string, manifest: Manifest): Slot {
  const variants = manifest[char.toLowerCase()] ?? [];
  return {
    char,
    src: variants.length ? pick(variants) : null,
    angle: deg(rand(-7, 7)),
    jy: rand(-0.05, 0.05),
  };
}

/** Reuses each position's scrap while its character is unchanged. */
export function syncSlots(slots: Slot[], text: string, manifest: Manifest): Slot[] {
  return [...text].map((char, i) =>
    slots[i] && slots[i].char === char ? slots[i] : makeSlot(char, manifest)
  );
}

function letterWidth(s: Slot, H: number) {
  if (!s.src) return H * 0.62;
  return aspectOf(s.src) * H;
}

/**
 * Lays the message out in centred lines of letter scraps.
 *
 * The letter height is chosen, not fixed: it starts large and steps down until
 * the longest word fits the line and the message fits in four lines, so a
 * short word gets big bold scraps and a longer phrase still fits the Story.
 * `lineShift` nudges each line sideways a little — perfectly centred lines are
 * what makes a collage look typeset instead of pasted.
 */
export function layoutLetters(
  slots: Slot[],
  lineShift: number[],
  maxWidth = 1000
): { items: Item[]; H: number } {
  // Split into lines (hard breaks), then words.
  const lines: Slot[][][] = [[]];
  let word: Slot[] = [];
  const flush = () => {
    if (word.length) lines[lines.length - 1].push(word);
    word = [];
  };
  for (const s of slots) {
    if (s.char === '\n') {
      flush();
      lines.push([]);
    } else if (s.char === ' ') flush();
    else word.push(s);
  }
  flush();

  let H = 180;
  let wrapped: Slot[][][] = [];
  for (; H >= 60; H -= 10) {
    const kern = H * 0.04;
    const space = H * 0.42;
    const wordW = (w: Slot[]) => w.reduce((a, s) => a + letterWidth(s, H) + kern, -kern);
    wrapped = [];
    let fits = true;
    for (const line of lines) {
      let cur: Slot[][] = [];
      let x = 0;
      for (const w of line) {
        const ww = wordW(w);
        if (ww > maxWidth) fits = false;
        if (cur.length && x + space + ww > maxWidth) {
          wrapped.push(cur);
          cur = [];
          x = 0;
        }
        x += (cur.length ? space : 0) + ww;
        cur.push(w);
      }
      wrapped.push(cur);
    }
    if (fits && wrapped.length <= 4) break;
  }

  const kern = H * 0.04;
  const space = H * 0.42;
  const items: Item[] = [];
  const lineH = H * 1.1;
  const top = -((wrapped.length - 1) * lineH) / 2;

  wrapped.forEach((line, li) => {
    const widths = line.map((w) => w.map((s) => letterWidth(s, H)));
    const total =
      widths.reduce((a, ws) => a + ws.reduce((b, v) => b + v + kern, -kern), 0) +
      space * Math.max(0, line.length - 1);
    let x = -total / 2 + (lineShift[li] ?? 0) * H;
    const y = top + li * lineH;
    line.forEach((w, wi) => {
      w.forEach((s, si) => {
        const lw = widths[wi][si];
        const h = s.src ? H : H * 0.8;
        items.push({
          kind: s.src ? 'letter' : 'glyph',
          src: s.src ?? '',
          char: s.char,
          x: x + lw / 2,
          y: y + s.jy * H,
          w: lw,
          h,
          angle: s.angle,
          z: 10,
        });
        x += lw + kern;
      });
      x += space - kern;
    });
  });

  return { items, H };
}

// ---- stickers around the message ---------------------------------------------

/** Where a sticker can sit, as a direction out from the text block's centre. */
const ANCHORS: { fx: number; fy: number; corner: boolean }[] = [
  { fx: -1, fy: -1, corner: true },
  { fx: 1, fy: -1, corner: true },
  { fx: -1, fy: 1, corner: true },
  { fx: 1, fy: 1, corner: true },
  { fx: 0, fy: -1, corner: false },
  { fx: 0, fy: 1, corner: false },
  { fx: -1, fy: 0, corner: false },
  { fx: 1, fy: 0, corner: false },
  { fx: -0.5, fy: -1, corner: false },
  { fx: 0.5, fy: -1, corner: false },
  { fx: -0.5, fy: 1, corner: false },
  { fx: 0.5, fy: 1, corner: false },
];

/** Drawn size for a sticker whose longer side is `s`. */
function sized(src: string, s: number) {
  const a = aspectOf(src);
  return a >= 1 ? { w: s, h: s / a } : { w: s * a, h: s };
}

/**
 * Scatters stickers around the edge of the message.
 *
 * Each one sits on an anchor around the text block and overlaps its edge by a
 * fifth to two fifths of its own size — close enough to belong to the words,
 * never so far over them that the message stops reading. Some go behind the
 * letters and some in front, which is most of what makes it look layered by
 * hand. Anchors that would pile two stickers on top of each other are skipped.
 * One small extra may land right on the words, the way a plaster or a heart
 * gets stuck across a cut-out title.
 */
export function scatterStickers(letters: Item[], H: number, srcs: string[], count: number): Item[] {
  const b = boundsOf(letters);
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  const hw = (b.x1 - b.x0) / 2;
  const hh = (b.y1 - b.y0) / 2;

  const out: Item[] = [];
  const pool = shuffled(srcs);
  let next = 0;
  const take = () => pool[next++ % pool.length];

  const onWords = count >= 4 && letters.length >= 3 && Math.random() < 0.5;
  const around = Math.min(ANCHORS.length, count - (onWords ? 1 : 0));

  // Two passes: the first keeps stickers well apart; if that leaves the
  // collage short, the second lets them crowd each other a little more.
  const spots = shuffled(ANCHORS);
  const used = new Set<(typeof ANCHORS)[number]>();
  for (const spacing of [0.36, 0.2]) {
    for (const a of spots) {
      if (out.length >= around || !pool.length) break;
      if (used.has(a)) continue;
      const src = take();
      const s = H * (a.corner ? rand(1.5, 2.2) : rand(1.15, 1.65));
      const { w, h } = sized(src, s);
      const push = rand(0.1, 0.32);
      const x = cx + a.fx * hw + a.fx * w * push + (a.fx === 0 ? rand(-0.35, 0.35) * hw : 0);
      const y = cy + a.fy * hh + a.fy * h * push + (a.fy === 0 ? rand(-0.3, 0.3) * hh : 0);
      const clash = out.some(
        (o) => Math.hypot(o.x - x, o.y - y) < (Math.max(o.w, o.h) + Math.max(w, h)) * spacing
      );
      if (clash) {
        next--;
        continue;
      }
      used.add(a);
      out.push({
        kind: 'sticker',
        src,
        x,
        y,
        w,
        h,
        angle: deg(rand(-18, 18)),
        z: Math.random() < 0.35 ? 5 : 15,
      });
    }
  }

  if (onWords && pool.length) {
    const src = take();
    const { w, h } = sized(src, H * rand(0.7, 0.95));
    const on = pick(letters);
    out.push({
      kind: 'sticker',
      src,
      x: on.x + on.w * rand(-0.2, 0.6),
      y: on.y + H * rand(-0.45, 0.45),
      w,
      h,
      angle: deg(rand(-28, 28)),
      z: 20,
    });
  }

  return out;
}

/** A fresh sticker in the same spot and at the same size as an old one. */
export function swapSticker(it: Item, src: string): Item {
  const s = Math.max(it.w, it.h);
  return { ...it, src, ...sized(src, s), angle: deg(rand(-18, 18)) };
}

// ---- a sticker pack as one cluster ------------------------------------------

/**
 * Arranges a pack's stickers into one loose cluster, the way you would lay
 * them out on a Story by hand: a staggered grid, each sticker jittered, tilted
 * and overlapping its neighbours a little, in a random stacking order.
 */
export function clusterStickers(srcs: string[]): Item[] {
  const n = srcs.length;
  const cols = Math.max(2, Math.round(Math.sqrt(n * 1.2)));
  const cell = 300;
  const order = shuffled(srcs);
  return order.map((src, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const rowLen = Math.min(cols, n - r * cols);
    const { w, h } = sized(src, cell * rand(1.0, 1.25));
    return {
      kind: 'sticker' as const,
      src,
      x: (c - (rowLen - 1) / 2) * cell + (r % 2 ? cell * 0.18 : -cell * 0.08) + rand(-0.14, 0.14) * cell,
      y: r * cell * 0.86 + rand(-0.14, 0.14) * cell,
      w,
      h,
      angle: deg(rand(-13, 13)),
      z: Math.random(),
    };
  });
}
