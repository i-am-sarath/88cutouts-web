/**
 * Thin wrapper over gtag. Safe to call when analytics is not configured — the
 * GA snippet is only emitted when PUBLIC_GA_MEASUREMENT_ID is set, so on a
 * local build or before the ID is wired up this is a no-op.
 */
type Params = Record<string, string | number | boolean | undefined>;

export function track(event: string, params: Params = {}): void {
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === 'function') gtag('event', event, params);
}
