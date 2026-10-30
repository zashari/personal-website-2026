// The owner's galloping horse (frames.js, from scripts/build-horse-frames.mjs), drawn on a canvas as a grid of marks in
// the colour mode's accent, galloping in place in the middle of it: in the contact section's circle (ContactStage.jsx)
// and on /horse, a test page. The grid stays put and the horse
// moves under it, like a dot-matrix display: each screen refresh, every cell takes the horse's tone there, blended
// between the frame before and the frame after (each sampled at its own sub-cell offset), so the 10 frames a second
// of the GIF flow instead of stepping. The tone picks the cell's mark: a full square, a smaller square, a cross, a dot
// or nothing; a few cells swap to a cross, and a few just off the horse's edge get a stray dot, so it reads as a
// halftone print rather than a pixel mask.
import { FRAMES, FRAME_MS } from './frames.js';

const FIT = { width: 0.8, height: 0.6 }; // by default, the horse at most this share of the canvas's width and height
// A cell's value: 0 off the horse, and on it from LIGHTEST (its lightest tone) to 1 (its darkest). The marks by value:
const LIGHTEST = 0.3;
const MARKS = [
  [0.75, 'full'],
  [0.55, 'square'],
  [0.38, 'cross'],
  [0.18, 'dot'],
];
const SIZES = { full: 0.84, square: 0.6, dot: 0.34 }; // a square mark's side, in cells

// A fixed pseudo-random number in [0, 1) per cell, so the texture holds still while the horse moves.
const hash = (x, y) => {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

const frames = FRAMES.map((f) => {
  const tones = Uint8Array.from(atob(f.cells), (c) => c.charCodeAt(0));
  return { ...f, values: Float32Array.from(tones, (t) => (t ? LIGHTEST + ((1 - LIGHTEST) * t) / 255 : 0)) };
});

// The grid: every cell any frame's horse reaches, once lined up.
const bounds = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
for (const f of frames) {
  f.values.forEach((v, i) => {
    if (!v) return;
    const x = (i % f.cols) + f.dx;
    const y = Math.floor(i / f.cols) + f.dy;
    bounds.left = Math.min(bounds.left, Math.floor(x) - 1);
    bounds.right = Math.max(bounds.right, Math.ceil(x) + 2);
    bounds.top = Math.min(bounds.top, Math.floor(y) - 1);
    bounds.bottom = Math.max(bounds.bottom, Math.ceil(y) + 2);
  });
}

// A frame's value at a point of the grid, between its cells (bilinear).
function sample(f, gx, gy) {
  const x = gx - f.dx;
  const y = gy - f.dy;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const at = (c, r) => (c >= 0 && c < f.cols && r >= 0 && r < f.rows ? f.values[r * f.cols + c] : 0);
  const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx;
  const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx;
  return top * (1 - fy) + bottom * fy;
}

// Draws the horse on canvas, galloping, until the returned function is called; fit is the share of the canvas's width
// and height it may fill. Its colour is the canvas's CSS color, read at every refresh, so it follows the colour mode as
// that fades. It only runs while the canvas is on screen.
export function gallop(canvas, { fit = FIT } = {}) {
  const context = canvas.getContext('2d');
  const cols = bounds.right - bounds.left;
  const rows = bounds.bottom - bounds.top;
  const values = new Float32Array(cols * rows);
  let cell = 1;
  let origin = { x: 0, y: 0 };
  // The canvas's pixels follow its size on screen, transforms included (the contact section scales its stage), so the
  // marks stay sharp at any scale.
  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    cell = Math.min((canvas.width * fit.width) / cols, (canvas.height * fit.height) / rows);
    origin = { x: (canvas.width - cols * cell) / 2, y: (canvas.height - rows * cell) / 2 };
  }

  function draw(time) {
    const position = time / FRAME_MS;
    const a = frames[Math.floor(position) % frames.length];
    const b = frames[(Math.floor(position) + 1) % frames.length];
    const t = position - Math.floor(position);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gx = c + bounds.left;
        const gy = r + bounds.top;
        values[r * cols + c] = sample(a, gx, gy) * (1 - t) + sample(b, gx, gy) * t;
      }
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    const ink = getComputedStyle(canvas).color;
    context.fillStyle = ink;
    context.strokeStyle = ink;
    context.lineWidth = Math.max(1, cell * 0.16);
    const squares = new Path2D();
    const crosses = new Path2D();
    const square = (x, y, side) => {
      const size = side * cell;
      squares.rect(x - size / 2, y - size / 2, size, size);
    };
    const value = (c, r) => (c >= 0 && c < cols && r >= 0 && r < rows ? values[r * cols + c] : 0);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = values[r * cols + c];
        const x = origin.x + (c + 0.5) * cell;
        const y = origin.y + (r + 0.5) * cell;
        const random = hash(c, r);
        let kind = MARKS.find(([least]) => v >= least)?.[1];
        if (!kind) {
          // A stray dot here and there just off the horse's edge.
          const edge = Math.max(value(c - 1, r), value(c + 1, r), value(c, r - 1), value(c, r + 1)) >= MARKS[2][0];
          if (edge && random < 0.07) square(x, y, SIZES.dot);
          continue;
        }
        if (random < 0.12) kind = 'cross';
        else if (random > 0.97) continue; // a gap now and then
        if (kind === 'cross') {
          const arm = cell * 0.32;
          crosses.moveTo(x - arm, y - arm);
          crosses.lineTo(x + arm, y + arm);
          crosses.moveTo(x + arm, y - arm);
          crosses.lineTo(x - arm, y + arm);
        } else {
          square(x, y, SIZES[kind]);
        }
      }
    }
    context.fill(squares);
    context.stroke(crosses);
  }

  let request = 0;
  let last = 0;
  function tick(now) {
    last = now;
    draw(now);
    request = requestAnimationFrame(tick);
  }

  const redraw = () => {
    resize();
    draw(last);
  };
  const observer = new ResizeObserver(redraw);
  observer.observe(canvas);
  // A stage's scale changes with the window without the canvas's own size changing.
  window.addEventListener('resize', redraw);
  const visibility = new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(request);
    if (entry.isIntersecting) request = requestAnimationFrame(tick);
  });
  visibility.observe(canvas);
  resize();
  return () => {
    cancelAnimationFrame(request);
    observer.disconnect();
    visibility.disconnect();
    window.removeEventListener('resize', redraw);
  };
}
