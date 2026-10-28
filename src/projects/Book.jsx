// /projects: the projects as an open magazine whose pages turn as the visitor scrolls.
//
// Each spread is laid out once as a full two-page sheet (Spread below) and every page shows its half of it through
// a window, so photos and headlines can run across the gutter as in print. The book is a stack of leaves: leaf i
// carries the right page of spread i on its front and the left page of spread i + 1 on its back. At rest every page
// is live HTML; while a leaf is in the air, three.js draws it bending (PageCurl.js), falling back to a flat CSS 3D
// rotateY until its page images are ready or when WebGL is missing. The section is a tall scroll track with a sticky
// stage; GSAP ScrollTrigger maps its scroll progress to "pages turned" and snaps to whole spreads. The turn follows
// the visitor's own scroll, and the owner wants it under reduced motion too, so there is no reduced variant.
//
// On a phone or tablet held upright the book is turned a quarter, so the spread fills the tall screen and the reader
// turns the device sideways; scrolling still turns the pages. Only an inner frame rotates (the track and sticky stage
// stay upright, as pinning needs), and a button offers the pages upright and stacked instead (WCAG 1.3.4). A device on
// its side, or any landscape screen, gets the book upright. Portrait windows with a mouse keep the stacked pages.
import { createContext, use, useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { domToCanvas } from 'modern-screenshot';
import { CLOSING, ISSUE, PROJECTS, spreadsOf } from './work';
import { PHOTOS, STORY_PHOTOS } from './photos';
import PageCurl from './PageCurl';
import { ARUMI_LAYOUTS, ArumiIndex } from './ArumiBook';
import { FRAUD_LAYOUTS, FraudIndex } from './FraudBook';
import './book.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);
// Phones resize the viewport as the address bar shows and hides; re-measuring then would jolt the book mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

// The open book: which project, and its spreads in reading order (spreadsOf in work.js). Every spread and page reads
// it from here.
const BookContext = createContext(null);

const ORDER = Object.keys(PROJECTS);
// Any touch screen held upright, phone or tablet: an upright iPad (about 820 px wide) is still too narrow for the
// spread, and stacked pages there read as one page per scroll.
const TOUCH_PORTRAIT_QUERY = '(orientation: portrait) and (pointer: coarse)';
const TOUCH_QUERY = '(pointer: coarse)';
const UPRIGHT_KEY = 'zashari-home-book-upright';
const NARROW_QUERY = '(max-aspect-ratio: 1/1), (max-width: 599px)';
// Easing of the page toward the scroll position, in seconds: a short lag reads as paper, not as a hinge.
const FOLLOW_S = 0.55;

// Typefaces the pages use; their files are inlined into each page image (see bookFontCss).
const BOOK_FONTS = new Set([
  'Times New Normal',
  'Open Sans',
  'Open Sans SemiCondensed',
  'Open Sans Condensed',
  'Host Grotesk',
  'Italianno',
]);

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
  const { project } = use(BookContext);
  const p = PROJECTS[project];
  return (
    <div className="bk-sheet-inner bk-cover">
      <p className="bk-cover-title">
        {p.date ? (
          <>
            {p.title},
            <br />
            {p.date}
          </>
        ) : (
          p.title
        )}
      </p>
      <p className="bk-cover-masthead">
        {ISSUE.masthead.split(' · ')[0]} · No. {pad(ORDER.indexOf(project) + 1)}
      </p>
      <Photo className="bk-cover-strip" {...PHOTOS[project].large} />
      <p className="bk-cover-disciplines">{p.category}</p>
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
    <svg
      className="bk-plate"
      viewBox={`0 0 ${PLATE.cols * PLATE.cell} ${PLATE.rows * PLATE.height + 8}`}
      aria-hidden="true"
    >
      {cells}
    </svg>
  );
}

