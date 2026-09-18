/**
 * Long-form copy for the DP pages.
 *
 * Each collection carries one paragraph written for it specifically, plus
 * guidance chosen by the platform it is aimed at — a WhatsApp set and an
 * Instagram set are cropped and sized by different rules, and saying so is
 * more useful than repeating the same paragraph ten times.
 *
 * The per-collection intro, blurb and FAQ live in src/data/dp-collections.json
 * and are not repeated here.
 */

type Platform = 'whatsapp' | 'instagram' | 'any';

interface CollectionCopy {
  platform: Platform;
  /** Written for this collection alone. */
  angle: string;
}

const COLLECTIONS: Record<string, CollectionCopy> = {
  girls: {
    platform: 'any',
    angle:
      'This is the broadest set here, which makes it the one to start from if you do not already know what you want. The images range from soft and pastel to plain and graphic, and they have one thing in common: a single clear subject with space around it, so the picture still reads when it is shrunk to a circle the size of a fingernail in a chat list.',
  },
  'stylish-girls': {
    platform: 'any',
    angle:
      'Style, at profile-picture size, is mostly silhouette and colour — the detail of an outfit disappears long before the shape of it does. The images in this set are chosen for a strong outline and a confident palette rather than for what is actually being worn, because that is the part that survives the crop.',
  },
  'attitude-girls': {
    platform: 'any',
    angle:
      'Attitude reads through posture and contrast, not through expression. A face is a handful of pixels at the size a profile picture is actually displayed, so the images here lean on strong shadows, a turned shoulder, a hard crop — the signals that still land when the detail is gone.',
  },
  'sad-girl': {
    platform: 'any',
    angle:
      'The visual language of this one is desaturation, empty space and a subject turned away. It is a quiet set by design, which also makes it the hardest to get right at small sizes: a muted image can disappear entirely against a light chat background, so the ones here all keep one point of contrast to hold the circle together.',
  },
  whatsapp: {
    platform: 'whatsapp',
    angle:
      'Built for the place a profile picture is seen most: a chat list, at about 50 pixels, next to twenty others. Everything in this set is composed so the subject fills the centre and the corners carry nothing, because the corners are exactly what WhatsApp throws away.',
  },
  'whatsapp-girls': {
    platform: 'whatsapp',
    angle:
      'The same circular-crop discipline as the main WhatsApp set, with a softer palette. These are made to sit comfortably in both the light and dark chat themes, which is why none of them are very pale — a near-white DP turns into a blank disc against a light background.',
  },
  instagram: {
    platform: 'instagram',
    angle:
      'Instagram renders a profile picture at around 110 pixels on a phone and smaller again in the Stories tray, and it sits above a grid that people read as one image. The pictures here are picked to carry a palette rather than a detail, so they can repeat the colours of a feed without competing with it.',
  },
  'instagram-aesthetic': {
    platform: 'instagram',
    angle:
      'This is the set for a profile that has a deliberate look already. Muted earth tones, film grain, one small subject and a lot of negative space — the point is a profile picture that reads as part of the grid rather than as a separate photograph parked above it.',
  },
  cute: {
    platform: 'any',
    angle:
      'Rounded shapes, warm colours and a single soft subject. Cute survives shrinking better than almost any other register, because it depends on shape rather than on detail — which is why these hold up in a chat list where a more complicated image turns to mush.',
  },
  aesthetic: {
    platform: 'any',
    angle:
      'A limited palette, one clear subject and plenty of empty space — the same recipe behind most of what gets called aesthetic. The restraint is the whole technique: these are not heavily filtered, they are simply photographs with very little going on in them, which is what makes them hold up at small sizes.',
  },
};

const PLATFORM_SECTIONS: Record<Platform, { h: string; p: string[] }[]> = {
  whatsapp: [
    {
      h: 'How WhatsApp crops a profile picture',
      p: [
        'WhatsApp takes a square image and draws a circle inside it, throwing away the four corners. That sounds obvious until you realise how much of a square the corners are — roughly 21% of the area. Anything you care about has to sit inside the circle, and anything decorative near a corner is not decoration, it is deleted.',
        'The display size is the other half of it. In a chat list your picture is drawn at around 50 pixels. That is smaller than the word you are reading now, and it means fine detail, small text and busy backgrounds all collapse into noise. One subject, large, with contrast against its background, is the only composition that reliably works.',
      ],
    },
    {
      h: 'Light theme, dark theme',
      p: [
        'Your picture is shown against both a light and a dark chat background depending on what the person looking at it has chosen. A very pale image disappears into the light theme; a very dark one disappears into the dark theme. A mid-tone image with one bright focal point survives both, which is why the pictures in this set avoid the extremes.',
        'There is a longer version of all of this, including the exact pixel sizes to upload, in the <a href="/blog/whatsapp-dp-size-guide/">WhatsApp DP size guide</a>.',
      ],
    },
  ],
  instagram: [
    {
      h: 'How Instagram shows a profile picture',
      p: [
        'Instagram crops to a circle like everything else, but the display size is what matters: around 110 pixels on a phone profile, smaller in the Stories tray, smaller again next to a comment. At those sizes a profile picture is not really an image — it is a shape and a colour that people learn to recognise.',
        'That argues for one subject and a narrow palette. It also argues against changing it often: recognition is most of what a profile picture does, and it takes a while to build.',
      ],
    },
    {
      h: 'Making it part of the grid',
      p: [
        'A profile picture sits directly above your grid, so the two are read together. Repeating two colours from your feed in your profile picture is enough to make the whole page look intentional, without matching anything literally.',
        'The reasoning behind that, and how to pick the palette in the first place, is in <a href="/blog/build-a-cohesive-instagram-aesthetic/">building a cohesive Instagram aesthetic</a> and <a href="/blog/how-to-choose-a-profile-picture/">how to choose a profile picture</a>.',
      ],
    },
  ],
  any: [
    {
      h: 'What survives the circle',
      p: [
        'Almost everywhere a profile picture is shown — WhatsApp, Instagram, Discord, Telegram — it is cropped to a circle and displayed small. Those two facts decide everything else. The corners of your square are discarded, so nothing important can live there, and fine detail is lost to the display size, so the composition has to work as a shape rather than as a photograph.',
        'The practical test is to shrink the image on your own screen until it is about the size of a fingernail. If you can still tell what it is, it works. If it turns into a smudge, no amount of detail at full size will save it.',
      ],
    },
    {
      h: 'Contrast beats detail',
      p: [
        'The single most useful thing you can do is make sure the subject is a different tone from its background. A dark subject on a dark background is illegible at 50 pixels no matter how good the photo is; a mid-tone subject against a pale background reads instantly.',
        'The full reasoning is in <a href="/blog/how-to-choose-a-profile-picture/">how to choose a profile picture</a>, and the sizing numbers are in the <a href="/blog/whatsapp-dp-size-guide/">DP size guide</a>.',
      ],
    },
  ],
};

export interface DpCollectionCopy {
  angle: string;
  sections: { h: string; p: string[] }[];
}

export function dpCollectionCopy(slug: string): DpCollectionCopy {
  const entry = COLLECTIONS[slug] ?? { platform: 'any' as Platform, angle: '' };
  return { angle: entry.angle, sections: PLATFORM_SECTIONS[entry.platform] };
}
