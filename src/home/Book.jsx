// Page 2 of /home: the projects as an open magazine whose pages turn as the visitor scrolls.
//
// Each spread is laid out once as a full two-page sheet (Spread below) and every page shows its half of it through
// a window, so photos and headlines can run across the gutter as in print. The book is a stack of leaves: leaf i
// carries the right page of spread i on its front and the left page of spread i + 1 on its back, and turns over the
// spine with a CSS 3D rotateY. The section is a tall scroll track with a sticky stage; GSAP ScrollTrigger maps its
// scroll progress to "pages turned" and snaps to whole spreads. Narrow or portrait screens get the pages stacked in
// normal scroll instead, with no pinning.
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { CLOSING, ISSUE, PROJECTS, SPREADS } from './work';
import coverAvif from './assets/images/reel/06.avif';
import coverWebp from './assets/images/reel/06.webp';
import deskAvif from '../temp/assets/images/photo-professional-desk.avif';
import deskWebp from '../temp/assets/images/photo-professional-desk.webp';
import workAvif from '../temp/assets/images/photo-professional-1.avif';
import workWebp from '../temp/assets/images/photo-professional-1.webp';
import commuteAvif from '../temp/assets/images/photo-personal-1.avif';
import commuteWebp from '../temp/assets/images/photo-personal-1.webp';
import './book.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TURNS = SPREADS.length - 1;
const STACKED_QUERY = '(max-width: 899px), (max-aspect-ratio: 1/1)';
// Easing of the page toward the scroll position, in seconds: a short lag reads as paper, not as a hinge.
const FOLLOW_S = 0.55;

const pad = (n) => String(n).padStart(2, '0');
// Folios as in a magazine: the cover has none, then spread s holds pages 2s + 2 and 2s + 3.
const folio = (spread, side) => pad(spread * 2 + 2 + (side === 'right' ? 1 : 0));

function Photo({ avif, webp, alt = '', className }) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={avif} />
      <img src={webp} alt={alt} loading="lazy" decoding="async" draggable={false} />
    </picture>
  );
}

// ---- Spread layouts. Sizes are in cqw of the whole spread (100cqw = both pages), so they scale like print. ----

function CoverSpread() {
  return (
    <div className="bk-sheet-inner bk-cover">
      <p className="bk-cover-title">
        {ISSUE.title},
        <br />
        {ISSUE.years}
      </p>
      <p className="bk-cover-masthead">{ISSUE.masthead}</p>
      <Photo className="bk-cover-strip" avif={coverAvif} webp={coverWebp} />
      <p className="bk-cover-disciplines">{ISSUE.disciplines.join('   ·   ')}</p>
      <p className="bk-cover-hint">{ISSUE.hint} →</p>
    </div>
  );
}