function FeatureSpread({ spread }) {
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
      <Folios spread={spread} />
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

// A project told on one page (photo, caption row, text, big folio), with a full-bleed photo facing it.
function StorySpread({ spread }) {
  const { project } = use(BookContext);
  const photo = STORY_PHOTOS[project];
  return (
    <div className="bk-sheet-inner bk-pair">
      <PairPage project={PROJECTS[project]} photo={PHOTOS[project].large} side="left" spread={spread} />
      <Photo className="bk-story-photo" {...photo} />
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

// The end of a book: the other books on the shelf on the left page, and the call to get in touch on the right.
function EndSpread({ spread }) {
  const { project } = use(BookContext);
  return (
    <div className="bk-sheet-inner bk-end">
      <div className="bk-end-index">
        <p className="bk-caption">{ISSUE.title}</p>
        <ol>
          {ORDER.map((key, i) => (
            <li key={key} data-current={key === project || undefined}>
              <span className="bk-end-number">{pad(i + 1)}</span>
              <span className="bk-end-title">{PROJECTS[key].title}</span>
              <span className="bk-caption">{PROJECTS[key].category}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="bk-closing-end bk-end-call">
        <p className="bk-caption">{CLOSING.kicker}</p>
        <p className="bk-closing-headline">{CLOSING.headline}</p>
        <a className="bk-closing-link" href={CLOSING.href} tabIndex={-1}>
          {CLOSING.label} →
        </a>
      </div>
      <Folios spread={spread} />
    </div>
  );
}

const LAYOUTS = {
  cover: CoverSpread,
  feature: FeatureSpread,
  story: StorySpread,
  end: EndSpread,
  ...ARUMI_LAYOUTS,
  ...FRAUD_LAYOUTS,
};

// The text of the books drawn in Figma, for screen readers.
const OWN_INDEX = { arumi: ArumiIndex, fraud: FraudIndex };

// One page: a window onto half of a spread's sheet. Every page is drawn for sighted readers only; the same text is
// given to assistive tech once, in order, by WorkIndex below.
function Page({ spread, side, className = '' }) {
  const { spreads } = use(BookContext);
  const Layout = LAYOUTS[spreads[spread].layout];
  return (
    <div className={`bk-page ${className}`} data-side={side} data-layout={spreads[spread].layout}>
      <div className="bk-sheet" data-side={side}>
        <Layout spread={spread} />
      </div>
      <span className="bk-grain" aria-hidden="true" />
      <span className="bk-gutter" aria-hidden="true" />
    </div>
  );
}

// The project as plain text for screen readers (the drawn pages repeat halves of each spread).
function WorkIndex() {
  const { project } = use(BookContext);
  const p = PROJECTS[project];
  const Own = OWN_INDEX[project];
  if (Own) {
    return (
      <div className="home-visually-hidden">
        <Own />
      </div>
    );
  }
  return (
    <div className="home-visually-hidden">
      <article>
        <h2>{p.title}</h2>
        <p>{[p.category, p.date].filter(Boolean).join(', ')}</p>
        <p>{p.body}</p>
      </article>
      <p>
        {CLOSING.headline} <a href={CLOSING.href}>{CLOSING.label}</a>
      </p>
    </div>
  );
}

function useMediaQuery(media) {
  const [matches, setMatches] = useState(() => window.matchMedia(media).matches);
  useEffect(() => {
    const query = window.matchMedia(media);
    const onChange = () => setMatches(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [media]);
  return matches;
}

function StackedBook({ onBookView, onClose }) {
  const { spreads } = use(BookContext);
  return (
    <>
      <BackButton onClose={onClose} />
      {onBookView && (
        <button type="button" className="bk-control bk-view-toggle" onClick={onBookView}>
          {ISSUE.bookView}
        </button>
      )}
      <div className="bk-stack" aria-hidden="true">
        {spreads.flatMap((s, i) =>
          ['left', 'right'].map((side) => (
            <Page key={`${s.key}-${side}`} spread={i} side={side} className="bk-page-flat" />
          ))
        )}
      </div>
    </>
  );
}

const idle = () => new Promise((resolve) => (window.requestIdleCallback ?? setTimeout)(resolve));

const readAsDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

// modern-screenshot does not pick up the page's own @font-face rules, so the page images would fall back to a system
// font. This builds the book's @font-face rules with each file inlined, once, for every image to share.
let fontCss = null;
function bookFontCss() {
  fontCss ??= (async () => {
    const rules = [];
    for (const sheet of document.styleSheets) {
      let list;
      try {
        list = sheet.cssRules;
      } catch {
        continue; // a cross-origin sheet cannot be read, and holds none of the book's fonts
      }
      for (const rule of list) {
        const family =
          rule instanceof CSSFontFaceRule && rule.style.getPropertyValue('font-family').replace(/["']/g, '');
        if (family && BOOK_FONTS.has(family)) rules.push({ rule, base: sheet.href ?? location.href });
      }
    }
    const faces = await Promise.all(
      rules.map(async ({ rule, base }) => {
        const match = /url\(\s*["']?([^"')]+)["']?\s*\)/.exec(rule.style.getPropertyValue('src'));
        if (!match) return '';
        try {
          const response = await fetch(new URL(match[1], base));
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return rule.cssText.replace(match[1], await readAsDataUrl(await response.blob()));
        } catch (error) {
          console.warn(`[work book] could not inline font ${match[1]} for the page images:`, error);
          return '';
        }
      })
    );
    return faces.join('\n');
  })();
  return fontCss;
}

// The three.js curl for the turning page (see PageCurl.js). Images of both pages of every leaf are made once the
// book comes near the screen, and again after a resize or a colour-mode switch; until a leaf's images exist, that
// leaf turns as flat CSS. Returns a ref to the PageCurl, or to null when WebGL is unavailable.
function usePageCurl({ canvasRef, bookRef, sectionRef, leaves, redraw }) {
  const curlRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const book = bookRef.current;
    let curl;
    try {
      curl = new PageCurl(canvas);
    } catch (error) {
      console.warn('[work book] WebGL unavailable, pages turn as flat CSS:', error);
      return undefined;
    }
    curlRef.current = curl;

    // Layout px inside the frame, not client rects: on a touch screen held upright the frame is turned a quarter, and
    // client rects would come back turned too. The canvas lives in the same frame, so it turns with the book.
    const measure = () => {
      const frame = canvas.parentElement;
      const style = getComputedStyle(book);
      const [x, y] = style.perspectiveOrigin.split(' ').map(parseFloat);
      curl.layout({
        stage: { width: frame.offsetWidth, height: frame.offsetHeight },
        book: { left: book.offsetLeft, top: book.offsetTop, width: book.offsetWidth, height: book.offsetHeight },
        perspective: parseFloat(style.perspective),
        origin: { x, y },
      });
      redraw();
    };

    let generation = 0;
    const rasterize = async () => {
      const run = ++generation;
      await document.fonts.ready;
      const cssText = await bookFontCss();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      for (let i = 0; i < leaves.current.length; i++) {
        // The book may have closed (back to the shelf) while the last leaf was being drawn.
        if (run !== generation || !leaves.current[i]) return;
        const pages = [...leaves.current[i].querySelectorAll(':scope > .bk-face > .bk-page')];
        try {
          const [front, back] = await Promise.all(
            pages.map((page) =>
              domToCanvas(page, {
                scale,
                // The page's layout size, given explicitly: left out, modern-screenshot measures the page with
                // getBoundingClientRect, which includes its leaf's 3D turn, so a page captured mid-turn came out
                // squeezed and cropped. offsetWidth/offsetHeight ignore transforms.
                width: page.offsetWidth,
                height: page.offsetHeight,
                font: { cssText },
                // <source> is dropped so each picture falls back to its inlined <img>; the grain is dropped because
                // its SVG noise filter renders as solid black inside the capture.
                filter: (node) => node.nodeName !== 'SOURCE' && !node.classList?.contains('bk-grain'),
              })
            )
          );
          if (run !== generation) return;
          curl.setLeaf(i, front, back);
        } catch (error) {
          console.warn(`[work book] could not draw leaf ${i} for the page curl; it turns as flat CSS:`, error);
        }
        await idle();
      }
    };

    let timer = 0;
    const later = (ms) => {
      clearTimeout(timer);
      timer = setTimeout(rasterize, ms);
    };
    measure();
    const resize = new ResizeObserver(() => {
      measure();
      later(400);
    });
    resize.observe(book);
    resize.observe(canvas.parentElement);
    // Re-draw the pages after the colour-mode fade (THEME_FADE_MS in HomeApp.jsx) so the accent matches.
    const theme = new MutationObserver(() => later(700));
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        near.disconnect();
        idle().then(rasterize);
      },
      { rootMargin: '100% 0px' }
    );
    near.observe(sectionRef.current);

    return () => {
      generation++;
      clearTimeout(timer);
      resize.disconnect();
      theme.disconnect();
      near.disconnect();
      curl.dispose();
      curlRef.current = null;
    };
  }, [canvasRef, bookRef, sectionRef, leaves, redraw]);
  return curlRef;
}

// Back to the shelf, at the top of the stacked pages and beside the turning book's controls.
function BackButton({ onClose, className = 'bk-control bk-view-toggle' }) {
  return (
    <button type="button" className={className} onClick={onClose}>
      ← {ISSUE.back}
    </button>
  );
}

function TurningBook({ rotated, onUpright, onClose, memory }) {
  const { spreads } = use(BookContext);
  const TURNS = spreads.length - 1;
  const sectionRef = useRef(null);
  const bookRef = useRef(null);
  const canvasRef = useRef(null);
  const leaves = useRef([]);
  const castRef = useRef(null);
  const triggerRef = useRef(null);
  const applyRef = useRef(() => {});
  const [current, setCurrent] = useState(0);
  const redraw = useCallback(() => applyRef.current(), []);
  const curlRef = usePageCurl({ canvasRef, bookRef, sectionRef, leaves, redraw });

  useGSAP(
    () => {
      const state = { p: 0 };
      let shown = 0;
      // Where the scroll is taking the book. The last spread it came to rest on, and whether the reader was in the
      // book then, live in memory (owned by Book) so they survive this book being remounted (see below).
      let target = 0;
      const rest = memory.current;
      // Lay the leaves out for p pages turned (fractional while a page is in the air).
      const turn = (p) => {
        const moving = Math.min(Math.floor(p), TURNS - 1);
        const f = p - moving;
        const inAir = f > 0.001 && f < 0.999;
        const curl = curlRef.current;
        const curled = Boolean(curl && inAir && curl.draw(moving, f));
        if (!curled) curl?.clear();
        leaves.current.forEach((leaf, i) => {
          if (!leaf) return;
          const t = gsap.utils.clamp(0, 1, p - i);
          leaf.style.setProperty('--turn', t.toFixed(4));
          // Unturned leaves stack first-on-top on the right, turned ones last-on-top on the left; the leaf in the
          // air goes over both. While three.js draws it bent, the HTML leaf steps aside.
          leaf.style.zIndex = t <= 0 ? TURNS - i : t >= 1 ? i + 1 : TURNS + 2;
          leaf.style.opacity = curled && i === moving ? '0' : '';
          // Which face is toward the reader (book.css hides the other, as Safari ignores backface-visibility).
          leaf.toggleAttribute('data-flipped', t >= 0.5);
        });
        const cast = castRef.current;
        if (cast) {
          cast.dataset.side = f < 0.5 ? 'right' : 'left';
          cast.style.opacity = inAir ? Math.sin(f * Math.PI).toFixed(3) : '0';
        }
      };
      const apply = () => {
        turn(state.p);
        const nearest = Math.round(state.p);
        if (Math.abs(state.p - nearest) < 0.02 && Math.abs(target - nearest) < 0.02) {
          rest.spread = nearest;
          rest.inBook = Boolean(triggerRef.current?.isActive);
        }
        if (nearest !== shown) {
          shown = nearest;
          setCurrent(nearest);
        }
      };
      applyRef.current = apply;
      const follow = gsap.quickTo(state, 'p', { duration: FOLLOW_S, ease: 'power3.out', onUpdate: apply });
      triggerRef.current = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          // While re-measuring, ScrollTrigger passes through progress 0; that is not the reader moving.
          if (ScrollTrigger.isRefreshing) return;
          target = self.progress * TURNS;
          follow(target);
        },
        // On touch, wait a little longer so momentum scrolling settles before the snap takes over.
        snap: {
          snapTo: 1 / TURNS,
          duration: { min: 0.25, max: 0.7 },
          delay: window.matchMedia(TOUCH_QUERY).matches ? 0.2 : 0.08,
          ease: 'power2.inOut',
        },
      });
      // A resize can swap the book out and back in (a square-ish size in between reads as a narrow window and
      // shows the stacked pages); come back on the spread the reader was on.
      if (rest.inBook) {
        const st = triggerRef.current;
        window.scrollTo({ top: st.start + ((st.end - st.start) * rest.spread) / TURNS, behavior: 'instant' });
        target = rest.spread;
      }
      state.p = rest.inBook ? rest.spread : triggerRef.current.progress * TURNS;
      apply();
      // A real resize (a device turned with auto-rotate, a window resized) changes the track's length; keep the
      // reader on the spread they were on instead of wherever the old scroll offset now lands. By the time
      // ScrollTrigger re-measures, the browser has already clamped or shifted the scroll on the resized page (in
      // an order that differs between engines), so the live position cannot be trusted; the last rest can, because
      // a jump only counts as rest once the page has caught up with it.
      let keep = null;
      const onRefreshInit = () => {
        keep = rest.inBook ? rest.spread : null;
      };
      const onRefresh = () => {
        const st = triggerRef.current;
        if (keep === null || !st) return;
        const top = st.start + ((st.end - st.start) * keep) / TURNS;
        keep = null;
        if (Math.abs(window.scrollY - top) > 1) window.scrollTo({ top, behavior: 'instant' });
      };
      ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
      ScrollTrigger.addEventListener('refresh', onRefresh);
      return () => {
        ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
        ScrollTrigger.removeEventListener('refresh', onRefresh);
        applyRef.current = () => {};
      };
    },
    { scope: sectionRef }
  );

  // Buttons and arrow keys scroll to a spread's place on the track, so scroll stays the one source of truth.
  const goTo = (index) => {
    const st = triggerRef.current;
    if (!st) return;
    const target = gsap.utils.clamp(0, TURNS, index);
    window.scrollTo({ top: st.start + ((st.end - st.start) * target) / TURNS, behavior: 'smooth' });
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
        <div className="bk-frame" data-rotated={rotated || undefined}>
          {rotated && <p className="bk-turn-hint">{ISSUE.turnHint}</p>}
          <div ref={bookRef} className="bk-book" aria-hidden="true">
            <Page spread={0} side="left" className="bk-base" />
            <Page spread={TURNS} side="right" className="bk-base" />
            {spreads.slice(0, -1).map((s, i) => (
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
          <canvas ref={canvasRef} className="bk-curl" aria-hidden="true" />
          <div className="bk-controls" onKeyDown={onKeyDown}>
            <BackButton onClose={onClose} className="bk-control" />
            <button type="button" className="bk-control" onClick={() => goTo(current - 1)} disabled={current === 0}>
              ← Prev
            </button>
            <p className="bk-counter" aria-live="polite">
              <span aria-hidden="true">
                {pad(current + 1)} / {pad(spreads.length)}
              </span>
              <span className="home-visually-hidden">
                Spread {current + 1} of {spreads.length}: {spreads[current].label}
              </span>
            </p>
            <button type="button" className="bk-control" onClick={() => goTo(current + 1)} disabled={current === TURNS}>
              Next →
            </button>
            {onUpright && (
              <button type="button" className="bk-control" onClick={onUpright}>
                {ISSUE.uprightView}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// One project's book (project is its key in PROJECTS); onClose goes back to the shelf. Its cloth colour (--book) is the
// accent inside it. Mount it with key={project} so a different book starts fresh.
export default function Book({ project, onClose }) {
  const [context] = useState(() => ({ project, spreads: spreadsOf(project) }));
  const touchPortrait = useMediaQuery(TOUCH_PORTRAIT_QUERY);
  const narrow = useMediaQuery(NARROW_QUERY);
  // The reader's choice of the upright pages is kept for the visit's later pages too.
  // The spread the book last rested on, kept here so it survives the book being swapped out and back in.
  const memory = useRef({ spread: 0, inBook: false });
  const [upright, setUpright] = useState(() => {
    try {
      return localStorage.getItem(UPRIGHT_KEY) === '1';
    } catch {
      return false; // storage blocked: the turned book is the default
    }
  });
  let view = 'turning';
  if (touchPortrait) view = upright ? 'stacked' : 'rotated';
  else if (narrow) view = 'stacked';
  // Switching views swaps the section's content, so bring its top back into view.
  const choose = (next) => {
    setUpright(next);
    memory.current.inBook = false; // the chosen view opens at its start
    try {
      localStorage.setItem(UPRIGHT_KEY, next ? '1' : '0');
    } catch {
      // Storage blocked (private mode, site data off): the choice lasts for this visit only.
    }
    requestAnimationFrame(() => document.getElementById('work')?.scrollIntoView({ behavior: 'instant' }));
  };
  return (
    <BookContext value={context}>
      <section
        id="work"
        className="bk-section"
        data-book={project}
        aria-label={PROJECTS[project].title}
        style={{ '--book': PROJECTS[project].color }}
      >
        {view === 'stacked' ? (
          <StackedBook onBookView={touchPortrait ? () => choose(false) : undefined} onClose={onClose} />
        ) : (
          <TurningBook
            rotated={view === 'rotated'}
            onUpright={touchPortrait ? () => choose(true) : undefined}
            onClose={onClose}
            memory={memory}
          />
        )}
        <WorkIndex />
      </section>
    </BookContext>
  );
}
