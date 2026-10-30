// /horse, a test page: the owner's galloping horse (frames.js, from scripts/build-horse-frames.mjs) drawn on a canvas as
// a grid of marks in the colour mode's accent, galloping in place in the middle of it. Each cell of the horse gets a
// mark by its tone: the darkest a full square, then a smaller square, a cross and a dot; a few cells swap to a cross,
// and a few empty cells at its edge get a stray dot, so it reads as a halftone print rather than a pixel mask.
import { FRAMES, FRAME_MS } from './frames.js';

const FIT = { width: 0.8, height: 0.6 }; // the horse at most this share of the window's width and height

// A fixed pseudo-random number in [0, 1) per cell, so the texture holds still while the horse moves.
const hash = (x, y) => {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

// The frames lined up on the horse's middle, and the bounds of every frame's cells together.
const middle = FRAMES.reduce((sum, f) => sum + f.cx, 0) / FRAMES.length;
const frames = FRAMES.map((f) => ({
  cols: f.cols,
  rows: f.rows,
  shift: Math.round(middle - f.cx),
  cells: Uint8Array.from(atob(f.cells), (c) => c.charCodeAt(0)),
}));
const bounds = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
for (const f of frames) {
  f.cells.forEach((tone, i) => {
    if (!tone) return;
    const x = (i % f.cols) + f.shift;
    const y = Math.floor(i / f.cols);
    bounds.left = Math.min(bounds.left, x);
    bounds.right = Math.max(bounds.right, x + 1);
    bounds.top = Math.min(bounds.top, y);
    bounds.bottom = Math.max(bounds.bottom, y + 1);
  });
}

// Draws the horse on canvas, galloping, until the returned function is called. Its colour is the canvas's CSS color,
// read at every frame, so it follows the colour mode as that fades (horse.css).
export function gallop(canvas) {
  const context = canvas.getContext('2d');
  let cell = 1;
  let origin = { x: 0, y: 0 };
  function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    const width = bounds.right - bounds.left;
    const height = bounds.bottom - bounds.top;
    cell = Math.min((canvas.width * FIT.width) / width, (canvas.height * FIT.height) / height);
    origin = {
      x: (canvas.width - width * cell) / 2 - bounds.left * cell,
      y: (canvas.height - height * cell) / 2 - bounds.top * cell,
    };
  }

  function mark(x, y, kind) {
    const px = origin.x + x * cell;
    const py = origin.y + y * cell;
    const mid = cell / 2;
    if (kind === 'cross') {
      const r = cell * 0.32;
      context.lineWidth = Math.max(1, cell * 0.16);
      context.beginPath();
      context.moveTo(px + mid - r, py + mid - r);
      context.lineTo(px + mid + r, py + mid + r);
      context.moveTo(px + mid + r, py + mid - r);
      context.lineTo(px + mid - r, py + mid + r);
      context.stroke();
      return;
    }
    const size = { full: 0.84, square: 0.6, dot: 0.34 }[kind] * cell;
    context.fillRect(px + mid - size / 2, py + mid - size / 2, size, size);
  }

  function draw(f) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const ink = getComputedStyle(canvas).color;
    context.fillStyle = ink;
    context.strokeStyle = ink;
    const at = (x, y) => (x >= 0 && x < f.cols && y >= 0 && y < f.rows ? f.cells[y * f.cols + x] : 0);
    for (let y = 0; y < f.rows; y++) {
      for (let x = 0; x < f.cols; x++) {
        const tone = at(x, y);
        const gx = x + f.shift;
        const r = hash(gx, y);
        if (!tone) {
          // A stray dot here and there just off the horse's edge.
          const edge = at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1);
          if (edge && r < 0.07) mark(gx, y, 'dot');
          continue;
        }
        const t = tone / 255;
        let kind = t > 0.62 ? 'full' : t > 0.38 ? 'square' : t > 0.18 ? 'cross' : 'dot';
        if (r < 0.12) kind = 'cross';
        else if (r > 0.97) continue; // a gap now and then
        mark(gx, y, kind);
      }
    }
  }

  let shown = -1;
  let request = 0;
  function tick(now) {
    const index = Math.floor(now / FRAME_MS) % frames.length;
    if (index !== shown) {
      shown = index;
      draw(frames[index]);
    }
    request = requestAnimationFrame(tick);
  }

  const observer = new ResizeObserver(() => {
    resize();
    if (shown >= 0) draw(frames[shown]);
  });
  observer.observe(canvas);
  resize();
  request = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(request);
    observer.disconnect();
  };
}
