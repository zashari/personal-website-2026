import { FILED, GITHUB_URL, LETTERHEAD, STATUS } from '../content/dossier';
import { QrCode, Rule, Text } from './primitives';

// A layer that Figma rotates: it reports the rotated bounding box, so recover the unrotated box
// around the same centre and let CSS rotate it back.
export const rotated = (bx, by, bw, bh, w, h) => ({ x: bx + bw / 2 - w / 2, y: by + bh / 2 - h / 2, w, h });

// Mirrors a front-side x onto the back of a sheet `width` wide (the back is the front seen from behind).
export const mirrorX = (width, x, w) => width - x - w;

// Letterhead shared by every front: department line with two redaction bars, then the location line.
// top is the department text's y on that sheet.
export function Letterhead({ top }) {
  return (
    <>
      <Text x={60} y={top} font="letterhead" size={20}>{LETTERHEAD.department}</Text>
      <span className="redact sheet-bar" style={bar(211, top + 3)} role="img" aria-label="redacted" />
      <span className="redact sheet-bar" style={bar(60, top + 23)} role="img" aria-label="redacted" />
      <Text x={60} y={top + 40} font="letterhead" size={10}>{LETTERHEAD.place}</Text>
    </>
  );
}

const bar = (x, y) => ({ position: 'absolute', left: `calc(${x} * var(--u))`, top: `calc(${y} * var(--u))`, width: 'calc(126 * var(--u))', height: 'calc(13 * var(--u))' });

// Footer of the personal and professional forms: status stamp, GitHub QR and filing date. top is the status label's y.
export function FormFooterInk({ top }) {
  return (
    <>
      <Text x={74} y={top} font="form" size={12}>{STATUS.label}</Text>
      <Text x={402} y={top + 1} font="form" size={12}>{FILED.label}</Text>
      <Text x={428} y={top - 1} size={12}>{FILED.date}</Text>
      <Rule x={427} y={top + 14} length={129} dash="1 3" />
    </>
  );
}

export function FormFooterStamps({ top }) {
  return (
    <Text x={113} y={top - 4} size={16} weight={900} tracking={1.6} color="var(--ink-red)" className="sheet-stamp">
      {STATUS.stamp}
    </Text>
  );
}

export function FormFooterQr({ top }) {
  return <QrCode url={GITHUB_URL} x={277} y={top - 59} size={84} blend="color-burn" />;
}
