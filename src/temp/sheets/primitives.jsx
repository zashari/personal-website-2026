import { useMemo } from 'react';
import { generate } from 'lean-qr';

// Building blocks for the dossier sheets. Every position and size is in Figma px of the sheet it sits on
// (see design/figma/docs/sheets); u() turns them into lengths relative to the rendered sheet width, so a
// sheet scales as one piece and its text is re-rasterized crisply at any size.

export const u = (n) => `calc(${n} * var(--u))`;

export const at = (x, y, w, h) => ({
  left: u(x),
  top: u(y),
  ...(w != null && { width: u(w) }),
  ...(h != null && { height: u(h) }),
});

const FILES = import.meta.glob('../assets/images/*.{avif,webp}', { eager: true, query: '?url', import: 'default' });
const byName = Object.fromEntries(Object.entries(FILES).map(([key, url]) => [key.split('/').pop(), url]));

export function image(name) {
  const avif = byName[`${name}.avif`];
  const webp = byName[`${name}.webp`];
  if (!avif || !webp) throw new Error(`Missing /temp image ${name}; run node scripts/build-temp-assets.mjs`);
  return { avif, webp };
}

export function Picture({ name, alt = '', className, style }) {
  const src = image(name);
  return (
    <picture>
      <source type="image/avif" srcSet={src.avif} />
      <img src={src.webp} alt={alt} className={className} style={style} draggable={false} decoding="async" />
    </picture>
  );
}

// A sheet side. width/height are the Figma node's size; children are positioned with at().
export function Sheet({ width, height, className = '', children }) {
  return (
    <div className={`sheet ${className}`} style={{ '--sheet-w': width, aspectRatio: `${width} / ${height}` }}>
      {children}
    </div>
  );
}

// The blank paper (base photo, punched holes and texture, composited by scripts/build-temp-assets.mjs).
export function Paper({ name, x, y, w, h, mirrored = false }) {
  return <Picture name={name} className={`sheet-paper${mirrored ? ' is-mirrored' : ''}`} style={at(x, y, w, h)} />;
}

const FONTS = {
  type: 'sheet-type',
  form: 'sheet-form',
  letterhead: 'sheet-letterhead',
};

// Figma's auto line height is the font's own (ascent + descent) rounded to whole px: 1.285 × size for
// JMH Typewriter, 1.1 × for Times New Normal, 1.0 × for David Libre.
const LINE_RATIO = { type: 1.285, form: 1.1, letterhead: 1 };
export const lineHeight = (font, size) => Math.round(size * LINE_RATIO[font]);

