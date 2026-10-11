import { symbols } from '../data/symbols';

/**
 * The symbol library for the scrapbook's Symbols tab. Served separately and
 * fetched only when that tab is opened: with the dot art it is ~70 KB, which
 * most visits to the editor never need.
 */
export function GET() {
  const list = symbols.map((s) => ({ t: s.title, c: s.category, x: s.text }));
  return new Response(JSON.stringify(list), {
    headers: { 'Content-Type': 'application/json' },
  });
}
