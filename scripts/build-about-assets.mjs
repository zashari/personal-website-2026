#!/usr/bin/env node
// Builds the /about assets from the Figma frame "aboutme-desktop-dark" (page version-2, node 2041:40), exported as SVG
// with text kept as text (design/figma/data/aboutme-desktop-{dark,light}.svg; the two differ only in colour).
// - src/about/assets/lines.svg: the hand-drawn circle and the tall line on the right, Figma's own paths
// - src/about/assets/fonts/caskaydia-cove-*.woff2: CaskaydiaCove NF (SIL OFL 1.1) cut down to Latin text, from the
//   3 MB Nerd Font files in design/source/about (their thousands of icon glyphs are not used here)
// - src/about/assets/media/wave-poster.webp: the first frame of the wave clip, shown until the video plays
// usage: node scripts/build-about-assets.mjs [path/to/gif-version.gif]
//   The clip itself (wave.mp4) is made from the same GIF by scripts/encode-about-video.mjs.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import subsetFont from 'subset-font';

const DATA = 'design/figma/data/aboutme-desktop-dark.svg';
const SOURCE = 'design/source/about';
const OUT = 'src/about/assets';
const GIF = process.argv[2] ?? '.tmp/about-me/gif-version.gif';

// Printable ASCII, Latin-1 and the usual typographic punctuation: enough for any wording in src/about/content.js.
const TEXT =
  String.fromCharCode(...Array.from({ length: 95 }, (_, i) => 32 + i)) +
  String.fromCharCode(...Array.from({ length: 96 }, (_, i) => 160 + i)) +
  '–—‘’“”•…→';

const svg = fs.readFileSync(DATA, 'utf8');
const pathById = (id) => {
  const match = svg.match(new RegExp(`<path id="${id}" d="([^"]+)"`));
  if (!match) throw new Error(`${id} not found in ${DATA}`);
  return match[1];
};

// The circle is a stroked outline; the tall line is a filled, tapering shape. Both are #919191 in both modes.
const lines = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" fill="none">
  <path d="${pathById('Ellipse 1')}" stroke="#919191" stroke-width="2"/>
  <path d="${pathById('Line 7')}" fill="#919191"/>
</svg>
`;
fs.writeFileSync(`${OUT}/lines.svg`, lines);
console.log(`lines.svg ${(lines.length / 1024).toFixed(1)} kB`);

for (const style of ['regular', 'italic']) {
  const font = fs.readFileSync(path.join(SOURCE, `caskaydia-cove-nf-${style}.ttf`));
  const woff2 = await subsetFont(font, TEXT, { targetFormat: 'woff2' });
  fs.writeFileSync(`${OUT}/fonts/caskaydia-cove-${style}.woff2`, woff2);
  console.log(`caskaydia-cove-${style}.woff2 ${(woff2.length / 1024).toFixed(1)} kB`);
}

if (fs.existsSync(GIF)) {
  // A video poster is a single URL with no fallback, so WebP (every current browser) rather than AVIF.
  await sharp(GIF, { page: 0 }).webp({ quality: 80 }).toFile(`${OUT}/media/wave-poster.webp`);
  console.log('wave-poster.webp');
} else {
  console.log(`${GIF} not found; poster left as it is`);
}
