/**
 * The interactive scrapbook page: tap to select, drag to move, the corner
 * handle (or two fingers, or the mouse wheel) to resize and rotate, the red
 * handle to remove. Undo/redo keep whole-page snapshots, which are tiny since
 * elements only hold source keys.
 */
import {
  FORMATS,
  drawDoc,
  handles,
  hitTest,
  outerBox,
  sourceOf,
  fitSize,
  coverCrop,
  HANDLE_CSS,
  type Doc,
  type El,
  type Format,
  type Frame,
} from './scene';

type Gesture =
  | { type: 'move'; id: number; sx: number; sy: number; ox: number; oy: number; moved: number; t: number; tapSelected: boolean }
  | { type: 'resize'; id: number; a0: number; d0: number; w0: number; h0: number; angle0: number }
  | { type: 'pinch'; id: number; a0: number; d0: number; w0: number; h0: number; angle0: number; x0: number; y0: number; mx: number; my: number };

export interface EditorEvents {
  /** Selection or contents changed: refresh the toolbar. */
  change?: () => void;
  /** An empty photo slot was tapped. */
  slot?: (el: El) => void;
}

const MIN = 40;

export class Editor {
  doc: Doc = { format: 'story', paper: 'cream', els: [] };
  selected: number | null = null;
  /** True once something was added and not yet exported. */
  dirty = false;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ev: EditorEvents;
  private nextId = 1;
  private past: string[] = [];
  private future: string[] = [];
  private pending: string | null = null;
  private pointers = new Map<number, { x: number; y: number }>();
  private g: Gesture | null = null;
  private frame = 0;
  private wheelTimer = 0;

  constructor(canvas: HTMLCanvasElement, ev: EditorEvents = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.ev = ev;
    this.resizeCanvas();
    canvas.addEventListener('pointerdown', (e) => this.down(e));
    canvas.addEventListener('pointermove', (e) => this.move(e));
    canvas.addEventListener('pointerup', (e) => this.up(e));
    canvas.addEventListener('pointercancel', (e) => this.up(e));
    canvas.addEventListener('wheel', (e) => this.wheel(e), { passive: false });
    if (canvas.parentElement) new ResizeObserver(() => this.fit()).observe(canvas.parentElement);
  }

  /**
   * Sizes the canvas on screen to the largest box of the page's shape that
   * fits its container. CSS max-width/max-height can't do this reliably in a
   * flex layout, where the container's height is itself being negotiated.
   */
  private fit() {
    const box = this.canvas.parentElement;
    if (!box) return;
    const { width: bw, height: bh } = box.getBoundingClientRect();
    if (!bw || !bh) return;
    const k = Math.min(bw / this.size.w, bh / this.size.h);
    this.canvas.style.width = `${Math.floor(this.size.w * k)}px`;
    this.canvas.style.height = `${Math.floor(this.size.h * k)}px`;
    this.draw();
  }

  // ---- basics ---------------------------------------------------------------

  get size() {
    return FORMATS[this.doc.format];
  }

  get sel(): El | undefined {
    return this.selected != null ? this.doc.els.find((e) => e.id === this.selected) : undefined;
  }

  get isEmpty() {
    return !this.doc.background && !this.doc.els.some((e) => e.kind !== 'slot');
  }

  private resizeCanvas() {
    this.canvas.width = this.size.w;
    this.canvas.height = this.size.h;
    this.fit();
  }

  /** Canvas pixels per CSS pixel. */
  private get px() {
    const r = this.canvas.getBoundingClientRect();
    return r.width ? this.size.w / r.width : 1;
  }

