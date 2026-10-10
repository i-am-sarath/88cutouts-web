// Original line drawings, rasterised locally into copyable Braille text.
// Run: node scripts/generate-dot-art.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const art = [
  ['Ribbon bow', ['bow', 'coquette', 'ribbon'], `<path d="M47 43C32 16 9 18 14 39C18 55 33 50 47 47M53 43C68 16 91 18 86 39C82 55 67 50 53 47M45 49L29 81L41 75L46 85L51 51M55 49L72 81L60 75L55 85L49 51"/><ellipse cx="50" cy="46" rx="6" ry="8"/><path d="M20 32L43 44M80 32L57 44"/>`],
  ['Garden butterfly', ['butterfly', 'wings', 'garden'], `<path d="M48 44C28 5 5 13 13 40C16 51 32 55 47 51C19 43 13 64 25 76C35 85 44 68 48 56M52 44C72 5 95 13 87 40C84 51 68 55 53 51C81 43 87 64 75 76C65 85 56 68 52 56M46 31L40 20M54 31L60 20"/><ellipse cx="50" cy="48" rx="3" ry="19"/><path d="M22 29Q29 24 38 40M78 29Q71 24 62 40M29 65L41 57M71 65L59 57"/>`],
  ['Rose stem', ['rose', 'flower', 'romantic'], `<path d="M50 48C26 48 24 27 38 21C38 9 61 9 65 21C82 24 75 48 50 48ZM38 21Q40 37 59 32Q69 22 57 19Q45 16 43 27Q46 43 65 37M29 31Q34 46 50 41M50 48Q44 67 53 90M48 67Q24 50 24 67Q29 79 48 74M50 78Q73 56 77 66Q77 79 51 84"/>`],
  ['Tulip pair', ['tulip', 'flowers', 'spring'], `<path d="M32 46Q12 39 17 20L27 27L32 13L38 26L48 19Q50 42 32 46ZM32 46L36 89M36 79Q14 72 16 55Q35 60 36 79M64 56Q46 49 51 30L61 37L67 23L73 38L83 31Q84 54 64 56ZM64 56L59 89M60 78Q82 70 84 54Q63 61 60 78"/>`],
  ['Daisy bouquet', ['daisy', 'flowers', 'bouquet'], `<circle cx="35" cy="32" r="5"/><circle cx="67" cy="43" r="5"/><path d="M35 27C18 9 17 31 30 32C9 40 29 51 35 37C38 56 55 41 40 32C60 28 45 9 35 27ZM67 38C50 20 49 42 62 43C41 51 61 62 67 48C70 67 87 52 72 43C92 39 77 20 67 38ZM35 46L51 85L67 57M48 74Q22 56 27 74Q31 84 51 85M54 74Q77 65 72 79Q65 89 51 85M40 87L57 87L54 95"/>`],
  ['Leaf sprig', ['leaves', 'botanical', 'branch'], `<path d="M30 91Q41 55 69 12M40 64Q15 68 18 51Q35 48 40 64M48 49Q28 44 33 29Q51 31 48 49M59 32Q47 20 56 10Q70 18 59 32M44 58Q67 33 76 46Q70 61 44 58M35 78Q62 58 68 73Q56 86 35 78"/>`],
  ['Curious cat', ['cat', 'kitten', 'animal'], `<path d="M25 42L20 14L42 28Q50 24 60 28L81 14L76 43Q89 60 77 75Q65 89 49 86Q29 86 19 72Q11 56 25 42Z"/><path d="M26 28L30 41M75 28L70 41M32 51Q37 44 42 51M59 51Q64 44 69 51M46 59L54 59L50 63ZM50 63Q44 70 39 64M50 63Q56 70 61 64M17 55L34 58M16 66L34 64M67 58L85 54M67 64L87 66"/>`],
  ['Sleepy bunny', ['bunny', 'rabbit', 'cute'], `<path d="M33 45C13 2 32 1 43 43M56 43C63 1 82 3 69 47M33 45C17 52 17 80 37 87C61 98 83 76 75 58Q70 45 56 43ZM31 18L37 39M69 18L63 39M33 64Q38 69 43 64M57 64Q62 69 67 64M46 73L54 73L50 77M50 77L46 80M50 77L54 80"/>`],
  ['Pocket teddy', ['bear', 'teddy', 'cute'], `<circle cx="29" cy="24" r="11"/><circle cx="71" cy="24" r="11"/><ellipse cx="50" cy="41" rx="28" ry="24"/><ellipse cx="50" cy="48" rx="12" ry="9"/><path d="M46 45L54 45L50 49M50 49L50 53M37 37L37 39M63 37L63 39M33 63Q19 74 26 83M67 63Q81 74 74 83"/><ellipse cx="50" cy="78" rx="20" ry="15"/><ellipse cx="30" cy="88" rx="10" ry="7"/><ellipse cx="70" cy="88" rx="10" ry="7"/><path d="M46 66L37 62L37 70ZM54 66L63 62L63 70Z"/>`],
  ['Heart envelope', ['letter', 'love', 'envelope'], `<rect x="12" y="30" width="76" height="49" rx="4"/><path d="M14 33L50 60L86 33M15 76L39 56M85 76L61 56M50 51C26 36 38 20 50 32C62 20 74 36 50 51Z"/>`],
  ['Love lock', ['lock', 'heart', 'romantic'], `<path d="M32 43V30C32 7 68 7 68 30V43M39 43V31C39 16 61 16 61 31V43"/><rect x="22" y="43" width="56" height="43" rx="9"/><path d="M50 73C26 58 41 48 50 58C59 48 74 58 50 73Z"/>`],
  ['Moon and stars', ['moon', 'stars', 'night'], `<path d="M60 14C17 13 8 72 47 85Q70 92 84 71C39 80 29 34 60 14Z"/><path d="M73 14L75 22L83 24L75 26L73 34L71 26L63 24L71 22ZM87 44L89 50L95 52L89 54L87 60L85 54L79 52L85 50ZM60 41L62 46L67 48L62 50L60 55L58 50L53 48L58 46Z"/>`],
  ['Ringed planet', ['saturn', 'planet', 'space'], `<circle cx="50" cy="50" r="25"/><path d="M25 46C-2 63 12 82 55 63C99 44 105 21 74 34M25 53C5 67 22 69 52 56C82 43 91 31 75 40M34 32Q42 28 52 29M28 43Q42 36 63 36M56 72L65 68"/><path d="M16 17L18 22L23 24L18 26L16 31L14 26L9 24L14 22M83 72L85 77L90 79L85 81L83 86L81 81L76 79L81 77"/>`],
  ['Cloud shower', ['cloud', 'rain', 'weather'], `<path d="M25 56C5 56 7 31 24 32C25 10 54 8 63 29C84 19 99 50 78 56Z"/><path d="M29 64L23 76M49 64L43 76M69 64L63 76M37 79L31 91M58 79L52 91"/>`],
  ['Sunflower', ['sunflower', 'flower', 'summer'], `<circle cx="50" cy="36" r="11"/><path d="M44 25Q38 7 50 10Q62 7 56 25M59 29Q78 21 74 35Q78 47 61 43M56 46Q62 63 50 61Q38 63 44 46M39 43Q21 48 26 35Q21 22 41 29M50 61L50 92M50 78Q29 62 25 71Q28 86 50 84M50 84Q72 66 77 76Q71 89 50 90"/><path d="M45 33L45 35M53 31L53 33M49 39L49 41M56 39L56 41"/>`],
  ['Cherry pair', ['cherries', 'fruit', 'summer'], `<path d="M34 59Q32 31 58 12Q69 30 69 58M58 12Q83 11 84 28Q64 30 58 12M58 12Q42 14 37 7"/><path d="M35 57C12 49 9 79 27 88C44 98 60 68 42 60ZM69 56C50 45 43 75 57 87C78 100 93 71 78 60Z"/><path d="M23 66Q18 75 26 81M60 65Q54 73 61 81"/>`],
  ['Strawberry', ['strawberry', 'fruit', 'cute'], `<path d="M50 29Q13 15 19 53Q28 80 50 92Q73 79 82 53Q88 16 50 29Z"/><path d="M50 31L34 17L46 21L49 9L56 21L71 16L64 30M50 31L43 39M50 31L57 39M32 44L30 48M48 48L46 52M66 44L64 48M36 62L34 66M56 65L54 69M49 78L47 82"/>`],
  ['Coffee moment', ['coffee', 'cup', 'cafe'], `<path d="M20 42H71L67 70Q45 88 25 70ZM71 47C97 39 92 72 68 67M15 80Q47 96 82 80M33 32C20 23 42 18 31 9M48 32C35 23 57 18 46 9M63 32C50 23 72 18 61 9"/><path d="M46 66C28 56 39 47 46 55C53 47 64 56 46 66Z"/>`],
  ['Vintage camera', ['camera', 'photo', 'travel'], `<path d="M13 35H29L34 24H64L70 35H87V80H13ZM20 35V28H28V35"/><circle cx="50" cy="57" r="17"/><circle cx="50" cy="57" r="11"/><path d="M42 50Q46 45 53 47M75 43H81M19 70H25M30 86L37 86M63 86L70 86"/>`],
  ['Music headphones', ['music', 'headphones', 'song'], `<path d="M18 59V44C18 2 82 2 82 44V59M25 54V44C25 11 75 11 75 44V54"/><rect x="14" y="50" width="17" height="30" rx="6"/><rect x="69" y="50" width="17" height="30" rx="6"/><path d="M50 68V44L64 40V60M50 49L64 45"/><ellipse cx="45" cy="69" rx="5" ry="4"/><ellipse cx="59" cy="61" rx="5" ry="4"/>`],
  ['Graceful swan', ['swan', 'bird', 'lake'], `<path d="M28 72Q2 46 23 54Q46 64 60 55C74 44 49 30 59 15Q67 6 75 17L87 22L75 24C58 22 80 43 73 61Q66 86 28 72ZM23 57Q24 74 59 68M29 60Q40 71 58 63M12 84Q34 79 51 85Q69 90 87 83"/><circle cx="71" cy="18" r="1"/>`],
  ['Little mushroom', ['mushroom', 'forest', 'nature'], `<path d="M12 52C18 5 80 5 88 52Q52 64 12 52ZM42 58L36 88Q50 97 64 88L58 58M25 52Q50 46 75 52"/><ellipse cx="35" cy="32" rx="7" ry="5"/><ellipse cx="62" cy="27" rx="6" ry="5"/><ellipse cx="72" cy="44" rx="5" ry="3"/><path d="M24 91L20 82M76 91L82 80M12 91H88"/>`],
  ['Sparkling heart', ['heart', 'love', 'sparkle'], `<path d="M48 78C-5 48 15 8 48 34C80 8 99 48 48 78Z"/><path d="M25 34Q17 43 26 53M78 66L80 74L88 76L80 78L78 86L76 78L68 76L76 74ZM17 8L19 14L25 16L19 18L17 24L15 18L9 16L15 14"/>`],
  ['Paper crane', ['crane', 'origami', 'bird'], `<path d="M12 72L45 52L25 16L60 45L85 20L73 57L91 67L67 64L49 83L45 57L12 72ZM45 52L60 45L73 57L49 83M45 52L67 64M25 16L53 51M85 20L64 53"/>`],
];

const bits = [[0,3],[1,4],[2,5],[6,7]];
const entries = [];
for (const [title, tags, drawing] of art) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><g fill="none" stroke="black" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${drawing}</g></svg>`;
  const { data } = await sharp(Buffer.from(svg)).resize(80,80).flatten({background:'#fff'}).greyscale().raw().toBuffer({resolveWithObject:true});
  const rows = [];
  for (let y=0; y<80; y+=4) {
    let row = '';
    for (let x=0; x<80; x+=2) {
      let cell = 0;
      for (let dy=0; dy<4; dy++) for (let dx=0; dx<2; dx++) if (data[(y+dy)*80+x+dx] < 180) cell |= 1 << bits[dy][dx];
      row += String.fromCodePoint(0x2800+cell);
    }
    rows.push(row);
  }
  entries.push({id:`dot-art-${entries.length+1}`,title,category:'Dot art',text:rows.join('\n'),tags:['braille','text art',...tags]});
}
writeFileSync(new URL('../src/data/dot-art.json', import.meta.url), JSON.stringify(entries,null,2)+'\n');
console.log(`Wrote ${entries.length} original dot drawings.`);
