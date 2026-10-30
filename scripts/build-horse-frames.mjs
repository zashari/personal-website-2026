#!/usr/bin/env node
// Builds the galloping horse of /horse (a test page) from Eadweard Muybridge's "The Horse in Motion" (1878, public
// domain; the 15-frame GIF on Wikimedia Commons, Muybridge_race_horse_animated.gif). Each frame is cut down to the
// horse alone: the dark pixels, with thin lines (the track's posts, the reins) opened away, and the jockey cut off above
// the horse's back between its tail and its neck (his arms join him to the neck, so shape alone cannot part them).
// Frames are lined up on the horse's middle, so it gallops in place.
// - src/horse/frames.js: per frame, a grid of cells (CELL source px each) with the horse's tone in each cell, 0 for
//   none and 1 to 255 from its lightest to its darkest, as base64
// usage: node scripts/build-horse-frames.mjs [gif]   (default .tmp/horse-src/muybridge.gif)
import fs from 'node:fs';
import sharp from 'sharp';

const GIF = process.argv[2] ?? '.tmp/horse-src/muybridge.gif';
const OUT = 'src/horse/frames.js';
const CELL = 2; // source px per cell: about 120 cells across the horse
const DARK = 110; // luminance below which a pixel is the horse (its coat is about 30 to 90, the backdrop above 180)
const MARGIN = { top: 2, left: 2, right: 2, bottom: 16 }; // the frame's edges, the track and the plate numbers
// Where the jockey is, as fractions of the horse's span from its tail: the croup's columns, whose top is the height of
// the back, and the columns he is cut from (the tail is left of them, the neck and head right).
const JOCKEY = { croup: [0.28, 0.34], cut: [0.33, 0.72] };

const { width, pageHeight: height, pages } = await sharp(GIF, { animated: true }).metadata();

// A square structuring element of radius r over a binary mask: erode (all set) or dilate (any set).
function morph(mask, w, h, r, all) {
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let hit = all;
      for (let dy = -r; dy <= r && hit === all; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const v = mask[Math.min(h - 1, Math.max(0, y + dy)) * w + Math.min(w - 1, Math.max(0, x + dx))];
          if (all ? !v : v) {
            hit = !all;
            break;
          }
        }
      }
      out[y * w + x] = hit ? 1 : 0;
    }
  }
  return out;
}

// The 4-connected sets of mask pixels of at least min px.
function shapes(mask, w, h, min) {
  const label = new Int32Array(w * h);
  const keep = new Set();
  let id = 0;
  for (let i = 0; i < w * h; i++) {
    if (!mask[i] || label[i]) continue;
    id++;
    const stack = [i];
    label[i] = id;
    let size = 0;
    while (stack.length) {
      const p = stack.pop();
      size++;
      const x = p % w;
      for (const q of [p - w, p + w, x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1]) {
        if (q >= 0 && q < w * h && mask[q] && !label[q]) {
          label[q] = id;
          stack.push(q);
        }
      }
    }
    if (size >= min) keep.add(id);
  }
  return label.map((l) => (keep.has(l) ? 1 : 0));
}

const w = width - MARGIN.left - MARGIN.right;
const h = height - MARGIN.top - MARGIN.bottom;
const frames = [];
for (let page = 0; page < pages; page++) {
  const lum = await sharp(GIF, { page })
    .extract({ left: MARGIN.left, top: MARGIN.top, width: w, height: h })
    .greyscale()
    .median(3)
    .raw()
    .toBuffer();
  const dark = lum.map((v) => (v < DARK ? 1 : 0));
  // Opening (erode, then dilate) by one px removes thin lines; what is left grows back by a px within the dark pixels
  // so the legs and tail keep their thin ends.
  const opened = morph(morph(dark, w, h, 1, true), w, h, 1, false);
  const body = morph(shapes(opened, w, h, 400), w, h, 1, false).map((v, i) => v & dark[i]);
  // The horse's span, and its back: as high as its croup (the jockey never reaches over it), the median of the top
  // edges of the columns there. The jockey is everything above the back, short of the tail and the neck.
  let left = w;
  let right = 0;
  for (let i = 0; i < w * h; i++) {
    if (!body[i]) continue;
    left = Math.min(left, i % w);
    right = Math.max(right, i % w);
  }
  const span = right - left;
  const tops = [];
  for (let x = Math.round(left + JOCKEY.croup[0] * span); x <= left + JOCKEY.croup[1] * span; x++) {
    let y = 0;
    while (y < h && !body[y * w + x]) y++;
    if (y < h) tops.push(y);
  }
  tops.sort((p, q) => p - q);
  const back = tops[Math.floor(tops.length / 2)];
  const [cutL, cutR] = [left + JOCKEY.cut[0] * span, left + JOCKEY.cut[1] * span];
  const riderless = body.map((v, i) => (v && !(Math.floor(i / w) < back - 1 && i % w > cutL && i % w < cutR) ? 1 : 0));
  const horse = shapes(riderless, w, h, 150);

  let sx = 0;
  let n = 0;
  let minY = h;
  let maxY = 0;
  for (let i = 0; i < w * h; i++) {
    if (!horse[i]) continue;
    sx += i % w;
    n++;
    minY = Math.min(minY, Math.floor(i / w));
    maxY = Math.max(maxY, Math.floor(i / w));
  }
  // The coat's tone, spread over the horse's own range so its light and dark patches read.
  const tones = [];
  for (let i = 0; i < w * h; i++) if (horse[i]) tones.push(lum[i]);
  tones.sort((a, b) => a - b);
  const lo = tones[Math.floor(tones.length * 0.05)];
  const hi = tones[Math.floor(tones.length * 0.95)];

  const cols = Math.ceil(w / CELL);
  const rows = Math.ceil(h / CELL);
  const cells = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let count = 0;
      let sum = 0;
      for (let y = r * CELL; y < Math.min(h, (r + 1) * CELL); y++) {
        for (let x = c * CELL; x < Math.min(w, (c + 1) * CELL); x++) {
          if (!horse[y * w + x]) continue;
          count++;
          sum += lum[y * w + x];
        }
      }
      if (count * 2 < CELL * CELL) continue; // under half covered: outside the horse
      const t = 1 - Math.min(1, Math.max(0, (sum / count - lo) / Math.max(1, hi - lo)));
      cells[r * cols + c] = 1 + Math.round(t * 254);
    }
  }
  frames.push({ cols, rows, cx: sx / n / CELL, bottom: maxY / CELL, cells: Buffer.from(cells).toString('base64') });
  console.log(`frame ${page + 1}: ${n} px, rows ${minY}-${maxY}`);
}

const lines = [
  `// Generated by scripts/build-horse-frames.mjs from Muybridge's "The Horse in Motion" (1878, public domain); do not edit.`,
  "// Per frame: the cell grid's size, the horse's middle (cx, in cells), its lowest cell, and its cells' tones (base64).",
  `export const FRAME_MS = 100;`,
  `export const FRAMES = ${JSON.stringify(frames)};`,
  '',
];
fs.mkdirSync('src/horse', { recursive: true });
fs.writeFileSync(OUT, lines.join('\n'));
console.log(`${OUT} ${(fs.statSync(OUT).size / 1024).toFixed(0)} kB`);
