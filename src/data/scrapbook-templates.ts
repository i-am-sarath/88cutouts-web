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
  | { t: 'mount'; x: number; y: number; w: number; h: number; a?: number; mount: 'strip' | 'stamp' | 'film' | 'contact'; group?:string }
  | { t: 'slot'; x: number; y: number; w: number; h: number; a?: number; frame?: 'polaroid' | 'border' | 'none' | 'stamp' | 'film' | 'torn'; filter?: 'mono' | 'warm'; group?:string }
  | { t: 'sticker'; slug: string; x: number; y: number; s: number; a?: number }
  | { t: 'letters'; text: string; x: number; y: number; s: number; a?: number }
  | { t: 'hand'; text: string; x: number; y: number; s: number; a?: number; color?: string; style?: 'hand' | 'label' | 'type' | 'caption' }
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

export const templates: ScrapbookTemplate[] = [
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
