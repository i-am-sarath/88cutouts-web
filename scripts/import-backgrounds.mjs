import { mkdir, readdir, copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const input = path.join(root, 'stickers', 'bg');
const output = path.join(root, 'public', 'bg');
await mkdir(path.join(output, 'thumbs'), { recursive: true });
const files = (await readdir(input)).filter((name) => /\.(webp|png|jpe?g)$/i.test(name)).sort();
const backgrounds = [];
for (const file of files) {
  const id = path.parse(file).name;
  const label = id.replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase());
  const category = /sky|ocean|lily|dais/.test(id) ? 'Nature' : /bokeh|light|sunset|golden-hour|blur/.test(id) ? 'Glow' : /denim|fabric|rib|corduroy|gingham|check|plaid|tartan|stripe/.test(id) ? 'Fabric' : /leopard/.test(id) ? 'Animal print' : 'Retro';
  await copyFile(path.join(input, file), path.join(output, file));
  await sharp(path.join(input, file)).resize(200, 280, { fit: 'cover' }).webp({ quality: 78 }).toFile(path.join(output, 'thumbs', `${id}.webp`));
  backgrounds.push({ id, label, category, src: `/bg/${file}`, thumb: `/bg/thumbs/${id}.webp` });
}
await writeFile(path.join(root, 'src', 'data', 'scrapbook-backgrounds.json'), JSON.stringify(backgrounds, null, 2) + '\n');
console.log(`Imported ${backgrounds.length} scrapbook backgrounds.`);