// Sixteen axial brain slices, one per model variant, drawn from a wobbly polar outline; the winner is filled.
function slicePath(cx, cy, rx, ry, wobble, seed, steps = 72) {
  let d = '';
  for (let k = 0; k <= steps; k++) {
    const a = (k / steps) * Math.PI * 2;
    const r = 1 + wobble * (Math.sin(a * 7 + seed) * 0.6 + Math.sin(a * 13 + seed * 1.7) * 0.4);
    const x = cx + Math.cos(a) * rx * r;
    const y = cy + Math.sin(a) * ry * r;
    d += `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d}Z`;
}

const PLATE = { cols: 8, rows: 2, cell: 200, height: 170 };
const WINNER = 10;
// Where the winner's label sits under its slice, in cqw of the spread (the plate spans the spread's full width).
const WINNER_X = (((WINNER % PLATE.cols) + 0.5) / PLATE.cols) * 100;

function BrainPlate() {
  const cells = [];
  for (let i = 0; i < PLATE.cols * PLATE.rows; i++) {
    const cx = (i % PLATE.cols) * PLATE.cell + PLATE.cell / 2;
    const cy = Math.floor(i / PLATE.cols) * PLATE.height + PLATE.height / 2 + 4;
    const depth = 0.82 + 0.18 * Math.sin((i / 15) * Math.PI);
    const rx = 52 * depth;
    const ry = 64 * depth;
    const win = i === WINNER;
    cells.push(
      <g key={i} className={win ? 'bk-plate-win' : undefined}>
        <path className="bk-plate-outer" d={slicePath(cx, cy, rx, ry, 0.025, i)} />
        <path className="bk-plate-line" d={slicePath(cx, cy, rx * 0.78, ry * 0.8, 0.07, i * 2.3)} />
        <path className="bk-plate-line" d={slicePath(cx, cy, rx * 0.55, ry * 0.6, 0.1, i * 3.1)} />
        <path className="bk-plate-line" d={slicePath(cx, cy, rx * 0.32, ry * 0.38, 0.14, i * 4.7)} />
        <path className="bk-plate-line" d={`M${cx} ${cy - ry * 0.98}L${cx} ${cy - ry * 0.42}`} />
        <text className="bk-plate-index" x={cx - PLATE.cell / 2 + 14} y={cy - PLATE.height / 2 + 18}>
          {pad(i + 1)}
        </text>
      </g>
    );
  }
  return (
    <svg className="bk-plate" viewBox={`0 0 ${PLATE.cols * PLATE.cell} ${PLATE.rows * PLATE.height + 8}`} aria-hidden="true">
      {cells}
    </svg>
  );
}

function FeatureSpread() {
  const p = PROJECTS.alzheimer;
  return (
    <div className="bk-sheet-inner bk-feature">
      <div className="bk-feature-stat">
        <p className="bk-stat">{p.stat}</p>
        <p className="bk-caption">{p.statNote}</p>
      </div>
      <p className="bk-feature-body bk-body">{p.body}</p>
      <h3 className="bk-feature-headline">
        {p.headline.map((word) => (
          <span key={word}>{word}</span>
        ))}
      </h3>
      <p className="bk-feature-credits bk-caption">
        {p.category}
        <br />
        {p.date}
      </p>
      <div className="bk-feature-band">
        <BrainPlate />
        <p className="bk-feature-winner bk-caption" style={{ left: `${WINNER_X}cqw` }}>
          {p.winner}
        </p>
        <p className="bk-feature-note bk-caption">{p.plateNote}</p>
      </div>
      <Folios spread={1} />
    </div>
  );
}

function PairPage({ project, photo, side, spread }) {
  return (
    <div className="bk-pair-page" data-side={side}>
      <Photo className="bk-pair-photo" {...photo} />
      <ul className="bk-pair-row">
        <li>{project.category}</li>
        <li>“{project.title}”</li>
        <li>{project.stack}</li>
        <li>{project.date}</li>
      </ul>
      <div className="bk-pair-text">
        <p className="bk-pair-title">{project.title}</p>
        <p className="bk-body">{project.body}</p>
      </div>
      <footer className="bk-pair-foot">
        <span className="bk-folio-big">{folio(spread, side)}</span>
        <span className="bk-pair-meta">
          {ISSUE.masthead.split(' · ')[0]}
          <br />
          {ISSUE.title}
        </span>
        <span className="bk-pair-meta">{project.category}</span>
      </footer>
    </div>
  );
}

function PairSpread() {
  return (
    <div className="bk-sheet-inner bk-pair">
      <PairPage project={PROJECTS.viewer} photo={{ avif: deskAvif, webp: deskWebp }} side="left" spread={2} />
      <PairPage project={PROJECTS.pipeline} photo={{ avif: workAvif, webp: workWebp }} side="right" spread={2} />
    </div>
  );
}

function DossierSpread() {
  const p = PROJECTS.fraud;
  return (
    <div className="bk-sheet-inner bk-dossier">
      <div className="bk-dossier-dark">
        <div className="bk-dossier-doc" aria-hidden="true">
          {[92, 70, 84, 40, 88, 76, 60, 90, 52].map((w, i) => (
            <span key={i} className="bk-dossier-bar" style={{ width: `${w}%` }} />
          ))}
          <span className="bk-dossier-stamp">{p.stamp}</span>
        </div>
      </div>
      <div className="bk-dossier-page">
        <h3 className="bk-dossier-headline">
          {p.headline.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </h3>
        <p className="bk-dossier-credits bk-caption">
          {p.category} · {p.date}
        </p>
        <div className="bk-dossier-columns">
          <p className="bk-body bk-dropcap">{p.body}</p>
          <blockquote className="bk-quote">{p.quote}</blockquote>
          <ul className="bk-dossier-stack bk-caption">
            {p.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="bk-dossier-stat">
          <p className="bk-stat">{p.stat}</p>
          <p className="bk-caption">{p.statNote}</p>
        </div>
      </div>
      <Folios spread={3} />
    </div>
  );
}

function ClosingSpread() {
  const p = PROJECTS.uplink;
  return (
    <div className="bk-sheet-inner bk-closing">
      <div className="bk-closing-photo">
        <Photo avif={commuteAvif} webp={commuteWebp} />
        <span className="bk-closing-stamp">{p.stamp}</span>
      </div>
      <div className="bk-closing-page">
        <p className="bk-caption">
          {p.category} · {p.date} · {p.stack}
        </p>
        <p className="bk-closing-title">{p.title}</p>
        <p className="bk-body">{p.body}</p>
      </div>
      <div className="bk-closing-end">
        <p className="bk-caption">{CLOSING.kicker}</p>
        <p className="bk-closing-headline">{CLOSING.headline}</p>
        <a className="bk-closing-link" href={CLOSING.href} tabIndex={-1}>
          {CLOSING.label} →
        </a>
      </div>
      <Folios spread={4} />
    </div>
  );
}

function Folios({ spread }) {
  return (
    <>
      <span className="bk-folio" data-side="left">
        {folio(spread, 'left')}
      </span>
      <span className="bk-folio" data-side="right">
        {folio(spread, 'right')}
      </span>
    </>
  );
}

const LAYOUTS = { cover: CoverSpread, feature: FeatureSpread, pair: PairSpread, dossier: DossierSpread, closing: ClosingSpread };

// One page: a window onto half of a spread's sheet. Every page is drawn for sighted readers only; the same text is
// given to assistive tech once, in order, by WorkIndex below.
function Page({ spread, side, className = '' }) {
  const Layout = LAYOUTS[SPREADS[spread].layout];
  return (
    <div className={`bk-page ${className}`} data-side={side} data-layout={SPREADS[spread].layout}>
      <div className="bk-sheet" data-side={side}>
        <Layout />
      </div>
      <span className="bk-gutter" aria-hidden="true" />
    </div>
  );
}

// The projects as plain, ordered text for screen readers (the drawn pages repeat halves of each spread).
function WorkIndex() {
  return (
    <div className="home-visually-hidden">
      {Object.values(PROJECTS).map((p) => (
        <article key={p.title}>
          <h3>{p.title}</h3>
          <p>
            {p.category}, {p.date}
          </p>
          <p>{p.body}</p>
        </article>
      ))}
      <p>
        {CLOSING.headline} <a href={CLOSING.href}>{CLOSING.label}</a>
      </p>
    </div>
  );
}

function useStacked() {
  const [stacked, setStacked] = useState(() => window.matchMedia(STACKED_QUERY).matches);
  useEffect(() => {
    const query = window.matchMedia(STACKED_QUERY);
    const onChange = () => setStacked(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return stacked;
}

function StackedBook() {
  return (
    <div className="bk-stack" aria-hidden="true">
      {SPREADS.flatMap((s, i) =>
        ['left', 'right'].map((side) => <Page key={`${s.key}-${side}`} spread={i} side={side} className="bk-page-flat" />)
      )}
    </div>
  );
}

function TurningBook() {
  const sectionRef = useRef(null);
  const leaves = useRef([]);
  const castRef = useRef(null);
  const triggerRef = useRef(null);
  const [current, setCurrent] = useState(0);

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const state = { p: 0 };
      let shown = 0;
      // Lay the leaves out for p pages turned (fractional while a page is in the air).
      const apply = () => {
        const { p } = state;
        leaves.current.forEach((leaf, i) => {
          if (!leaf) return;
          const t = gsap.utils.clamp(0, 1, p - i);
          leaf.style.setProperty('--turn', t.toFixed(4));
          // Unturned leaves stack first-on-top on the right, turned ones last-on-top on the left; the leaf in the
          // air goes over both.
          leaf.style.zIndex = t <= 0 ? TURNS - i : t >= 1 ? i + 1 : TURNS + 2;
        });
        const moving = Math.min(Math.floor(p), TURNS - 1);
        const f = p - moving;
        const cast = castRef.current;
        if (cast) {
          const air = f > 0.001 && f < 0.999 ? Math.sin(f * Math.PI) : 0;
          cast.dataset.side = f < 0.5 ? 'right' : 'left';
          cast.style.opacity = air.toFixed(3);
        }
        const nearest = Math.round(p);
        if (nearest !== shown) {
          shown = nearest;
          setCurrent(nearest);
        }
      };
      const follow = gsap.quickTo(state, 'p', { duration: reduce ? 0.2 : FOLLOW_S, ease: 'power3.out', onUpdate: apply });
      apply();
      triggerRef.current = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => follow(self.progress * TURNS),
        snap: { snapTo: 1 / TURNS, duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: 'power2.inOut' },
      });
      // The landing above sets its own height after layout (and again on short windows), which moves the track
      // without a window resize; re-measure the trigger whenever it changes.
      const above = sectionRef.current.closest('.bk-section')?.previousElementSibling;
      if (!above) return undefined;
      const observer = new ResizeObserver(() => ScrollTrigger.refresh());
      observer.observe(above);
      return () => observer.disconnect();
    },
    { scope: sectionRef }
  );

  // Buttons and arrow keys scroll to a spread's place on the track, so scroll stays the one source of truth.
  const goTo = (index) => {
    const st = triggerRef.current;
    if (!st) return;
    const target = gsap.utils.clamp(0, TURNS, index);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: st.start + ((st.end - st.start) * target) / TURNS, behavior: reduce ? 'auto' : 'smooth' });
  };
  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight' || event.key === 'PageDown') goTo(current + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'PageUp') goTo(current - 1);
    else return;
    event.preventDefault();
  };

  return (
    <div ref={sectionRef} className="bk-track" style={{ '--turns': TURNS }}>
      <div className="bk-stage">
        <div className="bk-book" aria-hidden="true">
          <Page spread={0} side="left" className="bk-base" />
          <Page spread={TURNS} side="right" className="bk-base" />
          {SPREADS.slice(0, -1).map((s, i) => (
            <div
              key={s.key}
              className="bk-leaf"
              ref={(el) => {
                leaves.current[i] = el;
              }}
            >
              <div className="bk-face" data-face="front">
                <Page spread={i} side="right" />
                <span className="bk-face-shade" aria-hidden="true" />
              </div>
              <div className="bk-face" data-face="back">
                <Page spread={i + 1} side="left" />
                <span className="bk-face-shade" aria-hidden="true" />
              </div>
            </div>
          ))}
          <span ref={castRef} className="bk-cast" aria-hidden="true" />
        </div>
        <div className="bk-controls" onKeyDown={onKeyDown}>
          <button type="button" className="bk-control" onClick={() => goTo(current - 1)} disabled={current === 0}>
            ← Prev
          </button>
          <p className="bk-counter" aria-live="polite">
            <span aria-hidden="true">
              {pad(current + 1)} / {pad(SPREADS.length)}
            </span>
            <span className="home-visually-hidden">
              Spread {current + 1} of {SPREADS.length}: {SPREADS[current].label}
            </span>
          </p>
          <button type="button" className="bk-control" onClick={() => goTo(current + 1)} disabled={current === TURNS}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Book() {
  const stacked = useStacked();
  return (
    <section id="work" className="bk-section" aria-label={ISSUE.sectionLabel}>
      {stacked ? <StackedBook /> : <TurningBook />}
      <WorkIndex />
    </section>
  );
}