// One Figma text layer: font, size and line height in Figma px. Without w the text never wraps,
// as Figma's auto-width layers; with w it wraps inside that width.
export function Text({ x, y, w, font = 'type', size, lh, weight, color, align, tracking, className = '', as: Tag = 'div', children, ...rest }) {
  const style = {
    ...at(x, y, w),
    fontSize: u(size),
    lineHeight: u(lh ?? lineHeight(font, size)),
    ...(weight && { fontWeight: weight }),
    ...(color && { color }),
    ...(align && { textAlign: align }),
    ...(tracking && { letterSpacing: u(tracking) }),
  };
  return (
    <Tag className={`sheet-text ${FONTS[font]} ${w == null ? 'is-nowrap' : ''} ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  );
}

// A black bar about `ch` characters wide. It carries no text, so hidden words never reach the page.
export function Redact({ ch }) {
  return <span className="redact" style={{ width: `${ch}ch` }} role="img" aria-label="redacted" />;
}

const MARKUP = /(\*\*[^*]+\*\*|==[^=]+==|\[\[redact:\d+\]\]|\n)/g;

// Renders the inline markup described in content/dossier.js.
export function Rich({ text }) {
  return text.split(MARKUP).filter(Boolean).map((part, i) => {
    if (part === '\n') return <br key={i} />;
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('==')) return <span key={i} className="ink-red">{part.slice(2, -2)}</span>;
    const redact = part.match(/^\[\[redact:(\d+)\]\]$/);
    if (redact) return <Redact key={i} ch={Number(redact[1])} />;
    return part;
  });
}

// A straight Figma line. dash "1 3" with round caps gives the dotted rules and underlines.
export function Rule({ x, y, length, weight = 1, dash, vertical = false, color = '#000', className = '' }) {
  const w = vertical ? weight : length;
  const h = vertical ? length : weight;
  const half = weight / 2;
  return (
    <svg className={`sheet-rule ${className}`} style={{ ...at(vertical ? x - half : x, vertical ? y : y - half, w, h) }} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <line
        x1={vertical ? half : 0}
        y1={vertical ? 0 : half}
        x2={vertical ? half : length}
        y2={vertical ? length : half}
        stroke={color}
        strokeWidth={weight}
        strokeDasharray={dash}
        strokeLinecap={dash ? 'round' : 'square'}
      />
    </svg>
  );
}

// Figma's 2 px inside stroke around the form.
export function Frame({ x, y, w, h, weight = 2 }) {
  return <div className="sheet-frame" style={{ ...at(x, y, w, h), borderWidth: u(weight) }} aria-hidden="true" />;
}

// A form field on the personal sheet: Times New Normal label, typewritten value and the dotted line under it.
// y is the value's line top; the label sits 3 px lower and the line 21 px lower, as in Figma.
export function Field({ y, labelX, valueX, lineX, lineW, label, value, href }) {
  const link = href && { as: 'a', href, target: '_blank', rel: 'noopener noreferrer', className: 'sheet-link' };
  return (
    <>
      <Text x={labelX} y={y + 3} font="form" size={16}>{label}</Text>
      <Text x={valueX} y={y} size={16} {...link}>
        <Rich text={value} />
      </Text>
      <Rule x={lineX} y={y + 21} length={lineW} dash="1 3" />
    </>
  );
}

// QR code drawn from the URL at render time, so it always points where the content says.
export function QrCode({ url, x, y, size, blend = 'darken', blurred = false, link = true }) {
  const path = useMemo(() => {
    const code = generate(url);
    let d = '';
    for (let row = 0; row < code.size; row++) {
      for (let col = 0; col < code.size; col++) if (code.get(col, row)) d += `M${col} ${row}h1v1h-1z`;
    }
    return { d, size: code.size };
  }, [url]);
  const pad = 2;
  const svg = (
    <svg viewBox={`${-pad} ${-pad} ${path.size + pad * 2} ${path.size + pad * 2}`} shapeRendering="crispEdges" aria-hidden="true">
      <path d={path.d} fill="#000" />
    </svg>
  );
  const style = { ...at(x, y, size, size), mixBlendMode: blend };
  const className = `sheet-qr${blurred ? ' is-blurred' : ''}`;
  if (!link || blurred) return <div className={className} style={style}>{svg}</div>;
  return (
    <a className={`${className} sheet-link`} style={style} href={url} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">
      {svg}
    </a>
  );
}

// A framed photo clipped to the sheet. Opening it shows the photo on its own, ready to flip.
export function Polaroid({ name, alt, x, y, size, rotate = 0, frame, onOpen }) {
  return (
    <button
      type="button"
      className="sheet-polaroid"
      style={{ ...at(x, y, size, size), borderWidth: u(frame), transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
      aria-label={`Open photo: ${alt}`}
    >
      <Picture name={name} alt={alt} className="sheet-polaroid-img" />
    </button>
  );
}

// The back of a polaroid as seen through the sheet: a blank white card with the same frame.
export function PolaroidBack({ x, y, size, rotate = 0, frame }) {
  return (
    <div
      className="sheet-polaroid-back"
      style={{ ...at(x, y, size, size), borderWidth: u(frame), transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      aria-hidden="true"
    />
  );
}

// Small decorative images (paperclips, staples, the seal), placed by their Figma box and rotation.
export function Piece({ name, x, y, w, h, rotate = 0, flip = false, className = '' }) {
  const transform = [rotate && `rotate(${rotate}deg)`, flip && 'scaleX(-1)'].filter(Boolean).join(' ') || undefined;
  return <Picture name={name} className={`sheet-piece ${className}`} style={{ ...at(x, y, w, h), transform }} />;
}
