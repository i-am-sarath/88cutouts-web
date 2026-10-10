---
title: "Reduce PNG File Size Without Flattening Transparency"
description: "Choose between cropping, resizing and compression by checking what each operation changes in the actual artwork."
date: 2026-09-26
category: technical
tags: [compression, PNG, dimensions]
cover: /stickers/golden-sun.png
---

A smaller file is easier to store and transfer, but a smaller byte count is not useful if the sticker loses its soft edges. Start with the image's intended display size and preserve a master before trying to reduce it.

## Remove unnecessary canvas first

Trim excessive outer transparent margins, while leaving shadows and fine details intact. Empty pixels often compress well already, so this may not save many bytes. Its larger benefit can be more predictable placement in the destination app.

Next inspect the artwork dimensions. A 3000-pixel cutout used as a 200-pixel accent may be larger than needed. Reduce a copy to a size that still covers the intended use, then compare both versions at that size.

![A source image passing through crop, resize and saved-file inspection as separate decisions.](/guides/export-flow.svg)

## Distinguish compression from simplification

Lossless PNG optimization changes how pixel data is stored without changing the decoded image. Colour reduction, resizing and alpha simplification change the image itself, even when the output filename still ends in PNG.

An optimizer may offer several modes, so read its settings rather than assuming everything labelled compression is lossless. Keep the result under a new filename until you have compared it with the original.

## Check the vulnerable parts

Flat icons with a few colours may tolerate palette reduction well. Photographic fur, soft shadows and gradients are less forgiving. Look for banding in the shadow, rough steps along curves and unexpected outlines over dark backgrounds.

Do not judge only on a white page. The alpha channel can appear fine there while revealing damage on a dark photo. The [two-background transparency test](/blog/check-png-transparency/) is useful after every operation that may change pixels.

## Make the tradeoff explicit

Record original dimensions, output dimensions and file sizes. For example, a file reduced from 800 KB to 250 KB may be a good result if it still looks clean at its planned size. The same byte saving is a bad result if the name on a birthday design becomes unreadable.

Keep the master for future larger uses. Never assume a compressed copy can later be enlarged back into the original detail. If your destination supports another transparent format, consult its requirements before switching; [PNG, WebP and other formats](/blog/png-jpg-webp-svg-image-formats/) serve different workflows. The [PNG specification](https://www.w3.org/TR/png-3/) is the reference for how the format represents image data.
