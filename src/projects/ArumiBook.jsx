// Arumi Coffee's book: four spreads drawn in Figma (design/figma/data/arumi-page-*.svg, each a 768 x 536 frame) and
// rebuilt here as live text and photos on the book's sheets (Book.jsx). Positions are the frames' own, in frame px,
// turned into cqw of the spread (--fpx in arumi.css), so every spread scales with the book like print. Text is placed
// by the baselines the SVG export gives; photos come cropped as Figma crops them (scripts/build-book-assets.mjs).
import { Fragment } from 'react';
import { textAt } from '../about/frame';
import PHOTOS from './assets/books/arumi/photos';
import { ARUMI_BOOK as A } from './work';
import './arumi.css';

const fpx = (n) => `calc(${n} * var(--fpx))`;

// A text block whose first baseline sits where Figma has it. width, when given, is the column's.
function at({ x, baseline, size, lineHeight = size * 1.3618, font = 'sans', width }) {
  const t = textAt({ x, baseline, size, lineHeight, font });
  return {
    left: fpx(t.left),
    top: fpx(t.top),
    fontSize: fpx(size),
    lineHeight: fpx(lineHeight),
    ...(width && { width: fpx(width) }),
  };
}

function Photo({ name, className = '' }) {
  const { avif, webp, x, y, w, h } = PHOTOS[name];
  return (
    <picture className={`ar-photo ${className}`} style={{ left: fpx(x), top: fpx(y), width: fpx(w), height: fpx(h) }}>
      <source type="image/avif" srcSet={avif} />
      <img src={webp} alt="" loading="lazy" decoding="async" draggable={false} />
    </picture>
  );
}

// **words** in bold.
const rich = (line) =>
  line.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : <Fragment key={i}>{part}</Fragment>));

// A justified column, line by line as Figma breaks it; the last line stays ragged unless justifyLast.
function Column({ lines, justifyLast = false, ...place }) {
  return (
    <p className="ar-text ar-column" style={at({ font: 'grotesk', size: 10, lineHeight: 11, ...place })}>
      {lines.map((line, i) => (
        <span key={i} className="ar-line" data-ragged={(i === lines.length - 1 && !justifyLast) || undefined}>
          {rich(line)}
        </span>
      ))}
    </p>
  );
}

function Lines({ lines, className, ...place }) {
  return (
    <p className={`ar-text ${className}`} style={at(place)}>
      {lines.map((line, i) => (
        <span key={i} className="ar-line">
          {line}
        </span>
      ))}
    </p>
  );
}

function Hint({ children, x, baseline = 497.655, size = 12, shadow = true }) {
  return (
    <p className="ar-text ar-hint" data-shadow={shadow || undefined} style={at({ x, baseline, size })}>
      {children}
    </p>
  );
}

// Pages 1 and 2: the title, the date and a strip of photo across the gutter.
function CoverSpread() {
  return (
    <div className="bk-sheet-inner ar-sheet">
      <p className="ar-text ar-cover-title" style={at({ x: 32, baseline: 56.2588, size: 20 })}>
        {A.title}
      </p>
      <p className="ar-text" style={at({ x: 669, baseline: 54.8191, size: 15 })}>
        {A.date}
      </p>
      <Photo name="s1-image" />
      <Hint x={615} shadow={false}>
        {A.hint}
      </Hint>
    </div>
  );
}

// Pages 3 and 4: one photo across both pages, the headline over it and the founder's words in a box.
function SunsetSpread() {
  return (
    <div className="bk-sheet-inner ar-sheet">
      <Photo name="s2-image" />
      <Lines lines={A.headline} className="ar-headline" x={26} baseline={88.397} size={50} lineHeight={68} />
      <Hint x={26}>{A.hint}</Hint>
      <div className="ar-quote-box" style={{ left: fpx(512), top: fpx(413), width: fpx(229), height: fpx(88) }} />
      <Lines lines={A.quote} className="ar-quote" x={517} baseline={429.5} size={12} lineHeight={13} font="times" />
      <p className="ar-text ar-quote" style={at({ x: 517, baseline: 490.5, size: 12, lineHeight: 13, font: 'times' })}>
        -
      </p>
      <p className="ar-text ar-quote" style={at({ x: 524, baseline: 490.5, size: 12, lineHeight: 13, font: 'times' })}>
        {A.quoteBy}
      </p>
    </div>
  );
}

// Pages 5 and 6: how it started, a photo per moment.
function PlanSpread() {
  return (
    <div className="bk-sheet-inner ar-sheet">
      <Photo name="s3-image-main" />
      <Column lines={A.opened} x={26} baseline={400} width={325} />
      <Lines lines={A.plan} className="ar-headline ar-condensed" x={26} baseline={79.397} size={50} lineHeight={50} />
      <Hint x={26} baseline={495.879} size={10}>
        {A.hint}
      </Hint>
      <Photo name="s3-image-bottom" />
      <Photo name="s3-image-main-2" />
      <Photo name="s3-image-top" />
      <Column lines={A.revamp} x={589} baseline={90} width={150} />
      <Column lines={A.vibe} x={589} baseline={398} width={150} />
    </div>
  );
}

// Pages 7 and 8: the signature drink running out of its photo, and the people behind it.
function TeamSpread() {
  return (
    <div className="bk-sheet-inner ar-sheet">
      <Photo name="s4-mont-blanc-left" />
      <p className="ar-text ar-condensed ar-shadow" style={at({ x: 133, baseline: 67.7588, size: 20 })}>
        {A.title}
      </p>
      <Hint x={26}>{A.end}</Hint>
      <Photo name="s4-image" />
      <Photo name="s4-mont-blanc-right" />
      <Column lines={A.hiatus} x={568} baseline={288} width={174} />
      <Column lines={A.today} x={568} baseline={177} width={174} />
      <Column lines={A.team} x={568} baseline={44} width={174} />
      <Column lines={A.dream} x={461} baseline={455} width={84} />
      <Column lines={A.hats} x={422} baseline={44} width={123} justifyLast />
    </div>
  );
}

export const ARUMI_LAYOUTS = {
  arumiCover: CoverSpread,
  arumiSunset: SunsetSpread,
  arumiPlan: PlanSpread,
  arumiTeam: TeamSpread,
};

const plain = (lines) => lines.join(' ').replace(/\*\*/g, '');

// The book as plain text for screen readers (the drawn pages are hidden from them).
export function ArumiIndex() {
  return (
    <article>
      <h2>Arumi Coffee</h2>
      <p>{A.date}</p>
      <h3>{plain(A.headline)}</h3>
      <blockquote>
        <p>{plain(A.quote)}</p>
        <footer>{A.quoteBy}</footer>
      </blockquote>
      <h3>{plain(A.plan)}</h3>
      {[A.opened, A.revamp, A.vibe, A.hats, A.team, A.today, A.hiatus, A.dream].map((lines) => (
        <p key={lines[0]}>{plain(lines)}</p>
      ))}
    </article>
  );
}