  draw() {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => drawDoc(this.ctx, this.doc, { selected: this.selected, px: this.px }));
  }

  private changed() {
    this.draw();
    this.ev.change?.();
  }

  private topZ() {
    return this.doc.els.reduce((m, e) => Math.max(m, e.z), 0);
  }

  // ---- history ----------------------------------------------------------------

  private snap() {
    return JSON.stringify(this.doc);
  }

  /** Call before a change; the snapshot is kept so undo returns here. */
  checkpoint() {
    this.past.push(this.snap());
    if (this.past.length > 60) this.past.shift();
    this.future = [];
  }

  private restore(s: string) {
    const prevFormat = this.doc.format;
    this.doc = JSON.parse(s);
    if (this.doc.format !== prevFormat) this.resizeCanvas();
    if (this.selected != null && !this.doc.els.some((e) => e.id === this.selected)) this.selected = null;
    this.changed();
  }

  get canUndo() {
    return this.past.length > 0;
  }
  get canRedo() {
    return this.future.length > 0;
  }

  undo() {
    const s = this.past.pop();
    if (!s) return;
    this.future.push(this.snap());
    this.restore(s);
  }

  redo() {
    const s = this.future.pop();
    if (!s) return;
    this.past.push(this.snap());
    this.restore(s);
  }

  // ---- adding -----------------------------------------------------------------

  /**
   * Adds artwork near the middle, slightly tilted and offset so several
   * additions in a row fan out instead of stacking exactly.
   */
  addArt(src: string, opts: { long?: number; shadow?: boolean; angle?: number; x?: number; y?: number } = {}) {
    const s = sourceOf(src);
    if (!s) return null;
    const { w: W, h: H } = this.size;
    const a = s.crop.sw / s.crop.sh;
    const { w, h } = fitSize(a, (opts.long ?? 0.42) * W);
    const jitter = () => (Math.random() - 0.5) * W * 0.16;
    return this.push({
      kind: 'art',
      src,
      x: opts.x ?? W / 2 + jitter(),
      y: opts.y ?? H / 2 + jitter(),
      w,
      h,
      angle: opts.angle ?? ((Math.random() - 0.5) * 12 * Math.PI) / 180,
      shadow: opts.shadow ?? true,
    });
  }

  addPhoto(src: string, frame: Frame = 'polaroid') {
    const s = sourceOf(src);
    if (!s) return null;
    const { w: W, h: H } = this.size;
    const { w, h } = fitSize(s.w / s.h, W * 0.5);
    return this.push({
      kind: 'photo',
      src,
      frame,
      x: W / 2 + (Math.random() - 0.5) * W * 0.1,
      y: H / 2 + (Math.random() - 0.5) * W * 0.1,
      w,
      h,
      angle: ((Math.random() - 0.5) * 8 * Math.PI) / 180,
      shadow: true,
    });
  }

  /** Puts a photo into an empty template slot, cropped to the slot's shape. */
  fillSlot(id: number, src: string) {
    const el = this.doc.els.find((e) => e.id === id);
    const s = sourceOf(src);
    if (!el || !s) return;
    this.checkpoint();
    el.kind = 'photo';
    el.src = src;
    el.crop = coverCrop(s, el.w / el.h);
    el.shadow = true;
    this.selected = el.id;
    this.dirty = true;
    this.changed();
  }

  /** Adds without a checkpoint of its own when `quiet` (templates batch them). */
  push(el: Omit<El, 'id' | 'z'>, quiet = false): El {
    if (!quiet) this.checkpoint();
    const full: El = { ...el, id: this.nextId++, z: this.topZ() + 1 };
    this.doc.els.push(full);
    if (!quiet) {
      this.selected = full.id;
      this.dirty = true;
      this.changed();
    }
    return full;
  }

  /** Replaces the whole page (a template, or Start over). */
  load(doc: Doc) {
    this.checkpoint();
    const prev = this.doc.format;
    this.doc = doc;
    this.nextId = doc.els.reduce((m, e) => Math.max(m, e.id), 0) + 1;
    if (doc.format !== prev) this.resizeCanvas();
    this.selected = null;
    this.changed();
  }

  setFormat(f: Format) {
    if (f === this.doc.format) return;
    this.checkpoint();
    const from = FORMATS[this.doc.format];
    const to = FORMATS[f];
    // Keep everything in the same place relative to the page.
    const ky = to.h / from.h;
    for (const el of this.doc.els) el.y = el.y * ky;
    this.doc.format = f;
    this.resizeCanvas();
    this.changed();
  }

  setPaper(id: string) {
    if (id === this.doc.paper && !this.doc.background) return;
    this.checkpoint();
    this.doc.paper = id;
    delete this.doc.background;
    this.dirty = true;
    this.changed();
  }

  setBackground(src: string) {
    if (!sourceOf(src)) return;
    this.checkpoint();
    this.doc.background = src;
    this.dirty = true;
    this.changed();
  }

  setFilter(filter?: El['filter']) {
    if (this.sel?.kind !== 'photo') return;
    this.checkpoint(); this.sel.filter = filter; this.dirty = true; this.changed();
  }

  /** Move or zoom the image inside its frame, keeping the frame covered. */
  adjustCrop(dx: number, dy: number, zoom = 1) {
    const el = this.sel;
    const s = el && sourceOf(el.src);
    if (!el || el.kind !== 'photo' || !s) return;
    this.checkpoint();
    const c = el.crop ?? coverCrop(s, el.w / el.h);
    const max = coverCrop(s, el.w / el.h);
    const sw = Math.max(max.sw / 8, Math.min(max.sw, c.sw / zoom));
    const sh = sw * el.h / el.w;
    el.crop = { sx: Math.max(0, Math.min(s.w-sw, c.sx+(c.sw-sw)/2+dx*c.sw)), sy: Math.max(0, Math.min(s.h-sh, c.sy+(c.sh-sh)/2+dy*c.sh)), sw, sh };
    this.dirty = true; this.changed();
  }

  // ---- the selected element ----------------------------------------------------

  select(id: number | null) {
    this.selected = id;
    this.changed();
  }

  remove() {
    const el = this.sel;
    if (!el) return;
    this.checkpoint();
    if (el.group && (el.kind==='photo'||el.kind==='slot')) {
      el.kind='slot';el.src='';delete el.crop;
    } else this.doc.els = this.doc.els.filter((e) => el.group ? e.group!==el.group : e !== el);
    this.selected = null;
    this.changed();
  }

  duplicate() {
    const el = this.sel;
    if (!el) return;
    const off = this.size.w * 0.05;
    if(el.group) {
      this.checkpoint();
      const group=`copy:${this.nextId}`;
      for(const item of this.doc.els.filter((e)=>e.group===el.group)) {
        const copy=this.push({...item,group,x:item.x+off,y:item.y+off,crop:item.crop&&{...item.crop}},true);
        if(item===el)this.selected=copy.id;
      }
      this.dirty=true;this.changed();return;
    }
    this.push({ ...el, x: el.x + off, y: el.y + off, crop: el.crop && { ...el.crop } });
  }

  flip() {
    const el = this.sel;
    if (!el || el.kind === 'slot') return;
    this.checkpoint();
    el.flip = !el.flip;
    this.changed();
  }

  forward() {
    const el = this.sel;
    if (!el) return;
    this.checkpoint();
    const items=this.doc.els.filter((e)=>el.group ? e.group===el.group : e===el).sort((a,b)=>a.z-b.z);
    const top=this.topZ()+1;items.forEach((item,i)=>item.z=top+i);
    this.changed();
  }

  backward() {
    const el = this.sel;
    if (!el) return;
    this.checkpoint();
    const low = this.doc.els.reduce((m, e) => Math.min(m, e.z), Infinity);
    const items=this.doc.els.filter((e)=>el.group ? e.group===el.group : e===el).sort((a,b)=>a.z-b.z);
    items.forEach((item,i)=>item.z=low-items.length+i);
    this.changed();
  }

  setFrame(frame: Frame) {
    const el = this.sel;
    if (!el || (el.kind !== 'photo' && el.kind !== 'slot')) return;
    this.checkpoint();
    el.frame = frame;
    this.changed();
  }

  nudge(dx: number, dy: number) {
    const el = this.sel;
    if (!el) return;
    if (!this.pending) this.pending = this.snap();
    const before={...el};
    el.x += dx;
    el.y += dy;
    this.syncGroup(before,el);
    this.settleSoon();
    this.draw();
  }

  /** Scale and rotate the selection by a step (keyboard, wheel, buttons). */
  transform(scale: number, rotate = 0) {
    const el = this.sel;
    if (!el) return;
    if (!this.pending) this.pending = this.snap();
    const before={...el};
    this.scaleTo(el, el.w * scale, el.h * scale);
    el.angle += rotate;
    this.syncGroup(before,el);
    this.settleSoon();
    this.draw();
  }

  private settleSoon() {
    clearTimeout(this.wheelTimer);
    this.wheelTimer = window.setTimeout(() => this.settle(), 350);
  }

  /** Records a finished continuous change (drag, pinch, wheel) as one undo step. */
  private settle() {
    if (this.pending && this.pending !== this.snap()) {
      this.past.push(this.pending);
      if (this.past.length > 60) this.past.shift();
      this.future = [];
      this.dirty = true;
    }
    this.pending = null;
    this.ev.change?.();
  }

  /** Resizes, keeping the element between finger-sized and 3 pages wide. */
  private scaleTo(el: El, w: number, h: number) {
    const max = this.size.w * 3;
    let k = 1;
    if (Math.min(w, h) < MIN) k = MIN / Math.min(w, h);
    if (Math.max(w, h) * k > max) k = max / Math.max(w, h);
    el.w = w * k;
    el.h = h * k;
  }

  /** Apply the selected print's affine change to its shared mount and cells. */
  private syncGroup(before:El,after:El) {
    if(!after.group)return;
    const scale=after.w/before.w,angle=after.angle-before.angle;
    const c=Math.cos(angle),s=Math.sin(angle);
    for(const item of this.doc.els) {
      if(item.id===after.id||item.group!==after.group)continue;
      const dx=(item.x-before.x)*scale,dy=(item.y-before.y)*scale;
      item.x=after.x+dx*c-dy*s;item.y=after.y+dx*s+dy*c;
      item.w*=scale;item.h*=scale;item.angle+=angle;
    }
  }

  // ---- export -------------------------------------------------------------------

  render(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = this.size.w;
    c.height = this.size.h;
    drawDoc(c.getContext('2d')!, this.doc, { exporting: true });
    return c;
  }

  // ---- pointers -------------------------------------------------------------------

  private point(e: { clientX: number; clientY: number }) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * this.size.w,
      y: ((e.clientY - r.top) / r.height) * this.size.h,
    };
  }

  private near(p: { x: number; y: number }, q: { x: number; y: number }) {
    return Math.hypot(p.x - q.x, p.y - q.y) <= (HANDLE_CSS + 8) * this.px;
  }

  private down(e: PointerEvent) {
    const p = this.point(e);
    this.pointers.set(e.pointerId, p);
    try {
      this.canvas.setPointerCapture(e.pointerId);
    } catch {
      /* synthetic event */
    }

    // Second finger: pinch the selected element (or the one under the first finger).
    if (this.pointers.size === 2) {
      const el = this.sel;
      if (!el) return;
      const [a, b] = [...this.pointers.values()];
      if (!this.pending) this.pending = this.snap();
      this.g = {
        type: 'pinch',
        id: el.id,
        a0: Math.atan2(b.y - a.y, b.x - a.x),
        d0: Math.hypot(b.x - a.x, b.y - a.y) || 1,
        w0: el.w,
        h0: el.h,
        angle0: el.angle,
        x0: el.x,
        y0: el.y,
        mx: (a.x + b.x) / 2,
        my: (a.y + b.y) / 2,
      };
      return;
    }
    if (this.pointers.size > 2) return;

    const sel = this.sel;
    if (sel) {
      const h = handles(sel, this.px);
      if (this.near(p, h.remove)) {
        e.preventDefault();
        this.remove();
        this.pointers.delete(e.pointerId);
        return;
      }
      if (this.near(p, h.resize)) {
        e.preventDefault();
        this.pending = this.snap();
        this.g = {
          type: 'resize',
          id: sel.id,
          a0: Math.atan2(p.y - sel.y, p.x - sel.x),
          d0: Math.hypot(p.x - sel.x, p.y - sel.y) || 1,
          w0: sel.w,
          h0: sel.h,
          angle0: sel.angle,
        };
        return;
      }
    }

    const hit = hitTest(this.doc.els, p.x, p.y, this.selected);
    if (!hit) {
      if (this.selected != null) this.select(null);
      return;
    }
    e.preventDefault();
    const wasSelected = hit.id === this.selected;
    this.selected = hit.id;
    this.pending = this.snap();
    this.g = { type: 'move', id: hit.id, sx: p.x, sy: p.y, ox: hit.x, oy: hit.y, moved: 0, t: performance.now(), tapSelected: wasSelected };
    this.changed();
  }

  private move(e: PointerEvent) {
    if (!this.pointers.has(e.pointerId)) {
      // Hover feedback for mouse users.
      if (e.pointerType === 'mouse') {
        const p = this.point(e);
        const sel = this.sel;
        const h = sel && handles(sel, this.px);
        this.canvas.style.cursor =
          h && this.near(p, h.resize) ? 'nwse-resize' : h && this.near(p, h.remove) ? 'pointer' : hitTest(this.doc.els, p.x, p.y, this.selected) ? 'move' : 'default';
      }
      return;
    }
    const p = this.point(e);
    this.pointers.set(e.pointerId, p);
    const g = this.g;
    if (!g) return;
    const el = this.doc.els.find((x) => x.id === g.id);
    if (!el) return;
    const before={...el};

    if (g.type === 'move') {
      el.x = g.ox + (p.x - g.sx);
      el.y = g.oy + (p.y - g.sy);
      g.moved = Math.max(g.moved, Math.hypot(p.x - g.sx, p.y - g.sy) / this.px);
    } else if (g.type === 'resize') {
      const a = Math.atan2(p.y - el.y, p.x - el.x);
      const d = Math.hypot(p.x - el.x, p.y - el.y);
      const k = d / g.d0;
      this.scaleTo(el, g.w0 * k, g.h0 * k);
      el.angle = g.angle0 + (a - g.a0);
    } else if (g.type === 'pinch' && this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      const k = Math.hypot(b.x - a.x, b.y - a.y) / g.d0;
      this.scaleTo(el, g.w0 * k, g.h0 * k);
      el.angle = g.angle0 + (Math.atan2(b.y - a.y, b.x - a.x) - g.a0);
      el.x = g.x0 + ((a.x + b.x) / 2 - g.mx);
      el.y = g.y0 + ((a.y + b.y) / 2 - g.my);
    }
    this.syncGroup(before,el);
    this.draw();
  }

  private up(e: PointerEvent) {
    if (!this.pointers.delete(e.pointerId)) return;
    try {
      this.canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    const g = this.g;
    if (g?.type === 'pinch') {
      // One finger lifted: stop pinching, and don't let the other start a drag.
      if (this.pointers.size === 0) {
        this.g = null;
        this.settle();
      }
      return;
    }
    this.g = null;
    if (g?.type === 'move' && g.moved < 6 && performance.now() - g.t < 500) {
      const el = this.doc.els.find((x) => x.id === g.id);
      if (el?.kind === 'slot') this.ev.slot?.(el);
    }
    this.settle();
  }

  private wheel(e: WheelEvent) {
    const el = this.sel;
    if (!el) return;
    const p = this.point(e);
    const b = outerBox(el);
    const pad = Math.max(b.x1 - b.x0, b.y1 - b.y0);
    if (Math.hypot(p.x - el.x, p.y - el.y) > pad) return;
    e.preventDefault();
    if (e.shiftKey || e.altKey) this.transform(1, (e.deltaY > 0 ? 3 : -3) * (Math.PI / 180));
    else this.transform(Math.exp(-e.deltaY * 0.0015));
  }
}
