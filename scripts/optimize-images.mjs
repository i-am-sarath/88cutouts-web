import { globby } from 'globby';
import sharp from 'sharp';

const files = await globby(['public/stickers/**/*.png', 'public/ransom-letters/**/*.png']);

for (const file of files) {
  const buffer = await sharp(file)
    .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  await sharp(buffer).toFile(file);
}

console.log(`Optimized ${files.length} image(s).`);
