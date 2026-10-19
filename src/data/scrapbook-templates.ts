/**
 * Starter pages for the scrapbook. Each one is also its own page at
 * /scrapbook/<slug>/ with written help, so it can be found in search.
 *
 * Positions are fractions of the page: x and y of its width and height, sizes
 * (s, w, h) of its width, angles in degrees. Laid out for the 9:16 Story page.
 * Stickers are named by slug; one that has since been deleted from the
 * library is simply left out at build time.
 */

import type { CardKind, DoodleKind } from '../lib/scrapbook/scene';

export type TplEl =
  | { t: 'mount'; x: number; y: number; w: number; h: number; a?: number; mount: 'strip' | 'stamp' | 'film' | 'contact'; group?:string }
  | { t: 'slot'; x: number; y: number; w: number; h: number; a?: number; frame?: 'polaroid' | 'border' | 'none' | 'stamp' | 'film' | 'torn' | 'circle' | 'oval' | 'rounded' | 'scallop'; filter?: 'mono' | 'warm'; group?:string; /** Sample photo shown in previews, never in the editor. */ demo?: string }
  | { t: 'sticker'; slug: string; x: number; y: number; s: number; a?: number }
  | { t: 'letters'; text: string; x: number; y: number; s: number; a?: number }
  | { t: 'hand'; text: string; x: number; y: number; s: number; a?: number; color?: string; style?: 'hand' | 'label' | 'type' | 'caption' | 'script' | 'outline' }
  /** A poem cut out word by word, each word on its own slip of paper. */
  | { t: 'words'; text: string; x: number; y: number; s: number; a?: number; color?: string }
  | { t: 'doodle'; kind: DoodleKind; x: number; y: number; s: number; a?: number; color?: string }
  | { t: 'card'; kind: CardKind; text: string; x: number; y: number; s: number; a?: number; color?: string }
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
  background?: string;
  intro: string[];
  tips: string[];
  captions: string[];
  els: TplEl[];
}

const dump = (slug: string, name: string, background: string, blurb: string, els: TplEl[]): ScrapbookTemplate => ({
  slug, name, paper: 'cream', background: `/bg/${background}.webp`, blurb, els,
  title: `${name} photo dump template`,
  description: `${blurb} Add your own photos, adjust the crops, decorate with cutouts and download a scrapbook photo dump.`,
  intro: ['Keep a whole day together on one page. This layout layers photo prints and little keepsakes into a scrapbook you can fill with your own camera roll.', 'Choose a mix of portraits, places and small details. The frames, paper and decorations are already arranged; every layer can still be moved, resized or removed.'],
  tips: ['Add several photos at once to fill the placeholders, or tap each spot to choose a specific picture.', 'Select a photo and use the crop arrows and zoom buttons to position it inside its frame.', 'Use a landscape from your trip as the page background for a more personal collage.', 'Add your own transparent PNG cutouts from Photos and layer them over the prints.'],
  captions: ['these are the days', 'a little collection of us', 'wish we could stay here', 'from my camera roll'],
});

// Coordinates inside the mount rotate together, leaving one continuous border.
function mounted(x:number,y:number,w:number,h:number,a:number,mount:'strip'|'stamp'|'film'|'contact', cells:{x:number;y:number;w:number;h:number}[], filter?:'mono'|'warm'): TplEl[] {
  const angle=a*Math.PI/180;
  const group=`${mount}:${x}:${y}`;
  return [
    {t:'mount',x,y,w,h,a,mount,group},
    ...cells.map((c):TplEl=>({t:'slot',
      x:x+(c.x*Math.cos(angle)-c.y*Math.sin(angle)),
      y:y+(c.x*Math.sin(angle)+c.y*Math.cos(angle))*9/16,
      w:c.w,h:c.h,a,frame:'none',filter,group,
    })),
  ];
}
function strip(x:number,y:number,w:number,photoH:number,count:number,a:number,style:'strip'|'film'='strip',filter:'mono'|'warm'='mono'):TplEl[] {
  const edge=style==='film'?.034:.018, gap=.008;
  const h=count*photoH+(count-1)*gap+edge*2+.022;
  return mounted(x,y,w,h,a,style,Array.from({length:count},(_,row)=>({
    x:0,y:-h/2+edge+photoH/2+row*(photoH+gap),w:w-edge*2,h:photoH,
  })),filter);
}

