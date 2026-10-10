---
title: "How to Check Whether a PNG Is Actually Transparent"
description: "Separate a real alpha channel from a white preview or a baked-in checkerboard using a two-background test."
date: 2026-09-26
category: technical
tags: [PNG, transparency, troubleshooting]
cover: /stickers/golden-sun.png
---

A filename ending in `.png` does not prove that the image has transparent pixels. PNG can store an opaque image too. Before you spend time trying different paste methods, check the file itself: the problem may be in the image rather than in the destination app.

## Test against two backgrounds

Open the downloaded file in an editor that supports layers. Put a solid cream layer underneath it, then change that layer to dark blue. Keep the PNG on its own layer throughout the test.

![A transparent circle on light and dark layers compared with a circle trapped inside a white rectangle.](/guides/transparency-test.svg)

If the surrounding area changes with the layer underneath, it is transparent. If a white rectangle stays visible, those white pixels belong to the image. If a checkerboard stays visible on both backgrounds, the checkerboard was saved into the artwork; it is not the editor's transparency display.

A grey or black background in a file viewer is inconclusive. Viewers choose different colours for empty pixels. The two-layer test removes that ambiguity.

## Inspect the boundary separately

An image can pass the background test and still have a pale fringe. Zoom into the outline, especially around fur, ribbon tails and soft shadows. A thin light rim on the dark test layer suggests the edge retained colour from its previous background.

Do not solve that by deleting every partly transparent pixel. Soft edges need intermediate opacity to look smooth. Follow the [halo correction workflow](/blog/fix-white-halos-png/) instead, then repeat both background tests.

## Check the exact file you will share

Download the original PNG rather than taking a screenshot of its preview. A screenshot captures the displayed background as well as the artwork. Similarly, exporting as JPEG loses the alpha channel.

After exporting, close the editor preview and reopen the saved file. This catches a wrong export format or a background layer left visible. Test that saved file in your destination app; the app may flatten it even when the file is correct.

On an [88cutouts sticker page](/), the light and dark comparisons provide a quick first check. Your final composition still deserves its own test, particularly after resizing or combining assets.

## If you need an opaque result

Transparency is not always the goal. For a finished card or wallpaper, add your chosen background intentionally and export the complete design. Keep a separate transparent master if you want to reuse the sticker later. The [format comparison](/blog/png-jpg-webp-svg-image-formats/) explains that choice; the [PNG specification](https://www.w3.org/TR/png-3/) describes alpha transparency in the format.
