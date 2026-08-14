# 88cutouts

Static gallery of transparent-PNG stickers, frames and letter cutouts for Instagram
Stories. No accounts, no backend, no database. Astro → Cloudflare Pages, edited through
Sveltia CMS at `/admin`.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # runs prebuild image optimization, then outputs to dist/
npm run preview
```

`npm run build` runs `scripts/optimize-images.mjs` first, which resizes anything in
`public/stickers` or `public/ransom-letters` down to a 900px max and recompresses the PNG.

## Adding stickers daily

Two paths, use whichever suits the batch:

**Bulk drop (many files at once)**

```bash
# 1. drop transparent PNGs into stickers/
# 2. then:
npm run import          # add --dry to preview without changing anything
```

`import` de-duplicates (exact hash *and* perceptual near-match against everything
already published), normalises the image, moves it to `public/stickers/`, and writes a
content entry. It then prints the list of new `.md` files needing a real title, category
and tags — fill those in via `/admin` or directly. Untouched source files are archived to
`stickers/_originals/`, rejects to `stickers/_duplicates/`. **Nothing is ever deleted.**

**One at a time** — just use `/admin`. It handles the image upload and the metadata in a
single form, and commits straight to `main`.

### Folders inside `stickers/`

| Folder | What's in it |
| --- | --- |
| `stickers/*.png` | the drop zone — put new files here |
| `stickers/_originals/` | pristine sources, kept because normalisation is lossy |
| `stickers/_duplicates/` | exact and near-duplicate rejects |
| `stickers/_on-hold/` | parked, not published — see below |

## Ransom-note letters

```bash
npm run import-letters      # --dry to preview
```

Reads the master scans and writes web-ready cutouts to `public/ransom-letters/`,
then rewrites `src/content/ransomLetters/letters.json`. It **replaces** the whole set each
run, so the masters are the source of truth.

Expected source layout (all gitignored — see below):

```
PNG Letters_01/0..9/<n>-NN.png
PNG Letters_01/- Special Characters/<name>-NN.png     # asterisk-01.png, at-01.png, ...
PNG_Letters_02/A..Z/<L>-NN.png
```

Current set: **390 cutouts across 54 characters**, up to 10 variants each — the composer
picks one at random per render, so the same message never looks identical twice.
Name-to-character mapping for the special folder lives in `SPECIAL` in
`scripts/import-letters.mjs`; `new-01.png` and `the-01.png` are excluded there because
they're whole words, not characters. There's no apostrophe scrap, so `'` is aliased onto
the quotation cutouts.

Masters are ~1280x1920 at 1–3 MB each. The importer trims each to the paper scrap,
normalises it to 200px tall (so a line of type sits evenly) and recompresses — about
8.6 MB for the full set.

## Source art is not committed

`JPG Textures/`, `PNG Letters_01/` and `PNG_Letters_02/` total roughly **1 GB** and are
gitignored, along with `stickers/_originals/` and `stickers/_duplicates/`. Keep them
locally (and backed up somewhere that isn't this repo) — they're the masters, and the
importers regenerate everything in `public/` from them.

They're excluded because Cloudflare re-clones the repo on every build and GitHub starts
warning past 1 GB. A commit is ~18 MB with them ignored.

> If `git add .` ever seems to hang and stage nothing, it's hashing large files. Let it
> finish — interrupting it leaves nothing staged and prints no error.

### On hold

`stickers/_on-hold/` holds 3 stickers that are recognisable third-party game IP (the Sims
plumbob, a Mario question block, and GTA's "Mission Passed" banner). They are excluded
from the build. Publishing them as free downloads on an AdSense-monetised site risks a
takedown and could complicate AdSense approval. Move them back into `stickers/` and run
`npm run import` if you decide otherwise.

## Adding content

Everything is editable from `/admin` (Sveltia CMS, GitHub backend). Publishing commits to
`main`, which triggers a Cloudflare Pages rebuild.

- **Stickers & Frames** → writes one `.md` file to `src/content/stickers/`, image uploaded
  to `public/stickers/`.
- **Ransom Note Letters** → appends to `src/content/ransomLetters/letters.json`, image
  uploaded to `public/ransom-letters/`. One entry per character *per style variant* —
  upload several images with the same `character` and the composer picks one at random for
  variety. Cover a–z, 0–9 and `. , ! ? ' -` at minimum; spaces are handled automatically.

Sticker images must be alpha-transparent PNGs. Letter cutouts should be roughly square
(~200×200px source).

## Signing in to /admin

Use **"Sign In with Token"** with a **classic** personal access token carrying the
**`repo`** scope. Classic tokens are account-wide, so one token covers this repo and every
other project — no per-repository setup.

Do **not** use a fine-grained token restricted to selected repositories. It authenticates
fine but fails the repo check with *"You don't have access to the 88cutouts-web
repository"* — which looks like a config error and isn't one. The give-away: a fine-grained
token returns an empty `x-oauth-scopes` header from `GET https://api.github.com/user`,
where a classic token lists its scopes.

Two things that catch people out:

- The token is stored in **browser localStorage, per origin**. Signing in on
  `localhost:4321` does not carry to the deployed Worker, and neither carries to
  `88cutouts.com`. Expect to paste it once per origin.
- No OAuth client is configured (`base_url` is commented out in `config.yml`), so the
  token flow is the only way to edit remotely. Sveltia has no hosted OAuth default; the
  Netlify fallback needs an app you never registered, which is why OAuth login fails.

**Editing locally needs no token at all:** `npm run dev`, open
`http://localhost:4321/admin/index.html` in Chrome or Edge (the File System Access API
rules out Firefox and Safari), click **"Work with Local Repository"** and pick the project
root. Changes land on disk; commit them yourself.

## Before first deploy — remaining placeholders

| File | What to set |
| --- | --- |
| `src/components/Footer.astro`, `src/pages/about.astro`, `src/pages/privacy.astro` | Contact email (`hello@88cutouts.com`) |
| `public/admin/index.html` | `@sveltia/cms` is loaded unpinned from unpkg; pin a version to stop an upstream release breaking the admin |
| `public/admin/config.yml` | *(optional)* `backend.base_url` — only if you deploy a `sveltia-cms-auth` Worker for OAuth login |

Already done: `backend.repo` points at `i-am-sarath/88cutouts-web`, and the placeholder art
has been replaced by the real sticker and letter sets.

## Notes on a few implementation choices

- **Fonts are self-hosted** (`public/fonts/`, latin subsets, Quicksand as a variable
  file). Loading them from `fonts.googleapis.com` was render-blocking and cost ~2.2s of
  FCP under mobile throttling — that alone was the difference between Lighthouse
  Performance 84 and 100. `@font-face` rules live at the top of `global.css`; the two
  latin files are `<link rel="preload">`ed in `BaseLayout.astro`.
- **`@astrojs/sitemap` is pinned to `3.2.1`.** 3.7.x uses the `astro:routes:resolved`
  hook, which only exists in Astro 5, and crashes the build on Astro 4. Unpin it when
  the project moves to Astro 5.
- **The ransom canvas is sized to its content**, not the fixed 900×320 in the original
  spec: 140 characters wraps to 8 lines (~555px), which the fixed height clipped. It also
  trims horizontally so a short message doesn't export with wide empty margins — empty
  transparent space makes the sticker smaller once it's pasted into a Story.
- **`--muted` and `--accent-ink` are darker than first drafted** so body text and the
  active category pill clear WCAG AA (4.5:1).
- **Stickers are trimmed and rescaled on import** (`scripts/normalize-sticker.mjs`).
  Cutouts routinely arrive as a 500x500 canvas holding a 100x100 subject — 23% average
  content fill across the first batch. That dead margin made stickers look tiny in the
  grid and pasted into a Story at a fraction of the expected size. Trade-off: a
  low-resolution subject gets upscaled and looks soft (`polka-dot-heart` is the worst
  case, a 5x upscale). Higher-resolution sources avoid this entirely. Adjust `TARGET` in
  `normalize-sticker.mjs` to change it.
- **The grid never serves the download asset.** `public/stickers/*.png` are the full-size
  files that Copy/Download use; `scripts/generate-thumbs.mjs` emits square WebP thumbs
  (200/400/512) for display. Serving the PNGs as 150px thumbnails cost ~1.2 MB per
  gallery page and dropped Performance to 83. The thumbs are square on purpose so the
  `width`/`height` attributes are correct for every sticker and CLS stays at 0.
  `public/stickers/thumbs/` is gitignored and regenerated during `prebuild`.

## Deploy

1. Push to GitHub (`main`).
2. Cloudflare → Workers & Pages → Create → Pages → Connect to Git.
3. Framework preset **Astro**, build command `npm run build`, output directory `dist`.
4. Add custom domain `88cutouts.com`.
5. Deploy the [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) Worker,
   register a GitHub OAuth App (Homepage `https://88cutouts.com`, callback
   `<worker-url>/callback`), set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and
   `ALLOWED_DOMAINS=88cutouts.com`. Then set `base_url` in `config.yml` to the Worker URL.

## Ads

**There are no ad slots in the site right now.** The empty "Sponsored" placeholders were
removed before launch — a boxed placeholder with nothing in it is just dead space, and
AdSense isn't approved yet.

To reintroduce them after approval: restore `src/components/AdSlot.astro` and the
`.ad-slot` rules in `global.css` (both are in git history — see the commit that removed
them), then render `<AdSlot />` every ~12 cards on the gallery and category pages and once
below the fold on sticker and ransom-note pages.

When that happens, keep to the original decisions: **manual ad units only, no Auto Ads**
(Auto Ads inject unpredictably and wreck CLS), give every slot a fixed reserved height so
switching ads on causes no layout shift, and keep each one visibly labelled and boxed —
never styled to pass as a sticker card.

`src/pages/privacy.astro` already discloses the intent to run AdSense, so that page needs
no change either way.