/** A template on plain paper rather than a photo background. */
const sheet = (slug: string, name: string, paper: string, blurb: string, extra: Pick<ScrapbookTemplate, 'intro' | 'captions'>, els: TplEl[]): ScrapbookTemplate => ({
  slug, name, paper, blurb, els, ...extra,
  title: `${name} scrapbook template`,
  description: `${blurb} Add your own photos, change the words and download the page for your Story.`,
  tips: ['Add three photos at once to fill the frames in order, or tap a frame to choose one picture.', 'Tap the cut-out words and use Delete, then make your own in Text with the Word cut-outs style.', 'The crayon doodles live under Doodles; pick a colour first, then tap a shape.', 'For a lyric card, type the lyric, then the song and artist on the next two lines.'],
});

export const templates: ScrapbookTemplate[] = [
  sheet('love-letter-poem', 'Love letter poem', 'white', 'Three rounded photos, crayon spirals, a lyric card and a love poem cut out word by word.', {
    intro: ['A page for one person: three photos, a song that is yours, and a short poem cut out of paper slips one word at a time, the way people used to make notes from magazines.', 'The orange crayon spirals and lilies hold it together, and every word, doodle and card can be moved, recoloured or rewritten.'],
    captions: ['I give you all my smiles', 'you are my favourite person', 'not a lot, just forever', 'everything I know about love'],
  }, [
    { t: 'doodle', kind: 'spiral', x: .19, y: .1, s: .4, a: 10, color: '#E8743B' },
    { t: 'doodle', kind: 'squiggle', x: .08, y: .75, s: .5, a: 72, color: '#E8743B' },
    { t: 'doodle', kind: 'wave', x: .95, y: .52, s: .32, a: -35, color: '#E8743B' },
    { t: 'slot', x: .32, y: .255, w: .5, h: .64, frame: 'rounded', demo: '/bg/golden-hour.webp' },
    { t: 'sticker', slug: 'maroon-number-7-billiard-ball', x: .55, y: .09, s: .1, a: -10 },
    { t: 'words', text: 'I give you\nall my smiles\nand every bit\nof my love', x: .79, y: .2, s: .4, a: 2, color: '#3E64A8' },
    { t: 'slot', x: .74, y: .5, w: .44, h: .36, a: 2, frame: 'rounded', demo: '/bg/daisies.webp' },
    { t: 'card', kind: 'lyrics', text: 'Not a lot, just forever\nour song\non repeat', x: .27, y: .5, s: .5, a: -3 },
    { t: 'slot', x: .52, y: .69, w: .5, h: .42, a: -2, frame: 'rounded', demo: '/bg/ocean.webp' },
    { t: 'sticker', slug: 'golden-lily', x: .83, y: .64, s: .24, a: 18 },
    { t: 'sticker', slug: 'golden-lily-1', x: .25, y: .62, s: .17, a: -25 },
    { t: 'words', text: 'you are more than I know\nand everything I know\nabout love', x: .48, y: .885, s: .78, a: -1, color: '#3E64A8' },
    { t: 'hand', text: 'forever', x: .82, y: .96, s: .26, a: -6, style: 'script', color: '#E8743B' },
  ]),
  sheet('orange-tile-memories', 'Orange tile memories', 'tiles', 'Three bordered prints pinned to terracotta tiles, with a dog, a yellow starburst and flowers.', {
    intro: ['Warm terracotta tiles make every photo on top of them glow. Three prints sit at slight angles as if pinned to a kitchen wall, with a sleepy dog draped over the top one.', 'It suits birthdays, holidays and slow summer days. Swap the dog for any sticker that belongs in your day.'],
    captions: ['best day ever', 'summer at home', 'the good days', 'a little sunshine'],
  }, [
    
    { t: 'slot', x: .7, y: .25, w: .42, h: .44, a: 3, frame: 'border', demo: '/bg/sky.webp' },
    { t: 'slot', x: .3, y: .46, w: .5, h: .56, a: -3, frame: 'border', demo: '/bg/golden-hour.webp' },
    { t: 'slot', x: .66, y: .71, w: .5, h: .42, a: 2, frame: 'border', demo: '/bg/lily-bouquet.webp' },
    { t: 'sticker', slug: 'dachshund-in-pink-dress', x: .78, y: .1, s: .32, a: 6 },
    { t: 'doodle', kind: 'burst', x: .17, y: .21, s: .24, a: 12, color: '#F2C84B' },
    { t: 'sticker', slug: 'pink-plumeria-flower', x: .9, y: .56, s: .22, a: -10 },
    { t: 'sticker', slug: 'orange-dahlia', x: .14, y: .7, s: .2, a: 15 },
    { t: 'tape', tape: 'kraft', x: .3, y: .25, s: .2, a: -30 },
    { t: 'sticker', slug: 'dark-red-push-pin', x: .52, y: .14, s: .1, a: 10 },
    { t: 'hand', text: 'best day ever', x: .36, y: .9, s: .6, a: -4, style: 'script', color: '#FFFFFF' },
  ]),
  sheet('pastel-girl-diary', 'Pastel girl diary', 'checker', 'Pastel checks, pink squiggles, cut-out words and four photos in polaroids, rounded and scalloped frames.', {
    intro: ['A diary page on butter and baby blue checks, with pink crayon squiggles running between the photos. It borrows from the girly collage pages people post with song lines and bubble titles.', 'Two prints turn black and white automatically for contrast; tap one and choose Original to bring the colour back.'],
    captions: ['girls just wanna have fun', 'my world of flowers', 'main character', 'soft days'],
  }, [
    { t: 'doodle', kind: 'squiggle', x: .14, y: .22, s: .48, a: 80, color: '#E58AA6' },
    { t: 'doodle', kind: 'squiggle', x: .66, y: .9, s: .55, a: -15, color: '#E58AA6' },
    { t: 'doodle', kind: 'burst', x: .84, y: .52, s: .3, a: 8, color: '#F4B6C2' },
    { t: 'slot', x: .6, y: .19, w: .48, h: .4, a: 4, frame: 'polaroid', filter: 'mono', demo: '/bg/lily-bouquet.webp' },
    { t: 'slot', x: .4, y: .46, w: .5, h: .44, a: -3, frame: 'rounded', demo: '/bg/golden-hour.webp' },
    { t: 'slot', x: .22, y: .72, w: .32, h: .4, a: -6, frame: 'scallop', demo: '/bg/daisies.webp' },
    { t: 'slot', x: .73, y: .75, w: .38, h: .38, a: 5, frame: 'polaroid', filter: 'mono', demo: '/bg/sky.webp' },
    { t: 'sticker', slug: 'heart-sealed-envelope', x: .86, y: .1, s: .2, a: 12 },
    { t: 'sticker', slug: 'red-cherry-pair', x: .18, y: .48, s: .16, a: -10 },
    { t: 'sticker', slug: 'pink-cherry-blossom', x: .47, y: .84, s: .22, a: 10 },
    { t: 'doodle', kind: 'sparkle', x: .26, y: .3, s: .12, color: '#F2C84B' },
    { t: 'words', text: 'girls just\nwanna have fun', x: .56, y: .63, s: .42, a: -6, color: '#E07A9B' },
    { t: 'hand', text: 'my world', x: .93, y: .32, s: .4, a: 90, style: 'outline', color: '#E07A9B' },
    { t: 'hand', text: 'of flowers', x: .35, y: .95, s: .45, a: -4, style: 'script', color: '#C8423B' },
  ]),
  sheet('solitude-editorial', 'Solitude editorial', 'white', 'A magazine-style page: a big print, a polaroid, a black and white circle, a red lily and quiet serif words.', {
    intro: ['A calmer, editorial page: lots of white, one big photo, a polaroid and a black and white circle, with a red lily breaking the grid. It reads like a page from a fashion zine.', 'The serif title and caption are plain text, so change them to a name, a place or a line from a song.'],
    captions: ['solitude', 'a soul that blooms by the sea', 'golden hour, quietly', 'slow mornings'],
  }, [
    { t: 'slot', x: .31, y: .21, w: .44, h: .42, a: -2, frame: 'polaroid', demo: '/bg/golden-string-lights.webp' },
    { t: 'slot', x: .66, y: .48, w: .56, h: .74, frame: 'none', demo: '/bg/sunset-smear.webp' },
    { t: 'sticker', slug: 'black-white-vinyl', x: .6, y: .25, s: .24, a: 0 },
    { t: 'slot', x: .26, y: .66, w: .4, h: .4, frame: 'circle', filter: 'mono', demo: '/bg/ocean.webp' },
    { t: 'sticker', slug: 'magenta-lily', x: .2, y: .44, s: .4, a: -12 },
    { t: 'hand', text: 'retro', x: .78, y: .3, s: .22, style: 'script', color: '#FFFFFF' },
    { t: 'sticker', slug: 'pale-pink-orchid', x: .33, y: .84, s: .22, a: 8 },
    { t: 'hand', text: 'SOLITUDE', x: .7, y: .05, s: .54, style: 'type', color: '#9AA58A' },
    { t: 'doodle', kind: 'sparkle', x: .93, y: .1, s: .06, color: '#2A2522' },
    { t: 'doodle', kind: 'sparkle', x: .1, y: .93, s: .05, color: '#2A2522' },
    { t: 'hand', text: 'a soul that blooms\nby the sea', x: .7, y: .88, s: .48, style: 'type', color: '#2A2522' },
  ]),
  sheet('little-life-clipboard', 'Little life clipboard', 'kraft', 'A clipboard of little moments: film frames, a polaroid, an oval locket, message bubbles and a now-playing card.', {
    intro: ['Everything from one ordinary, lovely week, clipped to a board: two film frames, a polaroid, an oval like a locket and a round snapshot, with the messages and the song that went with them.', 'Change the bubbles to things your friends actually said, and the player to the song that was on repeat.'],
    captions: ['i think i like this little life', 'live, laugh, and love', 'oops', 'iloveyou!'],
  }, [
    { t: 'sticker', slug: 'torn-lined-paper-scrap', x: .5, y: .52, s: .96, a: 2 },
    ...strip(.28,.3,.34,.2,2,-4,'film','warm'),
    { t: 'slot', x: .72, y: .27, w: .44, h: .32, a: 4, frame: 'polaroid', demo: '/bg/daisies.webp' },
    { t: 'slot', x: .3, y: .62, w: .3, h: .38, a: -5, frame: 'oval', demo: '/bg/sunset-smear.webp' },
    { t: 'slot', x: .71, y: .61, w: .44, h: .3, a: 3, frame: 'rounded', demo: '/bg/ocean.webp' },
    { t: 'slot', x: .55, y: .82, w: .26, h: .26, frame: 'circle', demo: '/bg/amber-bokeh.webp' },
    { t: 'sticker', slug: 'cream-binder-clip', x: .5, y: .06, s: .3 },
    { t: 'sticker', slug: 'bunny-plush-headphones', x: .12, y: .14, s: .22, a: -8 },
    { t: 'sticker', slug: 'green-gingham-bow', x: .88, y: .45, s: .18, a: 12 },
    { t: 'sticker', slug: 'orange-goldfish', x: .46, y: .44, s: .2, a: -10 },
    { t: 'sticker', slug: 'big-ripe-strawberry', x: .88, y: .74, s: .13, a: 10 },
    { t: 'sticker', slug: 'pale-pink-orchid', x: .14, y: .82, s: .2, a: -10 },
    { t: 'card', kind: 'bubble', text: 'oops', x: .84, y: .15, s: .16, a: 3, color: '#E58AA6' },
    { t: 'card', kind: 'bubble', text: 'iloveyou!', x: .22, y: .47, s: .26, a: -3, color: '#3B82F6' },
    { t: 'card', kind: 'player', text: 'little life\non repeat', x: .3, y: .9, s: .44, a: -2 },
    { t: 'hand', text: 'i think i like this little life...', x: .5, y: .975, s: .8, color: '#FFFFFF' },
  ]),
  dump('tropical-soulmates', 'Tropical soulmates', 'leopard-print', 'Seven layered photos, leopard print, hibiscus and little love notes.', [
    { t: 'sticker', slug: 'torn-kraft-paper-scrap', x: .7, y: .22, s: .75, a: 20 },
    ...strip(.17,.47,.38,.44,3,2,'strip','warm'),
    ...mounted(.7,.57,.61,.93,-7,'stamp',[
      {x:-.135,y:-.205,w:.265,h:.39},{x:.135,y:-.205,w:.265,h:.39},
      {x:-.135,y:.19,w:.265,h:.39},{x:.135,y:.19,w:.265,h:.39},
    ]),
    { t: 'sticker', slug: 'dark-pink-hibiscus', x: .86, y: .22, s: .39, a: 12 },
    { t: 'sticker', slug: 'crimson-ribbon-bow', x: .8, y: .89, s: .35, a: -5 },
    { t: 'sticker', slug: 'glossy-red-heart', x: .42, y: .77, s: .16, a: -15 },
    { t: 'hand', text: 'soulmates!', x: .2, y: .3, s: .29, style: 'caption' },
    { t: 'hand', text: 'you’re so gorgeous!', x: .68, y: .55, s: .61, a: -7, color: '#FFFFFF' },
    { t: 'hand', text: 'cuties', x: .7, y: .8, s: .22, style: 'caption', a:-7 },
    { t: 'hand', text: 'i love you\nmore than a little', x: .47, y: .88, s: .47, style: 'label', a: -3 },
  ]),
  dump('sunset-postcards', 'Sunset postcards', 'ocean', 'Five travel prints over ocean waves, sun charms and shells.', [
    { t: 'slot', x: .68, y: .17, w: .31, h: .43, a:1, frame: 'border', filter: 'warm' },
    { t: 'slot', x: .265, y: .27, w: .42, h: .33, a:-1, frame: 'border', filter: 'warm' },
    ...mounted(.4,.59,.66,.61,0,'stamp',[{x:0,y:0,w:.58,h:.53}], 'warm'),
    { t: 'slot', x: .78, y: .82, w: .32, h: .47, a:1, frame: 'border', filter: 'warm' },
    { t: 'slot', x: .75, y: .41, w: .19, h: .2, a: -2, frame: 'torn' },
    { t: 'tape', tape: 'clear', x: .84, y: .067, s: .22, a: 28 },
    { t: 'tape', tape: 'clear', x: .85, y: .65, s: .24, a: 35 },
    { t: 'tape', tape: 'kraft', x: .64, y: .91, s: .22, a: 45 },
    { t: 'sticker', slug: 'golden-sun-charm', x: .13, y: .44, s: .23, a: -12 },
    { t: 'sticker', slug: 'gold-sun-swirl', x: .5, y: .105, s: .17 },
    { t: 'sticker', slug: 'orange-starfish', x: .89, y: .31, s: .14, a: 12 },
    { t: 'sticker', slug: 'golden-scallop-shell', x: .12, y: .86, s: .26, a: -20 },
    { t: 'hand', text: 'somewhere with you', x: .42, y: .95, s: .51, color: '#FFF9EC', a: -3 },
  ]),
  dump('velvet-photo-booth', 'Velvet photo booth', 'red-gingham-star-patches', 'Sixteen crowded booth snapshots, connected print strips and golden charms.', [
    ...strip(.29,.31,.24,.215,3,-1),
    ...strip(.505,.47,.24,.26,4,1),
    ...strip(.695,.345,.25,.215,3,-2),
    ...strip(.31,.68,.22,.255,3,1),
    ...mounted(.7,.7,.31,.67,0,'contact',[
      {x:0,y:-.22,w:.275,h:.205},{x:0,y:-.01,w:.275,h:.205},{x:0,y:.2,w:.275,h:.205},
    ],'mono'),
    { t: 'sticker', slug: 'golden-lily', x: .62, y: .17, s: .2, a: -10 },
    { t: 'sticker', slug: 'golden-flower-pushpin', x: .23, y: .18, s: .12, a: -20 },
    { t: 'sticker', slug: 'tan-stitched-star-patch', x: .82, y: .47, s: .22, a: 15 },
    { t: 'sticker', slug: 'golden-sun-charm', x: .17, y: .76, s: .18, a: -15 },
    { t: 'sticker', slug: 'glossy-red-heart', x: .82, y: .67, s: .1, a: 12 },
    { t: 'hand', text: 'our kind of night', x: .5, y: .94, s: .51, color: '#F8E5BA', a: -3 },
  ]),
  dump('film-roll-weekend', 'Film roll weekend', 'navy-gold-sparkle', 'Eight warm film frames on a starry backdrop, a camera and white captions.', [
    ...strip(.28,.44,.39,.28,4,-5,'film','warm'),
    ...strip(.72,.51,.39,.28,4,5,'film','warm'),
    { t: 'sticker', slug: 'retro-film-camera', x: .76, y: .9, s: .25, a: 8 },
    { t: 'hand', text: 'weekend on film', x: .42, y: .92, s: .58, color: '#FFFFFF', a: -4 },
  ]),
  dump('blue-hour', 'Blue hour', 'denim-lace-stars', 'Six overlapping prints on denim and lace, blue bows and notebook scraps.', [
    { t: 'sticker', slug: 'torn-lined-paper-scrap', x: .48, y: .46, s: .9, a: -5 },
    ...strip(.28,.43,.37,.37,3,-5,'strip','warm'),
    ...mounted(.71,.52,.43,.88,5,'stamp',[
      {x:0,y:-.21,w:.35,h:.37},{x:0,y:.19,w:.35,h:.37},
    ]),
    {t:'slot',x:.63,y:.83,w:.37,h:.28,a:-9,frame:'polaroid'},
    { t: 'sticker', slug: 'blue-satin-bow', x: .72, y: .11, s: .28, a: 10 },
    { t: 'sticker', slug: 'blue-sparkle-stars', x: .17, y: .85, s: .23 },
    { t: 'hand', text: 'little things, lately', x: .5, y: .95, s: .62, color: '#FFFFFF', a: -3 },
  ]),
  dump('keepsake-journal', 'Keepsake journal', 'brown-plaid', 'Five taped prints on brown plaid, torn paper and golden flowers.', [
    { t: 'sticker', slug: 'torn-lined-paper-scrap', x: .5, y: .55, s: .91, a: 8 },
    { t: 'slot', x: .33, y: .25, w: .48, h: .4, a: -8, frame: 'torn', filter: 'warm' },
    { t: 'slot', x: .74, y: .3, w: .32, h: .42, a: 8, frame: 'polaroid', filter: 'warm' },
    { t: 'slot', x: .3, y: .56, w: .32, h: .36, a: -5, frame: 'border' },
    { t: 'slot', x: .69, y: .6, w: .4, h: .37, a: 5, frame: 'stamp' },
    { t: 'slot', x: .4, y: .8, w: .4, h: .3, a: -6, frame: 'border' },
    { t: 'tape', tape: 'kraft', x: .33, y: .14, s: .26, a: -12 },
    { t: 'tape', tape: 'clear', x: .73, y: .18, s: .23, a: 15 },
    { t: 'sticker', slug: 'golden-lily', x: .86, y: .79, s: .25, a: 15 },
    { t: 'hand', text: 'a day to keep', x: .5, y: .065, s: .56, a: -2, color: '#FFF9EC' },
    { t: 'hand', text: 'remember this feeling', x: .53, y: .94, s: .61, style: 'label', a: 3 },
  ]),
];

export const templateBySlug = (slug: string) => templates.find((t) => t.slug === slug);
