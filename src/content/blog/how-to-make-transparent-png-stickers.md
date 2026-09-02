---
title: "How to Make Your Own Transparent PNG Stickers (Free Tools, Real Workflow)"
description: "A complete workflow for turning a drawing, a photo or a physical object into a clean transparent PNG sticker — including the edge work that separates a professional cutout from an obvious one."
date: 2026-03-18
category: "guides"
tags: ["stickers", "transparent png", "tutorial", "background removal", "design"]
cover: "/stickers/golden-sun.png"
faq:
  - q: "What is the best free tool to remove an image background?"
    a: "For a quick automatic cut, the background removers built into Photos on iPhone and Google Photos on Android are surprisingly good and completely free. For control over the edge, GIMP and Photopea are free, run on any machine, and let you refine the selection manually."
  - q: "How do I remove a white background without leaving a white outline?"
    a: "Automatic removal keeps semi-transparent edge pixels that still carry white in them. The fix is to shrink the selection by one pixel before cutting, then feather it slightly — or use a tool with a 'decontaminate colours' option, which recalculates edge pixel colour rather than just making it transparent."
  - q: "What size should a sticker PNG be?"
    a: "At least 800 to 900 pixels on its longest edge for anything used at large scale on a Story. Larger than about 1500px is rarely useful and makes the file slow to load and copy."
  - q: "Can I make stickers on my phone only?"
    a: "Yes. Long-press a subject in iOS Photos to lift it out, or use Google Photos' cutout tool on Android, then save as PNG. The results are good on well-separated subjects and less good on hair, fur and fine detail."
---

Making a sticker is two separate jobs. The first is producing an image. The second — the one that actually determines whether it looks good — is getting the edge right. Most guides cover the first and skip the second, which is why so many homemade stickers have a faint white halo you can see the moment you put them on a dark photo.

This covers both, using free tools, with the edge work explained properly.

## Step 1: Get a source image

Three routes, in rough order of how well they turn out.

### Draw it

The most reliable, because you control the background from the start. Draw on a transparent canvas in any app that supports layers — Procreate, Krita, Photopea, Infinite Painter, Medibang. Do not draw on a white layer and cut it out later; delete or hide the background layer and work directly on transparency.

Set the canvas to around 1200 × 1200 px. That is enough to export at 900px with room to crop, and small enough to stay responsive.

### Photograph a physical object

Genuinely underrated, and the reason many paper-cutout stickers look right — they *are* paper. Cut a shape out of card, photograph it flat, cut out the background digitally. You get real paper grain, real edge fibre and real shadow, none of which is easy to fake.

For this to work:

- Shoot on a background that contrasts strongly with the object. A green cutting mat behind a pink bow is easy; white paper behind white lace is not.
- Use soft, even light. A window on an overcast day is ideal. Direct sun creates hard shadows that become part of your cutout.
- Shoot straight down, with the object flat. Perspective distortion on a sticker is very visible once it is placed on someone else's photo.
- Fill the frame. Cropping in later throws away resolution.

### Use an existing image

Only if you have the right to. This is covered properly in [what "free to use" actually means](/blog/free-to-use-images-copyright-explained/), but the short version: "I found it on Pinterest" is not a licence, and stickers made from other people's artwork are the most common reason accounts get takedown notices.

## Step 2: Remove the background

### The fast automatic route

Modern phone tools do this well enough for most subjects:

- **iPhone:** open the photo, long-press the subject until it lifts with a shimmer, then Copy or Share → Save Image. The result is a transparent PNG.
- **Android:** Google Photos → the image → Edit → Cutout tools, or long-press the subject in the Photos viewer on recent versions.
- **Browser:** any of the online background removers. They work, they are fast, and free tiers usually limit output resolution — check what you actually get before relying on one.

These are good on clearly separated subjects with hard edges. They struggle with hair, fur, translucency, thin structures like ribbon tails, and anything whose colour is close to the background.

### The controlled manual route

For anything you care about, use a real editor. GIMP and Photopea are both free; Photopea runs in a browser with no install and uses a Photoshop-like interface.

The workflow:

1. **Open the image and duplicate the layer.** Work on the copy, keep the original untouched.
2. **Make a selection.** For a flat, even background, the magic wand with a tolerance of 20–30 usually gets it in one click. For anything more complex, use the pen or lasso tool and take your time — this is where the quality comes from.
3. **Invert the selection** so the subject is selected rather than the background.
4. **Refine the edge.** Shrink the selection by 1 pixel, then feather by 0.5–1 pixel. This is the step that removes the halo, and it is explained below.
5. **Add a layer mask** from the selection rather than deleting the background. A mask is reversible; a delete is not.
6. **Inspect at 400% zoom** against both a black and a white background layer.

