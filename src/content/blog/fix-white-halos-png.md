---
title: "Fix White Halos Around a Transparent Sticker"
description: "Diagnose contaminated edge pixels and repair a sticker without cutting away fine details or making the outline jagged."
date: 2026-09-26
category: technical
tags: [PNG, edges, masks]
cover: /stickers/golden-sun.png
---

A white halo is usually most visible when a cutout is placed on a dark image. The background may be transparent, yet partly transparent pixels around the subject still contain the colour of the old white background. Reducing the opacity of the whole sticker makes the subject faint without removing that colour contamination.

## Establish what is wrong

Place the sticker over a dark solid layer and zoom to inspect the boundary. Then switch to a light background. If the fringe is visible only against the dark layer, inspect its colour as well as its opacity. If there is a solid rectangle, start with the [transparency test](/blog/check-png-transparency/) instead.

![The same soft-edged shape against light and dark backgrounds, showing why dark-background inspection matters.](/guides/transparency-test.svg)

Keep the original on a hidden layer. Repairs should be made to a duplicate so you can compare the result without relying on memory.

## Choose the smallest useful repair

For a simple hard-edged object, move the mask boundary slightly inward and inspect the result at the intended display size. Do not apply a fixed one-pixel contraction to every file: one pixel is a much bigger change to a tiny icon than to a large photograph.

For fur, hair or translucent fabric, contracting the entire mask can remove the details you wanted to keep. Instead, use your editor's edge-colour or decontamination controls if available, or carefully repaint edge colour while preserving the existing transparency. Follow the editor's documentation because the control names and behaviour differ.

## Avoid the sharpen-and-feather loop

Repeated feathering spreads the contaminated colour over a wider area. Repeated sharpening can exaggerate the light rim. Neither operation restores the original subject colour automatically.

Check at two scales: a close zoom for the source of the problem, and normal viewing size for the actual appearance. A repair that looks perfect at 800% may erase a whisker that mattered at normal size.

## Export and inspect again

Hide the test background and save a transparent PNG. Reopen it over both test colours. Finally place it over the actual photograph, where texture may reveal a different problem from a flat test layer.

If the original source is available, making a cleaner mask there is often preferable to repeatedly repairing a small exported file. See [Adobe's selection and masking documentation](https://helpx.adobe.com/photoshop/using/select-mask.html) for one editor's workflow, and [the sticker production guide](/blog/how-to-make-transparent-png-stickers/) for the complete process.
