---
title: "PNG, JPG, WebP, SVG: Which Image Format to Use and Why"
description: "A practical comparison of the four formats that matter, what each one is actually good at, why lossy and lossless is the wrong first question, and a decision table you can use without thinking about it again."
date: 2026-03-11
category: "technical"
tags: ["png", "jpeg", "webp", "svg", "image formats", "file size"]
cover: "/stickers/retro-pixel-computer.png"
faq:
  - q: "Should I use PNG or JPG?"
    a: "PNG for anything with transparency, flat colour, or text and sharp edges — logos, screenshots, illustrations, stickers. JPG for photographs with no transparency. If the image has both photographic content and transparency, PNG is the only one of the two that can carry it."
  - q: "Is WebP better than PNG?"
    a: "For file size, usually yes — WebP supports both lossy and lossless compression and an alpha channel, and typically produces smaller files than PNG at the same visual quality. Its weakness is compatibility with older software and some apps that expect a PNG specifically."
  - q: "Why are my PNG files so large?"
    a: "PNG compression is lossless, so it cannot discard detail. It is very efficient on flat colour and large uniform areas, and very inefficient on photographic noise. A photograph saved as PNG can easily be five to ten times larger than the same image as a good-quality JPG."
  - q: "When should I use SVG?"
    a: "When the image is genuinely made of shapes — logos, icons, simple illustrations, charts. SVG scales to any size with no quality loss and is usually tiny. It is unsuitable for photographs or for anything with painterly texture."
---

Most format advice reduces to "PNG for graphics, JPG for photos", which is correct as far as it goes and explains none of the cases where people actually get stuck. This is the longer version: what each format stores, what it throws away, and how to choose without having to remember a table.

## The one question that decides most of it

Before lossy versus lossless, before file size, ask: **does this image need transparency?**

If yes, you have exactly two mainstream options — PNG and WebP — and the decision is essentially made. JPEG cannot store transparency at all. There is no quality setting, no export option, no plugin; the format has no alpha channel. Any tool that appears to save a transparent JPG has silently flattened it onto a background.

If no, then the second question is **is this a photograph?** Photographs compress well with lossy methods and badly with lossless ones; graphics are the reverse.

Those two questions resolve perhaps ninety percent of real cases.

## JPEG

**What it is:** a lossy format from 1992, designed specifically for photographs, and still the default for essentially all camera and social output.

**How it works:** JPEG exploits properties of human vision. It converts the image from RGB to a brightness-plus-colour representation, then throws away colour detail more aggressively than brightness detail, because the eye is much more sensitive to luminance than to chrominance. It then divides the image into 8×8 blocks and discards the high-frequency components within each block — the fine variations you are least likely to notice.

**What it is good at:** photographs, especially with gradual tonal variation. A 3000×2000 photo that would be 15 MB as PNG is commonly 1.5–2 MB as a high-quality JPEG with no visible difference.

**What it is bad at:**

- **Transparency.** Not supported, at all.
- **Sharp edges.** The block-based approach produces "ringing" — faint halos — around high-contrast boundaries. This is why text in a JPEG screenshot looks fuzzy and slightly haloed.
- **Flat colour.** A large area of one colour should compress to almost nothing. JPEG instead introduces subtle blotchiness across it.
- **Repeated editing.** Every save re-encodes and loses more. Editing and re-saving the same JPEG ten times produces visible degradation.

**Quality settings, practically:** 90–95% is visually indistinguishable from the original for most images. 80–85% is the sweet spot for web use. Below 70% artefacts become visible in skies and skin. Above 95% file size climbs steeply for nothing.

## PNG

**What it is:** a lossless format from 1996, created partly as a patent-free replacement for GIF, and the standard for graphics with transparency.

**How it works:** PNG applies a per-row *filter* that predicts each pixel from its neighbours and stores the difference, then compresses the result with DEFLATE. On images where neighbouring pixels are similar — flat colour, smooth gradients, repeated patterns — the differences are mostly zero and compress enormously. On photographic noise, where every pixel differs unpredictably from its neighbour, there is nothing to exploit.

**What it is good at:**

- **Transparency**, with a full 8-bit alpha channel. This is its defining feature.
- **Screenshots**, text, UI, line art — anything with hard edges and flat regions.
- **Repeated editing.** Lossless means opening and re-saving costs nothing.

**What it is bad at:** photographs. A large photo as PNG is often five to ten times the size of an equivalent JPEG, with no visible benefit.

**Variants worth knowing:**

- **PNG-32** — full RGB plus 8-bit alpha. The one you want for cutouts and stickers.
- **PNG-24** — full RGB, no alpha.
- **PNG-8** — a palette of at most 256 colours, with optional binary transparency: each pixel is either fully opaque or fully invisible. Much smaller, and it destroys soft edges. If a sticker has visible staircase jaggies on its curves, it went through PNG-8 at some point.