## Step 3: The edge work

This is the part that matters and the part almost every tutorial skips.

### Why the white halo happens

When a cutout is photographed or drawn on a white background, the pixels along its boundary are *mixtures*. A pixel that is 60% object and 40% white background is stored as a single colour — a blend of the two — because a pixel can only hold one colour.

Automatic background removal sets that pixel's alpha to about 60% and leaves its colour unchanged. The colour is still a blend containing 40% white. Composite it onto a light photo and nobody notices. Composite it onto a dark photo and you get a pale outline tracing every edge.

### Three fixes, in increasing order of quality

**Shrink and feather.** Contract the selection by one pixel before masking, then feather slightly. You lose one pixel of the subject and take the contaminated edge with it. Crude, fast, and good enough for most work.

**Colour decontamination.** GIMP, Photopea and Photoshop all have some version of this, usually in a "refine edge" or "decontaminate colours" panel. It recalculates the true colour of each partially transparent pixel by mathematically removing the background contribution. This is the correct fix and it preserves the soft edge.

**Rebuild the edge.** For a small number of important stickers, mask generously, then paint the outer one or two pixels back in with the object's own colour at reduced opacity. Slow, and the results are as good as it gets.

### Checking your work

Put the finished cutout on three backgrounds: black, white, and a mid-grey. Zoom to 200%.

- Halo on black, clean on white → white contamination remains. Shrink further or decontaminate.
- Halo on white, clean on black → black contamination, usually from a dark background or a shadow.
- Staircase jaggies on curves → the alpha is binary rather than graded. You saved as PNG-8, or your selection had no anti-aliasing.
- Clean on all three → done.

## Step 4: Trim, size and export

**Trim to content.** Crop tightly to the visible pixels, leaving perhaps 2–4 pixels of transparent margin so the anti-aliased edge is not clipped. Large empty margins make the file bigger and make the sticker awkward to position — when someone scales it in Instagram, they are scaling the invisible box too.

**Size it.** Resize so the longest edge is 900–1200 px. Anything used large on a Story wants at least 800. Anything beyond about 1500 is wasted, since the destination will scale it down anyway.

**Export as PNG-32.** In Photopea: File → Export As → PNG. In GIMP: File → Export As, with a `.png` extension, and make sure "Save background colour" is off. Verify the exported file still has transparency by opening it in a viewer with a dark background — do not trust the editor's own preview.

**Do not run it through a generic image optimiser** without checking the result. Many optimisers reduce PNG-32 to PNG-8 to save space, which converts your carefully graded alpha into a binary mask and undoes all the edge work.

## Step 5: Test it in the wild

The final check is the only one that counts. Put the sticker onto an actual Story, at the size you intend to use it, over both a light and a dark photo. Things that only become visible here:

- Edge halo you missed at 400% zoom but which is obvious at Story scale.
- A subject that reads clearly at 100% and turns into a blob at 30%.
- Detail too fine to survive Instagram's compression.
- A shape that turns out to be much less interesting once it is not on a white page.

The methods for getting it onto a Story cleanly are covered in [how to add stickers to Instagram Stories](/blog/how-to-add-stickers-to-instagram-stories/).

## Design notes, briefly

Since you now have the technical parts, a few things about what makes a sticker useful rather than merely clean:

- **Silhouette first.** A sticker is recognised by its outline before anything else. If the silhouette is ambiguous, no amount of interior detail rescues it.
- **Give it a shadow.** A soft drop shadow at 15–25% opacity, offset a few pixels, makes a cutout sit *on* a photo rather than *in front of* it. Bake it into the PNG using semi-transparent pixels — this is one of the best arguments for a full alpha channel.
- **Design for small.** Most stickers are used at 20–40% of screen width. Check yours at 200px before deciding it works.
- **Leave one asymmetry.** Perfectly symmetrical cutouts read as clip art. A slightly uneven cut, an off-centre knot, one longer ribbon tail — these read as hand-made.

## If you would rather not

All of the above takes a while, and there is no shame in skipping it. The [sticker library here](/) is a few hundred cutouts already prepared this way — PNG-32, decontaminated edges, trimmed to content, normalised to a 900px maximum edge — and free for personal use. The [ransom-note typewriter](/ransom-note/) generates lettering the same way, and the [DP maker](/dp-maker/) composes a circular cutout from your own photo entirely in the browser.

But knowing the workflow is worth having anyway, if only because it tells you immediately whether a sticker from anywhere else was made properly.
