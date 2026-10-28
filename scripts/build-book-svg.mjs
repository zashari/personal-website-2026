#!/usr/bin/env node
// Builds a project book drawn as Figma's own SVG, for spreads whose look rests on Figma effects that live text and
// photos cannot match (texture and noise filters, glows, see-through lettering, photos inside letters): Deepfake's.
// Each spread is the image-stripped export (design/figma/data/<book>-page-<a>-<b>.svg) with its photos put back as
// compressed WebP, drawn inline on the book's sheet (DeepfakeBook.jsx), so its text keeps Figma's exact placement in the
// page's own fonts. The photos are in design/source/projects/<book>/, named after each image's data-name.
// - src/projects/assets/books/<book>/spread-<n>.svg: the spread, its photos as __IMG_<name>__ and its ids prefixed
// - src/projects/assets/books/<book>/*.webp: the photos, at their own size
// - src/projects/assets/books/<book>/figma.js: the spreads with their photos' URLs put in, and each spread's text in
//   reading order (for the book's text for screen readers)
// usage: node scripts/build-book-svg.mjs <book>
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const book = process.argv[2];
if (!book) throw new Error('usage: node scripts/build-book-svg.mjs <book>');
const DATA = 'design/figma/data';
const SOURCE = `design/source/projects/${book}`;
const OUT = `src/projects/assets/books/${book}`;

// The file each data-name was saved as (see build-book-assets.mjs).
const sourceName = (dataName) =>
  dataName
    .toLowerCase()
    .replace(/\.(\w+)\.\1$/, '.$1')
    .replace(/[^a-z0-9_.]+/g, '-')
    .replace(/-+(\.\w+)$/, '$1');
const ident = (name) => name.replace(/\.\w+$/, '').replace(/[^a-z0-9]+(\w)/gi, (_, c) => c.toUpperCase());

const decode = (text) =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');

// The words of a spread in reading order: each text element's lines (tspans sharing a baseline) joined, top to bottom
// and left to right by its first baseline.
function textOf(svg) {
  const blocks = [];
  for (const m of svg.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)) {
    const lines = new Map();
    let first = null;
    for (const t of m[1].matchAll(/<tspan x="([^"]+)" y="([^"]+)">([^<]*)<\/tspan>/g)) {
      first ??= { x: +t[1], y: +t[2] };
      lines.set(t[2], (lines.get(t[2]) ?? '') + t[3]);
    }
    // A line broken after a hyphen joins the next without a space ("pre-" and "processed").
    const joined = [...lines.values()].reduce((all, line) => (/-\s*$/.test(all) ? all.trimEnd() + line : `${all} ${line}`));
    const words = decode(joined).replace(/\s+/g, ' ').trim();
    if (words) blocks.push({ ...first, words });
  }
  return blocks.sort((a, b) => (Math.abs(a.y - b.y) < 20 ? a.x - b.x : a.y - b.y)).map((b) => b.words);
}

const files = fs
  .readdirSync(DATA)
  .filter((f) => f.startsWith(`${book}-page-`) && f.endsWith('.svg'))
  .sort((a, b) => parseInt(a.match(/page-(\d+)/)[1]) - parseInt(b.match(/page-(\d+)/)[1]));
if (!files.length) throw new Error(`no ${DATA}/${book}-page-*.svg`);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const photos = new Set();
const spreads = [];
for (const [i, file] of files.entries()) {
  const n = i + 1;
  let svg = fs.readFileSync(path.join(DATA, file), 'utf8');
  const text = textOf(svg);
  // Photos by placeholder; each is written once, whichever spreads use it.
  svg = svg.replace(/(<image [^>]*data-name=")([^"]+)("[^>]*xlink:href=")"/g, (_, a, name, b) => {
    const file = sourceName(name);
    photos.add(file);
    return `${a}${name}${b}__IMG_${ident(file)}__"`;
  });
  // Ids prefixed per book and spread, so two spreads on the page never share one.
  const prefix = `${book}${n}-`;
  svg = svg.replace(/ id="([^"]+)"/g, ` id="${prefix}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`);
  svg = svg.replace(/xlink:href="#([^"]+)"/g, `xlink:href="#${prefix}$1"`);
  // Layer names Figma kept as ids (whole paragraphs) only weigh; the reading text is kept apart.
  svg = svg.replace(/<g id="[^"]+"( filter=| clip-path=|>)/g, (m, rest) => (rest === '>' ? '<g>' : `<g${rest}`));
  // The frame fills the page's sheet: 768 x 536 (one export came out a pixel taller), scaled to fit.
  svg = svg.replace(/<svg width="\d+" height="\d+" viewBox="[^"]+"/, '<svg viewBox="0 0 768 536" preserveAspectRatio="none"');
  // A tenth of a frame px is finer than any screen shows it.
  svg = svg.replace(/ d="([^"]+)"/g, (_, d) => ` d="${d.replace(/-?\d*\.\d+/g, (v) => String(+(+v).toFixed(2)))}"`);
  fs.writeFileSync(`${OUT}/spread-${n}.svg`, svg);
  spreads.push({ n, text });
  console.log(`spread-${n}.svg ${(svg.length / 1024).toFixed(0)} kB, ${text.length} text blocks`);
}

for (const file of photos) {
  const out = `${OUT}/${file.replace(/\.\w+$/, '.webp')}`;
  const info = await sharp(path.join(SOURCE, file)).webp({ quality: 82, effort: 5 }).toFile(out);
  console.log(`${path.basename(out)} ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} kB`);
}

const lines = [
  `// Generated by scripts/build-book-svg.mjs ${book} from ${DATA}/${book}-page-*.svg; do not edit.`,
  "// Each spread as Figma's SVG with its photos' URLs put in, and its text in reading order.",
  ...[...photos].map((file) => `import ${ident(file)} from './${file.replace(/\.\w+$/, '.webp')}';`),
  ...spreads.map(({ n }) => `import spread${n} from './spread-${n}.svg?raw';`),
  '',
  `const PHOTOS = { ${[...photos].map((file) => ident(file)).join(', ')} };`,
  'const withPhotos = (svg) => svg.replace(/__IMG_(\\w+)__/g, (_, name) => PHOTOS[name]);',
  '',
  'export const SPREADS = [',
  ...spreads.map(({ n }) => `  withPhotos(spread${n}),`),
  '];',
  '',
  'export const TEXT = [',
  ...spreads.map(({ text }) => `  ${JSON.stringify(text)},`),
  '];',
  '',
];
fs.writeFileSync(`${OUT}/figma.js`, lines.join('\n'));
console.log(`${OUT}/figma.js`);
