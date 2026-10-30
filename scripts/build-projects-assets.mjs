#!/usr/bin/env node
// Builds the /projects assets from the Figma frames "projects-desktop" (the hero), "projects-showcase-desktop" and
// "projects-github-desktop", exported as SVG with text kept as text (design/figma/data/projects-*-light.svg; dark
// differs only in colour) and their photos split out to design/source/projects.
// - src/projects/assets/lines/*.svg: the hand-drawn lines of the three scenes, Figma's own paths, one file each
// - src/projects/assets/images/*.{avif,webp}: the hero photo and each project's photo, as a thumbnail and a preview,
//   and me.webp, the showcase's animated resting image
// - src/projects/assets/fonts/*.woff2: CaskaydiaCove NF SemiLight (the roles in brackets) cut down to Latin text, and
//   Open Sans Regular cut down to the two giant brackets; both SIL OFL 1.1. JMH Typewriter Bold (the asterisk) is
//   shipped as the unmodified file, src/projects/assets/fonts/jmh-typewriter-bold.ttf, as its terms require.
// usage: node scripts/build-projects-assets.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import subsetFont from 'subset-font';

const DATA = 'design/figma/data';
const SOURCE = 'design/source/projects';
const OUT = 'src/projects/assets';

// ---- Vectors ----
const svgs = {
  hero: fs.readFileSync(`${DATA}/projects-desktop-light.svg`, 'utf8'),
  showcase: fs.readFileSync(`${DATA}/projects-showcase-desktop-light.svg`, 'utf8'),
  // The third scene, "Please visit my Github profile" (2026-10-28); its rule and triangle are the showcase's.
  github: fs.readFileSync(`${DATA}/projects-github-desktop-light.svg`, 'utf8'),
};
const pathById = (svg, id) => {
  const match = svg.match(new RegExp(`<path id="${id}" d="([^"]+)"`));
  if (!match) throw new Error(`${id} not found`);
  // A tenth of a frame px is finer than any screen shows it; the export's six decimals only weigh.
  return match[1].replace(/\d*\.\d+/g, (n) => String(+(+n).toFixed(1)));
};
// One SVG per line, each on the whole 1920 x 1080 frame, so the page can move, scale and reveal them one by one.
// Stroked paths get Figma's 2 px #919191 stroke; filled ones (its tapering hand-drawn lines) are filled #919191.
const LINES = {
  'hero-circle': ['stroke', pathById(svgs.hero, 'Ellipse 2')],
  'hero-rule': ['fill', pathById(svgs.hero, 'Line 6')], // the horizontal line
  'hero-dash': ['stroke', pathById(svgs.hero, 'Line 7')], // the vertical dashed line
  'showcase-rule': ['fill', pathById(svgs.showcase, 'Line 7')], // the vertical line on the left
  'showcase-dash': ['stroke', pathById(svgs.showcase, 'Line 8')], // the horizontal dashed line
  'showcase-triangle': ['fill', pathById(svgs.showcase, 'Rectangle 1')],
  'showcase-circle': ['fill', pathById(svgs.showcase, 'Ellipse 3')],
  'github-arrow': ['fill', pathById(svgs.github, 'Arrow 1')], // painted in the accent through a CSS mask
};
fs.mkdirSync(`${OUT}/lines`, { recursive: true });
for (const [name, [paint, d]] of Object.entries(LINES)) {
  const style = paint === 'stroke' ? 'stroke="#919191" stroke-width="2"' : 'fill="#919191"';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" fill="none"><path d="${d}" ${style}/></svg>\n`;
  fs.writeFileSync(`${OUT}/lines/${name}.svg`, svg);
  console.log(`lines/${name}.svg ${(svg.length / 1024).toFixed(1)} kB`);
}

// ---- Photos: a thumbnail (179 x 134 on the frame) and a preview (619 x 398), at about twice their frame size ----
const PHOTOS = {
  hero: 'img_0079.jpg', // the user's replacement for the frame's own photo (img_7300.jpg)
  fraud: 'fraud-cover.png', // the user's cover for the project (2026-10-28), in place of the frame's img_8782.jpg
  alzheimer: 'alzheimer-cover.png', // the user's halftone brain (2026-10-30); its clip is assets/media/alzheimer.mp4
  arumi: 'arumi.png', // the user's still of the stand at night (2026-10-28); its clip is assets/media/arumi.mp4
  deepfake: 'deepfake-cover.png', // the user's mannequin still (2026-10-28); its clip is assets/media/deepfake.mp4
  gamified: 'gamified-cover.png', // the user's interrogation-room still (2026-10-28); its clip is assets/media/gamified.mp4
};
fs.mkdirSync(`${OUT}/images`, { recursive: true });
for (const [name, file] of Object.entries(PHOTOS)) {
  for (const [size, width] of [
    ['thumb', 360],
    ['preview', 1240],
  ]) {
    const image = () => sharp(path.join(SOURCE, file)).rotate().resize({ width, withoutEnlargement: true });
    await image().avif({ quality: 58, effort: 6 }).toFile(`${OUT}/images/${name}-${size}.avif`);
    await image().webp({ quality: 80, effort: 5 }).toFile(`${OUT}/images/${name}-${size}.webp`);
  }
  console.log(`${name}-{thumb,preview}.{avif,webp}`);
}

// The showcase's resting image: the user's 41-frame GIF (800 x 600, 0.1 s a frame) as an animated WebP, a seventh of
// its size. Animated AVIF is not an option here: libheif refuses a sequence this long.
const animated = await sharp(path.join(SOURCE, 'me.gif'), { animated: true })
  .webp({ quality: 75, effort: 6 })
  .toFile(`${OUT}/images/me.webp`);
console.log(`me.webp ${(animated.size / 1024).toFixed(0)} kB`);

// ---- Fonts ----
const LATIN =
  String.fromCharCode(...Array.from({ length: 95 }, (_, i) => 32 + i)) +
  String.fromCharCode(...Array.from({ length: 96 }, (_, i) => 160 + i)) +
  '–—‘’“”•…→';
fs.mkdirSync(`${OUT}/fonts`, { recursive: true });
const fonts = [
  ['design/source/about/caskaydia-cove-nf-semilight.ttf', LATIN, 'caskaydia-cove-semilight.woff2'],
  [`${SOURCE}/open-sans-regular.ttf`, '()', 'open-sans-brackets.woff2'],
];
for (const [file, text, out] of fonts) {
  const woff2 = await subsetFont(fs.readFileSync(file), text, { targetFormat: 'woff2' });
  fs.writeFileSync(`${OUT}/fonts/${out}`, woff2);
  console.log(`${out} ${(woff2.length / 1024).toFixed(1)} kB`);
}
