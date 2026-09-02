---
title: "Why Your Transparent PNG Turns Grey (and Where Transparency Actually Survives)"
description: "Alpha channels, flattening, matte fringing and JPG re-encoding — a plain-English explanation of why transparent images break on some apps and not others, with a survival table for every major platform."
date: 2026-01-21
category: "technical"
tags: ["png", "transparency", "alpha channel", "image formats", "instagram"]
cover: "/stickers/torn-kraft-paper-scrap.png"
faq:
  - q: "Why does my PNG look transparent on my phone but grey on Instagram?"
    a: "Your phone's gallery draws transparent pixels over a checkerboard or a white sheet, so it looks fine. Instagram's feed compositor flattens the image onto a fixed background before it publishes, and its chosen background is mid-grey. Nothing is wrong with your file; the destination simply does not keep alpha."
  - q: "Does saving a PNG as a JPG remove transparency?"
    a: "Yes, always. JPEG has no alpha channel, so every transparent pixel has to be assigned a colour during conversion. Most tools use white, some use black, and the result is permanent — converting back to PNG does not bring the transparency back."
  - q: "What is the grey checkerboard I see in image editors?"
    a: "It is a display convention, not part of the image. Editors draw a light grey checkerboard behind transparent areas so you can tell 'nothing here' apart from 'white here'. It is never exported with the file."
  - q: "Why does my cutout have a faint white outline on a dark background?"
    a: "That is matte fringing. The semi-transparent pixels around the edge of the cutout still carry a little of the white background the image was originally composed on. It is invisible on light photos and obvious on dark ones."
  - q: "Which apps keep PNG transparency?"
    a: "Instagram Stories, Reels overlays, DMs and Notes keep it. WhatsApp keeps it if you send the file as a Document, not as a photo. Instagram feed posts, Facebook feed posts and most photo-compression pipelines flatten it."
---

If you have ever downloaded a clean cutout, dropped it somewhere, and watched it acquire a grey or white rectangle, this article is the explanation. It is not a long list of settings to try — it is one concept, explained properly, after which the behaviour of every app you use becomes predictable.

## Every image is a grid of numbers

A digital image is a rectangle of pixels, and each pixel is a set of numbers. In the ordinary case there are three: how much red, how much green, how much blue. Eight bits each, so 0–255 per channel, which is where "24-bit colour" comes from.

That model has no way to express *absence*. Every pixel in an RGB image has a colour. There is no value that means "there is nothing here" — the closest you can get is white, which is a colour like any other.

The fix is a fourth number per pixel: **alpha**. Alpha records opacity, again 0–255, where 0 means fully transparent and 255 means fully opaque. A PNG with an alpha channel is a 32-bit image: red, green, blue, alpha. That extra channel is the entire difference between a sticker that sits on your photo and a sticker that arrives in a box.

The values in between matter more than people expect. A hard-edged cutout with only 0 and 255 alpha values looks jagged and cheap, because screen pixels are square and diagonal edges are not. Real cutouts have a one-to-three-pixel border of partial alpha — 40%, 130%, 200 out of 255 — which is what makes an edge read as smooth. Semi-transparency is also how you get soft drop shadows underneath a paper cutout, and how a piece of tulle or a glass highlight can be see-through without being invisible.

## Flattening: the thing that actually goes wrong

**Flattening** is the operation of taking an image with alpha and producing one without it. To do that, a program has to answer a question the file cannot answer for itself: *what is behind this?*

The formula is simple. For each pixel, with alpha as a fraction from 0 to 1:

`result = (foreground × alpha) + (background × (1 − alpha))`

If the program picks white as the background, your cutout ends up on a white sheet. If it picks black, black. If it picks the mid-grey many social pipelines default to, you get the grey box that sends people looking for answers.

Flattening is not a bug. It is a required step any time an image has to be written into a format or a pipeline that cannot carry alpha. The two things worth understanding are *when* it happens and *what background gets chosen*.

## Where transparency survives, and where it does not

| Destination | Keeps alpha? | Notes |
| --- | --- | --- |
| Instagram Story | Yes | Both pasted images and photo stickers |
| Instagram Reels overlay | Yes | Same compositor as Stories |
| Instagram feed post | No | Flattened, usually to grey or white |
| Instagram DM | Yes | Sent as an image attachment |
| Instagram Notes | Yes | Small, but alpha is preserved |
| WhatsApp, sent as photo | No | Re-encoded to JPEG on send |
| WhatsApp, sent as Document | Yes | The file arrives byte-identical |
| WhatsApp profile picture (DP) | No | Cropped to a circle, then flattened |
| Telegram, sent as photo | No | Compressed to JPEG |
| Telegram, sent as file | Yes | Original preserved |
| Discord upload | Yes | PNGs are kept as PNGs |
| Snapchat sticker import | Yes | Alpha respected on import |
| Email attachment | Yes | Attachments are not re-encoded |
| Google Docs / Slides | Yes | Both keep PNG alpha |
| Most printing services | No | CMYK printing has no alpha |

