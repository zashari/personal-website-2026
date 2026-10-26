// The Figma frame /about is drawn from (and whose decoration /projects shares): its size, and how to place a text
// line from the baseline the SVG export gives.
export const FRAME = { width: 1920, height: 1080 };

// Vertical metrics per font, in em, as Chrome measures them (fontBoundingBox at 100 px).
const METRICS = {
  mono: { ascent: 0.93, descent: 0.23 }, // CaskaydiaCove NF
  sans: { ascent: 1.069, descent: 0.293 }, // Open Sans
  script: { ascent: 0.8, descent: 0.45 }, // Italianno
};

// The SVG export gives each text line's baseline. A CSS line box puts the baseline half the leading plus the ascent
// below its top, so the box starts that far above the baseline.
export function textAt({ x, baseline, size, lineHeight, font = 'mono' }) {
  const { ascent, descent } = METRICS[font];
  const top = baseline - (lineHeight - (ascent + descent) * size) / 2 - ascent * size;
  return { left: x, top, fontSize: size, lineHeight: `${lineHeight}px` };
}
