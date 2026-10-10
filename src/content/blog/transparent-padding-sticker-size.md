---
title: "Why a Large PNG Can Paste as a Tiny Sticker"
description: "Use canvas and artwork dimensions to diagnose transparent padding, calculate usable size and trim without stretching."
date: 2026-09-26
category: technical
tags: [dimensions, cropping, PNG]
cover: /stickers/golden-sun.png
---

A 900-pixel-wide PNG may contain a subject only 300 pixels wide. The rest of the canvas can be transparent. When an app fits the entire file into a 300-pixel box, the visible subject becomes only 100 pixels wide. The file is large; the artwork inside it is not.

## Measure the visible area

Check the file dimensions first, then inspect the bounds of the non-transparent artwork. Some editors call the command trim, crop to content, or crop to selection. Keep the original file until you have verified the crop.

![A small subject inside a large transparent canvas compared with the same subject in a trimmed canvas.](/guides/padding.svg)

On sticker detail pages, 88cutouts lists artwork dimensions separately when its measured margin is substantial. That distinction is more useful than treating the outer canvas as the available detail.

## Work through the scale calculation

Suppose the file is 900 pixels wide and the subject spans 300 pixels. Displaying the file at 450 pixels gives the subject a visible width of `300 × 450 ÷ 900 = 150` pixels.

Trim the file to the subject's 300-pixel width and display it at 150 pixels: the appearance is the same size, but placement handles now fit the subject more closely. Cropping has removed empty space; it has not created additional detail.

If you enlarge that cropped 300-pixel subject to 600 pixels, you are still enlarging it twofold. A tighter canvas does not make it a high-resolution asset.

## Leave purposeful breathing room

Do not crop so tightly that soft shadows or partly transparent edge pixels are clipped. If the sticker will be rotated, a small margin can make editing easier. The useful distinction is between intentional breathing room and an enormous empty canvas that makes placement awkward.

For frames, transparent space inside the border is part of the design. Crop only the unnecessary outer margin; cropping to a single visible corner would destroy the frame.

## Verify the result

Export a new PNG with a different filename and reopen it. Compare against light and dark backgrounds, then add it to the same composition at a known size. Check that no whiskers, shadows or ribbon ends disappeared.

If the cropped version still looks soft, investigate [enlargement and raster resolution](/blog/why-stickers-look-blurry/). If the artwork is sharp but misplaced, the issue is layout rather than file quality.
