import type { ImageMeta } from './image-meta';
import { formatBytes } from './image-meta';

export function specs(meta: ImageMeta | null, type: string): { k: string; v: string }[] {
  const out: { k: string; v: string }[] = [
    { k: 'Format', v: 'PNG-32 with a real alpha channel' },
  ];
  if (meta) {
    const ratio = meta.aw / meta.ah;
    out.push({ k: 'File', v: `${meta.w} × ${meta.h} px PNG` });
    // Stated separately when the canvas carries a wide transparent margin --
    // the artwork box is what you actually see once it is pasted.
    if (meta.fill < 0.75) {
      out.push({
        k: 'Artwork',
        v: `${meta.aw} × ${meta.ah} px inside a transparent margin`,
      });
    }
    out.push({ k: 'Weight', v: formatBytes(meta.bytes) });
    out.push({
      k: 'Shape',
      v:
        ratio >= 1.25
          ? `landscape, ${ratio.toFixed(2)}:1`
          : ratio <= 0.8
            ? `portrait, 1:${(1 / ratio).toFixed(2)}`
            : 'roughly square',
    });
  }
  out.push({
    k: 'Background',
    v:
      meta && meta.fill < 0.75
        ? 'none — fully transparent, including the margin'
        : 'none — transparent to the edge of the artwork',
  });
  out.push({
    k: 'Use',
    v: type === 'frame' ? 'sits under your photo as a border' : 'sits on top of your photo',
  });
  out.push({ k: 'Licence', v: 'free for personal use, no attribution' });
  return out;
}

