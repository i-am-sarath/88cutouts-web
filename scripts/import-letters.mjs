/**
 * Imports ransom-note letter cutouts from the raw master folders into
 * `public/ransom-letters/`, and rewrites `src/content/ransomLetters/letters.json`.
 *
 * The masters are ~1280x1920 scans at 1-3 MB each (~1 GB total) and are
 * gitignored. This produces web-ready derivatives: trimmed to the paper scrap,
 * normalised to a consistent height so a line of type sits evenly, and
 * compressed.
 *
 * Source layout:
 *   PNG Letters_01/<0-9>/<n>-NN.png
 *   PNG Letters_01/- Special Characters/<name>-NN.png
 *   PNG_Letters_02/<A-Z>/<L>-NN.png
 *
 * Run: npm run import-letters   (--dry to preview)
 */
import sharp from 'sharp';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const OUT = path.join(ROOT, 'public/ransom-letters');
const JSON_OUT = path.join(ROOT, 'src/content/ransomLetters/letters.json');
const DRY = process.argv.includes('--dry');

/** Every cutout is scaled to this height so a rendered line looks even. */
const TARGET_H = 200;
/** Guard against a very wide scrap (a dash) blowing up. */
const MAX_W = 420;

const SOURCES = [
  { dir: 'PNG Letters_01', kind: 'folder-is-char' },
  { dir: 'PNG_Letters_02', kind: 'folder-is-char' },
];

/** Special-character folder names -> the character they represent. */
const SPECIAL = {
  and: '&',
  arrows: '>',
  asterisk: '*',
  at: '@',
  colon: ':',
  comma: ',',
  dash: '-',
  esclamation: '!',
  hashtag: '#',
  parenthesis: null, // resolved per-variant below
  percent: '%',
  plus: '+',
  point: '.',
  question: '?',
  quotation: '"',
  semicolon: ';',
  // whole words, not characters — not usable by the typewriter
  new: false,
  the: false,
};

/** parenthesis-01/03 are opening, -02/-04 are closing. */
const PARENTHESIS = { '01': '(', '02': ')', '03': '(', '04': ')' };

/**
 * There is no dedicated apostrophe scrap, so the quotation cutouts stand in for
 * it too — a double-quote scrap reads fine in a ransom note, and beats dropping
 * to a plain sans-serif fallback glyph.
 */
const ALIASES = { '"': ["'"] };

/** Filesystem-safe stem for a character. */
const FILE_NAME = {
  '&': 'and', '>': 'gt', '*': 'asterisk', '@': 'at', ':': 'colon', ',': 'comma',
  '-': 'dash', '!': 'excl', '#': 'hash', '(': 'paren-open', ')': 'paren-close',
  '%': 'percent', '+': 'plus', '.': 'dot', '?': 'question', '"': 'quote',
  ';': 'semicolon',
};
const fileStem = (ch) => FILE_NAME[ch] ?? ch.toLowerCase();

const isPng = (f) => f.toLowerCase().endsWith('.png');

/** @type {Array<{char:string, src:string}>} */
const jobs = [];
const unmapped = [];

for (const { dir } of SOURCES) {
  const abs = path.join(ROOT, dir);
  let entries;
  try {
    entries = await readdir(abs, { withFileTypes: true });
  } catch {
    console.log(`(skipping missing folder: ${dir})`);
    continue;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const folder = entry.name;
    const files = (await readdir(path.join(abs, folder))).filter(isPng).sort();

    const isSpecial = /special characters/i.test(folder);

    for (const file of files) {
      const src = path.join(abs, folder, file);

      if (!isSpecial) {
        // folder name is the character: "0".."9", "A".."Z"
        const ch = folder.trim();
        if (ch.length !== 1) {
          unmapped.push(`${folder}/${file}`);
          continue;
        }
        jobs.push({ char: ch, src });
        continue;
      }

      const m = /^(.+?)-(\d+)\.png$/i.exec(file);
      if (!m) {
        unmapped.push(`${folder}/${file}`);
        continue;
      }
      const [, name, num] = m;
      const key = name.toLowerCase();

      let ch;
      if (key === 'parenthesis') ch = PARENTHESIS[num];
      else ch = SPECIAL[key];

      if (ch === false) continue; // deliberately excluded word art
      if (!ch) {
        unmapped.push(`${folder}/${file}`);
        continue;
      }
      jobs.push({ char: ch, src });
    }
  }
}

if (jobs.length === 0) {
  console.log('No source letters found — are the master folders present?');
  process.exit(0);
}

// Replace the previous set outright so removed masters don't linger.
if (!DRY) {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
}

const counters = new Map();
const letters = [];
let bytes = 0;

for (const { char, src } of jobs) {
  const stem = fileStem(char);
  const n = (counters.get(stem) ?? 0) + 1;
  counters.set(stem, n);

  const rel = `/ransom-letters/${stem}-${String(n).padStart(2, '0')}.png`;
  letters.push({ character: char, image: rel });
  if (DRY) continue;

  const input = await readFile(src);
  let trimmed;
  try {
    trimmed = await sharp(input).ensureAlpha().trim({ threshold: 1 }).toBuffer();
  } catch {
    trimmed = input;
  }

  const meta = await sharp(trimmed).metadata();
  let h = TARGET_H;
  let w = Math.max(1, Math.round((meta.width / meta.height) * h));
  if (w > MAX_W) {
    w = MAX_W;
    h = Math.max(1, Math.round((meta.height / meta.width) * w));
  }

  const buf = await sharp(trimmed)
    .resize(w, h, { fit: 'fill', kernel: 'lanczos3' })
    .png({ compressionLevel: 9, quality: 90 })
    .toBuffer();

  await writeFile(path.join(ROOT, 'public', rel.replace(/^\//, '')), buf);
  bytes += buf.length;
}

// Register alias characters against the same files — no extra image written.
for (const [source, targets] of Object.entries(ALIASES)) {
  const shared = letters.filter((l) => l.character === source);
  for (const target of targets) {
    for (const l of shared) letters.push({ character: target, image: l.image });
  }
}

if (!DRY) {
  await writeFile(JSON_OUT, JSON.stringify({ letters }, null, 2) + '\n');
}

const byChar = new Map();
for (const l of letters) byChar.set(l.character, (byChar.get(l.character) ?? 0) + 1);

const chars = [...byChar.keys()].sort();
console.log(
  `${DRY ? '[dry run] ' : ''}${letters.length} cutouts across ${byChar.size} characters ` +
    `(${(bytes / 1024 / 1024).toFixed(1)} MB)\n`
);
console.log(`characters: ${chars.join(' ')}`);
console.log(
  `variants per character: min ${Math.min(...byChar.values())}, max ${Math.max(...byChar.values())}`
);
if (unmapped.length) {
  console.log(`\nunmapped (skipped): ${unmapped.length}`);
  for (const u of unmapped.slice(0, 12)) console.log(`  ${u}`);
}
