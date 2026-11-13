/**
 * The tray: stickers a visitor collects while browsing, kept on their own
 * device (localStorage, no account). The scrapbook maker opens with all of
 * them on the page via /scrapbook/?add=a,b,c.
 */
export interface TrayItem {
  slug: string;
  title: string;
  thumb: string;
}

const KEY = '88cutouts-tray-v1';
export const TRAY_MAX = 24;

export function readTray(): TrayItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((x) => x && typeof x.slug === 'string' && typeof x.thumb === 'string')
      .slice(0, TRAY_MAX);
  } catch {
    return [];
  }
}

function save(items: TrayItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* Private mode: the tray still works for this page view. */
  }
  window.dispatchEvent(new CustomEvent('tray:change'));
}

/** Adds or removes; returns 'added', 'removed' or 'full'. */
export function toggleTray(item: TrayItem): 'added' | 'removed' | 'full' {
  const items = readTray();
  const at = items.findIndex((x) => x.slug === item.slug);
  if (at >= 0) {
    items.splice(at, 1);
    save(items);
    return 'removed';
  }
  if (items.length >= TRAY_MAX) return 'full';
  items.push(item);
  save(items);
  return 'added';
}

export function removeFromTray(slug: string): void {
  save(readTray().filter((x) => x.slug !== slug));
}

export function clearTray(): void {
  save([]);
}

export function trayUrl(items: TrayItem[]): string {
  if (!items.length) return '/scrapbook/';
  return `/scrapbook/?add=${items.map((x) => encodeURIComponent(x.slug)).join(',')}`;
}
