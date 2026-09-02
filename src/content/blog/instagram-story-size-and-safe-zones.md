---
title: "Instagram Story Dimensions and Safe Zones, Measured Properly"
description: "1080×1920, 9:16, and the parts of it you cannot actually use. A measured guide to Story safe zones, the tap targets that eat your design, and how to lay out a Story that survives every phone."
date: 2026-02-04
category: "instagram"
tags: ["instagram", "stories", "dimensions", "safe zone", "design"]
cover: "/stickers/retro-film-camera.png"
faq:
  - q: "What is the correct Instagram Story size?"
    a: "1080 × 1920 pixels, an aspect ratio of 9:16. Instagram accepts other ratios between 1.91:1 and 9:16, but anything narrower than 9:16 gets letterboxed and anything taller gets cropped."
  - q: "How big is the Instagram Story safe zone?"
    a: "Keep important content inside a centre band roughly 1080 × 1420 px — that means leaving about 250 px clear at the top and about 250 px at the bottom of a 1920 px canvas. Interface elements sit in those margins on most phones."
  - q: "Why does my Story get cropped on some phones?"
    a: "Because phone screens are not all 9:16. Taller displays fill the screen by scaling your image up and cropping the sides slightly; shorter or wider ones crop the top and bottom. Designing inside the safe zone makes this invisible."
  - q: "Does Instagram reduce Story quality?"
    a: "It re-encodes every upload. Uploading at exactly 1080 × 1920 avoids a resize step, which is the main thing you control. Uploading at 4K gets downscaled anyway and often looks worse after Instagram's compressor works on it."
  - q: "What file format is best for Instagram Stories?"
    a: "JPEG at high quality for a finished full-bleed Story, since it will be re-encoded to JPEG regardless. Use PNG only when you need transparency preserved — for example a sticker you are pasting onto a Story rather than the Story background itself."
---

Most guides to Story dimensions give you one number — 1080 by 1920 — and stop. That number is correct and almost useless on its own, because the interesting part is not the canvas, it is how much of the canvas you can actually use. This piece covers the measurements, the reasons behind them, and how to lay out a Story so it works on every phone rather than only on the one you designed it on.

## The canvas

**1080 × 1920 pixels. Aspect ratio 9:16. Roughly 0.5625:1.**

Instagram accepts uploads from 1.91:1 (wide landscape) through to 9:16 (tall portrait). Anything within that range is displayed; anything outside it is cropped to fit. In practice there is only one sensible choice, because 9:16 is the only ratio that fills a phone screen without bars or cropping.

Two things about that resolution are worth knowing:

**1080 is a target, not a maximum.** Instagram will accept a 2160 × 3840 upload and downscale it. There is no quality advantage, and there are two disadvantages: a slower upload, and an extra resampling step whose algorithm you do not control. If your source is larger, resize to 1080 × 1920 yourself with a tool you trust, then upload.

**Under 1080 wide is a real penalty.** Instagram will upscale a 720 × 1280 upload to fill the screen, and upscaling is where images visibly soften. If you are exporting from a design tool, set the canvas to 1080 × 1920 rather than a smaller convenient number.

## The safe zone, in numbers

Instagram draws its own interface on top of your Story. That interface is not consistent across app versions, phone shapes or feature sets, which is why the safe zone is a rule of thumb rather than a fixed rectangle. The useful approximation:

- **Top margin: ~250 px.** Your profile chip, username, timestamp, the progress bars for each Story segment, and the ⋯ menu.
- **Bottom margin: ~250 px.** The reply field, the share and like controls, and on Reels-adjacent surfaces a caption area.
- **Side margins: ~60 px each.** Less critical, but Story rings and some action buttons intrude at the edges on wide phones.

That leaves a usable band of roughly **1080 × 1420 px, centred vertically**, and a comfortable one of about **960 × 1420** once you account for the sides.

If you take one number away from this article, take that: **anything that must be seen goes in the middle 1420 pixels.**

## Why the margins are not fixed

Phones stopped being 9:16 around 2017. Modern displays run from about 19.5:9 (iPhone) to 21:9 (some Sony and Xiaomi models) and beyond. Foldables are their own category entirely.

When a taller-than-9:16 screen displays a 9:16 Story, Instagram scales the image to fill the height and crops horizontally, or scales to fill the width and adds vertical padding — the behaviour has varied by version. Either way, the relationship between "the pixels in your file" and "the pixels a specific person sees" is not one-to-one, and it differs per device.

This is the real argument for the safe zone. It is not that Instagram's UI is exactly 250px tall on your phone; it is that you cannot know how much of your top and bottom will be visible on someone else's. Designing with margins makes the question irrelevant.

## Layout patterns that work

### The centred single element

One large subject in the middle, empty space above and below. It is the most forgiving layout that exists, because the safe zone problem simply cannot bite it. Almost all high-performing Stories are some version of this.

