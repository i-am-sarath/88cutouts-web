import dotArt from './dot-art.json';
import { extraGroups } from './symbol-extras';
export const symbolCategories = ['Dots', 'Stars', 'Hearts', 'Dividers', 'Cute faces', 'Bows', 'Flowers', 'Celestial', 'Arrows', 'Text frames', 'Dot art'] as const;
type Category = typeof symbolCategories[number];
export interface SymbolEntry { id: string; title: string; category: Category; text: string; tags: string[] }

const groups: { category: Category; tags: string[]; items: [string, string][] }[] = [
  { category: 'Dots', tags: ['minimal', 'small', 'bio'], items: [
    ['Soft dots', '· ˚ ·'], ['Little orbit', '° · ○ · °'], ['Dot trail', '· · • · ·'],
    ['Tiny bubbles', '˚ ○ ˚ ○ ˚'], ['Quiet pause', '⋅ ⋅ ⋅'], ['Circle cluster', '◦ • ◦'],
    ['Dotted frame', '· ˚ your words ˚ ·'], ['Moon dust', '° ⋅ · ☾ · ⋅ °'],
  ] },
  { category: 'Stars', tags: ['sparkle', 'night', 'aesthetic'], items: [
    ['Three sparkles', '✧ · ✦ · ✧'], ['Star trail', '⋆ · ⋆ · ✧'], ['Night sky', '☾ · ✧ · ⋆'],
    ['Little constellation', '✦ ˚ · ✧ · ˚ ✦'], ['Star brackets', '⋆ [ your words ] ⋆'],
    ['Wish line', '˚ ✩ · make a wish · ✩ ˚'], ['Twinkle pair', '✧ ˚ ✧'], ['Sparkle ribbon', '· ✦ ─ ✧ ─ ✦ ·'],
  ] },
  { category: 'Hearts', tags: ['love', 'cute', 'romantic'], items: [
    ['Heart trio', '♡ · ♥ · ♡'], ['Little love', '˚ · ♡ · ˚'], ['Love note', '♡ your words ♡'],
    ['Heart orbit', '° ♡ · ○ · ♡ °'], ['Sweet sparkle', '✧ ♡ ✧'], ['Heart ribbon', '─ ♡ ─ ♡ ─'],
    ['With love', '· ♡ with love ♡ ·'], ['Pocket heart', '( ♡ )'],
  ] },
  { category: 'Dividers', tags: ['separator', 'line', 'caption'], items: [
    ['Dotted line', '· · · · · · · · ·'], ['Star divider', '── ✦ · ✦ ──'], ['Heart divider', '──── ♡ ────'],
    ['Soft waves', '∿ ∿ ∿ ∿ ∿'], ['Circle divider', '─ ○ · ○ ─'], ['Flower divider', '── ❀ ──'],
    ['Diamond line', '◇ ─ · ─ ◇'], ['Night divider', '── ☾ · ⋆ ──'],
  ] },
  { category: 'Cute faces', tags: ['kaomoji', 'happy', 'text face'], items: [
    ['Happy hello', '(＾▽＾)'], ['Little cat', '(=^･ω･^=)'], ['Blushing smile', '(˶ᵔ ᵕ ᵔ˶)'],
    ['Bear hug', 'ʕっ•ᴥ•ʔっ'], ['Sleepy face', '(－ω－) z Z'], ['Happy wave', '(｡･ω･｡)ﾉ'],
    ['Tiny cheer', '٩(＾◡＾)۶'], ['Love eyes', '(♡‿♡)'],
  ] },
];

export const symbols: SymbolEntry[] = [
  ...[...groups, ...extraGroups].flatMap(group => group.items.map(([title, text]) => ({
    id: `${group.category.toLowerCase().replaceAll(' ', '-')}-${title.toLowerCase().replaceAll(' ', '-')}`,
    title, text, category: group.category, tags: [...group.tags],
  }))),
  ...dotArt.map(entry => ({ ...entry, category: 'Dot art' as Category })),
];