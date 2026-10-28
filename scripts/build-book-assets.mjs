#!/usr/bin/env node
// Builds a project book's assets from its Figma spreads, exported as SVG with text kept as text and the embedded photos
// stripped (design/figma/data/<book>-page-<a>-<b>.svg, one 768 x 536 frame per spread). The photos themselves are in
// design/source/projects/<book>/, named after each image's data-name in the export.
// - src/projects/assets/books/<book>/*.{avif,webp}: every photo cropped exactly as its frame crops it, at 3x the frame;
//   a photo Figma splits into a left and a right rect across the gutter comes out as one image
// - src/projects/assets/books/<book>/photos.js: each photo's place on its spread, in frame px, with its imports
// - src/projects/assets/fonts/book-*.woff2: the books' typefaces (Host Grotesk, Open Sans, Open Sans Condensed), cut down
//   to Latin text; all SIL OFL 1.1, masters in design/source/projects/fonts
// usage: node scripts/build-book-assets.mjs arumi
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import subsetFont from 'subset-font';

const book = process.argv[2];
if (!book) throw new Error('usage: node scripts/build-book-assets.mjs <book>');
const DATA = 'design/figma/data';
const SOURCE = `design/source/projects/${book}`;
const OUT = `src/projects/assets/books/${book}`;
const SCALE = 3; // output px per frame px: the book is at most 1480 px wide, about twice the 768 px frame

// Figma's data-name to the file it was saved as (lower case, ".JPG.jpg" folded, the edited frame suffixed -edit).
const sourceName = (dataName) =>
  dataName
    .toLowerCase()
    .replace(/\.jpg\.jpg$/, '.jpg')
    .replace(/ 1\(edit\)/, '-edit')
    .replace(/ezgif-frame-001/, 'mont-blanc');

const num = (attrs, name, fallback = 0) => Number(attrs.match(new RegExp(` ${name}="([^"]+)"`))?.[1] ?? fallback);

// A pattern maps image px into the rect's bounding box (0..1): u = a * px + e, v = d * py + f.
function patternsOf(svg) {
  const patterns = {};
  for (const m of svg.matchAll(/<pattern id="([^"]+)"[^>]*>\s*<use xlink:href="#([^"]+)" transform="([^"]+)"/g)) {
    const n = m[3].match(/-?[\d.]+(?:e-?\d+)?/g).map(Number);
    const [a, d, e, f] = m[3].startsWith('scale') ? [n[0], n[1], 0, 0] : [n[0], n[3], n[4], n[5]];
    patterns[m[1]] = { image: m[2], a, d, e, f };
  }
  return patterns;
}

function photosOf(file, spread) {
  const svg = fs.readFileSync(file, 'utf8');
  const images = {};
  for (const m of svg.matchAll(/<image id="([^"]+)" data-name="([^"]+)" width="(\d+)" height="(\d+)"/g)) {
    images[m[1]] = { file: sourceName(m[2]), width: +m[3], height: +m[4] };
  }
  const patterns = patternsOf(svg);
  const rects = [];
  for (const m of svg.matchAll(/<rect id="([^"]+)"([^>]*) fill="url\(#([^)]+)\)"/g)) {
    const p = patterns[m[3]];
    const image = images[p.image];
    rects.push({
      id: m[1],
      x: num(m[2], 'x'),
      y: num(m[2], 'y'),
      w: num(m[2], 'width'),
      h: num(m[2], 'height'),
      image,
      crop: { left: -p.e / p.a, top: -p.f / p.d, width: 1 / p.a, height: 1 / p.d },
    });
  }
  // Join a photo split at the gutter: same image, same row, the second rect starting where the first ends.
  const joined = [];
  for (const r of rects.sort((a, b) => a.x - b.x)) {
    const prev = joined.find(
      (q) => q.image.file === r.image.file && q.y === r.y && q.h === r.h && Math.abs(q.x + q.w - r.x) < 0.5
    );
    if (prev) {
      prev.w += r.w;
      prev.crop.width = r.crop.left + r.crop.width - prev.crop.left;
      prev.id = prev.id.replace(/-left$/, '');
    } else joined.push({ ...r, crop: { ...r.crop } });
  }
  return joined.map((r) => ({ ...r, name: `s${spread}-${r.id.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}` }));
}

