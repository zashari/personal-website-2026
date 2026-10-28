// The Figma frame /about is drawn from (and whose decoration /projects shares): its size, how it is fitted to the
// window, and how to place a text line from the baseline the SVG export gives.
export const FRAME = { width: 1920, height: 1080 };
// The dashed line's 2 px band, through the clip's middle and the circle's centre.
export const DASH_Y = 540;
export const DASH_BLEED = 2000; // the dashed line runs past the frame's sides to the window's edges

// Below this the 16 px Figma text drops under ~9 px, so short windows scroll instead.
const MIN_SCALE = 0.55;
const FLOW_MAX_WIDTH = 1100; // narrower than this, the stage's text would be too small to read
const FLOW_MAX_ASPECT = 1.2; // and windows less than 1.2 times as wide as tall would leave the stage floating
// The frame is empty above the intro text (its box starts at y 103), so the header may overlap that band; the stage is
// kept low enough, or small enough, for the intro to start this far below the header's label.
const INTRO_TOP = 103;
const HEADER_GAP = 16;

// Where the frame goes in a window of this size under a header this tall: as large as fits below the header, centred
// across and resting on the bottom edge of the page (pageHeight, taller than the window when a short window must
// scroll). Null when the window is too narrow or upright for the frame, and the page lays its content out as a column.
export function fitFrame({ width, height, headerHeight }) {
  if (width < FLOW_MAX_WIDTH || width < height * FLOW_MAX_ASPECT) return null;
  const below = headerHeight + HEADER_GAP;
  const fit = Math.min(height / FRAME.height, (height - below) / (FRAME.height - INTRO_TOP));
  const scale = Math.min(width / FRAME.width, Math.max(fit, MIN_SCALE));
  const pageHeight = Math.max(height, below + (FRAME.height - INTRO_TOP) * scale);
  return { scale, x: (width - FRAME.width * scale) / 2, y: pageHeight - FRAME.height * scale, pageHeight };
}

// Vertical metrics per font, in em, as Chrome measures them (fontBoundingBox at 100 px).
const METRICS = {
  mono: { ascent: 0.93, descent: 0.23 }, // CaskaydiaCove NF
  sans: { ascent: 1.069, descent: 0.293 }, // Open Sans
  script: { ascent: 0.8, descent: 0.45 }, // Italianno
  typewriter: { ascent: 0.969, descent: 0.291 }, // JMH Typewriter (its hhea and win metrics, used on Windows)
  grotesk: { ascent: 0.99, descent: 0.29 }, // Host Grotesk (typo metrics, which it asks to be used)
  times: { ascent: 0.75, descent: 0.25 }, // Times New Normal (typo metrics, which it asks to be used)
};

// The SVG export gives each text line's baseline. A CSS line box puts the baseline half the leading plus the ascent
// below its top, so the box starts that far above the baseline.
export function textAt({ x, baseline, size, lineHeight, font = 'mono' }) {
  const { ascent, descent } = METRICS[font];
  const top = baseline - (lineHeight - (ascent + descent) * size) / 2 - ascent * size;
  return { left: x, top, fontSize: size, lineHeight: `${lineHeight}px` };
}
