#!/usr/bin/env node
// Builds the galloping horse of /horse (a test page) from the owner's GIF of a black horse galloping over sand
// (.tmp/horse-2.gif, 23 frames, one stride). Each frame is cut down to the horse alone: its dark pixels, without the
// shadow it casts on the sand (as dark as the horse, so it is cut off below the shadow's top edge, a line fitted to the
// columns where the shadow lies alone) and keeping only the largest dark shape, which leaves out the dust and the
// stones along the horizon. Frames are lined up on the horse's middle, so it gallops in place.
// - src/horse/frames.js: per frame, a grid of cells (CELL source px each) with the horse's tone in each cell, 0 for
//   none and 1 to 255 from its lightest to its darkest, as base64; and the GIF's frame time
// usage: node scripts/build-horse-frames.mjs [gif]   (default .tmp/horse-2.gif)
import fs from 'node:fs';
import sharp from 'sharp';

const GIF = process.argv[2] ?? '.tmp/horse-2.gif';
const OUT = 'src/horse/frames.js';
const CELL = 3; // source px per cell: about 115 cells across the horse
const DARK = 80; // luminance below which a pixel is the horse (coat 10 to 45, mane 50 to 80; the horizon 80 to 115)
// The shadow: a column whose lowest dark run starts below this share of the frame's height is shadow alone (a leg's
// run starts higher, at the horse); the cut is this many px above the fitted top edge.
const SHADOW = { below: 0.8, margin: 3 };

const { width: w, pageHeight: h, pages, delay } = await sharp(GIF, { animated: true }).metadata();

// The largest 4-connected set of mask pixels.
function largest(mask) {
  const label = new Int32Array(w * h);
  let best = { id: 0, size: 0 };
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
    if (size > best.size) best = { id, size };
  }
  return label.map((l) => (l === best.id ? 1 : 0));
}

// A least-squares line y = a + b x through points, refitted once without the points furthest from it (the odd column
// where dust or a hoof sits on the shadow).
function fitLine(points) {
  const fit = (ps) => {
    const n = ps.length;
    const mx = ps.reduce((s, p) => s + p.x, 0) / n;
    const my = ps.reduce((s, p) => s + p.y, 0) / n;
    const sxx = ps.reduce((s, p) => s + (p.x - mx) ** 2, 0);
    const b = sxx ? ps.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / sxx : 0;
    return { a: my - b * mx, b };
  };
  const first = fit(points);
  const off = (p) => Math.abs(p.y - (first.a + first.b * p.x));
  const kept = [...points].sort((p, q) => off(p) - off(q)).slice(0, Math.ceil(points.length * 0.8));
  return fit(kept);
}

const frames = [];
for (let page = 0; page < pages; page++) {
  const lum = await sharp(GIF, { page }).greyscale().median(3).raw().toBuffer();
  const dark = lum.map((v) => (v < DARK ? 1 : 0));

  // The shadow's top edge, from the columns where the lowest dark run lies alone near the ground.
  const tops = [];
  for (let x = 0; x < w; x++) {
    let y = h - 1;
    while (y >= 0 && !dark[y * w + x]) y--;
    if (y < 0) continue;
    while (y > 0 && dark[(y - 1) * w + x]) y--;
    if (y > SHADOW.below * h) tops.push({ x, y });
  }
  const ground = tops.length > 10 ? fitLine(tops) : { a: h, b: 0 };
  const above = dark.map((v, i) => (v && Math.floor(i / w) < ground.a + ground.b * (i % w) - SHADOW.margin ? 1 : 0));
  const horse = largest(above);

  let sx = 0;
  let n = 0;
  for (let i = 0; i < w * h; i++) {
    if (!horse[i]) continue;
    sx += i % w;
    n++;
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
  frames.push({ cols, rows, cx: sx / n / CELL, cells: Buffer.from(cells).toString('base64') });
  console.log(`frame ${page + 1}: ${n} px, ground y ${ground.a.toFixed(0)} + ${ground.b.toFixed(3)} x`);
}

const lines = [
  `// Generated by scripts/build-horse-frames.mjs from the owner's GIF of a horse galloping; do not edit.`,
  "// Per frame: the cell grid's size, the horse's middle (cx, in cells), and its cells' tones (base64).",
  `export const FRAME_MS = ${delay?.[0] ?? 100};`,
  `export const FRAMES = ${JSON.stringify(frames)};`,
  '',
];
fs.mkdirSync('src/horse', { recursive: true });
fs.writeFileSync(OUT, lines.join('\n'));
console.log(`${OUT} ${(fs.statSync(OUT).size / 1024).toFixed(0)} kB`);
