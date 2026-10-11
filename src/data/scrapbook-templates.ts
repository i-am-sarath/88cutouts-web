/**
 * Starter pages for the scrapbook. Each one is also its own page at
 * /scrapbook/<slug>/ with written help, so it can be found in search.
 *
 * Positions are fractions of the page: x and y of its width and height, sizes
 * (s, w, h) of its width, angles in degrees. Laid out for the 9:16 Story page.
 * Stickers are named by slug; one that has since been deleted from the
 * library is simply left out at build time.
 */

export type TplEl =
  | { t: 'slot'; x: number; y: number; w: number; h: number; a?: number; frame?: 'polaroid' | 'border' | 'none' }
  | { t: 'sticker'; slug: string; x: number; y: number; s: number; a?: number }
  | { t: 'letters'; text: string; x: number; y: number; s: number; a?: number }
  | { t: 'hand'; text: string; x: number; y: number; s: number; a?: number; color?: string }
  | { t: 'tape'; tape: string; x: number; y: number; s: number; a?: number };

export interface ScrapbookTemplate {
  slug: string;
  name: string;
  /** <title> and <h1>. */
  title: string;
  description: string;
  /** One line for the template card. */
  blurb: string;
  paper: string;
  intro: string[];
  tips: string[];
  captions: string[];
  els: TplEl[];
}

