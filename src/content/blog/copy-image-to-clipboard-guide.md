---
title: "Copying Images to Your Clipboard: What Actually Happens, and Why It Sometimes Fails"
description: "How the Async Clipboard API moves a real PNG to your phone's clipboard, why iOS shows a permission prompt, why some browsers refuse, and what to do when the Copy button does not work."
date: 2026-02-25
category: "technical"
tags: ["clipboard", "browser", "ios", "android", "troubleshooting"]
cover: "/stickers/pixel-sunglasses.png"
faq:
  - q: "Why does my phone ask permission when I paste an image?"
    a: "iOS treats the clipboard as private data. When one app reads something another app put there, the system asks you to confirm. Tapping Don't Allow makes the paste silently do nothing, which looks like the copy failed when it did not."
  - q: "Why does the Copy button not work in my browser?"
    a: "Either the browser does not implement writing images to the clipboard, or the page is not served over HTTPS, or the copy was not triggered directly by your tap. Firefox on Android is the most common browser without image-copy support; use Download instead."
  - q: "Does copying an image keep its transparency?"
    a: "Yes, if the clipboard entry is a real PNG. The Clipboard API writes actual image bytes with the alpha channel intact. A screenshot does not, which is why screenshots always produce a white box."
  - q: "Where does a copied image go on Android?"
    a: "Into the system clipboard, which most keyboards surface as a clipboard tray or a paste chip. Gboard keeps recent clipboard entries for about an hour under its clipboard icon."
  - q: "Is copying safer than downloading?"
    a: "Neither is risky, but copying leaves nothing on your device. It is useful if you want one sticker for one Story and would rather not accumulate files in your camera roll."
---

The Copy button on an image looks like it should be trivial. Under the surface it is one of the more constrained things a web page can do, and understanding why explains most of the situations where it does not work.

## What the clipboard actually is

Your operating system maintains a small shared store — the pasteboard on iOS and macOS, the clipboard on Windows and Android — that any application can write to and, with permission, read from.

The important detail: a clipboard entry is not a single thing. It is a set of *representations* of the same content, each tagged with a MIME type. Copy a table from a spreadsheet and the clipboard holds the same data as `text/plain`, `text/html` and often a spreadsheet-specific format simultaneously. The receiving application picks whichever representation it can handle best.

For images this means a clipboard entry can carry `image/png`, `image/jpeg`, a file reference, and a plain-text URL all at once. When you paste into Instagram, it looks for an image representation. When you paste into a text field, it takes the text one. Same copy, different results, and that is by design rather than a bug.

## The Async Clipboard API

Modern browsers expose this through `navigator.clipboard`. Writing an image looks roughly like this:

```
const blob = await (await fetch('/stickers/pink-satin-bow.png')).blob();
await navigator.clipboard.write([
  new ClipboardItem({ 'image/png': blob })
]);
```

Three things about that are worth pulling out.

**It writes real bytes.** The `blob` is the actual PNG file, alpha channel and all. This is not a picture of the page, not a canvas re-render, not a link. That is why a copied sticker pastes into a Story with its transparency intact, and why a screenshot of the same sticker does not.

**`image/png` is effectively the only supported type.** Browsers restrict which MIME types can be written, and PNG is the one every implementation supports. JPEG support is inconsistent. This is a security decision — the clipboard is shared across applications, so browsers only allow formats they can validate and sanitise.

**It is asynchronous and permission-gated.** The call returns a promise, and it can be rejected for reasons that have nothing to do with your code.

## The four rules a copy has to satisfy

A browser will refuse to write to the clipboard unless all of these hold.

### 1. Secure context

The page must be served over HTTPS, or be on `localhost`. Clipboard access over plain HTTP is blocked outright. This is rarely the problem in practice, but it is the first thing to check on a self-hosted or local test page.

### 2. Transient user activation

The write must happen as a direct result of a user gesture — a click or tap — and within a short window afterwards. You cannot copy on page load, on a timer, or when the user scrolls past something.

This is the rule that causes the most subtle failures. If your code fetches the image *first* and then writes to the clipboard, the fetch may take long enough that the browser considers the user gesture expired, and the write is rejected. The fix used on this site is to hand `ClipboardItem` a promise for the blob rather than the blob itself, so the clipboard write starts immediately inside the tap handler and the fetch resolves into it. Safari in particular is strict about this and it is the difference between a Copy button that works on iOS and one that mysteriously does not.

### 3. Document focus

