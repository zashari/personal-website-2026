#!/usr/bin/env node
// Builds the site icons for zashari.website, /temp, /home and /learning from the logo master.
// usage: node scripts/build-icons.mjs   (master: design/source/zashari-logo.png, a black Z on transparent)
// - public/favicon.svg: the Z for browser tabs, black on light tab bars and white on dark ones (CSS in the SVG)
// - public/favicon-48.png: fallback for browsers without SVG favicons (Safari), black on transparent
// - public/icon-192.png, public/apple-touch-icon.png: home-screen icons. iOS fills transparency with black, so these
//   put the Z on the site's cream background, inside the area that survives rounded-corner masks.
import fs from 'node:fs';
import sharp from 'sharp';

const MASTER = 'design/source/zashari-logo.png';
const CREAM = '#dbd5c9';

// The Z scaled to fit a box (keeping its aspect), centred on a square canvas.
async function glyph(size, fill, background) {
  const z = await sharp(MASTER).trim().resize({ width: Math.round(size * fill), height: Math.round(size * fill), fit: 'inside' }).toBuffer();
  const canvas = sharp({ create: { width: size, height: size, channels: 4, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } } });
  return canvas.composite([{ input: z, gravity: 'centre' }]).png({ compressionLevel: 9 });
}

await (await glyph(48, 0.94)).toFile('public/favicon-48.png');
await (await glyph(192, 0.62, CREAM)).flatten({ background: CREAM }).toFile('public/icon-192.png');
await (await glyph(180, 0.62, CREAM)).flatten({ background: CREAM }).toFile('public/apple-touch-icon.png');

// SVG favicon: a 128 px raster of the Z embedded once, recoloured by the tab bar's colour scheme.
const raster = await (await glyph(128, 0.94)).toBuffer();
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <style>@media (prefers-color-scheme: dark) { image { filter: invert(1); } }</style>
  <image width="128" height="128" href="data:image/png;base64,${raster.toString('base64')}"/>
</svg>
`;
fs.writeFileSync('public/favicon.svg', svg);
for (const f of ['favicon.svg', 'favicon-48.png', 'icon-192.png', 'apple-touch-icon.png']) console.log(f, fs.statSync(`public/${f}`).size, 'bytes');
