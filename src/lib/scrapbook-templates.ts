/**
 * Scrapbook templates with their stickers looked up in the library, for the
 * editor and the template pages. A sticker that has since left the library is
 * dropped (with a build warning) rather than leaving a gap.
 */
import { templates, type ScrapbookTemplate } from '../data/scrapbook-templates';
import type { ResolvedTemplate } from './scrapbook/template';
import { getStickers } from './stickers';
import { stickerThumb } from './thumbs.mjs';

export async function resolveTemplate(t: ScrapbookTemplate): Promise<ResolvedTemplate> {
  const bySlug = new Map<string, string>((await getStickers()).map((s) => [s.slug, s.data.image]));
  const els: ResolvedTemplate['els'] = [];
  for (const el of t.els) {
    if (el.t !== 'sticker') {
      els.push(el);
      continue;
    }
    const image = bySlug.get(el.slug);
    if (image) els.push({ ...el, src: stickerThumb(image, 512) });
    else console.warn(`[scrapbook] "${t.slug}": sticker "${el.slug}" not found, skipped.`);
  }
  return { slug: t.slug, name: t.name, paper: t.paper, els };
}

export const resolveTemplates = () => Promise.all(templates.map(resolveTemplate));
