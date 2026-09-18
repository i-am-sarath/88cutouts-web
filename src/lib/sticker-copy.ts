/**
 * Page copy for a sticker detail page.
 *
 * The first version of this file gave every sticker the same three paragraphs
 * per category plus a block of instructions repeated verbatim on all 119
 * pages. Measured with 8-gram overlap, two sticker pages shared 62% of their
 * text on average and 93% at worst — longer than before, but still boilerplate,
 * which is exactly what an ad network means by scaled content.
 *
 * So nothing here is a fixed paragraph. Every section is assembled from
 * sentence pools by a generator seeded on the slug, and most of the sentences
 * are chosen by things that genuinely differ between stickers:
 *
 *   - its tags, which are near-unique (135 distinct tags, 94 used only once),
 *   - its colour words, which change the advice that is actually useful,
 *   - its real pixel dimensions, aspect ratio and file size,
 *   - the named siblings it links to.
 *
 * Instructions that are true of every sticker — how to paste into a Story, how
 * the opacity control works — deliberately live on one canonical page each and
 * are linked, not repeated. Repeating them is what created the 224-word
 * identical run.
 *
 * Seeded rather than random, so a page says the same thing on every build.
 */
import type { CollectionEntry } from 'astro:content';
import type { ImageMeta } from './image-meta';
import { formatBytes } from './image-meta';

/* ----------------------------------------------------------------- picking */