export const templates: ScrapbookTemplate[] = [
  {
    slug: 'birthday',
    name: 'Birthday',
    title: 'Birthday scrapbook page template',
    description:
      'A free birthday scrapbook page: two photo spots, "happy birthday" in cut-out letters, cake-day stickers and washi tape. Add your photos and download it as a Story.',
    blurb: 'Two photos, cut-out "happy birthday", macarons and bows.',
    paper: 'blush',
    intro: [
      'A birthday page has one job: make the person feel like the main character for a day. This template gives you a big cut-out "happy birthday" across the top, two taped-down photo spots that overlap like prints stuck into a real book, and a few sweet stickers around the edges so the page feels finished before you have added a thing.',
      'Use one recent photo and one old one. A baby photo, a first-day-of-school picture or a blurry night-out shot next to a recent photo tells a story without any words, and it is the version people screenshot and keep.',
    ],
    tips: [
      'Put the person\'s best photo in the larger, upper spot. The eye lands on the top half of a Story first.',
      'Swap the champagne cat for something that is actually theirs: their favourite flower, a pet, a bow in their colour.',
      'Keep the bottom fifth fairly clear if you are posting to Stories. Instagram puts the reply bar there.',
      'Tag them with Instagram\'s own mention sticker after you upload, so the tag stays tappable.',
    ],
    captions: ['happy birthday to my favourite person', 'another trip around the sun ☼', 'main character day', 'make a wish ♡', 'officially one year cooler', 'cake first, questions later'],
    els: [
      { t: 'letters', text: 'happy birthday', x: 0.5, y: 0.11, s: 0.86, a: -2 },
      { t: 'slot', x: 0.37, y: 0.4, w: 0.52, h: 0.52, a: -5, frame: 'polaroid' },
      { t: 'slot', x: 0.66, y: 0.645, w: 0.44, h: 0.44, a: 6, frame: 'polaroid' },
      { t: 'tape', tape: 'pink-stripe', x: 0.37, y: 0.255, s: 0.3, a: -8 },
      { t: 'tape', tape: 'mint-dot', x: 0.66, y: 0.52, s: 0.26, a: 5 },
      { t: 'sticker', slug: 'stacked-macarons', x: 0.8, y: 0.27, s: 0.26, a: 8 },
      { t: 'sticker', slug: 'pink-satin-bow', x: 0.17, y: 0.63, s: 0.26, a: -10 },
      { t: 'sticker', slug: 'cat-drinking-champagne', x: 0.24, y: 0.85, s: 0.3, a: -4 },
      { t: 'sticker', slug: 'glossy-red-heart', x: 0.88, y: 0.93, s: 0.16, a: 12 },
      { t: 'hand', text: 'make a wish ♡', x: 0.64, y: 0.875, s: 0.42, a: -3 },
    ],
  },
  {
    slug: 'travel-diary',
    name: 'Travel diary',
    title: 'Travel diary scrapbook page template',
    description:
      'A free travel scrapbook page on kraft paper: three photo spots, cut-out "summer", shells, a starfish and a coconut drink. Add your holiday photos and save it as a Story.',
    blurb: 'Kraft paper, three photos, shells and a starfish.',
    paper: 'kraft',
    intro: [
      'A holiday camera roll is mostly near-duplicates. A travel page forces you to choose three photos that actually say where you were, which is exactly why it is nicer to look back on than a 40-picture dump.',
      'This template sits on kraft paper, like a travel journal, with three prints tumbling down the page, beachy stickers in the gaps and a handwritten line at the bottom. Change the cut-out word to the place name for a page that works as a postcard.',
    ],
    tips: [
      'Pick one wide shot (the view), one close-up (food, a ticket, your feet in the sand) and one with people in it. Three different distances make the page feel deep.',
      'Retype the title as the city or beach: short names of four to eight letters look best in cut-out letters.',
      'Kraft paper reads warm. If your photos are very blue (sea, sky), try the Sky or Cream paper instead.',
      'Make a page per day of the trip in the same paper and post them as a Story series.',
    ],
    captions: ['wish you were here', 'salt in the air, sand in my hair', 'postcard from somewhere warm', 'out of office ☼', 'collecting moments, not things', 'take me back'],
    els: [
      { t: 'letters', text: 'summer', x: 0.5, y: 0.085, s: 0.62, a: 3 },
      { t: 'slot', x: 0.3, y: 0.3, w: 0.44, h: 0.44, a: -6, frame: 'polaroid' },
      { t: 'slot', x: 0.7, y: 0.47, w: 0.44, h: 0.44, a: 5, frame: 'polaroid' },
      { t: 'slot', x: 0.36, y: 0.68, w: 0.5, h: 0.4, a: -3, frame: 'polaroid' },
      { t: 'tape', tape: 'kraft', x: 0.3, y: 0.185, s: 0.26, a: -10 },
      { t: 'tape', tape: 'clear', x: 0.7, y: 0.355, s: 0.24, a: 8 },
      { t: 'sticker', slug: 'coconut-hibiscus-drink', x: 0.8, y: 0.21, s: 0.26, a: 10 },
      { t: 'sticker', slug: 'orange-starfish', x: 0.14, y: 0.49, s: 0.2, a: -15 },
      { t: 'sticker', slug: 'pink-scallop-shell', x: 0.82, y: 0.73, s: 0.22, a: 12 },
      { t: 'sticker', slug: 'golden-sun-charm', x: 0.13, y: 0.83, s: 0.18, a: -6 },
      { t: 'sticker', slug: 'seashell-starfish-bouquet', x: 0.78, y: 0.91, s: 0.28, a: -6 },
      { t: 'hand', text: 'wish you were here', x: 0.42, y: 0.9, s: 0.5, a: -2 },
    ],
  },
  {
    slug: 'besties',
    name: 'Besties',
    title: 'Best friends scrapbook page template',
    description:
      'A free best-friends scrapbook page on grid paper: two portrait photos, cut-out "my girls", bows, lips and sparkle glasses. Add your photos and post it as a Story.',
    blurb: 'Grid paper, two portrait photos, bows and sparkles.',
    paper: 'grid',
    intro: [
      'Friend pages are the ones people actually reshare, because everyone on them wants a copy. This template uses two tall portrait spots, which suit the way phone photos of friends are usually taken, overlapping down a sheet of grid paper like a school notebook.',
      'Coquette bows, a lipstick kiss and sparkle glasses keep it playful. Swap the cut-out title for an inside joke or your group chat name and it stops being a template and starts being yours.',
    ],
    tips: [
      'Use portrait photos here. Landscape shots get cropped hard to fit the tall spots.',
      'Retype the title as the group chat name. Inside jokes get more replies than "besties".',
      'If there are more than two of you, add photos from the Photos tab and let them overlap. A crowded page suits a crowded friendship.',
      'Make a matching page for each friend\'s birthday through the year using the same paper and tape.',
    ],
    captions: ['core memories ✧', 'my people', 'the group chat in real life', 'partners in crime', 'never a dull moment', 'found my forever people'],
    els: [
      { t: 'letters', text: 'my girls', x: 0.5, y: 0.095, s: 0.7, a: -2 },
      { t: 'slot', x: 0.33, y: 0.36, w: 0.5, h: 0.62, a: -4, frame: 'polaroid' },
      { t: 'slot', x: 0.68, y: 0.6, w: 0.5, h: 0.62, a: 5, frame: 'polaroid' },
      { t: 'tape', tape: 'lilac-grid', x: 0.33, y: 0.19, s: 0.28, a: -6 },
      { t: 'tape', tape: 'pink-stripe', x: 0.68, y: 0.43, s: 0.26, a: 7 },
      { t: 'sticker', slug: 'pink-gingham-bow', x: 0.8, y: 0.21, s: 0.26, a: 12 },
      { t: 'sticker', slug: 'kiss-lips', x: 0.17, y: 0.66, s: 0.2, a: -10 },
      { t: 'sticker', slug: 'sparkle-glasses', x: 0.2, y: 0.87, s: 0.26, a: -6 },
      { t: 'sticker', slug: 'pink-doodle-star', x: 0.87, y: 0.88, s: 0.16, a: 10 },
      { t: 'hand', text: 'core memories ✧', x: 0.6, y: 0.93, s: 0.46, a: -2 },
    ],
  },
  {
    slug: 'photo-dump',
    name: 'Photo dump',
    title: 'Photo dump scrapbook page template',
    description:
      'A free photo dump scrapbook page: four photo spots with white borders on dotted paper, cut-out "photo dump", a film camera and a cassette tape. Add four photos and save it as one Story.',
    blurb: 'Four bordered photos, retro camera and cassette.',
    paper: 'dots',
    intro: [
      'A photo dump carousel scatters your week across ten slides that most people swipe past. Four photos on one page get seen together, in the order you chose, which is the whole point of a dump.',
      'This layout puts four white-bordered prints in a loose zig-zag on dotted paper, with a film camera and a cassette at the bottom for that retro camera-roll feeling. It works for a week, a month, a festival or a "things that made me happy lately" round-up.',
    ],
    tips: [
      'Mix close-ups and wide shots so the four prints don\'t all look the same size inside their frames.',
      'Choose one colour that appears in every photo (a red top, a blue sky) and the page will feel planned.',
      'The white border frame suits photo dumps better than polaroids: it keeps four photos from feeling heavy.',
      'Rename the title to the month — "october" in cut-out letters makes a monthly series.',
    ],
    captions: ['lately', 'photo dump ✧ no context', 'a week in pictures', 'recently on my camera roll', 'small things, good days', 'month in review'],
    els: [
      { t: 'letters', text: 'photo dump', x: 0.5, y: 0.075, s: 0.78, a: -1 },
      { t: 'slot', x: 0.29, y: 0.275, w: 0.46, h: 0.46, a: -3, frame: 'border' },
      { t: 'slot', x: 0.72, y: 0.33, w: 0.42, h: 0.52, a: 4, frame: 'border' },
      { t: 'slot', x: 0.3, y: 0.6, w: 0.44, h: 0.5, a: 3, frame: 'border' },
      { t: 'slot', x: 0.7, y: 0.7, w: 0.46, h: 0.46, a: -4, frame: 'border' },
      { t: 'tape', tape: 'night-star', x: 0.29, y: 0.145, s: 0.25, a: -6 },
      { t: 'tape', tape: 'butter-check', x: 0.72, y: 0.185, s: 0.25, a: 6 },
      { t: 'sticker', slug: 'retro-film-camera', x: 0.78, y: 0.9, s: 0.3, a: 8 },
      { t: 'sticker', slug: 'heart-cassette-tape', x: 0.24, y: 0.89, s: 0.3, a: -8 },
    ],
  },
  {
    slug: 'love',
    name: 'Love',
    title: 'Couple and love scrapbook page template',
    description:
      'A free love scrapbook page on lined paper: one big polaroid, cut-out "you & me", a sealed love letter, a red rose and a love coupon. Add your photo for an anniversary or Valentine\'s Story.',
    blurb: 'One big polaroid, love letter, rose and a coupon.',
    paper: 'lined',
    intro: [
      'A love page should feel like a note slipped into a book, not an advert. This one is built around a single large polaroid on lined notebook paper, with a handwritten line in the polaroid\'s white strip — the place people used to write dates and names on real instant photos.',
      'Around it: a sealed love letter, a rose, a lipstick kiss and a love coupon. It is made for anniversaries and Valentine\'s Day, but it works just as well for a long-distance "miss you" or a first-date memory.',
    ],
    tips: [
      'Pick a photo where you are both looking at each other, or at the same thing. It reads warmer than both looking at the camera.',
      'Rewrite the handwritten line in the polaroid strip with a date or a place. Specific beats sweet.',
      'Lined paper looks best with the photo tilted a few degrees off the lines. Use the corner handle to rotate it.',
      'For a private message, download it and send it in a chat instead of posting it.',
    ],
    captions: ['my favourite person', 'you & me, always', 'still my favourite hello', 'happy anniversary ♡', 'ten out of ten, would choose again', 'my safe place'],
    els: [
      { t: 'letters', text: 'you & me', x: 0.5, y: 0.095, s: 0.66, a: 2 },
      { t: 'slot', x: 0.5, y: 0.42, w: 0.66, h: 0.66, a: -3, frame: 'polaroid' },
      { t: 'tape', tape: 'red-heart', x: 0.5, y: 0.235, s: 0.3, a: -4 },
      { t: 'hand', text: 'my favourite person', x: 0.5, y: 0.645, s: 0.5, a: -3 },
      { t: 'sticker', slug: 'red-lips-kiss', x: 0.17, y: 0.25, s: 0.18, a: -12 },
      { t: 'sticker', slug: 'crumpled-paper-heart', x: 0.85, y: 0.24, s: 0.2, a: 12 },
      { t: 'sticker', slug: 'sealed-love-letter', x: 0.24, y: 0.79, s: 0.34, a: -8 },
      { t: 'sticker', slug: 'dark-red-rose', x: 0.79, y: 0.76, s: 0.3, a: 10 },
      { t: 'sticker', slug: 'love-coupon-ticket', x: 0.55, y: 0.92, s: 0.36, a: 4 },
    ],
  },
  {
    slug: 'pet-diary',
    name: 'Pet diary',
    title: 'Pet scrapbook page template',
    description:
      'A free pet scrapbook page on butter-yellow paper: two polaroids, cut-out "my baby", cat and teddy stickers and washi tape. Add photos of your cat or dog and save it as a Story.',
    blurb: 'Two polaroids, cut-out "my baby", cats and a teddy.',
    paper: 'butter',
    intro: [
      'Pet photos are the most-saved photos on most phones and the least-organised. A pet page is a reason to finally pick the two best ones: one portrait where they look noble, one where they look ridiculous.',
      'This template sets two polaroids on soft butter-yellow paper with cut-out "my baby" on top and a few animal stickers around them. Retype the title as your pet\'s name for a page that makes a nice gotcha-day or birthday post.',
    ],
    tips: [
      'Pet photos taken at their eye level look best in the big spot. Get down on the floor for the shot.',
      'Retype the title as the pet\'s name. Short names look great in big cut-out letters.',
      'Swap the cat stickers for dog ones if needed, or use stickers in the pet\'s colours.',
      'Do one page a year on their birthday or adoption day and you will have a book of them growing up.',
    ],
    captions: ['my baby', 'the real boss of the house', 'professional napper', 'happy gotcha day', 'best friend, four paws', 'too cute to function'],
    els: [
      { t: 'letters', text: 'my baby', x: 0.5, y: 0.095, s: 0.64, a: -2 },
      { t: 'slot', x: 0.36, y: 0.38, w: 0.56, h: 0.56, a: -4, frame: 'polaroid' },
      { t: 'slot', x: 0.68, y: 0.665, w: 0.44, h: 0.44, a: 6, frame: 'polaroid' },
      { t: 'tape', tape: 'mint-dot', x: 0.36, y: 0.225, s: 0.3, a: -7 },
      { t: 'tape', tape: 'pink-stripe', x: 0.68, y: 0.54, s: 0.26, a: 6 },
      { t: 'sticker', slug: 'cat-with-pink-bow', x: 0.81, y: 0.22, s: 0.26, a: 8 },
      { t: 'sticker', slug: 'heart-paws-bow-cat', x: 0.18, y: 0.68, s: 0.26, a: -8 },
      { t: 'sticker', slug: 'brown-teddy-bear', x: 0.24, y: 0.89, s: 0.24, a: -6 },
      { t: 'sticker', slug: 'hamster-peace-sign', x: 0.82, y: 0.9, s: 0.24, a: 10 },
    ],
  },
];

export const templateBySlug = (slug: string) => templates.find((t) => t.slug === slug);
