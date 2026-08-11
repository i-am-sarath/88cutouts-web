/**
 * One-off / repair pass: normalise every PNG already in public/stickers.
 *
 * Run with `npm run normalize`. Safe to re-run — already-tight stickers only
 * gain the 3% padding once they have nothing left to trim, so check the report
 * before running it twice.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSticker } from './normalize-sticker.mjs';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const PUB = path.join(ROOT, 'public/stickers');
const DRY = process.argv.includes('--dry');

const files = (await readdir(PUB)).filter((f) => f.toLowerCase().endsWith('.png')).sort();

const rows = [];
for (const f of files) {
  const src = path.join(PUB, f);
  const { buffer, before, after, fillBefore } = await normalizeSticker(await readFile(src));
  if (!DRY) await writeFile(src, buffer);
  rows.push({ f, before, after, fill: fillBefore * 100 });
}

rows.sort((a, b) => a.fill - b.fill);
console.log(`${DRY ? '[dry run] ' : ''}normalised ${rows.length} stickers\n`);
console.log('most reclaimed:');
for (const r of rows.slice(0, 10)) {
  console.log(`  ${r.f.padEnd(34)} ${r.before.padEnd(10)} -> ${r.after.padEnd(10)} was ${r.fill.toFixed(0)}% content`);
}
const avg = rows.reduce((s, r) => s + r.fill, 0) / rows.length;
console.log(`\naverage content fill before: ${avg.toFixed(1)}%`);