/** mulberry32 — small, fast, good enough for choosing sentences. */
function seeded(slug: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function one<T>(rand: () => number, list: T[]): T {
  return list[Math.floor(rand() * list.length)];
}

/** `k` distinct items, in an order that also depends on the seed. */
function some<T>(rand: () => number, list: T[], k: number): T[] {
  const copy = list.slice();
  const n = Math.min(k, copy.length);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rand() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/* ------------------------------------------------------------------ shape */

export type Shape = 'wide' | 'tall' | 'square';

export function shapeOf(meta: ImageMeta | null): Shape {
  if (!meta) return 'square';
  // The artwork box, not the canvas: a 720x900 file whose cutout is 204x417 is
  // a portrait sticker, whatever the file says.
  const ratio = meta.aw / meta.ah;
  if (ratio >= 1.25) return 'wide';
  if (ratio <= 0.8) return 'tall';
  return 'square';
}

const SHAPE_LINES: Record<Shape, string[]> = {
  wide: [
    'The file is wider than it is tall, which makes it a banner rather than a badge — laid across a 9:16 Story it acts like a header, and kept to about half the width it reads as an accent instead.',
    'Landscape shapes want horizontal space, so the natural homes for this one are a band across the top above your caption, a strip along the bottom edge, or straight through the middle of a plain background.',
    'Because it runs wide, a corner is the one place it does not work — the long axis ends up pointing at nothing. Give it a full horizontal band and it settles immediately.',
    'A wide cutout sitting just above or below the subject of a photo frames that subject without covering it, which is the trick this shape is best at.',
  ],
  tall: [
    'It is taller than it is wide, so it suits the edges of a Story rather than the middle — down the left or right side it fills the vertical space a 9:16 frame gives you for free.',
    'Portrait shapes work well as a column beside text: the eye reads the words and the shape as one block rather than as two objects competing for the same corner.',
    'This one has roughly the proportions of the screen it is going on, which makes placement unusually easy — anywhere along a vertical edge works, and scaled up it can run nearly the full height as a side border.',
    'Standing it against one edge and letting it run past the top or bottom of the frame is worth trying; a tall cutout survives being cropped far better than a wide one.',
  ],
  square: [
    'It is roughly square, which is the most forgiving shape there is — any corner, next to a caption, or centred over a plain background all work without adjustment.',
    'A square cutout scales down further than a long shape before it stops being readable, so this is the one to reach for when you want something small in a corner.',
    'If you are layering two or three stickers, a square one is the safest anchor to build the others around: long shapes fight each other, square ones stack.',
    'Being close to square, it reads much the same placed large in the middle or small at the edge, which makes it hard to get wrong.',
  ],
};

/* ----------------------------------------------------------------- subject */

/**
 * Lines per motif, keyed by tag. Tags are the most distinguishing thing a
 * sticker has, so this is where most of a page's individuality comes from.
 *
 * Tags used by three or more stickers carry a second variant: with one line
 * each, the ten stickers tagged `bow` all opened with the same sentence, which
 * is the duplication this file exists to avoid.
 */
const SUBJECT_LINES: Record<string, string | string[]> = {
  bow: [
    'A bow is a corner element before it is anything else — placed at a slight angle near the edge of a frame it reads as something tied on, while dead-centre and square to the edge it reads as clip art.',
    'Bows have an obvious top and bottom, so they only read correctly the right way up — which makes them one of the few cutouts where rotating past about twenty degrees starts to look like a mistake rather than a choice.',
  ],
  ribbon: [
    'Ribbon is one of the few motifs that works stretched: run it along an edge or let it trail off the side of the frame and it stops looking like a sticker and starts looking like something laid across the photo.',
    'The tails are what make a ribbon read as ribbon, so avoid cropping them against the edge of the frame — a trimmed ribbon just looks like a band of colour.',
  ],
  satin: [
    'The satin sheen is the detail doing the work here, and a highlight needs size to survive — keep it large enough that the fold in the fabric is still visible, or the whole thing flattens into a coloured shape.',
    'Because the surface is glossy, it argues with the bright areas of a photograph. Sitting it over a darker part of the image is what keeps the sheen legible.',
  ],
  gingham: [
    'Gingham is a printed pattern, and a small repeating check is the first thing to turn to mush when an image is compressed. Placed big it reads as fabric; placed tiny it reads as noise.',
    'Checked fabric brings its own grid, so keep it away from anything else with a repeating pattern — two grids in a frame vibrate against each other.',
  ],
  heart: [
    'A heart survives being shrunk further than almost any other shape, which is why it works in a corner at a size where anything more detailed would give up.',
    'Hearts are so legible that they are easy to overuse — one near a caption is a note, a ring of them around the frame is a filter.',
  ],
  love: [
    'It carries its meaning without a caption, so pairing it with words usually adds nothing — the shape has already said it.',
    'Sentimental motifs work better slightly hidden than centred: tucked behind the subject or running off the edge, they read as a detail rather than a statement.',
  ],
  flower: [
    'One bloom placed off-centre does more than three spread evenly; flowers are a motif where an odd, slightly awkward placement looks considered and a symmetrical one looks like a template.',
    'A single flower is one of the few cutouts that can carry a whole frame on its own, provided it is placed large and allowed to break the edge of the photo.',
  ],
  flowers: [
    'A group of blooms works best tucked into a corner and allowed to run off the edge, so it reads as a spray rather than a bouquet posed in the middle of the frame.',
    'Several blooms at clearly different sizes read as gathered; the same blooms at one size read as a repeated graphic.',
  ],
  floral: [
    'Botanical shapes have irregular outlines, which means they need a little clear space around them — pressed against a caption they lose the silhouette that makes them readable.',
    'Floral cutouts are busy by nature, so they want the quietest part of the photo. Over pattern they stop resolving into anything at all.',
  ],
  bouquet: 'A bouquet is a busy shape, so it wants a quiet photo underneath. Over a patterned background it stops resolving into anything.',
  botanical: 'The detail in a botanical cutout lives in the edges of the petals, and that is the first thing lost at small sizes — this one rewards being placed larger than feels necessary.',
  petals: 'Loose petals scatter well: three or four at different sizes and angles read as something that fell onto the photo rather than something that was placed on it.',
  pixel: [
    'The visible pixel steps are deliberate, so scale it in whole steps where you can. Smoothly enlarged, a pixel edge just looks like a blurry image rather than a stylistic choice.',
    'Hard pixel edges need hard company — next to a watercolour or a satin highlight they look like a rendering error rather than a reference.',
  ],
  y2k: 'Early-2000s graphics were hard-edged because the bandwidth demanded it, and reproducing that look means keeping the crunch — this one belongs over flat saturated colour or a flash-lit photo, not a soft grainy one.',
  retro: [
    'Analogue objects carry their nostalgia on their own, which is why one is normally enough. Two in a frame starts to read as a themed collage rather than as a detail.',
    'The appeal here is that the object is obsolete, not that the colours are warm — so it works just as well on a modern, clean photo as on a filtered one.',
  ],
  vintage: 'Worn, slightly faded objects sit best on photos that already have some age in the colour — against a bright, high-saturation image they can look pasted on.',
  music: [
    'Music motifs do most of their work next to a caption about a song: the object supplies the context so the words do not have to.',
    'An instrument or format is a shorthand for a whole mood, which is why one is enough. Two music objects in a frame start explaining themselves.',
  ],
  vinyl: 'A record is a circle, and circles are the one shape that survives being placed small without ambiguity — you can drop this one into a corner and it still reads instantly.',
  record: 'The grooves are fine concentric detail, which compression treats badly. Larger is safer here than it is for most cutouts.',
  cassette: 'A cassette is a wide rectangle with a lot of internal detail, so it wants to sit horizontally and at a decent size — shrunk small it becomes an unreadable grey block.',
  camera: 'A camera cutout reads as a caption about the photo itself, which makes it one of the few objects that comments on the Story rather than decorating it.',
  star: [
    'Stars work in threes at different sizes, scattered loosely. Evenly spaced and the same size, they read as a border, which is a much heavier effect than most photos want.',
    'A star has points that catch the eye from any angle, so it can sit closer to the subject of a photo than a rounder shape could without crowding it.',
  ],
  stars: 'Scatter them at different sizes rather than lining them up — irregularity is what stops a group of stars looking like a graphic overlay.',
  sparkle: 'Sparkles are an accent on top of an accent: they work over another cutout or at the edge of a subject, and almost never as the only thing in the frame.',
  glitter: 'Glitter texture is dense and high-contrast, so give it space — over a busy photo it disappears into the noise instead of adding to it.',
  shine: 'The highlight is the whole point of this one, and highlights compete with the bright areas of a photo. Place it over a darker part of the image and it reads properly.',
  sun: 'A sun motif sits naturally in a top corner, which is where the eye expects light to come from — putting it at the bottom of a frame feels subtly wrong even when nothing else is.',
  celestial: 'Celestial shapes suit dark photos and night shots, where they have something to contrast against. On a bright image they lose their glow.',
  moon: 'A moon works best small and high in the frame, with nothing else near it. Crowded, it stops reading as sky.',
  cat: 'These kittens are cut close to the fur, so they need a quiet patch of photo to sit on — against pattern the edge stops reading as an edge.',
  kitten: 'The silhouette is read first, so a kitten with a dark accessory — a beanie, glasses, a cap — survives being shrunk far better than a plain pale one.',
  bunny: 'The ears give this one a tall, distinctive outline, which means it stays recognisable even when it is small enough that the face has gone.',
  rabbit: 'A recognisable silhouette does the work here, so resist placing anything overlapping it — clipping the outline costs more than it would on a rounder shape.',
  animal: 'These are photographic rather than drawn, so what keeps them readable is tonal contrast with the photo behind them — check the background before committing to a size.',
  bear: 'A rounded, symmetrical shape like this one is happiest centred or in a corner, and it takes being scaled small better than an irregular cutout would.',
  coffee: 'Food and drink cutouts work as a label for the photo rather than as decoration — next to a morning shot they do the caption’s job without any words.',
  tea: 'It reads as a small aside rather than a subject, which makes it a good second element alongside something with a stronger silhouette.',
  food: 'Food shapes are usually warm-toned, so they fight warm photos and sit beautifully on cool or neutral ones. Check the background before committing to a size.',
  pastry: 'The texture is the appeal here, and texture needs pixels — this is not one to shrink into a corner.',
  cookie: 'A round, high-contrast shape reads instantly at small sizes, so it works as the small second element in a two-sticker composition.',
  paper: 'Paper cutouts are a base layer more than a subject: put something on top of this one, and rotate it a few degrees so the edge stops reading as a graphic.',
  scrap: 'Torn edges are what sell it, so avoid cropping this one — clipping a torn edge against the side of the frame removes the only thing that says paper.',
  'torn paper': 'Two overlapping scraps at slightly different angles give a depth that a single flat piece never does, and the effect costs nothing but a second copy.',
  texture: 'Texture layers work faded. At full strength this competes with the photo; at around half it becomes a surface for everything else to sit on.',
  tape: 'Tape reads as a fastening, so it wants to be crossing something — an edge, a corner, the join between two elements. Floating in clear space it loses the joke.',
  washi: 'A strip along the top edge makes a photo look taped down rather than floated on the screen, which is the quickest way to make a Story look assembled by hand.',
  letter: 'Lettering has one job, which is to be read at a glance — so it goes where the photo is quietest, not where the composition is most interesting.',
  letters: 'Cut-out letters carry texture that live text cannot fake, but they stop being legible sooner. Give them more size than you would give typed words.',
  text: 'Keep this above about 80% opacity. Legibility is the entire purpose, and faded lettering over a photograph loses it faster than any other kind of cutout.',
  'ransom note': 'The cut-out letter look reads as slightly urgent and slightly deadpan, which suits an announcement far better than it suits a caption.',
  envelope: 'An envelope implies something unopened, so it works on a Story that is teasing rather than telling — an announcement you have not made yet.',
  mail: 'Postal motifs suit dates and announcements, and they pair naturally with lettering rather than with other objects.',
  comic: 'A burst shape is loud by design — it will take over whatever frame it is in, so use it as the only sticker rather than one of several.',
  doodle: 'Hand-drawn lines are thin, and thin lines are the first casualty of compression. Place this one larger than you think, or it softens into nothing.',
  sketch: 'The rough line quality is the appeal, so it sits better on an imperfect photo than on a very clean one.',
  number: 'Numerals are the strongest characters there are at small sizes — wide, unambiguous, and readable at a size where letters have already given up.',
  pushpin: 'A pin implies something pinned, so put it overlapping the corner of a photo or a paper scrap rather than sitting on its own.',
  button: 'Small round objects read as punctuation in a frame — good as the last thing you add, rarely good as the first.',
  charm: 'Charms collect well: two or three different ones at varying sizes along one edge look deliberate in a way that one alone rarely does.',
  frame: 'This one goes under your photo rather than on top of it — add it first, scale it, then place the image behind so it fills the opening.',
  glossy: 'A glossy finish has a bright highlight, and highlights argue with the bright parts of a photograph. It sits best over a darker, quieter area.',
  cutout: 'The hand-cut edge is what separates this from a vector shape, so keep it large enough that the edge is still visible as an edge.',
};

/* ------------------------------------------------------------------ colour */

const COLOUR_LINES: Record<string, string> = {
  red: 'Red advances — it will be the first thing the eye lands on no matter where you put it, so place it where you actually want attention rather than where there happens to be room.',
  crimson: 'A deep crimson needs some darkness in the photo underneath or it floats. Against a pale, high-key image it can read as a hole rather than an object.',
  pink: 'Soft pink sits on almost anything, which is its strength and its problem: on an already-pink photo it disappears, and it wants a neutral or darker background to register at all.',
  blue: 'Blue recedes, so it sits back into a photo rather than jumping off it. That makes it good for a second element and poor for the thing you want noticed.',
  yellow: 'Yellow is the brightest colour at any given saturation, so it works against dark photos and vanishes against pale ones — the opposite of most of the library.',
  purple: 'Purple holds up unusually well against both light and dark backgrounds, which makes it a safe choice when you do not know what photo it is going on.',
  green: 'Green blends into anything with foliage or daylight in it. Over an indoor or neutral shot it stands out cleanly.',
  gold: 'Metallic tones depend on the contrast between highlight and shadow. On a flat, evenly lit photo the metal reads as plain yellow.',
  cream: 'Cream and off-white are the quietest things here — they need a mid-tone or dark photo behind them, or they simply do not appear.',
  white: 'Against a pale photo this will disappear. It is made for dark backgrounds, where it reads as a clean cut edge.',
  black: 'Black holds its silhouette at any size, which makes it the most reliable choice for something small — but it closes up into a blob if the shape has fine internal detail.',
  brown: 'Warm neutrals are the easiest colour to layer, because they argue with almost nothing. This is a good background element.',
  beige: 'A low-contrast neutral like this works as a supporting layer rather than a subject — put something with more contrast on top of it.',
  orange: 'Orange is warm and loud at once, so one is plenty. Two orange elements in a frame will compete rather than agree.',
  maroon: 'Deep, desaturated reds sit into a photo instead of on top of it, which makes them useful when you want the cutout noticed second rather than first.',
  lavender: 'Pale cool tones need a warm or dark photo behind them. On a bright neutral background they wash out completely.',
  mauve: 'Muted tones like this are for layering, not for headlining — pair it with something that has more contrast.',
  silver: 'Like all metallics, this depends on the light in the photo underneath. A flat image will flatten it too.',
};

/* ---------------------------------------------------------------- category */

/**
 * Several lines per shelf, sampled rather than concatenated, so two stickers
 * in the same category do not open with the same sentence.
 */
const CATEGORY_LINES: Record<string, string[]> = {
  coquette: [
    'The coquette look depends on restraint — one element near the edge of a frame does more than four scattered across it, because the style is about suggestion rather than decoration.',
    'Keep the palette to blush, cream and one deeper red. A fourth colour, especially a cool one, is usually what breaks this look.',
    'These sit best on soft photos: an outfit, a mirror shot, flowers on a table, a coffee in good light.',
    'Placed slightly crooked rather than square to the edge, a coquette cutout reads as something set down rather than stuck on.',
    'If a frame feels overloaded, remove something rather than resizing it — this is a style that fails by addition.',
  ],
  hearts: [
    'A single heart next to a caption is a note; a ring of them around the frame is a filter, and reads as one.',
    'If you want two in a frame, make them different finishes. Two identical hearts look duplicated, a paper one and a glossy one look collected.',
    'This is the shape that survives being repeated, which is why a loose scatter of three at different sizes works where most cutouts would not.',
    'Hearts pair with lettering better than they pair with other objects — the shape plus two or three words is a complete composition.',
  ],
  cute: [
    'Most of this shelf is photographic rather than drawn, and the accessory — a cap, glasses, a drink — is usually what keeps each one readable at small sizes.',
    'One cutout plus one small accent is usually the whole composition here. A third element starts to look like a sticker sheet.',
    'These suit photos that are already warm — a pet, a friend, food, a weekend — and they need a quiet patch of image to sit on.',
    'The characters are drawn low-contrast on purpose, so they read as warm rather than loud. They are supporting elements, not subjects.',
  ],
  retro: [
    'Nostalgia is usually applied as a colour grade; this shelf does it the other way round, with real objects that happen to be obsolete.',
    'Slightly desaturated or film-grain photos suit these best. Over a bright, high-saturation image an analogue object can look stuck on.',
    'These go with each other and with paper underneath, but not with the pixel-edged Y2K set — both are nostalgic, for different things, and the two read as two jokes told at once.',
    'One analogue object is a detail; two is a themed collage. The first is almost always what you want.',
  ],
  y2k: [
    'The hard edge is the whole point, so nothing in the frame should try to smooth it out — pair this with chunky lettering rather than with watercolour.',
    'Flat saturated backgrounds and flash-lit photos suit it. Soft, grainy or heavily filtered images work against it.',
    'Below about 60% opacity the effect breaks, because a pixel edge fading out reads as a compression artefact rather than a choice.',
    'Scale it in whole steps where the app lets you. Half-sizes are what turn a crisp pixel edge into mush.',
  ],
  flowers: [
    'Either one large bloom placed off-centre as a subject, or several small ones tucked around the edges — the middle ground of three evenly spaced flowers reads as a template.',
    'Mixing a watercolour bloom with a photographic one rarely works, because the eye reads them as belonging to different worlds. Pick a lane per Story.',
    'Flowers are one of the few things that can surround lettering without looking cluttered, which makes them the default choice for an announcement.',
    'This shelf takes fading better than any other — a bloom at 40% in the corner of a busy photo becomes a wash of colour rather than an object.',
  ],
  text: [
    'Put lettering where the photo is quietest, not where the composition is most interesting. The two are rarely the same place.',
    'Do not stack two text stickers in one frame. If you need more words, set the whole phrase in the cutout text maker instead.',
    'A ready-made word has texture and an irregular edge that live text cannot fake, which is the only reason to use one over Instagram’s own fonts.',
    'Text needs more size than it feels like it needs — what reads easily on a laptop is routinely too small on the phone it will actually be seen on.',
  ],
  paper: [
    'This is a base layer, not a subject. The job is to give everything else something to sit on, which means being the least attention-grabbing thing in the frame.',
    'Rotate it a few degrees. Perfectly aligned paper reads as a graphic; crooked paper reads as physical.',
    'Two overlapping pieces in slightly different tones give a scrapbook depth that one flat layer never does.',
    'Almost anything on the site works on top of paper, because paper is a neutral — this is the shelf most people skip and then wish they had not.',
  ],
  aesthetic: [
    'These are accents, meant to be noticed second. One tucked against the edge of the frame is the intended use, and the intended size is small.',
    'Group them along one edge rather than putting one in each corner — grouped they read as a composition, spread they read as a border.',
    'There is not much internal detail to hold up at size, so scaling one of these large tends to expose it rather than show it off.',
    'This is the element that finishes a frame that is nearly done, rather than the one you start from.',
  ],
  frames: [
    'A frame changes the crop of your photo, not just its border, so pick an image with space around the subject or the opening will cut into it.',
    'If you add anything else, put it overlapping the border rather than inside the opening, so the frame still reads as an edge.',
    'Frames want full opacity. The border is structural, and a faded border stops reading as an edge at all.',
    'Add the frame first and scale it, then place the photo behind — doing it the other way round means fighting the layer order.',
  ],
  seasonal: [
    'Calendar cutouts compete with a lot of near-identical Stories on the day they matter, so placement counts more than usual: off-centre and large beats small and tidy.',
    'Use it on the first Story in a set rather than on every frame. Repeating a date across six Stories dilutes it.',
    'Keep it solid. A date is information, and information should not be translucent.',
    'These pair with lettering rather than with other objects — a date and a short phrase is a complete announcement.',
  ],
  general: [
    'This is one of the cutouts that does not belong to a single look, which is exactly what makes it useful — a plain shape works next to almost anything.',
    'Take the element that sets the mood from a themed shelf and let this one be the supporting piece. One strong identity plus one neutral is what stops a Story looking like a sticker sheet.',
    'The usual placement is near a corner or beside a caption, sized small enough to decorate the frame rather than claim it.',
    'Around 70% opacity suits most uses of something like this: enough presence to be seen, not so much that it pulls the eye off the photo.',
  ],
};

/* --------------------------------------------------------------- placement */

const PLACEMENT_LINES = [
  'Keep it inside the safe zone — Instagram covers roughly the top 250 and bottom 320 pixels of a 1080 × 1920 Story with its own interface.',
  'Placing it over a quiet part of the photo rather than the busiest part does more for legibility than any amount of resizing.',
  'Rotating a cutout a few degrees off true is usually worth doing; perfectly upright reads as an overlay, slightly crooked reads as an object.',
  'If it is competing with the subject of the photo, make it smaller before you make it fainter — size is the gentler adjustment.',
  'Overlapping the edge of the frame, so part of the cutout runs off-screen, is a quick way to stop a Story looking centred and static.',
  'Two elements at clearly different sizes look deliberate; two at similar sizes look like a mistake.',
  'Leave one part of the frame completely empty. A Story with nothing in one corner reads as composed rather than filled.',
  'If you are adding more than one cutout, put them on the same side of the frame rather than balancing them across it.',
];

/* ------------------------------------------------------------------ specs */

export function specs(meta: ImageMeta | null, type: string): { k: string; v: string }[] {
  const out: { k: string; v: string }[] = [
    { k: 'Format', v: 'PNG-32 with a real alpha channel' },
  ];
  if (meta) {
    const ratio = meta.aw / meta.ah;
    out.push({ k: 'File', v: `${meta.w} × ${meta.h} px PNG` });
    // Stated separately when the canvas carries a wide transparent margin --
    // the artwork box is what you actually see once it is pasted.
    if (meta.fill < 0.75) {
      out.push({
        k: 'Artwork',
        v: `${meta.aw} × ${meta.ah} px inside a transparent margin`,
      });
    }
    out.push({ k: 'Weight', v: formatBytes(meta.bytes) });
    out.push({
      k: 'Shape',
      v:
        ratio >= 1.25
          ? `landscape, ${ratio.toFixed(2)}:1`
          : ratio <= 0.8
            ? `portrait, 1:${(1 / ratio).toFixed(2)}`
            : 'roughly square',
    });
  }
  out.push({
    k: 'Background',
    v:
      meta && meta.fill < 0.75
        ? 'none — fully transparent, including the margin'
        : 'none — transparent to the edge of the artwork',
  });
  out.push({
    k: 'Use',
    v: type === 'frame' ? 'sits under your photo as a border' : 'sits on top of your photo',
  });
  out.push({ k: 'Licence', v: 'free for personal use, no attribution' });
  return out;
}

/* ------------------------------------------------------------- assembling */

const H_ABOUT = [
  'Where {t} works',
  'When to reach for {t}',
  'What {t} is good for',
  'Using {t} in a Story',
  'How {t} behaves on a photo',
];

const H_PLACE = [
  'Placing it',
  'Where to put it',
  'Getting the placement right',
  'Size and position',
  'On the frame',
];

const H_PAIR = [
  'What it goes with',
  'Pairing it',
  'What to put beside it',
  'Building a frame around it',
];

/**
 * The closing "read the guide" pointer. It was one fixed sentence on all 119
 * pages, which is 35 words of pure duplication for no reader benefit.
 */
const ASIDES = [
  'The mechanics of pasting one of these into a Story are covered once in <a href="/blog/how-to-add-stickers-to-instagram-stories/">adding stickers to Instagram Stories</a>.',
  'If a cutout keeps landing with a white box behind it, <a href="/blog/transparent-png-turns-grey-explained/">why a transparent PNG turns grey</a> explains what is happening.',
  'Which parts of the frame Instagram covers with its own interface is set out in <a href="/blog/instagram-story-size-and-safe-zones/">Story size and safe zones</a>.',
  'Everything behind how these files are cut and cleaned is in <a href="/blog/how-to-make-transparent-png-stickers/">making transparent PNG stickers</a>.',
  'For putting a whole look together rather than one sticker, see <a href="/blog/build-a-cohesive-instagram-aesthetic/">building a cohesive Instagram aesthetic</a>.',
  'If copying images fails in your browser, <a href="/blog/copy-image-to-clipboard-guide/">copying an image to the clipboard</a> covers the fallbacks.',
];

export interface StickerCopy {
  sections: { h: string; p: string[] }[];
  faq: { q: string; a: string }[];
  /** HTML — one varied pointer to a guide, not the same line on every page. */
  aside: string;
}

export function stickerCopy(
  entry: CollectionEntry<'stickers'>,
  meta: ImageMeta | null,
  related: CollectionEntry<'stickers'>[]
): StickerCopy {
  const rand = seeded(entry.slug);
  const { title, category, type } = entry.data;
  const tags = entry.data.tags.map((t) => t.toLowerCase());
  const shape = shapeOf(meta);

  // Sentences drawn from this sticker's own tags — the part no other page has.
  // A tag with several variants contributes one of them, picked by this
  // sticker's own seed, so two stickers sharing a tag rarely share the line.
  const subject = tags
    .map((t) => {
      const line = SUBJECT_LINES[t];
      if (!line) return null;
      return Array.isArray(line) ? one(rand, line) : line;
    })
    .filter((l): l is string => Boolean(l));
  const colour = tags.map((t) => COLOUR_LINES[t]).filter(Boolean);
  const catLines = CATEGORY_LINES[category.toLowerCase()] ?? CATEGORY_LINES.general;

  const about: string[] = [];
  if (subject.length) about.push(...some(rand, subject, 2));
  about.push(...some(rand, catLines, subject.length ? 1 : 2));
  if (colour.length) about.push(one(rand, colour));

  const placing: string[] = [one(rand, SHAPE_LINES[shape]), ...some(rand, PLACEMENT_LINES, 2)];

  if (meta) {
    const longest = Math.max(meta.aw, meta.ah);
    const room = longest >= 800 ? 'about half a Story wide' : 'about a third of a Story wide';
    placing.push(
      one(rand, [
        `The artwork measures ${meta.aw} × ${meta.ah}, so it holds up to ${room} before the edges start to soften.`,
        `At ${meta.aw} × ${meta.ah} pixels of actual artwork there is room to place it ${room} and no further — past that it is inventing detail it does not have.`,
        `${meta.aw} × ${meta.ah} pixels of artwork is enough for ${room}; the file is ${formatBytes(meta.bytes)}, which is why Copy is instant rather than a wait.`,
        `The cutout itself is ${meta.aw} × ${meta.ah} and stays crisp up to ${room}, and the ${formatBytes(meta.bytes)} file copies in one tap.`,
      ])
    );
    if (meta.fill < 0.75) {
      placing.push(
        `Worth expecting: the PNG is ${meta.w} × ${meta.h} with the cutout sitting inside a transparent margin, so it pastes in smaller than the box around it. Scale it up until the artwork is the size you want and ignore the empty space.`
      );
    }
  }

  const sections = [
    { h: one(rand, H_ABOUT).replace('{t}', title), p: about },
    { h: one(rand, H_PLACE), p: placing },
  ];

  // Pairing is already unique per page because it names real neighbours; one
  // sampled category line gives the paragraph around it some variety too.
  const pairLines = some(rand, catLines, 1);
  if (pairLines.length) {
    sections.push({ h: one(rand, H_PAIR), p: pairLines });
  }

  return {
    sections,
    faq: stickerFaq(entry, meta, rand, related),
    aside: one(rand, ASIDES),
  };
}

/* -------------------------------------------------------------------- faq */

function stickerFaq(
  entry: CollectionEntry<'stickers'>,
  meta: ImageMeta | null,
  rand: () => number,
  related: CollectionEntry<'stickers'>[]
): { q: string; a: string }[] {
  const { title, type, category } = entry.data;
  const tags = entry.data.tags.map((t) => t.toLowerCase());
  const shape = shapeOf(meta);
  const sibling = related[0]?.data.title;

  const pool: { q: string; a: string }[] = [];

  if (meta) {
    pool.push({
      q: `What size is ${title}?`,
      a: `The file is ${meta.w} × ${meta.h} pixels and about ${formatBytes(meta.bytes)}, saved as a PNG-32${
        meta.fill < 0.75 ? `, with the cutout itself ${meta.aw} × ${meta.ah} inside a transparent margin` : ''
      }. That is ${
        shape === 'wide'
          ? 'a landscape shape, so it wants a horizontal band rather than a corner'
          : shape === 'tall'
            ? 'a portrait shape, so it suits a vertical edge of the frame'
            : 'close to square, so it drops into any corner without adjustment'
      }.`,
    });
  }

  pool.push({
    q: `Can I use ${title} for free?`,
    a: `Yes, for anything personal — your Stories, your chats, your notes, a card for a friend. No account, no watermark, no credit needed. Reselling it or bundling it into a paid pack is the line. Full terms are on the about page.`,
  });

  pool.push({
    q: `How see-through can I make it?`,
    a: `Anywhere from 5% to full, using the control above the buttons. ${
      category === 'text' || category === 'frames'
        ? 'This one is an exception to the usual advice though — keep it high, because legibility is the whole point and a faded version stops doing its job.'
        : shape === 'square'
          ? 'Around 45% is a good starting point for laying it over a photo, since a compact shape stays readable further down than a detailed one.'
          : 'Around 60% tends to be the floor for a shape this size — below that the outline starts to go.'
    }`,
  });

  if (tags.length) {
    pool.push({
      q: `What is ${title} tagged as?`,
      a: `${tags.slice(0, 4).join(', ')}${tags.length > 4 ? ` and ${tags.length - 4} more` : ''} — it sits on the ${category} shelf. The tags are how the search box on this site finds it, so if you are looking for something similar, searching any one of those words will surface the rest.`,
    });
  }

  if (sibling) {
    pool.push({
      q: `What goes well with ${title}?`,
      a: `${sibling} is the closest match in the library, and the rest of the ${category} set is built to the same palette. As a rule, one element with a strong identity plus one neutral supporting piece is enough for a single Story.`,
    });
  }

  if (type === 'frame') {
    pool.push({
      q: 'How do I put my photo inside it?',
      a: 'Add the frame to your Story first and scale it, then place your photo behind it. In a layered editor, put the image underneath and export the flattened result.',
    });
  } else {
    pool.push({
      q: `Where should ${title} go in a Story?`,
      a: `${
        shape === 'wide'
          ? 'Across a horizontal band — above your caption or along the bottom edge.'
          : shape === 'tall'
            ? 'Down one of the vertical edges, where it fills the space a 9:16 frame gives you for free.'
            : 'Any corner, or beside a caption.'
      } Keep it clear of the top 250 and bottom 320 pixels, which Instagram covers with its own interface.`,
    });
  }

  pool.push({
    q: `Why does ${title} look soft when I scale it up?`,
    a: meta
      ? `Because the artwork is ${Math.max(meta.aw, meta.ah)} pixels on its longest edge, and a Story is 1080 wide. Stretched to fill the frame it has to invent detail it does not have. Placed at half the frame width or less it stays crisp.`
      : `Because it is being scaled past its native size. Placed at half the frame width or less it stays crisp.`,
  });

  // Four per page, chosen by seed, so no two pages carry the same set in the
  // same order.
  return some(rand, pool, 4);
}
