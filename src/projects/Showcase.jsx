import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FRAME, textAt } from '../about/frame';
import { HERO, SHOWCASE } from './content';
import { CLIPS, HERO_PHOTO, PHOTOS, SHOWCASE_REST } from './photos';
import { PROJECTS } from './work';
import heroCircle from './assets/lines/hero-circle.svg';
import heroRule from './assets/lines/hero-rule.svg';
import heroDash from './assets/lines/hero-dash.svg';
import showcaseCircle from './assets/lines/showcase-circle.svg';
import showcaseRule from './assets/lines/showcase-rule.svg';
import showcaseDash from './assets/lines/showcase-dash.svg';
import showcaseTriangle from './assets/lines/showcase-triangle.svg';
import './showcase.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// /projects before a book is open: two scenes from the Figma frames "projects-desktop" (the hero, "Things I've done")
// and "projects-showcase-desktop" (the strip of projects over a big preview of one), drawn in Figma px on a 1920 x 1080
// stage scaled to the window. Scrolling one screen turns the hero into the showcase, scrubbed by the scroll and settling
// on either scene: the photo in the hero's brackets grows into the preview, the brackets and asterisk grow with it,
// the words fall away, the strip comes in and the hand-drawn lines move to their showcase places. Research:
// reports/Projects hero to showcase scroll.md. Narrow or upright windows get the same content as a column instead.

const ORDER = Object.keys(PROJECTS);
const pad3 = (n) => String(n).padStart(3, '0');

// ---- Positions, from the frames' SVG export (text by its baseline) ----
const sans = (x, baseline, size) => textAt({ x, baseline, size, lineHeight: size * 1.3618, font: 'sans' });
const mono = (x, baseline, size, lineHeight) => textAt({ x, baseline, size, lineHeight });
const typewriter = (x, baseline, size) => textAt({ x, baseline, size, lineHeight: size * 1.26, font: 'typewriter' });

const HERO_WORDS = [sans(772, 387.794, 100), sans(872, 523.794, 100), sans(814, 769.794, 100)];
const HERO_NUMBERS = Array.from({ length: 7 }, (_, i) => mono(440, 62.0938 + 161 * i, 16, 25));
// The hero's brackets are Open Sans Bold at 100 ("(       )": the closing one seven spaces on); the showcase's are
// Open Sans Regular at 450. Each pair is drawn twice, and the hero pair grows into the showcase pair as one fades.
const SMALL_BRACKETS = {
  open: sans(835, 634.387, 100),
  close: sans(1054, 634.387, 100),
};
// At 450 px the Regular cut sits 19 px lower in Figma than its metrics put it (measured on an overlay of the export).
const BIG_BRACKETS = {
  open: sans(658, 790.24 + 19, 450),
  close: sans(1448, 790.24 + 19, 450),
};
const BRACKET_SCALE = 4.5;
const ASTERISK = {
  hero: typewriter(803, 599.791, 50),
  showcase: typewriter(626, 540.582, 100),
};
const PHOTO = {
  hero: { left: 887, top: 553, width: 146, height: 110 },
  showcase: { left: 810, top: 469, width: 619, height: 398 },
};
const PREVIEW_TITLE = mono(810, 910.334, 25, 25);
// "Click here for project detail", ending just left of the showcase's asterisk (the user's mockup, 2026-10-28).
const HINT = { ...mono(0, 510, 15, 15), left: undefined, right: 1920 - 615 };
const PREVIEW_ROLE_BASELINE = 909.334;
// The strip: a column every 266 px from x 498; the number, the 179 x 134 photo, then the title (15 px lines) and role.
const STRIP = {
  x: 498,
  step: 266,
  number: mono(0, 78.0938, 16, 15),
  photoTop: 88,
  title: mono(0, 246.094, 16, 15),
};
// The hand-drawn circle moves from round the hero to the showcase's right (bounding boxes of Figma's paths).
const CIRCLE = {
  hero: { cx: 959.9, cy: 540.2, size: 665.2 },
  showcase: { cx: 1619.7, cy: 540.6, size: 580.2 },
};
const TRIANGLE_CENTRE = '251px 541px';

const FLOW_MAX_WIDTH = 1100; // as /about: narrower than this the frame's 16 px text would be too small to read
const FLOW_MAX_ASPECT = 1.2;