Every cutout on this site is PNG-32 for exactly that reason — the soft anti-aliased edge is the difference between a cutout that sits on a photo and one that is stuck to it.

## WebP

**What it is:** a format Google released in 2010, now supported by every current browser.

**How it works:** WebP has two distinct modes. Lossy WebP derives from the VP8 video codec and uses block prediction, which is generally more efficient than JPEG's approach. Lossless WebP uses a different scheme with a colour cache and better entropy coding than PNG's DEFLATE.

**What it is good at:** almost everything, size-wise. Lossy WebP typically comes in 25–35% smaller than a JPEG of equivalent quality. Lossless WebP is typically 20–30% smaller than PNG. It supports an alpha channel in *both* modes, which is genuinely useful — it means you can have a lossily-compressed image with transparency, something JPEG could never do and PNG could only do at lossless sizes.

**What it is bad at:** being a PNG. That sounds glib, but it is the real limitation. Plenty of apps, print workflows, older design software and platform upload fields expect PNG or JPEG specifically. WebP is excellent for *displaying* images on the web and unreliable as an interchange format.

That distinction is exactly how this site uses it: gallery thumbnails are generated as WebP because they only ever need to be displayed in a browser, while the download and clipboard-copy paths always hand over the original PNG, because that file has to work in Instagram, in editing apps, and anywhere else you take it.

## SVG

**What it is:** not a bitmap at all. SVG is an XML document describing shapes — paths, circles, rectangles, text — that the renderer draws at whatever size is asked for.

**What it is good at:**

- **Infinite scaling.** The same file is crisp on a watch and on a billboard.
- **Tiny file sizes** for geometric artwork. A logo that is 40 KB as a PNG might be 2 KB as an SVG.
- **Programmatic control.** Colours can be changed with CSS, parts can be animated, elements can respond to interaction.

**What it is bad at:** anything photographic or painterly. There is no way to express a photograph as shapes without either embedding a bitmap inside the SVG (which defeats the purpose) or generating tens of thousands of paths (which makes a file larger and slower than the bitmap it replaced).

**The subtlety people miss:** an SVG containing an embedded base64 bitmap is not vector art. Auto-tracing tools sometimes produce these, and they are worse than the original in every respect.

## AVIF, briefly

Worth a mention. AVIF derives from the AV1 video codec and generally beats WebP on compression, sometimes substantially, with alpha support and wide colour. Browser support is now broad.

The reasons not to reach for it by default: encoding is slow, tooling support outside browsers is still patchy, and at very low bitrates its failure mode is a smeary, over-smoothed look that some people find worse than JPEG's honest blockiness. It is a good third option in a `<picture>` element with WebP and JPEG fallbacks, and a poor choice for a file you intend to hand to someone.

## The decision table

| Content | Needs transparency | Best choice | Fallback |
| --- | --- | --- | --- |
| Photograph, web display | No | WebP (lossy) | JPEG 85% |
| Photograph, to send or archive | No | JPEG 92% | PNG if editing |
| Sticker or cutout | Yes | PNG-32 | WebP lossless |
| Screenshot | No | PNG | WebP lossless |
| Logo or icon | Usually | SVG | PNG-32 |
| Illustration, flat colour | Either | SVG or PNG | WebP lossless |
| Profile picture upload | No | JPEG 90% | PNG |
| Anything going to print | No | TIFF or PNG | High-quality JPEG |

## Three rules that prevent most problems

**1. Never convert lossy to lossy.** Every JPEG-to-JPEG round trip loses information. If you must edit a JPEG, do all your edits in one session and save once. If you will edit repeatedly, work in PNG or a native editor format and export JPEG only at the end.

**2. Downscale before compressing, not after.** Reducing a 4000px image to 1080px removes far more file size than any quality setting will, and it removes it without artefacts. Resize first, then choose a quality level.

**3. Match the format to the destination, not to your preference.** A profile picture field will re-encode whatever you give it, so a 12 MB PNG buys you nothing over a 400 KB JPEG. A Story sticker must be PNG or the transparency dies. The destination decides.

## Why file size still matters

It is tempting to think bandwidth solved this. It did not, for two reasons.

Mobile networks are wildly variable — the same phone that loads a page instantly on wifi may take eight seconds on a congested cell. And image bytes compete with each other: a gallery of a hundred full-size PNGs does not load a hundred times slower than one, it loads badly, because the browser is fighting for connections and the largest image blocks the ones people can actually see.

That is the practical argument for the split this site uses, and for the split most well-built galleries use: small modern-format images for browsing, original files for taking away. Optimise the looking, never the thing you hand over.
