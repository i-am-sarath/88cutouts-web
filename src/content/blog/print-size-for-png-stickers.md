---
title: "Calculate a PNG's Print Size before Making a Card"
description: "Convert artwork pixels to physical size and understand why changing a PPI label cannot create missing detail."
date: 2026-09-26
category: technical
tags: [printing, resolution, dimensions]
cover: /stickers/golden-sun.png
---

A PNG that looks large on screen may be small when printed sharply. To estimate its usable print size, start with the artwork's pixel dimensions and the print resolution you intend to use. Do not start with the file's size in kilobytes.

## Use the simple calculation

Physical width in inches equals pixel width divided by pixels per inch. For an example at 300 PPI, artwork 900 pixels wide prints 3 inches wide. Artwork 300 pixels wide prints 1 inch wide at the same setting.

![A raster source related to a physical output size, with the pixel-width divided by PPI calculation.](/guides/print-size.svg)

300 PPI is a useful planning example for close-viewed print work, not a universal requirement. The printer, material, viewing distance and artwork style affect what is acceptable. Ask the printer for its specifications before preparing a larger project.

## Measure artwork, not empty canvas

A 900-pixel canvas with a 300-pixel subject does not give you a 3-inch subject at 300 PPI. The visible subject is only 1 inch at that scale. See the [transparent-padding explanation](/blog/transparent-padding-sticker-size/) when the file dimensions seem unusually generous.

Changing a metadata value from 72 to 300 PPI does not add pixels. Without resampling, it changes the relationship between existing pixels and physical size. With resampling, the editor creates new samples, but it cannot reconstruct detail that was not there.

## Make a small proof

Place the artwork at the intended physical size on a test page. Include fine text and the lightest edges, because those are often the first elements to become disappointing.

Print a draft on ordinary paper and inspect it from the distance at which the card will be read. A screen preview cannot fully predict paper colour, ink behaviour or the appearance of subtle shadows.

## Keep permission separate from resolution

An image being technically printable does not establish permission to sell prints or use it for client work. 88cutouts downloads are offered for personal projects; consult the [licence](/license/) for uses outside that scope.

Save the editable composition as well as the exported image. If a printer asks for bleed, crop marks or another file format, work from that source rather than repeatedly converting the final PNG. [Adobe's image-size documentation](https://helpx.adobe.com/photoshop/using/image-size-resolution.html) explains the relationship between dimensions, resolution and resampling.
