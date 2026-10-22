// Encodes the PNG masters in design/source into the AVIF/WebP files the site ships (src/assets/images).
// Run with `npm run images` after changing a master. Output is committed, so CI never needs sharp.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'design/source';
const OUT = 'src/assets/images';

// Folder covers and previews are shown at 100vw (up to 220vw on phones), so they get a width ladder.
// Papers and photos become WebGL textures that can be zoomed 3x, so they keep their full resolution.
const LADDERS = {
  cover: [1280, 1920, 2560, 3456],
  preview: [960, 1440, 1920],
};

const AVIF = { quality: 80, effort: 6 };
const WEBP = { quality: 90, alphaQuality: 100, effort: 5 };

function ladderFor(file) {
  if (file.includes('-cover')) return LADDERS.cover;
  if (file.includes('-preview')) return LADDERS.preview;
  return null;
}

async function encode(input, base, width) {
  const resized = () => (width ? sharp(input).resize({ width, withoutEnlargement: true }) : sharp(input));
  await resized().avif(AVIF).toFile(path.join(OUT, `${base}.avif`));
  await resized().webp(WEBP).toFile(path.join(OUT, `${base}.webp`));
}

fs.mkdirSync(OUT, { recursive: true });
for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith('.png'))) {
  const input = path.join(SRC, file);
  const name = file.replace(/\.png$/, '');
  const ladder = ladderFor(file);
  if (ladder) {
    const { width: native } = await sharp(input).metadata();
    const widths = [...new Set(ladder.map((w) => Math.min(w, native)))];
    for (const w of widths) await encode(input, `${name}-${w}w`, w);
  } else {
    await encode(input, name);
  }
  console.log(`encoded ${file}`);
}
