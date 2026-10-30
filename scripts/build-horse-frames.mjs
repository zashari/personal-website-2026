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
const BARREL = [0.3, 0.55]; // the barrel's rows, as shares of the horse's height from its top
const HELD = 0.4; // a frame changing less than this share of the usual change from the one before is a held frame
const LOOP_MIN = 8; // the shortest loop, in frames

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
  const raw = await sharp(GIF, { page }).greyscale().raw().toBuffer();
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

  // Where the horse is, steadier than its middle (which swings with its legs and tail): its barrel, the middle of the
  // rows between its back and its belly, and the ground under it (the camera pans and tilts over the clip).
  let top = h;
  let bottom = 0;
  for (let i = 0; i < w * h; i++) {
    if (!horse[i]) continue;
    top = Math.min(top, Math.floor(i / w));
    bottom = Math.max(bottom, Math.floor(i / w));
  }
  let sx = 0;
  let n = 0;
  for (let i = 0; i < w * h; i++) {
    const y = Math.floor(i / w);
    if (!horse[i] || y < top + BARREL[0] * (bottom - top) || y > top + BARREL[1] * (bottom - top)) continue;
    sx += i % w;
    n++;
  }
  const barrel = sx / n;
  const floor = ground.a + ground.b * barrel;

  // The coat's tone, spread over the horse's own range so its light and dark patches read.
  const tones = [];
  for (let i = 0; i < w * h; i++) if (horse[i]) tones.push(lum[i]);
  tones.sort((p, q) => p - q);
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
  frames.push({ page, raw, cols, rows, x: barrel / CELL, y: floor / CELL, cells });
}

// A frame that barely differs from the one before (the GIF holds a few) only stalls the gallop.
const change = (p, q) => p.raw.reduce((sum, v, i) => sum + Math.abs(v - q.raw[i]), 0) / p.raw.length;
const steps = frames.slice(1).map((f, i) => change(f, frames[i]));
const usual = [...steps].sort((p, q) => p - q)[Math.floor(steps.length / 2)];
const moving = frames.filter((f, i) => i === 0 || steps[i - 1] >= HELD * usual);

// Each frame's offset, in cells, that puts its barrel and ground where the frames' average is.
const mean = (key) => moving.reduce((sum, f) => sum + f[key], 0) / moving.length;
const [mx, my] = [mean('x'), mean('y')];
for (const f of moving) [f.dx, f.dy] = [mx - f.x, my - f.y];

// The loop: the GIF does not end in the pose it starts with, so the gallop runs from frame i to the frame before j,
// where j is the later frame most like i once both are lined up (a whole number of strides apart).
const overlap = (p, q) => {
  const [ox, oy] = [Math.round(q.dx - p.dx), Math.round(q.dy - p.dy)];
  let both = 0;
  let either = 0;
  for (let r = 0; r < p.rows; r++) {
    for (let c = 0; c < p.cols; c++) {
      const a = p.cells[r * p.cols + c] > 0;
      const qc = c - ox;
      const qr = r - oy;
      const b = qc >= 0 && qc < q.cols && qr >= 0 && qr < q.rows && q.cells[qr * q.cols + qc] > 0;
      both += a && b;
      either += a || b;
    }
  }
  return both / either;
};
let loop = { i: 0, j: moving.length, score: 0 };
for (let i = 0; i < moving.length; i++) {
  for (let j = i + LOOP_MIN; j < moving.length; j++) {
    const score = overlap(moving[i], moving[j]);
    if (score > loop.score + 0.01 || (score > loop.score - 0.01 && j - i > loop.j - loop.i)) loop = { i, j, score };
  }
}
const chosen = moving.slice(loop.i, loop.j);
console.log(
  `${frames.length - moving.length} held frame(s) dropped; loop: GIF frames ${chosen[0].page + 1} to ${chosen.at(-1).page + 1} (${chosen.length}), its ends ${(loop.score * 100).toFixed(0)}% alike`
);

const out = chosen.map((f) => ({
  cols: f.cols,
  rows: f.rows,
  dx: +f.dx.toFixed(2),
  dy: +f.dy.toFixed(2),
  cells: Buffer.from(f.cells).toString('base64'),
}));
const lines = [
  `// Generated by scripts/build-horse-frames.mjs from the owner's GIF of a horse galloping; do not edit.`,
  "// Per frame, in loop order: the cell grid's size, the offset in cells that lines the horse up with the others, and",
  "// its cells' tones (base64).",
  `export const FRAME_MS = ${delay?.[0] ?? 100};`,
  `export const FRAMES = ${JSON.stringify(out)};`,
  '',
];
fs.mkdirSync('src/horse', { recursive: true });
fs.writeFileSync(OUT, lines.join('\n'));
console.log(`${OUT} ${(fs.statSync(OUT).size / 1024).toFixed(0)} kB`);
