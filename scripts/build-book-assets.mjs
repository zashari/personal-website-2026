#!/usr/bin/env node
// Builds a project book's assets from its Figma spreads, exported as SVG with text kept as text and the embedded photos
// stripped (design/figma/data/<book>-page-<a>-<b>.svg, one 768 x 536 frame per spread). The photos themselves are in
// design/source/projects/<book>/, named after each image's data-name in the export (see sourceName).
// - src/projects/assets/books/<book>/*.{avif,webp}: every photo cropped exactly as its frame crops it (its pattern, and
//   the page it is clipped to), at 3x the frame; a photo Figma splits into a left and a right rect across the gutter
//   comes out as one image
// - src/projects/assets/books/<book>/figma.js: each photo's place on its spread, in frame px, with its imports, and the
//   spreads' vector paths (hand-drawn lines)
// - src/projects/assets/fonts/book-*.woff2: the books' typefaces (Host Grotesk, Open Sans, Open Sans Condensed), cut down
//   to Latin text; all SIL OFL 1.1, masters in design/source/projects/fonts
// usage: node scripts/build-book-assets.mjs <book>
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
const PAGE = { width: 384, height: 536 };

// Figma's data-name to the file it was saved as: lower case, a doubled extension folded ("IMG_1.JPG.jpg"), anything but
// letters, digits, _ and . turned into dashes. A few files were given names of their own.
const RENAMED = { 'ezgif-frame-001.png': 'mont-blanc.png', 'ezgif-frame-001 1(edit).png': 'mont-blanc-edit.png' };
const sourceName = (dataName) =>
  RENAMED[dataName] ??
  dataName
    .toLowerCase()
    .replace(/\.(\w+)\.\1$/, '.$1')
    .replace(/[^a-z0-9_.]+/g, '-')
    .replace(/-+(\.\w+)$/, '$1');

const attr = (attrs, name, fallback = 0) => attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]+)"`))?.[1] ?? fallback;
const num = (attrs, name, fallback = 0) => Number(attr(attrs, name, fallback));

// An axis-aligned transform list (matrix, translate, scale) as x' = a * x + e, y' = d * y + f.
function parseTransform(list = '') {
  let t = { a: 1, d: 1, e: 0, f: 0 };
  for (const [, fn, args] of list.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const n = args.match(/-?[\d.]+(?:e-?\d+)?/g).map(Number);
    const m =
      fn === 'matrix'
        ? { a: n[0], d: n[3], e: n[4], f: n[5] }
        : fn === 'translate'
          ? { a: 1, d: 1, e: n[0], f: n[1] ?? 0 }
          : { a: n[0], d: n[1] ?? n[0], e: 0, f: 0 }; // scale
    t = { a: t.a * m.a, d: t.d * m.d, e: t.a * m.e + t.e, f: t.d * m.f + t.f };
  }
  return t;
}

const round = (d) => d.replace(/-?\d*\.\d+/g, (n) => String(+(+n).toFixed(1)));

