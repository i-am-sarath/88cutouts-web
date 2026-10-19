/**
 * Turns a template (see src/data/scrapbook-templates.ts) into a page. Shared
 * by the editor and by the preview on each template's own page.
 */
import { FORMATS, coverCrop, loadUrl, makeMount, makeLetters, makeTape, makeText, makeWords, makeDoodle, makeCard, sourceOf, fitSize, type Doc, type El } from './scene';
import type { Manifest } from '../collage/layout';
import type { TplEl } from '../../data/scrapbook-templates';

export interface ResolvedTemplate {
  slug: string;
  name: string;
  paper: string;
  background?: string;
  /** Sticker elements carry their resolved image URL. */
  els: (TplEl & { src?: string })[];
}

let manifest: Promise<Manifest> | null = null;

/** The cut-out letter scraps, fetched once and only when something needs them. */
export function getManifest(): Promise<Manifest> {
  return (manifest ??= fetch('/ransom-letters-manifest.json')
    .then((r) => r.json())
    .catch(() => ({})));
}

const rad = (d = 0) => (d * Math.PI) / 180;

/** Scenery that fills frames in previews when a template names no sample of its own. */
const SAMPLES = ['golden-hour', 'daisies', 'ocean', 'lily-bouquet', 'sky', 'golden-string-lights', 'sunset-smear', 'amber-bokeh', 'dried-lily-macro'].map((n) => `/bg/${n}.webp`);

/** `demo` fills photo frames with their sample pictures, for previews. */
export async function buildTemplate(t: ResolvedTemplate, opts: { demo?: boolean } = {}): Promise<Doc> {
  const { w: W, h: H } = FORMATS.story;
  const m = t.els.some((e) => e.t === 'letters') ? await getManifest() : {};
  if (t.background && !(await loadUrl(t.background))) throw new Error('Template background could not load');

  // Artwork is generated in parallel; element order (and so layering) is kept.
  const made = await Promise.all(
    t.els.map(async (e, i): Promise<{ key: string; shadow: boolean } | null> => {
      if (e.t === 'mount') return { key: makeMount(e.w*W,e.h*W,e.mount), shadow: true };
      if (e.t === 'slot') {
        if (!opts.demo) return null;
        const src = e.demo ?? SAMPLES[t.els.slice(0, i).filter((x) => x.t === 'slot').length % SAMPLES.length];
        return (await loadUrl(src)) ? { key: src, shadow: true } : null;
      }
      if (e.t === 'sticker') return e.src && (await loadUrl(e.src)) ? { key: e.src, shadow: true } : null;
      if (e.t === 'letters') {
        const key = await makeLetters(e.text, m);
        return key ? { key, shadow: true } : null;
      }
      if (e.t === 'hand') return { key: await makeText(e.text, e.style ?? 'hand', e.color), shadow: false };
      if (e.t === 'tape') return { key: makeTape(e.tape), shadow: false };
      if (e.t === 'words') return { key: makeWords(e.text, e.color), shadow: false };
      if (e.t === 'doodle') return { key: makeDoodle(e.kind, e.color), shadow: false };
      if (e.t === 'card') return { key: await makeCard(e.kind, e.text, e.color), shadow: true };
      return null;
    })
  );

  const els: El[] = [];
  t.els.forEach((e, i) => {
    const base = { id: i + 1, z: i + 1, x: e.x * W, y: e.y * H, angle: rad(e.a), group: 'group' in e ? e.group : undefined };
    if (e.t === 'slot') {
      const sample = made[i] && sourceOf(made[i]!.key);
      if (sample) {
        els.push({ ...base, kind: 'photo', src: made[i]!.key, w: e.w * W, h: e.h * W, frame: e.frame ?? 'polaroid', filter: e.filter, crop: coverCrop(sample, e.w / e.h), shadow: true });
        return;
      }
      els.push({ ...base, kind: 'slot', src: '', w: e.w * W, h: e.h * W, frame: e.frame ?? 'polaroid', filter: e.filter });
      return;
    }
    const art = made[i];
    const s = art && sourceOf(art.key);
    if (!art || !s) return;
    if (e.t === 'mount') {
      els.push({ ...base, kind:'art', src:art.key, w:e.w*W, h:e.h*W, shadow:true });
      return;
    }
    els.push({ ...base, kind: 'art', src: art.key, ...fitSize(s.crop.sw / s.crop.sh, e.s * W), shadow: art.shadow });
  });

  return { format: 'story', paper: t.paper, background: t.background, els };
}
