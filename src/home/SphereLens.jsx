// Clear-glass lens for the /home spheres in light mode: an SVG displacement filter used as each sphere's backdrop-filter,
// so the page behind it (spiral, photo) bends as it would through a glass ball, live while the sphere drifts. Only
// Chromium applies SVG filters in backdrop-filter; other browsers keep the unbent clear glass Strands draws.
export const LENS_ID = 'home-sphere-lens';
export const LENS_SUPPORTED = typeof navigator !== 'undefined' && /Chrome\//.test(navigator.userAgent);

const SIZE = 256; // displacement map resolution; stretched over the sphere's box
const RADIUS = 0.42; // Strands draws its sphere at 84% of its box
const SCALE = 0.5; // displacement range in box units: a channel at 0 or 255 shifts by a quarter of the box
const MAGNIFY = 0.15; // the centre shows the page 15% closer to the middle, so it reads slightly magnified
const STRENGTH = 0.4; // share of that full bend actually applied; 1 matches Strands' own remap exactly

// A point at radius r inside the sphere shows the page at r * sc: Strands' own ball-lens remap (refraction 1), which
// squeezes the page toward the rim, times a gentle magnification toward the centre, then eased off by STRENGTH.
function buildMap() {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const px = (x + 0.5) / SIZE - 0.5;
      const py = (y + 0.5) / SIZE - 0.5;
      const r = Math.hypot(px, py) / RADIUS;
      let sc = 1;
      if (r < 1) {
        const bend = r ** 5.17;
        const full = (((1 - 0.278 * (1 - bend)) * (1 - 0.632 * bend)) / (1 - 0.278)) * (1 - MAGNIFY * (1 - r * r));
        sc = 1 + (full - 1) * STRENGTH;
      }
      const i = (y * SIZE + x) * 4;
      img.data[i] = Math.round((0.5 + (px * (sc - 1)) / SCALE) * 255);
      img.data[i + 1] = Math.round((0.5 + (py * (sc - 1)) / SCALE) * 255);
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

let map = null;

export default function SphereLens() {
  map ??= buildMap();
  return (
    <svg className="home-sphere-lens" width="0" height="0" aria-hidden="true">
      <filter
        id={LENS_ID}
        x="0"
        y="0"
        width="1"
        height="1"
        filterUnits="objectBoundingBox"
        primitiveUnits="objectBoundingBox"
        colorInterpolationFilters="sRGB"
      >
        <feImage href={map} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={SCALE} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