// Fit the frame inside the window, centred across and resting on the bottom edge, where the colour mode bar is.
function useStage() {
  const [stage, setStage] = useState(null);
  useLayoutEffect(() => {
    const update = () => {
      const width = document.documentElement.clientWidth;
      const height = window.innerHeight;
      if (width < FLOW_MAX_WIDTH || width < height * FLOW_MAX_ASPECT) {
        setStage({ variant: 'flow' });
        return;
      }
      const scale = Math.min(width / FRAME.width, height / FRAME.height);
      setStage({
        variant: 'stage',
        scale,
        x: (width - FRAME.width * scale) / 2,
        y: height - FRAME.height * scale,
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return stage;
}

function Picture({ photo, alt = '', className, eager = false, ...rest }) {
  return (
    <picture className={className} {...rest}>
      <source type="image/avif" srcSet={photo.avif} />
      <img src={photo.webp} alt={alt} decoding="async" loading={eager ? 'eager' : 'lazy'} draggable={false} />
    </picture>
  );
}

// A project's clip over its photo (CLIPS): hidden and paused, it plays from the start, looping, while playing is true.
function Clip({ clip, playing, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    if (!playing) {
      video.pause();
      return;
    }
    video.currentTime = 0;
    video.play().catch((error) => {
      // Pointing away before it starts interrupts play(); that is expected, anything else is not.
      if (error.name !== 'AbortError') console.error('[projects] the clip could not play:', error);
    });
  }, [playing]);
  return (
    <video
      ref={ref}
      className={className}
      src={clip.src}
      poster={clip.poster}
      data-playing={playing || undefined}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
}

// A hand-drawn line, Figma's own path on the whole frame. A straight line that meets the frame's edge in Figma runs on
// past it (bleed: the axis it runs along and where it crosses), so a window wider or taller than the frame keeps it
// unbroken, as /about's dashed line does. The line and its bleed move and reveal as one.
const BLEED = 2000;
function Line({ src, className, bleed }) {
  return (
    <span className={`pj-line ${className}`}>
      <img src={src} alt="" width={FRAME.width} height={FRAME.height} draggable={false} />
      {bleed?.axis === 'x' && (
        <>
          <span
            className="pj-bleed"
            data-dashed={bleed.dashed || undefined}
            style={{ left: -BLEED, top: bleed.at - 1, width: BLEED, height: 2 }}
          />
          <span
            className="pj-bleed"
            data-dashed={bleed.dashed || undefined}
            style={{
              left: FRAME.width,
              top: bleed.at - 1,
              width: BLEED,
              height: 2,
            }}
          />
        </>
      )}
      {bleed?.axis === 'y' && (
        <span
          className="pj-bleed"
          data-dashed={bleed.dashed || undefined}
          style={{ left: bleed.at - 1, top: -BLEED, width: 2, height: BLEED }}
        />
      )}
    </span>
  );
}

// The strip of projects: a tab list. Pointing at a project shows it in the preview; choosing one (click, Enter, or the
// arrow keys) keeps it there once the pointer leaves. Until one is chosen the preview keeps the hero's photo, and Tab
// lands on the first project.
function Strip({ selected, peek, onSelect, onPeek, onFocusStrip }) {
  const listRef = useRef(null);
  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    let index = ORDER.indexOf(selected);
    if (step) index = (index + step + ORDER.length) % ORDER.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = ORDER.length - 1;
    else return;
    event.preventDefault();
    onSelect(ORDER[index]);
    listRef.current.querySelectorAll('[role="tab"]')[index].focus();
  };
  return (
    <div
      className="pj-strip"
      role="tablist"
      aria-label={SHOWCASE.stripLabel}
      ref={listRef}
      onKeyDown={onKeyDown}
      onPointerLeave={() => onPeek(null)}
    >
      {ORDER.map((key, i) => {
        const p = PROJECTS[key];
        return (
          <button
            key={key}
            type="button"
            role="tab"
            id={`pj-tab-${key}`}
            aria-selected={key === selected}
            aria-controls="pj-preview"
            tabIndex={key === (selected ?? ORDER[0]) ? 0 : -1}
            className="pj-strip-item"
            data-project={key}
            style={{ left: STRIP.x + STRIP.step * i }}
            onClick={() => onSelect(key)}
            onPointerEnter={() => onPeek(key)}
            onFocus={onFocusStrip}
          >
            <span className="pj-strip-number" style={STRIP.number}>
              {pad3(i + 1)}
            </span>
            <Picture className="pj-strip-photo" photo={PHOTOS[key].thumb} eager />
            {CLIPS[key] && <Clip className="pj-strip-clip" clip={CLIPS[key]} playing={peek === key} />}
            <span className="pj-strip-text" style={{ top: STRIP.title.top }}>
              <span className="pj-strip-title">{p.title}</span>
              <span className="pj-strip-role">({p.role})</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// The two scenes on the scaled stage, and the scroll that turns one into the other.
function Stage({ stage, selected, onSelect, onOpen }) {
  const trackRef = useRef(null);
  const triggerRef = useRef(null);
  const [scene, setScene] = useState('hero');
  const [peek, setPeek] = useState(null);
  const sceneRef = useRef('hero');
  // The latest onSelect, for the scroll callback set up once below.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  // The project in the preview: pointed at or chosen, but only on the showcase; scrolling back up to the hero brings its
  // photo back (and lets go of the choice; see onUpdate below).
  const shown = scene === 'showcase' ? (peek ?? selected) : null;
  const project = PROJECTS[shown];

  useGSAP(
    () => {
      const q = gsap.utils.selector(trackRef);
      const smallOpen = SMALL_BRACKETS.open;
      const smallClose = SMALL_BRACKETS.close;
      const bigOpen = BIG_BRACKETS.open;
      const bigClose = BIG_BRACKETS.close;
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
      tl
        // The words and the column of numbers fall away.
        .to(q('.pj-word')[0], { y: -90, opacity: 0, duration: 0.45 }, 0)
        .to(q('.pj-word')[1], { y: -60, opacity: 0, duration: 0.45 }, 0.03)
        .to(q('.pj-word')[2], { y: 90, opacity: 0, duration: 0.45 }, 0)
        .to(q('.pj-numbers'), { x: -40, opacity: 0, duration: 0.35 }, 0)
        // The photo grows into the preview, then gives way to the showcase's moving image, which stays until a
        // project is pointed at or chosen.
        .fromTo(q('.pj-preview'), { ...PHOTO.hero }, { ...PHOTO.showcase, duration: 0.8 }, 0.1)
        .fromTo(q('.pj-preview-rest'), { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none' }, 0.72)
        // The brackets and the asterisk grow with it, from the hero's to the showcase's; the hero's bold brackets hand
        // over to the showcase's regular ones early and quickly, so the two are never seen overlapping for long.
        .fromTo(
          q('.pj-bracket-big[data-side="open"]'),
          {
            x: smallOpen.left - bigOpen.left,
            y: smallOpen.top - bigOpen.top,
            scale: 1 / BRACKET_SCALE,
          },
          { x: 0, y: 0, scale: 1, duration: 0.8 },
          0.1
        )
        .fromTo(
          q('.pj-bracket-big[data-side="close"]'),
          {
            x: smallClose.left - bigClose.left,
            y: smallClose.top - bigClose.top,
            scale: 1 / BRACKET_SCALE,
          },
          { x: 0, y: 0, scale: 1, duration: 0.8 },
          0.1
        )
        .to(
          q('.pj-bracket-small[data-side="open"]'),
          {
            x: bigOpen.left - smallOpen.left,
            y: bigOpen.top - smallOpen.top,
            scale: BRACKET_SCALE,
            duration: 0.8,
          },
          0.1
        )
        .to(
          q('.pj-bracket-small[data-side="close"]'),
          {
            x: bigClose.left - smallClose.left,
            y: bigClose.top - smallClose.top,
            scale: BRACKET_SCALE,
            duration: 0.8,
          },
          0.1
        )
        .fromTo(q('.pj-bracket-small'), { opacity: 1 }, { opacity: 0, duration: 0.12, ease: 'none' }, 0.16)
        .fromTo(q('.pj-bracket-big'), { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'none' }, 0.16)
        .fromTo(
          q('.pj-asterisk'),
          {
            x: ASTERISK.hero.left - ASTERISK.showcase.left,
            y: ASTERISK.hero.top - ASTERISK.showcase.top,
            scale: ASTERISK.hero.fontSize / ASTERISK.showcase.fontSize,
          },
          { x: 0, y: 0, scale: 1, duration: 0.8 },
          0.1
        )
        // The showcase's text and strip come in.
        .fromTo(q('.pj-preview-text'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3 }, 0.7)
        .fromTo(q('.pj-strip-item'), { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.05 }, 0.55)
        // The lines: the circle moves right and becomes the showcase's; the hero's straight lines give way to the
        // showcase's, which draw in; the rounded triangle appears on the left.
        .to(
          q('.pj-line-hero-circle'),
          {
            x: CIRCLE.showcase.cx - CIRCLE.hero.cx,
            y: CIRCLE.showcase.cy - CIRCLE.hero.cy,
            scale: CIRCLE.showcase.size / CIRCLE.hero.size,
            duration: 0.8,
          },
          0.1
        )
        .to(q('.pj-line-hero-circle'), { opacity: 0, duration: 0.15, ease: 'none' }, 0.85)
        .fromTo(q('.pj-line-showcase-circle'), { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none' }, 0.85)
        .to(q('.pj-line-hero-dash, .pj-line-hero-rule'), { opacity: 0, duration: 0.35 }, 0)
        .fromTo(
          q('.pj-line-showcase-dash'),
          // Left to right across the window, bleed included.
          { clipPath: `inset(0px ${FRAME.width + BLEED}px 0px ${-BLEED}px)` },
          {
            clipPath: `inset(0px ${-BLEED}px 0px ${-BLEED}px)`,
            duration: 0.5,
            ease: 'power1.inOut',
          },
          0.4
        )
        .fromTo(
          q('.pj-line-showcase-rule'),
          // Top to bottom, bleed included.
          { clipPath: `inset(${-BLEED}px 0px ${FRAME.height + BLEED}px 0px)` },
          {
            clipPath: `inset(${-BLEED}px 0px ${-BLEED}px 0px)`,
            duration: 0.5,
            ease: 'power1.inOut',
          },
          0.4
        )
        .fromTo(
          q('.pj-line-showcase-triangle'),
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.45 },
          0.45
        );
      triggerRef.current = ScrollTrigger.create({
        trigger: trackRef.current,
        start: 'top top',
        end: 'bottom bottom',
        animation: tl,
        scrub: 0.6,
        // Settle on a scene, in the direction the visitor was scrolling.
        snap: {
          snapTo: [0, 1],
          directional: true,
          duration: { min: 0.3, max: 0.8 },
          delay: 0.05,
          ease: 'power2.inOut',
        },
        onUpdate: (self) => {
          const next = self.progress > 0.9 ? 'showcase' : 'hero';
          // Leaving the showcase for the hero lets go of the chosen project, so coming back shows the resting image.
          if (next === 'hero' && sceneRef.current === 'showcase') {
            setPeek(null);
            onSelectRef.current(null);
          }
          sceneRef.current = next;
          setScene(next);
        },
      });
      sceneRef.current = triggerRef.current.progress > 0.9 ? 'showcase' : 'hero';
      setScene(sceneRef.current);
    },
    { scope: trackRef }
  );

  // Reaching the strip with the keyboard while the hero is up brings the showcase in.
  const toShowcase = () => {
    const st = triggerRef.current;
    if (st && st.progress < 0.9) window.scrollTo({ top: st.end, behavior: 'smooth' });
  };
  const open = (event) => {
    if (!project) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpen(shown);
  };

  return (
    <div className="pj-track" ref={trackRef} data-scene={scene}>
      <div className="pj-sticky">
        <div
          className="pj-stage"
          style={{
            width: FRAME.width,
            height: FRAME.height,
            transform: `translate(${stage.x}px, ${stage.y}px) scale(${stage.scale})`,
          }}
        >
          <Line src={heroCircle} className="pj-line-hero-circle" />
          <Line src={heroRule} className="pj-line-hero-rule" bleed={{ axis: 'x', at: 721 }} />
          <Line src={heroDash} className="pj-line-hero-dash" bleed={{ axis: 'y', at: 1293, dashed: true }} />
          <Line src={showcaseCircle} className="pj-line-showcase-circle" />
          <Line src={showcaseRule} className="pj-line-showcase-rule" bleed={{ axis: 'y', at: 321 }} />
          <Line src={showcaseDash} className="pj-line-showcase-dash" bleed={{ axis: 'x', at: 539, dashed: true }} />
          <Line src={showcaseTriangle} className="pj-line-showcase-triangle" />

          <div className="pj-numbers" aria-hidden="true">
            {HERO_NUMBERS.map((box, i) => (
              <span key={i} style={box}>
                {String(i + 1).padStart(2, '0')}
              </span>
            ))}
          </div>

          <h2 className="pj-hero" aria-label={HERO.label}>
            {HERO.lines.map((word, i) => (
              <span key={word} className="pj-word" style={HERO_WORDS[i]} aria-hidden="true">
                {word}
              </span>
            ))}
          </h2>
          <span className="pj-bracket-small" data-side="open" style={SMALL_BRACKETS.open} aria-hidden="true">
            (
          </span>
          <span className="pj-bracket-small" data-side="close" style={SMALL_BRACKETS.close} aria-hidden="true">
            )
          </span>
          <span className="pj-bracket-big" data-side="open" style={BIG_BRACKETS.open} aria-hidden="true">
            (
          </span>
          <span className="pj-bracket-big" data-side="close" style={BIG_BRACKETS.close} aria-hidden="true">
            )
          </span>
          <span className="pj-asterisk" style={ASTERISK.showcase} aria-hidden="true">
            *
          </span>
          <span className="pj-hint" style={HINT} data-shown={Boolean(project) || undefined} aria-hidden="true">
            {SHOWCASE.hint}
          </span>

          {/* The strip comes before the preview it controls, so Tab reaches it first. */}
          <Strip selected={selected} peek={peek} onSelect={onSelect} onPeek={setPeek} onFocusStrip={toShowcase} />

          {/* The preview shows the project pointed at or chosen, in the same photo as its thumbnail, and opens its
              book; with none, it keeps the hero's photo and leads nowhere yet. */}
          <a
            className="pj-preview"
            id="pj-preview"
            role="tabpanel"
            aria-labelledby={project ? `pj-tab-${shown}` : undefined}
            href={project ? `?p=${project.slug}` : undefined}
            aria-label={project ? SHOWCASE.open(project.title) : undefined}
            tabIndex={project && scene === 'showcase' ? 0 : -1}
            onClick={open}
            style={PHOTO.hero}
          >
            <Picture className="pj-preview-image" photo={HERO_PHOTO.large} eager data-shown={!project || undefined} />
            <img
              className="pj-preview-rest"
              src={SHOWCASE_REST}
              alt=""
              width="800"
              height="600"
              decoding="async"
              fetchPriority="low"
              draggable={false}
            />
            {ORDER.map((key) => (
              <Fragment key={key}>
                <Picture
                  className="pj-preview-image"
                  photo={PHOTOS[key].large}
                  eager
                  data-shown={key === shown || undefined}
                />
                {CLIPS[key] && <Clip className="pj-preview-clip" clip={CLIPS[key]} playing={key === shown} />}
              </Fragment>
            ))}
          </a>
          <div className="pj-preview-text" aria-hidden="true">
            {project && (
              <>
                <span key={`t-${shown}`} className="pj-preview-title" style={PREVIEW_TITLE}>
                  {project.title}
                </span>
                <span
                  key={`r-${shown}`}
                  className="pj-preview-role"
                  style={{
                    ...mono(0, PREVIEW_ROLE_BASELINE, 25, 25),
                    left: undefined,
                    right: FRAME.width - 1429,
                  }}
                >
                  ({project.role})
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Narrow or upright windows: the hero, then the projects as a list of cards that open their books.
function Flow({ onOpen }) {
  const open = (event, key) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpen(key);
  };
  return (
    <div className="pj-flow">
      <h2 className="pj-flow-hero" aria-label={HERO.label}>
        <span aria-hidden="true">{HERO.lines[0]}</span>
        <span aria-hidden="true">{HERO.lines[1]}</span>
        <span className="pj-flow-photo-line" aria-hidden="true">
          <span className="pj-flow-asterisk">*</span>(
          <Picture className="pj-flow-photo" photo={HERO_PHOTO.thumb} eager />)
        </span>
        <span aria-hidden="true">{HERO.lines[2]}</span>
      </h2>
      <ol className="pj-flow-list" aria-label={SHOWCASE.stripLabel}>
        {ORDER.map((key, i) => {
          const p = PROJECTS[key];
          return (
            <li key={key}>
              <a
                className="pj-flow-card"
                href={`?p=${p.slug}`}
                data-project={key}
                aria-label={SHOWCASE.open(p.title)}
                onClick={(event) => open(event, key)}
              >
                <span className="pj-strip-number">{pad3(i + 1)}</span>
                <Picture className="pj-flow-card-photo" photo={PHOTOS[key].large} />
                <span className="pj-strip-title">{p.title}</span>
                <span className="pj-strip-role">({p.role})</span>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// selected is the project the preview rests on (kept by ProjectsApp, so it survives a book being opened and closed);
// onOpen(key) opens a project's book.
export default function Showcase({ selected, onSelect, onOpen }) {
  const stage = useStage();
  if (!stage) return null;
  return (
    <section className="pj" data-variant={stage.variant}>
      {stage.variant === 'stage' ? (
        <Stage stage={stage} selected={selected} onSelect={onSelect} onOpen={onOpen} />
      ) : (
        <Flow onOpen={onOpen} />
      )}
    </section>
  );
}