Practically: a photo as the background, one [large cutout](/) overlapping the subject, and nothing else. Resist the urge to fill the empty space — the empty space is what makes the subject read.

### The stacked thirds

Divide the safe band into three horizontal thirds: a heading zone, a content zone, a call-to-action zone. Text at the top of the safe band, the main image or point in the middle, a swipe-up or a question sticker at the bottom.

The failure mode here is putting the call-to-action too low. If it drifts into the bottom 250px, it collides with Instagram's reply bar and becomes both invisible and untappable.

### The scrapbook

Multiple overlapping cutouts on a plain or blurred background, deliberately un-aligned. Covered in more detail in [the collage guide](/blog/digital-scrapbook-collage-guide/), but the layout rule is the same: keep the whole arrangement inside the safe band, and let it be dense in the middle rather than spread to the edges.

### The full-bleed photo with one accent

A photograph filling the frame, with a single small cutout — a [sparkle](/stickers/blue-sparkle-stars/), a bow, a torn paper scrap — placed at a visual rest point. This is the layout most people are actually reaching for when they browse a sticker library. It works because the photo does the composing and the sticker only has to punctuate it.

## Tap targets: the invisible constraint

Everything on a Story is also a *touch surface*, and Instagram claims a lot of the screen for its own gestures:

- **Tap the right half:** next Story.
- **Tap the left half:** previous Story.
- **Swipe up:** reply, or open a link.
- **Swipe down:** dismiss.
- **Long press anywhere:** pause.

The consequence: your Story has no interactive area of its own except the interactive stickers Instagram provides — polls, questions, links, music, product tags. A picture of a button is not a button, and asking people to "tap the link below" when there is no link sticker just makes them advance to the next Story.

Interactive stickers also need room. A poll sticker is about 250px tall at default size and needs finger clearance around it. Two interactive stickers on one Story usually means neither gets used, because people default to the easier one and move on.

## Text on Stories

Instagram's own text tool is genuinely good, and there is a strong argument for using it rather than baking text into your uploaded image: it renders at native device resolution rather than being compressed as part of a JPEG. Baked-in text at small sizes picks up JPEG ringing artefacts around the letterforms; Instagram-rendered text does not.

Sizing guidance, for the default fonts:

- **Headline:** large enough that it reads at a glance while someone's thumb is already moving. In practice that means 60–90px at 1080 wide, which is bigger than most people's instinct.
- **Body:** rarely worth it. If your point needs more than about twelve words, it is a carousel or a Reel, not a Story.
- **Caption or credit:** small is fine, but keep it inside the safe band anyway.

If you want a decorative or hand-cut look that Instagram's fonts cannot produce, that is exactly what the [ransom-note typewriter](/ransom-note/) is for — type your message, get back a transparent PNG of cut-out letters, and paste it as a sticker. Because it is an image, keep it larger than you would keep live text, and keep it well inside the safe zone.

## Export settings

For a finished, full-bleed Story:

- **Format:** JPEG. It is going to be re-encoded to JPEG regardless, so exporting PNG just makes the upload larger without improving the result.
- **Quality:** 85–90%. Above that, file size climbs steeply for no visible gain after Instagram's own pass.
- **Colour profile:** sRGB. Instagram assumes sRGB. Exporting in Display P3 or Adobe RGB gives you the classic symptom of colours that look correct in your editor and dull or oversaturated in the app.
- **Dimensions:** exactly 1080 × 1920.

For a sticker or overlay you intend to paste onto a Story:

- **Format:** PNG with an alpha channel. This is the case where PNG is mandatory.
- **Size:** at least 800–900px on the longest edge, so it stays sharp when scaled up on the canvas.
- **No baked background.** If it has a white rectangle behind it, it is not a sticker.

## Common mistakes, in the order people make them

1. **Designing at 1080 × 1920 and using every pixel.** The corners and edges are not yours.
2. **Screenshotting a design instead of exporting it.** You get your phone's screen resolution rather than the canvas resolution, and any transparency is lost.
3. **Uploading a square image.** It gets pillarboxed with a blurred or gradient fill, which nearly always looks like an accident.
4. **Too many elements.** A Story is watched for about three to five seconds. Anything requiring a second read is not read.
5. **Low-contrast text over a busy photo.** Add a scrim — a semi-transparent dark rectangle behind the text — or move the text over a quiet region of the image.
6. **Ignoring the reply bar.** The bottom 250px is Instagram's, not yours, and it is where people put their most important line remarkably often.

## A short checklist before you post

- Canvas is 1080 × 1920, exported sRGB JPEG at ~88%.
- Everything essential sits inside the middle 1420px.
- One clear subject; the eye knows where to land within half a second.
- Text is large, high-contrast, and under a dozen words.
- At most one interactive sticker, with clearance around it.
- Any pasted cutout is a real alpha PNG, not a screenshot.

Get those six right and your Story will look the same on a five-year-old Android as it does on the phone you made it on — which is more than most Stories manage.
