/**
 * Copy and download for sticker PNGs, shared by the sticker pages and the
 * one-tap Copy on gallery tiles. Browser-only.
 */
import { track } from './track';

export function showToast(msg: string) {
  let toast = document.getElementById('global-toast') as (HTMLElement & { _t?: number }) | null;
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = window.setTimeout(() => toast!.classList.remove('show'), 2200);
}

/**
 * The clipboard only reliably accepts image/png, so anything else gets
 * re-encoded through a canvas (alpha is preserved). Anything below full
 * opacity always takes the canvas path — that is where the alpha is applied.
 */
export async function toPngBlob(src: string, alpha = 1): Promise<Blob> {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Failed to fetch ${src}`);
  const blob = await res.blob();
  if (blob.type === 'image/png' && alpha >= 1) return blob;

  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.globalAlpha = alpha;
  ctx.drawImage(bitmap, 0, 0);
  return await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/png')
  );
}

export async function copyImage(src: string, slug: string, alpha = 1) {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    showToast("Copy isn't supported here — tap Download instead.");
    // How often the core interaction is unavailable is worth knowing.
    track('sticker_copy_unsupported', { sticker: slug, reason: 'no_clipboard_api' });
    return false;
  }

  // Kick the fetch off inside the click handler so Safari keeps the user
  // gesture alive; the promise is handed straight to ClipboardItem.
  const pending = toPngBlob(src, alpha);
  pending.catch(() => {});

  const opacity = Math.round(alpha * 100);

  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': pending })]);
    showToast('Copied! Paste into your Instagram Story.');
    track('sticker_copy', { sticker: slug, method: 'promise', opacity });
    return true;
  } catch {
    /* Browser rejects promise-valued ClipboardItem — retry with the blob. */
  }

  try {
    const blob = await pending;
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    showToast('Copied! Paste into your Instagram Story.');
    track('sticker_copy', { sticker: slug, method: 'blob', opacity });
    return true;
  } catch {
    showToast("Copy isn't supported here — tap Download instead.");
    track('sticker_copy_unsupported', { sticker: slug, reason: 'write_rejected' });
    return false;
  }
}

export async function downloadImage(src: string, filename: string, original: boolean, alpha = 1) {
  try {
    // Serving the original bytes only works at full opacity; a translucent
    // version has to be re-encoded through the canvas.
    const blob = original && alpha >= 1 ? await (await fetch(src)).blob() : await toPngBlob(src, alpha);
    const opacity = Math.round(alpha * 100);
    const name = alpha >= 1 ? filename : `${filename.replace(/\.\w+$/, '')}-${opacity}.png`;
    track('sticker_download', { sticker: filename.replace(/\.\w+$/, ''), opacity });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch {
    showToast('Download failed — try again.');
  }
}