The pattern behind that table is worth naming: **transparency survives when a file is transported, and dies when a file is republished.** Anything that re-encodes for bandwidth or composes a fixed-size output will flatten. Anything that just hands the bytes along will not.

## Why the feed flattens and Stories do not

It is a reasonable question — same app, opposite behaviour.

A Story is a *composition*. Instagram builds it live in the editor: a background layer, then text layers, then sticker layers, drawn on top of each other every frame. In that model, alpha is essential; without it, no sticker could ever sit on a photo. The composition is only flattened at the very end, when the finished Story is encoded — and by then your sticker has something behind it.

A feed post is a *photograph*. Instagram's feed pipeline expects a rectangular image of known dimensions to display in a grid, and it re-encodes uploads aggressively — JPEG at a target quality, resized to standard widths. JPEG has no alpha channel, so the flattening step is unavoidable, and it happens before your image ever reaches anyone's screen.

Once you see this split, most app behaviour becomes guessable. Ask "is this thing a layer in a composition, or a finished photo being republished?" and you will usually get the right answer.

## Matte fringing: the subtle failure

There is a second, quieter problem that survives even when alpha does.

Say a designer draws a cutout on a white canvas, then cuts it out. The interior pixels are clean. But the edge pixels — the ones that were 50% cutout and 50% white canvas — now carry a colour that is *half white*, plus an alpha value of 128. That is stored faithfully in the PNG.

Composite that onto a light photo and it is invisible; the white in the edge blends into a light background. Composite it onto a dark photo and every edge pixel is now half-white against near-black, and your cutout gets a pale halo tracing its outline.

This is called **matte fringing**, and it is the difference between a cutout that looks professionally prepared and one that looks like it was lifted from somewhere. The correct fix is *unmultiplying*: reconstructing the true colour of each edge pixel by dividing out the background contribution, so the stored colour is the object's own colour rather than a blend. Well-prepared cutouts do this. Search-result PNGs mostly do not.

You can test any sticker in ten seconds. Put it on a black background and a white one. If it looks equally clean on both, the matte is correct. If it grows a light halo on black or a dark halo on white, it does not.

## The screenshot problem

The single most common reason people end up with an opaque file is that they screenshotted instead of downloading.

A screenshot is a capture of the composited display buffer. By the time pixels reach your screen they have already been drawn over whatever was behind them — a white page, a dark app background, a checkerboard preview. There is nothing left to recover. No amount of "remove background" tooling brings back the original alpha; the best it can do is guess a new one, which on a soft-edged cutout means throwing away exactly the semi-transparent pixels that made it look good.

This is why every sticker page here has an explicit **Download** button that hands over the original file, and a **Copy** button that puts the real image bytes on your clipboard rather than a rendered picture of the page. Both preserve alpha. Screenshots never will.

## Indexed transparency vs alpha transparency

One more distinction, because it explains jagged edges.

PNG supports two kinds of transparency. The older one is **indexed** or binary transparency, common in PNG-8 and GIF: one colour in a small palette is designated "transparent", and every pixel is either that colour or not. There is no partial opacity at all. It compresses beautifully and it looks terrible on curves — hard staircase edges, no soft shadow, no anti-aliasing against the background.

The newer one is **alpha** transparency, PNG-32: a full 0–255 opacity value per pixel. Larger files, but it is the only one that can represent a soft edge.

If a cutout has visible stair-steps on its diagonals, it was almost certainly saved as PNG-8 somewhere along the way — often by an "optimiser" that reduced file size by throwing away the alpha channel. That trade is usually not worth it for cutouts, where the edge quality is the whole product.

## Practical rules

Everything above collapses into a short list:

1. **Download, never screenshot.** This solves most cases on its own.
2. **Send as a file, not as a photo,** whenever a chat app is in the path.
3. **Use Stories, not the feed,** if you need transparency on Instagram.
4. **Check on both black and white** before trusting a cutout from an unknown source.
5. **Keep PNG as PNG.** Any conversion to JPG is one-way, and no later conversion undoes it.
6. **If you need a finished square with a background** — a profile picture, for example — flatten it yourself onto a background you chose, rather than letting a platform choose grey for you.

That last one is worth expanding. If you are making a [profile picture](/dp/), do not upload a transparent PNG and hope. Put a background behind it deliberately — a colour, a gradient, a photo — and upload the flattened result. You get to make the decision instead of discovering what WhatsApp's default was. The [DP maker](/dp-maker/) on this site does exactly this: it composes your photo, a background and any cutouts you add into one square image, then hands you the finished file.

## The mental model, in one sentence

Alpha is a per-pixel record of *how much of what is behind should show through* — so the moment an app decides there is nothing behind, it has to invent something, and grey is what it invents.