The page must have focus. Copying from a background tab is refused. Some browser extensions and in-app browsers steal focus in ways that break this without any visible sign.

### 4. Browser support

Support for *writing* images — as opposed to text — is narrower than people assume:

| Browser | Image copy support |
| --- | --- |
| Safari, iOS 13.4+ | Yes |
| Chrome, Android and desktop | Yes, since version 76 |
| Edge | Yes |
| Samsung Internet | Yes, recent versions |
| Firefox desktop | Partial; PNG writing supported in recent versions |
| Firefox on Android | Generally not |
| In-app browsers (Instagram, Facebook) | Unreliable |

That last row matters more than the others, because a large share of mobile traffic to any site arrives inside an in-app browser. These are stripped-down web views with inconsistent permissions, and clipboard writes frequently fail in them for no visible reason. If the Copy button is not working, opening the page in your real browser — the ⋯ menu usually offers "Open in Safari" or "Open in Chrome" — resolves it more often than anything else.

## The iOS paste prompt

On iOS you will sometimes see a dialogue reading something like *"Instagram would like to paste from Safari"* with Allow and Don't Allow.

This is deliberate. Apple treats clipboard contents as private — clipboards routinely contain passwords, addresses and one-time codes — so when an app *reads* something a different app *wrote*, the system asks. The prompt is about the reading app, not the writing one, which is why it appears at paste time rather than copy time.

The confusing part is what happens when you decline: nothing. No error, no message, no sticker. The paste simply does not occur, and it looks exactly like the copy failed. If you tapped Don't Allow by reflex, copy the image again and allow it the second time.

iOS also remembers the choice per app pair for a period, so allowing it once usually means you will not be asked again for a while.

## Android's clipboard surfaces

Android is more permissive but less consistent about presentation.

Since Android 10, only the app in the foreground can read the clipboard, which closed a long-standing privacy hole. Since Android 12, a toast appears whenever an app reads clipboard content, so you may see a brief "Instagram pasted from Chrome" notification.

Where the paste option appears varies by keyboard and manufacturer:

- **Gboard** shows a clipboard icon in its toolbar with recent entries retained for about an hour.
- **Samsung Keyboard** shows a clipboard tray, often with a longer history.
- **Long-pressing** an editable field usually offers Paste directly.

If none of those show your image, the copy did not succeed. Fall back to downloading.

## When to download instead

Copying is the faster path for one sticker used immediately. Downloading is better when:

- You are building a composition from several cutouts and need them all available.
- You want to edit in a separate app before posting.
- Your browser is an in-app web view and copy is unreliable.
- You want the file again next week.

Every sticker page here offers both for exactly this reason. Download always works — it is a plain file save with no permissions involved — and it hands over the original PNG rather than a display-optimised version, so the transparency and the full resolution both survive.

## Why the copied file is the original, not the thumbnail

Worth noting because it is a real distinction. Galleries on this site display generated WebP thumbnails, typically 200 or 400 pixels square, because loading a hundred full-size PNGs on a phone would be slow. Those thumbnails are for looking at.

Copy and Download both bypass them and fetch the source PNG at its full size. If you long-press an image in the gallery and choose "Save image" instead, you may get the thumbnail — smaller, and in a format some apps handle less predictably. The buttons exist to remove that ambiguity.

## Troubleshooting, in order

1. **Nothing happened when I tapped Copy.** Check you are in a real browser rather than an in-app one. Open in Safari or Chrome and try again.
2. **Copy said it worked but there is no Paste option.** The clipboard probably holds text. Copy the image again, then open the text tool in Instagram so the keyboard is up before looking for the Paste chip.
3. **A permission dialogue appeared and I dismissed it.** Copy again and tap Allow.
4. **It pastes but with a white box.** That is not a clipboard problem — the file itself lost transparency. See [why transparent PNGs turn grey](/blog/transparent-png-turns-grey-explained/).
5. **It works on my laptop but not my phone.** Almost always browser support or an in-app web view. Download is the reliable path on mobile.
6. **It worked yesterday and not today.** Check whether the browser updated, and whether you are on a different network that might be intercepting HTTPS — some corporate and school networks break secure-context assumptions.

## The summary

The clipboard is shared system state, so browsers guard it with four conditions: HTTPS, a real user gesture, page focus, and actual support for image writing. When a Copy button fails, one of those four is missing — and in practice it is usually the last one, on a browser embedded inside another app. Download is the fallback that has no conditions at all, which is why it should always be offered alongside.