function spreadOf(file, spread) {
  const svg = fs.readFileSync(file, 'utf8');
  const images = {};
  for (const m of svg.matchAll(/<image id="([^"]+)" data-name="([^"]+)" width="(\d+)" height="(\d+)"/g)) {
    images[m[1]] = { file: sourceName(m[2]), width: +m[3], height: +m[4] };
  }
  // A pattern maps image px into the rect's bounding box (0..1).
  const patterns = {};
  for (const m of svg.matchAll(/<pattern id="([^"]+)"[^>]*>\s*<use xlink:href="#([^"]+)" transform="([^"]+)"/g)) {
    patterns[m[1]] = { image: m[2], ...parseTransform(m[3]) };
  }
  const clips = {};
  for (const m of svg.matchAll(/<clipPath id="([^"]+)">\s*<rect([^>]*)\/>/g)) {
    const t = parseTransform(attr(m[2], 'transform', ''));
    clips[m[1]] = { x: num(m[2], 'x') + t.e, y: num(m[2], 'y') + t.f, w: num(m[2], 'width'), h: num(m[2], 'height') };
  }
  // Walk the tags in order, keeping the clip of every open group, so each rect knows the page it is cut to.
  const rects = [];
  const paths = [];
  const open = [];
  const body = svg.slice(0, svg.indexOf('<defs>'));
  for (const [, close, tag, attrs, selfClosing] of body.matchAll(/<(\/?)(\w+)([^>]*?)(\/?)>/g)) {
    if (tag === 'g') {
      if (close) open.pop();
      else open.push(clips[attr(attrs, 'clip-path', '').slice(5, -1)] ?? null);
      continue;
    }
    if (close || !selfClosing) continue;
    const clip = open.findLast(Boolean) ?? { x: 0, y: 0, w: 2 * PAGE.width, h: PAGE.height };
    if (tag === 'path') {
      paths.push({
        id: attr(attrs, 'id', `path-${paths.length + 1}`),
        d: round(attr(attrs, 'd')),
        fill: attr(attrs, 'fill', null),
        stroke: attr(attrs, 'stroke', null),
        strokeWidth: attr(attrs, 'stroke-width', null),
      });
    }
    const fill = attr(attrs, 'fill', '').match(/^url\(#(.+)\)$/)?.[1];
    if (tag !== 'rect' || !fill) continue;
    const p = patterns[fill];
    const move = parseTransform(attr(attrs, 'transform', '')); // translate only, as Figma writes it for rects
    const r = {
      x: num(attrs, 'x') + move.e,
      y: num(attrs, 'y') + move.f,
      w: num(attrs, 'width'),
      h: num(attrs, 'height'),
    };
    // The image px under the rect's corner, and image px per frame px.
    const crop = { left: -p.e / p.a, top: -p.f / p.d, sx: 1 / p.a / r.w, sy: 1 / p.d / r.h };
    // Cut the rect to its clip, and the crop with it.
    const x0 = Math.max(r.x, clip.x);
    const y0 = Math.max(r.y, clip.y);
    const x1 = Math.min(r.x + r.w, clip.x + clip.w);
    const y1 = Math.min(r.y + r.h, clip.y + clip.h);
    rects.push({
      id: attr(attrs, 'id', `image-${rects.length + 1}`),
      // A stroke Figma draws centred on the rect's edge (a print's white border).
      ...(attr(attrs, 'stroke', null) && { stroke: attr(attrs, 'stroke'), strokeWidth: num(attrs, 'stroke-width', 1) }),
      x: x0,
      y: y0,
      w: x1 - x0,
      h: y1 - y0,
      image: images[p.image],
      crop: {
        left: crop.left + (x0 - r.x) * crop.sx,
        top: crop.top + (y0 - r.y) * crop.sy,
        width: (x1 - x0) * crop.sx,
        height: (y1 - y0) * crop.sy,
      },
    });
  }
  // Join a photo split at the gutter: same image, same row, the second rect starting where the first ends and its crop
  // carrying on from the first's (to a few source px).
  const joined = [];
  for (const r of rects) {
    const prev = joined.find(
      (q) =>
        q.image.file === r.image.file &&
        q.y === r.y &&
        q.h === r.h &&
        Math.abs(q.x + q.w - r.x) < 0.5 &&
        Math.abs(q.crop.left + q.crop.width - r.crop.left) < 8
    );
    if (prev) {
      prev.w += r.w;
      prev.crop.width = r.crop.left + r.crop.width - prev.crop.left;
      prev.id = prev.id.replace(/-left$/, '');
      // It is drawn where its second half is, over anything between the two.
      joined.push(...joined.splice(joined.indexOf(prev), 1));
    } else joined.push({ ...r, crop: { ...r.crop } });
  }
  // A photo another one drawn after it covers whole is never seen (Figma keeps such stray layers); leave it out.
  const covers = (q, r) => q.x <= r.x + 0.5 && q.y <= r.y + 0.5 && q.x + q.w >= r.x + r.w - 0.5 && q.y + q.h >= r.y + r.h - 0.5;
  const seen = joined.filter((r, i) => !joined.slice(i + 1).some((q) => covers(q, r)));
  const slug = (id) => id.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  return {
    photos: seen.map((r) => ({ ...r, name: `s${spread}-${slug(r.id)}` })),
    paths: paths.map((p) => ({ ...p, name: `s${spread}-${slug(p.id)}` })),
  };
}

const files = fs
  .readdirSync(DATA)
  .filter((f) => f.startsWith(`${book}-page-`) && f.endsWith('.svg'))
  .sort((a, b) => parseInt(a.match(/page-(\d+)/)[1]) - parseInt(b.match(/page-(\d+)/)[1]));
if (!files.length) throw new Error(`no ${DATA}/${book}-page-*.svg`);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const placed = [];
const drawn = [];
for (const [i, file] of files.entries()) {
  const { photos, paths } = spreadOf(path.join(DATA, file), i + 1);
  drawn.push(...paths);
  for (const photo of photos) {
    const { image, crop } = photo;
    // Crops can stray a few source px past the image's edge; clamp them to it.
    const left = Math.max(0, Math.round(crop.left));
    const top = Math.max(0, Math.round(crop.top));
    const width = Math.min(image.width - left, Math.round(crop.width));
    const height = Math.min(image.height - top, Math.round(crop.height));
    // Never larger than the crop itself: upscaling only adds bytes.
    const k = Math.min(SCALE, width / photo.w, height / photo.h);
    const size = { width: Math.round(photo.w * k), height: Math.round(photo.h * k) };
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
const json = (value) => JSON.stringify(value).replace(/"(\w+)":/g, '$1: ').replace(/,(?=\w+: )/g, ', ');
const lines = [
  `// Generated by scripts/build-book-assets.mjs ${book} from ${DATA}/${book}-page-*.svg; do not edit.`,
  '// Each photo and path on the book, by spread (s1 is the first) and its layer name in Figma; photos with their rect in',
  '// frame px.',
  ...placed.flatMap((p) => [
    `import ${ident(p.name)}Avif from './${p.name}.avif';`,
    `import ${ident(p.name)}Webp from './${p.name}.webp';`,
  ]),
  '',
  'export const PHOTOS = {',
  ...placed.map(
    (p) =>
      `  '${p.name}': { avif: ${ident(p.name)}Avif, webp: ${ident(p.name)}Webp, x: ${+p.x.toFixed(2)}, y: ${+p.y.toFixed(2)}, w: ${+p.w.toFixed(2)}, h: ${+p.h.toFixed(2)}${p.stroke ? `, stroke: '${p.stroke}', strokeWidth: ${p.strokeWidth}` : ''} },`
  ),
  '};',
  '',
  'export const PATHS = {',
  ...drawn.map(({ name, id, ...rest }) => {
    const props = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== null));
    return `  '${name}': ${json(props)},`;
  }),
  '};',
  '',
];
fs.writeFileSync(`${OUT}/figma.js`, lines.join('\n'));
console.log(`${OUT}/figma.js`);

// ---- Fonts ----
const LATIN =
  String.fromCharCode(...Array.from({ length: 95 }, (_, i) => 32 + i)) +
  String.fromCharCode(...Array.from({ length: 96 }, (_, i) => 160 + i)) +
  '–—‘’“”•…→';
const FONTS = {
  'HostGrotesk-Regular.ttf': 'book-host-grotesk-regular.woff2',
  'HostGrotesk-Medium.ttf': 'book-host-grotesk-medium.woff2',
  'HostGrotesk-MediumItalic.ttf': 'book-host-grotesk-medium-italic.woff2',
  'HostGrotesk-Bold.ttf': 'book-host-grotesk-bold.woff2',
  'HostGrotesk-ExtraBold.ttf': 'book-host-grotesk-extrabold.woff2',
  'OpenSans-Regular.ttf': 'book-open-sans-regular.woff2',
  'OpenSans-Medium.ttf': 'book-open-sans-medium.woff2',
  'OpenSans-ExtraBold.ttf': 'book-open-sans-extrabold.woff2',
  'OpenSans_Condensed-Regular.ttf': 'book-open-sans-condensed-regular.woff2',
  'OpenSans_Condensed-ExtraBold.ttf': 'book-open-sans-condensed-extrabold.woff2',
};
for (const [file, out] of Object.entries(FONTS)) {
  const woff2 = await subsetFont(fs.readFileSync(`design/source/projects/fonts/${file}`), LATIN, {
    targetFormat: 'woff2',
  });
  fs.writeFileSync(`src/projects/assets/fonts/${out}`, woff2);
  console.log(`${out} ${(woff2.length / 1024).toFixed(1)} kB`);
}
