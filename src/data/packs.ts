/**
 * Sticker packs: small themed sets picked from the library by hand, each one
 * meant to dress a single Story. A pack page lays its stickers out as one
 * cluster you can copy in a tap, and links into the collage maker narrowed to
 * that pack (/collage-maker/?pack=<slug>).
 *
 * `stickers` are sticker slugs (file names in src/content/stickers). A slug
 * that doesn't resolve is dropped with a build warning, so deleting a sticker
 * never breaks a pack.
 */
export interface PackData {
  slug: string;
  name: string;
  /** <title>, without the site suffix. */
  title: string;
  /** One line: the card caption and meta description. */
  blurb: string;
  /** Opening paragraphs of the pack page. */
  intro: string[];
  /** Concrete Story ideas this pack suits. */
  ideas: string[];
  /** A note on what to pair it with, or how to place it. */
  tip: string;
  /** Suggested words for the collage maker. */
  phrase: string;
  stickers: string[];
}

export const packs: PackData[] = [
  {
    slug: 'beach-day',
    name: 'Beach day',
    title: 'Beach day sticker pack — shells, starfish & coconut drinks',
    blurb: 'Seashells, starfish, a coconut drink and a plumeria: everything a holiday photo dump needs, in one copy.',
    intro: [
      'A beach Story usually starts with a photo that is already doing most of the work: sea, sand, a lot of sky. What it lacks is something at hand scale, the small objects you actually picked up. This pack is those objects: a pearl oyster, an iridescent conch, two starfish, scallops in teal and blush, a coconut drink with a hibiscus in it and one plumeria.',
      'The colours are held to warm corals, sand and a single cool teal, so they sit on a sunset photo and a midday one equally well. None of them is bright enough to compete with the water, which is the usual problem with beach clip art.',
    ],
    ideas: [
      'A holiday photo dump: one shell in each corner of the first slide, the rest spread across the following Stories.',
      'A "last day" Story: the coconut drink beside the date in cut-out letters.',
      'A packing-list Story over a photo of your suitcase, with a starfish marking each ticked item.',
    ],
    tip: 'Shells look best tucked half off the edge of the photo, as if they were lying on the sand beneath it. Keep one sticker per edge, not per corner.',
    phrase: 'beach day',
    stickers: [
      'orange-starfish',
      'pink-scallop-shell',
      'iridescent-pink-conch-shell',
      'pearl-oyster-shell',
      'coconut-hibiscus-drink',
      'pink-plumeria-flower',
      'teal-scallop-shell',
      'red-starfish',
    ],
  },
  {
    slug: 'coquette-bows',
    name: 'Coquette bows',
    title: 'Coquette bow sticker pack — satin, gingham & polka dot bows',
    blurb: 'Satin, gingham and polka-dot bows with a kiss mark and a striped tag, for the soft pink end of your feed.',
    intro: [
      'The bow is the single most recognisable element of the coquette look, and the easiest to overdo. This pack gives you five that sit together without clashing: pink satin, red gingham, black polka dot, beige gingham and a dusty rose satin, plus a lipstick kiss and a striped gift tag for when a caption needs something beside it.',
      'They share a palette of blush, cream, cherry red and one black, which is the palette the style actually runs on. The black bow is there on purpose: a set of only pale pinks disappears on a light photo, and one dark note is what keeps the others visible.',
    ],
    ideas: [
      'A mirror selfie with a bow on each top corner of the frame, the way you would clip ribbons to a printed photo.',
      'A "get ready with me" sequence, with the gift tag labelling each step.',
      'A birthday Story for a friend: their photo, the kiss mark in the corner, their name in cut-out letters.',
    ],
    tip: 'Use two bows at most on one Story, at matching angles. Coquette looks deliberate when it repeats and cluttered when it scatters.',
    phrase: 'pretty girl',
    stickers: [
      'pink-satin-bow',
      'red-gingham-bow',
      'black-polka-dot-bow',
      'beige-gingham-bow',
      'rose-satin-bow',
      'kiss-lips',
      'pink-striped-tag',
    ],
  },
  {
    slug: 'autumn-academia',
    name: 'Autumn academia',
    title: 'Autumn academia sticker pack — plaid bows, letters & coffee',
    blurb: 'Plaid and velvet bows, a sealed letter, lined paper and black coffee: a study-desk palette for colder months.',
    intro: [
      'Autumn Stories tend to be browner, quieter and more indoor than summer ones: a desk, a book, a window, a coffee going cold. This pack is built for that palette. Four bows in brown plaid, green plaid, navy plaid and maroon velvet, a sealed love letter, a torn scrap of lined paper, a vintage clip and a top-down black coffee.',
      'Everything is in deep, slightly muted tones, so it reads as warm rather than gloomy against a dim photo. It is the opposite of the coquette pack: the same idea of paper and ribbon, but in wool colours instead of pastels.',
    ],
    ideas: [
      'A study-session Story: coffee in one corner, the lined-paper scrap carrying your to-do list.',
      'A reading update, with the book cover photo and a plaid bow pinned to the top edge.',
      'A "letter to October" Story: the sealed envelope over a photo of falling leaves.',
    ],
    tip: 'Photos with warm, low light suit this pack best. Over a cold blue photo the browns go muddy, so warm the photo slightly before adding them.',
    phrase: 'hello october',
    stickers: [
      'brown-plaid-bow',
      'maroon-velvet-bow',
      'navy-plaid-bow',
      'green-plaid-bow',
      'sealed-love-letter',
      'torn-lined-paper-scrap',
      'brown-vintage-clip',
      'black-coffee-top-view',
    ],
  },
  {
    slug: 'cat-lovers',
    name: 'Cat lovers',
    title: 'Cat sticker pack — funny cats in hoodies, sunglasses & flower crowns',
    blurb: 'Eight cats with opinions: a shark hoodie, wet sunglasses, a boba tea, a facepalm and a flower crown.',
    intro: [
      'Cat stickers work because each one is a reaction. This pack picks eight that cover most of the moods you would want to reply with: a cat in a shark hoodie, a wet cat in sunglasses, a boba-tea cat, one in a flower crown, a surprised face, a facepalm, a small orange cat and one holding a heart with a bow.',
      'They are photographic rather than drawn, so they sit more naturally on real photos than cartoon stickers do. Use one as the punchline of a Story, not as decoration: a single surprised cat beside a screenshot says more than a caption would.',
    ],
    ideas: [
      'A reaction Story: a screenshot or a photo, and the facepalm or surprised cat beside it.',
      'A "my weekend" photo dump, with a different cat on each slide as the running joke.',
      'A friend\'s birthday: the flower-crown cat and their name in cut-out letters.',
    ],
    tip: 'Keep it to one cat per Story. Two cats side by side read as a sticker sheet; one cat reads as a comment.',
    phrase: 'no thoughts',
    stickers: [
      'cat-in-shark-hoodie',
      'wet-cat-sunglasses',
      'boba-tea-cat',
      'cat-with-flower-crown',
      'surprised-cat-face',
      'facepalm-cat',
      'little-orange-cat',
      'heart-paws-bow-cat',
    ],
  },
  {
    slug: 'birthday',
    name: 'Birthday',
    title: 'Birthday sticker pack for Instagram Stories',
    blurb: 'Cut-out "happy birthday" letters, a champagne cat, macarons, tulips, sparkles and a bow: one wish, fully dressed.',
    intro: [
      'A birthday Story for someone else has one job: their photo, their name and enough decoration that it looks like you made an effort. This pack covers the decoration. Ready-made "happy birthday" letters, a cat raising a glass of champagne, a stack of macarons, a tulip bouquet, blue sparkle stars, a pink satin bow and a glossy red heart.',
      'The cut-out letters are the anchor. Put them across the top or bottom band of the Story, then add two or three of the others around the photo. If you want their name in the same style, the collage maker below builds it from the same paper-letter set.',
    ],
    ideas: [
      'A birthday shout-out: their photo in the middle, the letters across the top, macarons and tulips on the lower corners.',
      'A countdown to your own birthday, with the sparkle stars beside the number of days left.',
      'A throwback slide: an old photo of the two of you with the champagne cat in the corner.',
    ],
    tip: 'Keep Instagram\'s top 250 and bottom 320 pixels clear. The profile bar and the reply field cover them, and a birthday message that disappears under "Send message" undoes the point.',
    phrase: 'happy birthday',
    stickers: [
      'happy-birthday-cutout-letters',
      'cat-drinking-champagne',
      'stacked-macarons',
      'pink-tulip-bouquet',
      'blue-sparkle-stars',
      'pink-satin-bow',
      'glossy-red-heart',
    ],
  },
  {
    slug: 'love-letters',
    name: 'Love letters',
    title: 'Love letter sticker pack — envelopes, hearts, roses & kisses',
    blurb: 'Sealed envelopes, a love coupon, lipstick kisses, paper hearts and a red rose, for anniversaries and soft-launches.',
    intro: [
      'This is the romantic pack, without tipping into greeting card territory. A sealed love letter, a tulip envelope, a love coupon, a red lipstick kiss, a glossy heart, a crumpled paper heart, a polka-dot heart and one dark red rose.',
      'The crumpled heart and the envelopes are what keep it from being saccharine. They are paper objects with creases and edges, so they look found rather than printed. Pair them with a real photo rather than a plain background and the whole thing reads as a scrapbook page rather than an e-card.',
    ],
    ideas: [
      'An anniversary Story: an old photo and a new one side by side, the sealed letter between them.',
      'A soft-launch: a photo of two hands or two drinks, one heart and nothing else.',
      'A love coupon for a friend: the coupon sticker, and what it is for in cut-out letters.',
    ],
    tip: 'Red is loud on a Story. Use one red element (the kiss, the rose or the glossy heart) and let the paper pieces do the rest.',
    phrase: 'love you',
    stickers: [
      'sealed-love-letter',
      'tulip-letter-envelope',
      'love-coupon-ticket',
      'red-lips-kiss',
      'glossy-red-heart',
      'crumpled-paper-heart',
      'polka-dot-heart',
      'dark-red-rose',
    ],
  },
  {
    slug: 'retro-music',
    name: 'Retro music',
    title: 'Retro music sticker pack — vinyl, cassettes, guitar & gramophone',
    blurb: 'A heart vinyl, cassettes, a gramophone, a red guitar, a microphone and headphones: for sharing what you have on repeat.',
    intro: [
      'Sharing a song to your Story gives you Instagram\'s own music sticker, which looks the same on everyone\'s. This pack is for dressing it up: a heart-shaped vinyl record, a heart cassette, a stack of mix tapes, a red electric guitar, a vintage gramophone, a red music note, a silver microphone and white wireless headphones.',
      'The old and new pieces are mixed on purpose. A gramophone next to wireless headphones is a small joke about how you listen now versus how the song was recorded, and it gives the Story a point of view instead of just a track name.',
    ],
    ideas: [
      'A "song of the week" Story: the music sticker in the middle, a vinyl half-hidden behind it.',
      'A concert photo dump, with the microphone and the guitar on the ticket shot.',
      'A playlist share: the cassette stack and the playlist name in cut-out letters.',
    ],
    tip: 'Put a record behind Instagram\'s music sticker rather than beside it, so it looks as if the record is playing. Paste the record first, then the music sticker, so it stays on top.',
    phrase: 'on repeat',
    stickers: [
      'heart-vinyl-record',
      'heart-cassette-tape',
      'mix-tape-stack',
      'red-electric-guitar',
      'vintage-gramophone',
      'red-music-note',
      'silver-microphone',
      'white-wireless-headphones',
    ],
  },
  {
    slug: 'tropical-flowers',
    name: 'Tropical flowers',
    title: 'Tropical flower sticker pack — hibiscus, plumeria & dahlia',
    blurb: 'Hibiscus in three pinks, plumeria, an orange dahlia and a flower-topped coconut: bold blooms for summer Stories.',
    intro: [
      'Tropical flowers are the brightest things in the library, and this pack uses that. Three hibiscus, from bright to pastel, a pink plumeria, a pink-and-yellow plumeria, an orange dahlia and a coconut with a flower tucked into it.',
      'Where the beach pack is soft and sandy, this one is saturated. It suits photos with strong light and deep shadows, like a pool, a market or a street at noon, where a pastel sticker would wash out.',
    ],
    ideas: [
      'A summer outfit photo with a hibiscus tucked behind the ear, as a sticker.',
      'A travel Story: the destination in cut-out letters, flowers clustered around the first letter.',
      'A pool-day dump with a single plumeria floating on the water in each photo.',
    ],
    tip: 'Tropical flowers look most natural in odd numbers and slightly overlapping, the way a lei or a bouquet is arranged. Three together in one corner beats one in each corner.',
    phrase: 'summer',
    stickers: [
      'pink-hibiscus-flower',
      'bright-pink-hibiscus',
      'pastel-hibiscus-flower',
      'pink-plumeria-flower-1',
      'pink-yellow-plumeria',
      'orange-dahlia',
      'coconut-with-flower',
    ],
  },
  {
    slug: 'lily-bouquet',
    name: 'Lily bouquet',
    title: 'Lily & bouquet sticker pack — stargazer, leopard lily, tulips & sunflowers',
    blurb: 'Stargazer, leopard-print and dark red lilies, tulips, sunflowers and lavender: a whole florist\'s bench to arrange.',
    intro: [
      'This pack is for building a bouquet on the Story itself. Stargazer, leopard-print, cream and dark red lilies for height, a tulip bouquet, a sunflower bouquet and a bunch of lavender for bulk, and a peach blossom to finish.',
      'Arranged together they make one large floral shape. Pasted alone, any of them is a clean single stem. The leopard-print lily is the odd one out, a flower with a pattern on it, and it is usually the one people remember.',
    ],
    ideas: [
      'A "flowers for you" Story: stack the bouquets into one arrangement over a plain background, with a name in cut-out letters.',
      'A Mother\'s Day or graduation post, with the lilies framing the photo on both sides.',
      'A plant-shop visit, with a single stem pasted over each photo in the dump.',
    ],
    tip: 'Build a bouquet from the back forward: paste the tall lilies first, then the bouquets, then the small blossom last so it sits on top.',
    phrase: 'for you',
    stickers: [
      'pink-stargazer-lily',
      'leopard-print-lily',
      'cream-lily',
      'dark-red-lily',
      'pink-tulip-bouquet',
      'sunflower-bouquet',
      'lavender-bouquet',
      'peach-blossom',
    ],
  },
  {
    slug: 'scrapbook-kit',
    name: 'Scrapbook kit',
    title: 'Digital scrapbook sticker pack — washi tape, paper scraps & pins',
    blurb: 'Washi tape, torn kraft and lined paper, clips, pushpins and a plaster: the hardware for pinning photos to a Story.',
    intro: [
      'Most of what makes a scrapbook page look like a scrapbook page is not the pictures, it is what holds them down. This pack is that hardware: floral and starry-night washi tape, a torn kraft-paper scrap, a torn lined-paper scrap, a cream paper clip, a maroon pushpin, a gold flower pushpin and a star plaster.',
      'Put a strip of tape across the corner of a photo and it stops being a photo on a Story and becomes a photo stuck to a page. That small change is the whole digital-scrapbook look, and it works on any photo in any palette.',
    ],
    ideas: [
      'A photo dump where every photo is taped or pinned, as if it were a page in a journal.',
      'A handwritten-note Story: the lined paper scrap with your text on it, clipped at the top.',
      'A travel diary slide: the ticket or map photo pinned, with the date on the kraft scrap.',
    ],
    tip: 'Tape goes across corners at roughly 45°, pins go near the top edge, clips go on the top edge itself. Getting that right is what makes it look real.',
    phrase: 'core memory',
    stickers: [
      'floral-washi-tape',
      'starry-night-washi-tape',
      'torn-kraft-paper-scrap',
      'torn-lined-paper-scrap',
      'cream-paper-clip',
      'maroon-pushpin',
      'golden-flower-pushpin',
      'star-bandage-plaster',
    ],
  },
  {
    slug: 'y2k-pixel',
    name: 'Y2K pixel',
    title: 'Y2K pixel sticker pack — pixel hearts, old computer & sparkles',
    blurb: 'Pixel hearts, a pixel speech bubble, 8-bit sunglasses, an old computer and sparkles, straight from a 2003 desktop.',
    intro: [
      'The y2k look online is mostly pixel art and sparkle: the icons of early chat apps, the hearts from a game, a beige computer. This pack collects them: a row of pixel hearts, a pixel heart speech bubble, 8-bit sunglasses, a retro pixel computer, a pixel graduation cap, blue sparkle stars, sparkle glasses and an "OMG" comic burst.',
      'Pixel art is deliberately low-resolution, so these hold up at small sizes better than any other stickers in the library. That makes them the best choice for a corner of a busy Story, where a detailed sticker would turn to mush.',
    ],
    ideas: [
      'A "status update" Story: the speech bubble beside your news, the OMG burst for emphasis.',
      'A gaming or late-night Story with the computer and the pixel hearts.',
      'A graduation post, with the pixel cap on your head in the photo.',
    ],
    tip: 'Don\'t rotate pixel stickers. The appeal is the hard grid, and tilting them makes the pixels look like a mistake.',
    phrase: 'omg',
    stickers: [
      'pixel-heart-row',
      'pixel-heart-speech-bubble',
      'pixel-sunglasses',
      'retro-pixel-computer',
      'pixel-graduation-cap',
      'blue-sparkle-stars',
      'sparkle-glasses',
      'omg-comic-burst',
    ],
  },
  {
    slug: 'cafe-date',
    name: 'Café date',
    title: 'Café sticker pack — iced coffee, pastries, macarons & cookies',
    blurb: 'Iced coffee, a black coffee, a coffee cat, a pretzel, macarons, a palmier and a heart cookie: for every café photo.',
    intro: [
      'Café Stories are one of the most-posted things on Instagram and one of the hardest to make interesting: it is usually a cup on a table. This pack is for making that cup the start of something. Iced coffee in a clear cup, black coffee from above, a cat holding an iced coffee, a soft pretzel, a stack of macarons, a heart-shaped palmier, a heart-shaped chocolate chip cookie and a pair of round glasses.',
      'Everything is photographed food, so it blends into a real table photo rather than floating on top of it.',
    ],
    ideas: [
      'A café review: the photo of your order, and the pastry sticker you would have ordered instead.',
      'A "study date" Story, with the coffee and the round glasses beside your notes.',
      'A café crawl dump, with a different pastry on each slide and the café names in cut-out letters.',
    ],
    tip: 'Match the light. A sticker photographed in bright daylight looks pasted-on over a dim evening café shot, so choose the brighter photos for this pack.',
    phrase: 'coffee date',
    stickers: [
      'iced-coffee-cup',
      'black-coffee-top-view',
      'iced-coffee-cat',
      'soft-pretzel',
      'stacked-macarons',
      'heart-palmier-pastry',
      'chocolate-chip-cookie-heart',
      'round-glasses',
    ],
  },
  {
    slug: 'golden-sun',
    name: 'Golden sun',
    title: 'Golden sun sticker pack — sun charms, evil eye & sunflowers',
    blurb: 'Gold sun charms, an evil-eye sun, a swirl sun, sunflowers and a gold scallop shell: warm boho accents.',
    intro: [
      'Gold sun charms are the boho corner of the library: jewellery-like, warm and a little mystical. This pack puts them together with the flowers and shells that share their colour. A golden sun charm, an evil-eye sun charm, a gold swirl sun, a plain golden sun, a doodled yellow sun, sun-shaped flowers, a sunflower and a gold scallop shell.',
      'Gold reads as a colour and as a material at the same time, so these work on almost any photo. On a warm photo they blend in, and on a cool one they become the single warm point the eye goes to.',
    ],
    ideas: [
      'A golden-hour selfie with a sun charm in the corner of the sky.',
      'A manifestation or new-month Story: the evil-eye sun and your intention in cut-out letters.',
      'A beach sunset photo with the gold shell on the sand.',
    ],
    tip: 'Charms look best at small sizes, like real jewellery. Scale them down further than feels natural. At full size the detail becomes clip art.',
    phrase: 'good vibes',
    stickers: [
      'golden-sun-charm',
      'evil-eye-sun-charm',
      'gold-sun-swirl',
      'golden-sun',
      'yellow-doodle-sun',
      'golden-sun-flowers',
      'sunflower-sticker',
      'golden-scallop-shell',
    ],
  },
  {
    slug: 'stitched-stars',
    name: 'Stitched stars',
    title: 'Star sticker pack — stitched patches, leopard star & sparkles',
    blurb: 'Stitched varsity star patches, a leopard-print star, a doodle star, a star button and a star vinyl.',
    intro: [
      'Stars are the easiest way to say "this one is good" on a Story, and this pack has a star for each texture: a brown stitched patch, a red stitched patch, a tan stitched patch, a leopard-print star, a pink doodled star, a chocolate star button, a vinyl record with a star label and blue sparkle stars.',
      'The stitched patches carry the varsity-jacket look that has been everywhere in streetwear. Put two or three of them together at different angles and they look sewn onto the photo.',
    ],
    ideas: [
      'A rating Story: a movie, a meal or a book, with one to five stars stuck beside it.',
      'An outfit photo with patches on the jacket, as if they were ironed on.',
      'A "proud of you" Story for a friend, with the stars around their name in cut-out letters.',
    ],
    tip: 'Mix textures but keep to one or two colours. A brown patch, a tan patch and the leopard star look like one set; add the pink doodle and it becomes a sticker sheet.',
    phrase: 'star girl',
    stickers: [
      'brown-stitched-star-patch',
      'red-stitched-star',
      'tan-stitched-star-patch',
      'leopard-print-star',
      'pink-doodle-star',
      'chocolate-star-button',
      'star-vinyl-record',
      'blue-sparkle-stars',
    ],
  },
];
