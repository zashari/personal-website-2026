// The pieces a project's own book is built from (ArumiBook.jsx, FraudBook.jsx): its spreads are drawn in Figma as
// 768 x 536 frames (design/figma/data/<book>-page-*.svg) and rebuilt as live text, photos and paths on the book's sheets
// (Book.jsx). Positions are the frames' own, in frame px, turned into cqw of the spread (--fpx in figma-book.css), so
// every spread scales with the book like print. Text is placed by the baselines the SVG export gives; photos come
// cropped as Figma crops them and paths as Figma draws them (scripts/build-book-assets.mjs, which writes each book's
// assets/books/<book>/figma.js).
import { Fragment } from 'react';
import { textAt } from '../about/frame';
import './figma-book.css';

export const fpx = (n) => `calc(${n} * var(--fpx))`;

// Each typeface: its family (figma-book.css) and its vertical metrics (frame.js). Figma draws a face with a line gap
// (Times New Normal's is 0.1 em) that much lower than the baseline its SVG export gives, so shift moves it down to match.
const FONTS = {
  sans: { className: 'fb-sans', metrics: 'sans' },
  condensed: { className: 'fb-condensed', metrics: 'sans' },
  grotesk: { className: 'fb-grotesk', metrics: 'grotesk' },
  times: { className: 'fb-times', metrics: 'times', shift: 0.1 },
  script: { className: 'fb-script', metrics: 'script' }, // Italianno, the logotype's Z (src/home/brand.css)
};

// A text block whose first baseline sits where Figma has it. width, when given, is the column's.
export function at({ x, baseline, size, lineHeight = size * 1.3618, font = 'sans', width }) {
  const { metrics, shift = 0 } = FONTS[font];
  const t = textAt({ x, baseline: baseline + shift * size, size, lineHeight, font: metrics });
  return {
    left: fpx(t.left),
    top: fpx(t.top),
    fontSize: fpx(size),
    lineHeight: fpx(lineHeight),
    ...(width && { width: fpx(width) }),
  };
}

// The sheet of one spread; children are placed on it in frame px.
export function Sheet({ children, className = '' }) {
  return <div className={`bk-sheet-inner fb-sheet ${className}`}>{children}</div>;
}

// A photo from a book's figma.js, at its rect.
export function Photo({ avif, webp, x, y, w, h }) {
  return (
    <picture className="fb-photo" style={{ left: fpx(x), top: fpx(y), width: fpx(w), height: fpx(h) }}>
      <source type="image/avif" srcSet={avif} />
      <img src={webp} alt="" loading="lazy" decoding="async" draggable={false} />
    </picture>
  );
}

// A path from a book's figma.js, drawn on the whole frame.
export function Path({ d, fill, stroke, strokeWidth }) {
  return (
    <svg className="fb-path" viewBox="0 0 768 536" aria-hidden="true">
      <path d={d} fill={fill ?? 'none'} stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  );
}

// A box of colour, such as the dark panels under text on a photo.
export function Box({ x, y, w, h, color }) {
  return <div className="fb-box" style={{ left: fpx(x), top: fpx(y), width: fpx(w), height: fpx(h), background: color }} />;
}

// **words** in bold; {{words}} kept together, so a justified line does not spread the spaces inside them.
const rich = (line) =>
  line.split(/(\*\*.+?\*\*|\{\{.+?\}\})/).map((part, i) => {
    if (part.startsWith('**')) return <b key={i}>{part.slice(2, -2)}</b>;
    if (part.startsWith('{{')) {
      return (
        <span key={i} className="fb-keep">
          {part.slice(2, -2)}
        </span>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });

// Text line by line as Figma breaks it. justify spreads every line across the column (width) but the last of each
// paragraph; an empty line ends a paragraph and stands for Figma's blank line between them. A line may be given as
// { text, align } to set it apart and leave it unspread (Figma's centred last lines). justifyLast spreads the very
// last line too. style adds to the block's own (letter spacing and the like).
export function Text({
  lines,
  font = 'sans',
  weight,
  color,
  justify = false,
  justifyLast = false,
  align,
  shadow = false,
  className = '',
  style: extra,
  ...place
}) {
  const style = { ...at({ font, ...place }), fontWeight: weight, color, textAlign: align, ...extra };
  return (
    <p className={`fb-text ${FONTS[font].className} ${className}`} data-shadow={shadow || undefined} style={style}>
      {lines.map((line, i) => {
        const set = typeof line !== 'string';
        const text = set ? line.text : line;
        const last = set || (i === lines.length - 1 ? !justifyLast : lines[i + 1] === '');
        return (
          <span
            key={i}
            className="fb-line"
            data-justify={(justify && !last) || undefined}
            style={set ? { textAlign: line.align } : undefined}
          >
            {text === '' ? ' ' : rich(text)}
          </span>
        );
      })}
    </p>
  );
}

// "Scroll to turn this page" and the like, in the bottom-left corner of a book's pages.
export function Hint({ children, x = 26, baseline = 497.655, size = 12, color, shadow = true }) {
  return <Text lines={[children]} x={x} baseline={baseline} size={size} color={color} shadow={shadow} />;
}

// Lines as one plain sentence, for a book's text for screen readers (the drawn pages are hidden from them).
export const plain = (lines) =>
  lines
    .map((line) => (typeof line === 'string' ? line : line.text))
    .join(' ')
    .replace(/\*\*|\{\{|\}\}/g, '');
