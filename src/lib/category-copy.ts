/**
 * Long-form copy for /category/<slug>/.
 *
 * Kept separate from sticker-copy.ts on purpose: a category page and the
 * sticker pages beneath it should not repeat each other's sentences, or the
 * shelf reads as a duplicate of its contents. This file is about the set as a
 * whole — what is in it, when to reach for it, how the pieces differ.
 *
 * A category with no entry here still renders: the generic fallback covers the
 * things that are true of every shelf, and a new one can be written in later.
 */

export interface CategoryPage {
  /** Shown under the heading. */
  intro: string;
  /** Body sections, in order. */
  sections: { h: string; p: string[] }[];
  faq: { q: string; a: string }[];
}

const PAGES: Record<string, CategoryPage> = {
  coquette: {
    intro:
      'Bows in satin, gingham and ribbon, in the soft pinks and reds that go with the coquette look. Small enough to sit in a corner without taking over the photo.',
    sections: [
      {
        h: 'What the coquette look actually is',
        p: [
          'Coquette is a revival of a very specific kind of femininity — ribbon, lace, pearls, pale pink, a slightly nostalgic and slightly theatrical version of girlhood. It came back through Tumblr and then TikTok, and the reason it works on Stories is that it is built from small repeated motifs rather than from a colour filter. A bow is a coquette signal on its own, with no other styling required.',
          'That also means it is easy to overdo. The look reads as taste when it is one or two elements against a plain photo, and as a costume when every corner of the frame has something in it. If you are unsure, remove one thing.',
        ],
      },
      {
        h: 'Choosing between the bows',
        p: [
          'The satin bows have visible highlights and a soft sheen, so they hold up at larger sizes and look best over photographs. The gingham and fabric ones are flatter and more graphic, which makes them better small — in a corner, or repeated two or three times along an edge. The ribbon pieces are longer and thinner, and work as a line across the frame rather than as a point of interest.',
          'Colour matters more here than in most sets. Blush and cream sit on almost anything; the deeper reds need a photo with some darkness in it or they float.',
        ],
      },
      {
        h: 'Putting them on a Story',
        p: [
          'Place a bow at a slight angle rather than square to the edge of the frame — it reads as something set down rather than stuck on. Over a busy photo, drop the opacity to around 70% on the sticker page before copying, which keeps the satin readable while letting the photo texture come through.',
          'They pair naturally with the flowers and hearts shelves, and with a torn paper scrap underneath as a texture layer. Keep the whole thing to three colours.',
        ],
      },
    ],
    faq: [
      {
        q: 'What colours go with coquette stickers?',
        a: 'Blush pink, cream, soft white and one deeper red or burgundy as an accent. The look depends on a narrow palette — adding a fourth colour, especially a cool one like blue or green, is usually what breaks it.',
      },
      {
        q: 'How many bows should I put on one Story?',
        a: 'One, or two at different sizes. The coquette aesthetic is about suggestion, and a frame with four or five bows scattered across it reads as a sticker sheet rather than a styled photo.',
      },
      {
        q: 'Do these work on photos that are not pink?',
        a: 'Yes, and often better. A single pale bow against a dark or neutral photo has more contrast and more impact than the same bow on an already-pink image, where it can disappear into the background.',
      },
    ],
  },

  hearts: {
    intro:
      'Hearts in paper, pixel and glossy finishes — some plain, some textured, all sized to sit near a caption without crowding it.',
    sections: [
      {
        h: 'The most useful shape there is',
        p: [
          'A heart survives everything: being shrunk to the size of a thumbnail, sitting over a busy photograph, being repeated a dozen times across a background. It is instantly legible at any scale, which is why it is the one sticker shape that never really goes out of use.',
          'The flip side is that it is the easiest shape to overuse. A single heart next to a caption is a note. A ring of hearts around the edge of the frame is a filter, and reads as one.',
        ],
      },
      {
        h: 'Finishes, and when to use them',
        p: [
          'The paper and crumpled hearts have a visible texture and an irregular edge, so they suit scrapbook-style Stories and sit well on top of washi tape or torn paper. The glossy ones have a highlight and read as an object — better used large and alone. The pixel hearts belong with the Y2K set and look wrong next to watercolour.',
          'If you want two hearts in one frame, make them different finishes. Two identical hearts look duplicated; a paper one and a glossy one look collected.',
        ],
      },
      {
        h: 'Fading them out',
        p: [
          'Hearts take opacity better than anything else here. At 20–30%, a loose scatter of them across a photo behaves like a texture rather than a set of stickers — it adds warmth without adding objects. Set the opacity on the sticker page before copying, so the file arrives already faded.',
          'At full strength, one heart still holds its own next to lettering, which is the other reliable use: heart, then two or three words.',
        ],
      },
    ],
    faq: [
      {
        q: 'How do I make a heart sticker transparent?',
        a: 'Open any heart on this page and use the opacity slider above the Copy button. Drag it to 20–40% and copy — the PNG itself is translucent, so it pastes into a Story already faded rather than needing to be adjusted afterwards.',
      },
      {
        q: 'Which heart works best over a photo?',
        a: 'A paper or matte one. Glossy hearts have a bright highlight that competes with the highlights in a photograph, while a matte finish settles into the image more easily.',
      },
      {
        q: 'Can I use these for a birthday or anniversary Story?',
        a: 'Yes — pair one with lettering rather than with more hearts. A single heart plus a date or a name reads far better than a frame full of hearts.',
      },
    ],
  },

  cute: {
    intro:
      'Photoreal kittens and small animals, most of them dressed up — beanies, glasses, bows, a barbell, a bubble tea. Built for photo dumps, pet updates and anything that needs a bit of softness.',
    sections: [
      {
        h: 'Photographs, not drawings',
        p: [
          'Nearly everything on this shelf is photographic rather than drawn — rendered kittens, cut out close to the fur, usually holding or wearing something. The exceptions are the bunny and the fuzzy bear face, which are flat illustrations, and they read noticeably differently next to the rest.',
          'Because they are photographic, what keeps one readable is tonal contrast with the photo behind it, not a line weight — a pale kitten on a pale background disappears however large you place it.',
        ],
      },
      {
        h: 'Where they go',
        p: [
          'These suit photos that are already warm: a pet, a friend, food, a weekend. Put the cutout against a quiet part of the image — a wall, a table, the sky — rather than over a patterned area, where a fur edge stops reading as an edge.',
          'One cutout plus one small accent, like a heart or a sparkle, is usually the whole composition. A third element starts to look like a sticker sheet.',
        ],
      },
      {
        h: 'Size, not opacity',
        p: [
          'Unlike the paper and flower sets, these do not fade well. Faces carry a lot of small detail, and that detail goes first as opacity drops — below about 80% you are left with a vague shape rather than a character. If you need one to sit back in the frame, make it smaller rather than fainter.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are these drawn or photographed?',
        a: 'Most are photographic — rendered rather than sketched — and cut out close to the fur, then exported as transparent PNGs with the edges cleaned so no grey halo survives on a dark background. The bunny and the fuzzy bear face are the flat illustrations in the set.',
      },
      {
        q: 'Can I use them on a pet account?',
        a: 'Yes — free for personal use, including on an account about your own pet. What is not allowed is selling them or repackaging them as a sticker pack.',
      },
      {
        q: 'Why does my cutout look blurry?',
        a: 'Almost always because it was scaled up past its native size. Each file here is around 900 pixels on its longest edge; blown up to fill a 1080-wide Story it will soften. Placing it at half the frame width or less keeps it crisp.',
      },
    ],
  },

  retro: {
    intro:
      'Cassette tapes, vinyl records, film cameras and a guitar — cutouts built around an analogue, pre-digital feel rather than a specific decade.',
    sections: [
      {
        h: 'Objects, not filters',
        p: [
          'Nostalgia on Instagram is usually applied as a colour grade. This shelf does it the other way round: real objects that happen to be obsolete. A cassette in the corner of a Story says something about the music without touching the photo, which is a lighter hand than pushing the whole image towards orange.',
          'Because each piece carries a lot of implied meaning, one is normally enough. Two analogue objects in the same frame start to read as a themed collage rather than as a detail.',
        ],
      },
      {
        h: 'What they sit well with',
        p: [
          'They go with each other — tapes with records, cameras with film — and with the paper shelf underneath as a background layer. They do not sit comfortably with the pixel-edged Y2K graphics: both are nostalgic, but for different things, and the two styles read as two different jokes told at once.',
          'Slightly desaturated or film-grain photos suit them best. Over a bright, high-saturation image, an analogue object can look pasted on.',
        ],
      },
      {
        h: 'Sizing and opacity',
        p: [
          'These have detail in their highlights — the sheen on a record, the chrome on a camera — so they want to be placed large enough for that detail to survive, roughly a third of the frame width or more. Keep the opacity at full, or at 60% at the very lowest; the highlights wash out before anything else does.',
        ],
      },
    ],
    faq: [
      {
        q: 'What decade are these from?',
        a: 'None specifically. They are built around an analogue feel — tape, vinyl, film — rather than the styling of one particular decade, which makes them easier to use next to modern photos.',
      },
      {
        q: 'Do these work for a music Story?',
        a: 'That is the main use. A cassette or a record next to a song title does more than the title alone, and it works particularly well over a slightly desaturated photo.',
      },
      {
        q: 'Can I mix these with the Y2K stickers?',
        a: 'Usually not. The retro pieces are photographic and soft-edged; the Y2K ones are pixel-edged and hard. Put them in separate Stories rather than the same frame.',
      },
    ],
  },

  y2k: {
    intro:
      'Pixel-edged graphics — sunglasses, a health bar, a boxy computer — pulled from the early-2000s look rather than smoothed into modern vector art.',
    sections: [
      {
        h: 'Crunchy on purpose',
        p: [
          'The visible pixel edge is the whole point. Early-2000s web graphics were small, compressed and hard-edged because that was what the bandwidth allowed, and reproducing that look means keeping the edge rather than smoothing it into a clean vector. Every file here keeps its steps.',
          'That means scaling matters more than usual. Blown up smoothly, a pixel edge turns into a blur, which just looks like a low-quality image rather than a deliberate one. Placed at or near its native size, it stays crisp and reads as intentional.',
        ],
      },
      {
        h: 'What goes with it',
        p: [
          'Other hard-edged things: chunky lettering, comic bursts, pixel shapes. The cutout text maker pairs well here — paper letters have the same anti-professional, cut-and-paste register as early web graphics. Watercolour flowers and satin bows do not.',
          'Backgrounds that suit it are flat and saturated, or flash-lit photos with hard shadows. Soft, film-grain images fight it.',
        ],
      },
      {
        h: 'Opacity',
        p: [
          'Keep these solid. A pixel edge fading out reads as a compression artefact rather than as a design choice — 70% is about as low as it goes before the effect breaks.',
        ],
      },
    ],
    faq: [
      {
        q: 'Why do these look pixelated?',
        a: 'Deliberately. The early-2000s look depends on visible pixel steps at the edges, so the artwork keeps them rather than smoothing them away. Place the sticker near its native size and the steps read as style; scale it up hugely and they read as a blur.',
      },
      {
        q: 'What photos suit Y2K stickers?',
        a: 'Flash-lit shots, flat saturated colours, screenshots and anything with hard shadows. Soft, grainy or heavily filtered photos work against the hard edge.',
      },
      {
        q: 'Can I use these on a profile picture?',
        a: 'They are square-friendly and bold, so yes — just keep the subject inside the centre circle, since profile pictures get cropped to a circle almost everywhere.',
      },
    ],
  },

  flowers: {
    intro:
      'Watercolour blooms, pressed petals and bouquets — the kind of stickers that work over a garden photo, a bunch someone gave you, or just a good outfit.',
    sections: [
      {
        h: 'Two ways to use a flower',
        p: [
          'Either one large bloom placed off-centre as a subject in its own right, or several small ones tucked around the edges as a border. The first suits a portrait or a still life where the photo has a clear focal point already. The second suits a photo dump, where no single image is carrying the frame and the flowers provide the through-line.',
          'What rarely works is the middle ground — three medium flowers evenly spaced, which reads as a template.',
        ],
      },
      {
        h: 'Matching the rendering style',
        p: [
          'The watercolour blooms have soft edges and visible pigment; the pressed and photographic ones have crisp detail. Mixing the two in one frame usually looks wrong, because the eye reads them as belonging to different worlds. Pick a lane per Story.',
          'Flowers sit well with the coquette bows and with paper textures underneath. They also work as a frame around lettering, which is one of the few cases where surrounding text with stickers does not look cluttered.',
        ],
      },
      {
        h: 'Fading them',
        p: [
          'Flowers take opacity better than almost anything else here. At 40–50%, a bloom in the corner of a busy photo becomes a wash of colour rather than an object, which is often exactly what an over-full image needs. Set it on the sticker page before you copy.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are these real flowers or illustrations?',
        a: 'Both — the set mixes watercolour illustrations with photographed and pressed blooms. Each sticker page says which it is in the description, and the two styles are best kept in separate Stories.',
      },
      {
        q: 'Which flower sticker works over a busy photo?',
        a: 'A single large one at reduced opacity, rather than several small ones. Small flowers get lost in a busy image; one big bloom at 40–50% reads as a deliberate colour wash.',
      },
      {
        q: 'Can I use these on a wedding or event Story?',
        a: 'Yes, and they are one of the better sets for it. Pair a bloom with the cutout text maker for a date or a name and you have an announcement without needing a design app.',
      },
    ],
  },

  text: {
    intro:
      'Lettering and speech-bubble stickers meant to be read at a glance: birthday letters, a love coupon, a comic burst, a "new" badge.',
    sections: [
      {
        h: 'Legibility first',
        p: [
          'Text stickers have exactly one job, which is to be read instantly on a phone held at arm’s length. That means clear space around them and enough size to survive Instagram’s compression. Put lettering where the photo is quietest rather than where the composition is most interesting — the two are rarely the same place.',
          'Do not stack two text stickers in one frame. If you need more words, use one sticker and put the rest in Instagram’s own text, or set the whole phrase in the cutout text maker.',
        ],
      },
      {
        h: 'When to use a ready-made word instead of typing one',
        p: [
          'A ready-made lettering sticker has a texture and an irregular edge that live text cannot fake — it reads as an object on the photo. Instagram’s fonts are clean and uniform, which makes them invisible in a good way for captions and in a bad way for anything meant to stand out.',
          'For a phrase that is not on this shelf, the cutout text maker sets any short message in the same paper-letter style, at whatever opacity you want.',
        ],
      },
      {
        h: 'Opacity',
        p: [
          'Keep lettering above 80%. Legibility is the entire purpose, and faded text over a photograph loses it faster than any other kind of sticker.',
        ],
      },
    ],
    faq: [
      {
        q: 'Can I make my own text in this style?',
        a: 'Yes — the cutout text maker takes any short message and returns it as paper letters on a transparent PNG, with the same opacity control as the stickers here.',
      },
      {
        q: 'How big should text be in a Story?',
        a: 'Big enough to read without effort on a phone — as a rule, at least a third of the frame width for a short word. Text that looks fine on a laptop is routinely too small on the device people will actually see it on.',
      },
      {
        q: 'Why should I use a text sticker instead of Instagram’s fonts?',
        a: 'Because a cut-out or hand-drawn word has texture and an irregular edge, so it reads as an object placed on the photo rather than an overlay typed on top of it. For captions, Instagram’s fonts are still the better choice.',
      },
    ],
  },

  paper: {
    intro:
      'Washi tape and torn-paper scraps, built to sit underneath other stickers as a background layer rather than stand alone.',
    sections: [
      {
        h: 'A base layer, not a subject',
        p: [
          'Everything on this shelf is designed to go underneath something else. A strip of washi tape along the top edge, a torn scrap behind a block of text, a piece holding down the corner of a photo — the job is to give the rest of the frame something to sit on, which means it should be the least attention-grabbing thing in it.',
          'This is the set that makes a Story look like a scrapbook page rather than a photo with stickers on it, and it is the one most people skip.',
        ],
      },
      {
        h: 'Building depth',
        p: [
          'Two overlapping scraps in slightly different tones give a sense of layers that a single flat piece never does. Rotate each one a few degrees in a different direction — perfectly aligned paper reads as a graphic, crooked paper reads as physical.',
          'Put lettering, a bow or a small charm on top. Almost anything on the site works over paper, because paper is a neutral.',
        ],
      },
      {
        h: 'This is the set that wants fading',
        p: [
          'Paper is the one category where reduced opacity is usually correct. At 40–60% a scrap becomes a genuine background texture instead of a shape competing with whatever sits above it. Set it before copying and the file arrives already faded.',
        ],
      },
    ],
    faq: [
      {
        q: 'What is washi tape used for in a Story?',
        a: 'As a visual anchor — a strip across a corner or along an edge makes a photo look taped down rather than floated on the screen. It also gives text something to sit on so it does not read as an overlay.',
      },
      {
        q: 'Should paper stickers go over or under my photo?',
        a: 'Over it, but faded. Unlike frames, these are not meant to hold your photo — they are meant to sit lightly on top as a texture, usually at around half opacity.',
      },
      {
        q: 'Can I layer several paper pieces?',
        a: 'Yes, and two or three overlapping at slightly different angles is where the effect works best. Keep them in a narrow tonal range so it reads as one surface rather than a pile.',
      },
    ],
  },

  aesthetic: {
    intro:
      'Small decorative charms — a sun swirl, an evil eye, a glass flower — meant as an accent rather than the main subject of a Story.',
    sections: [
      {
        h: 'Accents, noticed second',
        p: [
          'These are meant to be seen after the photo, not before it. One tucked into a corner or against the edge of the frame is the intended use, and the intended size is small — there is not much internal detail to hold up if you scale one to fill half the screen.',
          'The upside of small is that you can use more than one. Two or three different charms at varying sizes along a single edge look deliberate in a way that the same charms scattered across the whole frame do not.',
        ],
      },
      {
        h: 'Keeping them on one side',
        p: [
          'Group them. Charms placed along one edge read as a composition; the same charms placed one in each corner read as a border, which is a much heavier effect than it sounds. If you only use one, put it where the photo has empty space rather than over the subject.',
          'They pair with almost anything here, which is why the shelf is worth knowing — a charm is the element that finishes a frame that is nearly done.',
        ],
      },
      {
        h: 'Opacity',
        p: [
          'Anywhere between 50% and full works. Lower it when the charm sits directly over the subject of the photo, keep it high when it sits over empty space.',
        ],
      },
    ],
    faq: [
      {
        q: 'How many charms should I put in one Story?',
        a: 'One if it is doing a job, or two to three grouped along a single edge at different sizes. Spreading them into each corner turns them into a border, which is a much stronger effect than most photos want.',
      },
      {
        q: 'What does the evil eye sticker mean?',
        a: 'It is a protective symbol used across the Mediterranean, Middle East and South Asia, traditionally worn or hung to deflect bad luck. On a Story it is usually used decoratively, in that spirit.',
      },
      {
        q: 'Can I use these as a profile picture accent?',
        a: 'Yes, though keep them well inside the centre of the square — profile pictures are cropped to a circle, so anything near a corner will be cut off.',
      },
    ],
  },

  frames: {
    intro:
      'Frames go under a photo rather than on top of one — a border to drop your own picture into, not a sticker in the usual sense.',
    sections: [
      {
        h: 'The opposite of a sticker',
        p: [
          'A frame has a transparent middle, and your photo goes into that middle. In an Instagram Story the simplest route is to add the frame first, scale it to the size you want, then place your photo behind it. In any editor that supports layers, drop your image under the frame and export the result as a single picture.',
          'It is worth knowing that a frame changes the crop of your photo, not just its border — so pick an image with space around the subject, or the frame will cut into it.',
        ],
      },
      {
        h: 'Keep the rest simple',
        p: [
          'A frame is usually the whole composition. If you add anything else, put it overlapping the border rather than inside the opening, so the frame still reads as an edge instead of as another sticker in a pile.',
          'Frames want full opacity. The border is structural, and a faded border stops reading as an edge at all.',
        ],
      },
    ],
    faq: [
      {
        q: 'How do I put my photo inside a frame?',
        a: 'Add the frame to your Story and scale it, then place your photo behind it. In a layered editor, put your image on a layer underneath the frame and export the flattened result.',
      },
      {
        q: 'What size should my photo be?',
        a: 'Larger than the frame opening, with room around the subject. The frame crops whatever is behind it, so a tightly cropped photo will lose its edges.',
      },
      {
        q: 'Can I use a frame as a normal sticker?',
        a: 'You can place one over a photo without filling it, and the transparent middle will show the image through — but it is designed to define an opening, so it works best with something deliberately placed inside.',
      },
    ],
  },

  seasonal: {
    intro:
      'Stickers tied to a specific date on the calendar rather than a fixed theme — added and swapped out as the year moves along.',
    sections: [
      {
        h: 'Short window, specific job',
        p: [
          'Calendar cutouts mark a date on a day when everyone is posting about the same thing, which means they compete with a lot of near-identical Stories. Placement matters more than usual: off-centre and large beats small and tidy, because a small date sticker in the corner looks like every other one.',
          'Use it on the first Story in a set rather than on every frame. Repeating a date across six Stories dilutes it.',
        ],
      },
      {
        h: 'What to pair it with',
        p: [
          'Lettering, and anything celebratory. The cutout text maker is the natural companion — a date sticker plus a short phrase in the same paper style is a complete announcement without a design app.',
          'Keep these solid. A date is information, and information should not be translucent.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do seasonal stickers get removed after the date?',
        a: 'No — the page stays up and the file stays free. New ones are added as the calendar moves, but nothing is taken away.',
      },
      {
        q: 'Can I use a year sticker on a profile picture?',
        a: 'Numbers are the strongest characters at small sizes, so yes. Keep it inside the centre circle, since profile pictures are cropped round.',
      },
    ],
  },

  general: {
    intro:
      "Stickers that didn't fit neatly into one of the other shelves — a mix of small, useful cutouts for whatever a photo needs.",
    sections: [
      {
        h: 'The useful odds and ends',
        p: [
          'This is where the cutouts that do not belong to one look end up: small shapes, plain objects, the pieces that turn up in all sorts of Stories without ever defining one. They are worth browsing precisely because they are not tied to an aesthetic — a plain shape works next to almost anything.',
          'The usual placement is near a corner or beside a caption, sized small enough that the cutout decorates the frame rather than claiming it.',
        ],
      },
      {
        h: 'Using them as the second element',
        p: [
          'Pick the sticker that sets the mood from one of the themed shelves, then take the supporting piece from here. That division — one element with a strong identity, one neutral — is what stops a Story looking like a sticker sheet.',
          'Around 70% opacity suits most uses: enough presence to be seen, not so much that it pulls the eye off the photo.',
        ],
      },
    ],
    faq: [
      {
        q: 'Why are these not in a category?',
        a: 'Because forcing every cutout into a theme makes the themes less useful. These are the pieces that work across several looks, so they live on their own shelf rather than distorting another one.',
      },
      {
        q: 'Are these lower quality than the themed sets?',
        a: 'No — same process, same PNG-32 export, same edge cleaning. The only difference is that they do not belong to a single aesthetic.',
      },
    ],
  },
};

const FALLBACK: CategoryPage = {
  intro:
    'Free transparent PNG cutouts in this set — tap any one to copy it, set the opacity you want, and paste it straight into a Story.',
  sections: [
    {
      h: 'How to use these',
      p: [
        'Open any cutout in this set, tap Copy, then open Instagram, start a Story and long-press to paste. It arrives as a sticker you can pinch, rotate and place, with no white box around it, because every file here keeps a real alpha channel.',
        'Each sticker page also carries an opacity control, so the same cutout can be copied solid, softened to sit into a photo, or faded right down to behave like a watermark.',
      ],
    },
  ],
  faq: [
    {
      q: 'Are these free?',
      a: 'Yes — free for personal use, with no account, no watermark and no attribution requirement.',
    },
    {
      q: 'What format are the files?',
      a: 'Transparent PNG-32, trimmed to the artwork and normalised to a 900 pixel maximum edge.',
    },
  ],
};

export function categoryPage(slug: string): CategoryPage {
  return PAGES[slug.toLowerCase()] ?? FALLBACK;
}