const files = fs
  .readdirSync(DATA)
  .filter((f) => f.startsWith(`${book}-page-`) && f.endsWith('.svg'))
  .sort((a, b) => parseInt(a.match(/page-(\d+)/)[1]) - parseInt(b.match(/page-(\d+)/)[1]));
if (!files.length) throw new Error(`no ${DATA}/${book}-page-*.svg`);

fs.mkdirSync(OUT, { recursive: true });
const placed = [];
for (const [i, file] of files.entries()) {
  for (const photo of photosOf(path.join(DATA, file), i + 1)) {
    const { image, crop } = photo;
    // Crops can stray a few source px past the image's edge; clamp them to it.
    const left = Math.max(0, Math.round(crop.left));
    const top = Math.max(0, Math.round(crop.top));
    const width = Math.min(image.width - left, Math.round(crop.width));
    const height = Math.min(image.height - top, Math.round(crop.height));
    const size = { width: Math.round(photo.w * SCALE), height: Math.round(photo.h * SCALE) };
    const cut = () =>
      sharp(path.join(SOURCE, image.file))
        .extract({ left, top, width, height })
        .resize({ ...size, fit: 'fill' });
    await cut().avif({ quality: 58, effort: 6 }).toFile(`${OUT}/${photo.name}.avif`);
    await cut().webp({ quality: 80, effort: 5 }).toFile(`${OUT}/${photo.name}.webp`);
    placed.push(photo);
    console.log(`${photo.name} ${size.width}x${size.height} from ${image.file}`);
  }
}

const ident = (name) => name.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const lines = [
  `// Generated by scripts/build-book-assets.mjs ${book} from ${DATA}/${book}-page-*.svg; do not edit.`,
  '// Each photo on the book, by spread (s1 is the first) and its layer name in Figma, with its rect in frame px.',
  ...placed.flatMap((p) => [
    `import ${ident(p.name)}Avif from './${p.name}.avif';`,
    `import ${ident(p.name)}Webp from './${p.name}.webp';`,
  ]),
  '',
  'export default {',
  ...placed.map(
    (p) =>
      `  '${p.name}': { avif: ${ident(p.name)}Avif, webp: ${ident(p.name)}Webp, x: ${p.x}, y: ${p.y}, w: ${p.w}, h: ${p.h} },`
  ),
  '};',
  '',
];
fs.writeFileSync(`${OUT}/photos.js`, lines.join('\n'));
console.log(`${OUT}/photos.js`);

// ---- Fonts ----
const LATIN =
  String.fromCharCode(...Array.from({ length: 95 }, (_, i) => 32 + i)) +
  String.fromCharCode(...Array.from({ length: 96 }, (_, i) => 160 + i)) +
  '–—‘’“”•…→';
const FONTS = {
  'HostGrotesk-Regular.ttf': 'book-host-grotesk-regular.woff2',
  'HostGrotesk-Bold.ttf': 'book-host-grotesk-bold.woff2',
  'OpenSans-Regular.ttf': 'book-open-sans-regular.woff2',
  'OpenSans-Medium.ttf': 'book-open-sans-medium.woff2',
  'OpenSans-ExtraBold.ttf': 'book-open-sans-extrabold.woff2',
  'OpenSans_Condensed-ExtraBold.ttf': 'book-open-sans-condensed-extrabold.woff2',
};
for (const [file, out] of Object.entries(FONTS)) {
  const woff2 = await subsetFont(fs.readFileSync(`design/source/projects/fonts/${file}`), LATIN, {
    targetFormat: 'woff2',
  });
  fs.writeFileSync(`src/projects/assets/fonts/${out}`, woff2);
  console.log(`${out} ${(woff2.length / 1024).toFixed(1)} kB`);
}
