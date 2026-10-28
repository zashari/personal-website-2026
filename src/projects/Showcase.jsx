import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FRAME, textAt } from '../about/frame';
import { SOCIALS } from '../home/content';
import { GITHUB, HERO, SHOWCASE } from './content';
import { CLIPS, HERO_PHOTO, PHOTOS, SHOWCASE_REST } from './photos';
import { PROJECTS } from './work';
import heroCircle from './assets/lines/hero-circle.svg';
import heroRule from './assets/lines/hero-rule.svg';
import heroDash from './assets/lines/hero-dash.svg';
import showcaseCircle from './assets/lines/showcase-circle.svg';
import showcaseRule from './assets/lines/showcase-rule.svg';
import showcaseDash from './assets/lines/showcase-dash.svg';
import showcaseTriangle from './assets/lines/showcase-triangle.svg';
import githubArrow from './assets/lines/github-arrow.svg';
import './showcase.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// /projects before a book is open: three scenes from the Figma frames "projects-desktop" (the hero, "Things I've done"),
// "projects-showcase-desktop" (the strip of projects over a big preview of one) and "projects-github-desktop" ("Please
// visit my Github profile"), drawn in Figma px on a 1920 x 1080 stage scaled to the window. Each screen of scroll turns
// one scene into the next, scrubbed by the scroll and settling on a scene. Hero to showcase: the photo in the hero's
// brackets grows into the preview, the brackets and asterisk grow with it, the words fall away, the strip comes in and
// the hand-drawn lines move to their showcase places. Showcase to Github: the strip leaves, the brackets close on the
// preview, the dashed line erases and the circle rolls away, while the triangle turns upright, the asterisk rises to
// the headline and a second one spins in. Research: reports/Projects hero to showcase scroll.md. Narrow or upright
// windows get the same content as a column instead.

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
  github: typewriter(618, 315.373, 150),
  second: typewriter(1618, 912.373, 150), // the Github scene's other asterisk, bottom right
};
// In the Github scene the asterisks spin in place, a turn every SPIN_S seconds; leaving it, each settles on the nearest
// fifth of a turn, where its five arms look as they did.
const SPIN_S = 6;
const ARMS = 5;
const PHOTO = {
  hero: { left: 887, top: 553, width: 146, height: 110 },
  showcase: { left: 810, top: 469, width: 619, height: 398 },
};
const PREVIEW_TITLE = mono(810, 910.334, 25, 25);
// "Click here for project detail", ending just left of the showcase's asterisk (the user's mockup, 2026-10-28).
const HINT = { ...mono(0, 510, 15, 15), left: undefined, right: 1920 - 615 };
// How long a project pointed at stays in the preview once the pointer leaves the strip, so it can reach the preview,
// the asterisk or the hint, which all open the project's book.
const LINGER_MS = 700;
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
// The Github scene's triangle is the showcase's turned a quarter anticlockwise round its centre (251, 541) and moved
// (Figma's two paths match point for point that way).
const TRIANGLE_UPRIGHT = { rotation: -90, x: 69.95, y: 68.05 };
// The Github scene's words: Times New Normal at 100 on 110 px lines, with "Github" and "!!" set apart; the socials at
// 20, as on /home. Placed on the SVG's own baselines: at these sizes they match Figma's render (an overlay shows no
// offset), unlike the books' small Times (FigmaBook.jsx).
const times = (x, baseline, size, lineHeight) => textAt({ x, baseline, size, lineHeight, font: 'times' });
const GITHUB_LINES = [times(618, 485, 100, 110), times(618, 595, 100, 110), times(618, 705, 100, 110)];
const GITHUB_LINK = times(1461.7, 485, 100, 110);
const GITHUB_BANG = times(949.902, 705, 100, 110);
const SOCIAL_X = { tiktok: 742, github: 920, instagram: 1096 };
const SOCIAL_BASELINE = 1037;

// The scroll runs hero (0), showcase (0.5) and Github (1); a scene counts as reached a tenth of the way to it.
const SCENE_AT = [0, 0.5, 1];
const sceneAt = (progress) => (progress < 0.45 ? 'hero' : progress <= 0.55 ? 'showcase' : 'github');
// How far the scroll must carry from a scene, as a share of the way to the next, before letting go settles on that
// next one; a shorter scroll springs back. The owner found a plain directional snap too eager: a nudge changed scenes.
const COMMIT = 0.3;
const nearestScene = (progress) => SCENE_AT.reduce((a, b) => (Math.abs(b - progress) < Math.abs(a - progress) ? b : a));
// Where to settle once the scroll stops, given the scene it last settled on (rest): the same one after a short scroll,
// the next one in the scroll's direction after a longer one. A scene the scroll already rests on (a jump straight to
// it, as on the way back from a book) stays put.
function settleOn(progress, direction, rest) {
  const here = SCENE_AT.find((p) => Math.abs(p - progress) < 0.01);
  if (here !== undefined) return here;
  if (Math.abs(progress - rest) < COMMIT * SCENE_AT[1]) return rest;
  return direction > 0 ? SCENE_AT.find((p) => p > progress) : SCENE_AT.findLast((p) => p < progress);
}

// Where the showcase rests on the scroll (half way down the track), for ProjectsApp to return to from a book; null
// until the stage is laid out.
export function showcaseScrollTop() {
  const st = ScrollTrigger.getById('pj-scenes');
  return st ? st.start + (st.end - st.start) / 2 : null;
}

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

// The three scenes on the scaled stage, and the scroll that turns one into the next.
function Stage({ stage, selected, onSelect, onOpen }) {
  const trackRef = useRef(null);
  const triggerRef = useRef(null);
  const [scene, setScene] = useState('hero');
  const [peek, setPeek] = useState(null);
  const lingerRef = useRef(0);
  useEffect(() => () => clearTimeout(lingerRef.current), []);
  // Pointing at a project shows it at once; pointing away lets go of it after LINGER_MS, unless the pointer reaches
  // something that opens it first (hold).
  const pointAt = (key) => {
    clearTimeout(lingerRef.current);
    if (key) setPeek(key);
    else lingerRef.current = setTimeout(() => setPeek(null), LINGER_MS);
  };
  const letGo = () => pointAt(null);
  const hold = () => clearTimeout(lingerRef.current);
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

      // Showcase to Github, as long as hero to showcase (one), so the showcase sits half way down the scroll.
      const one = tl.duration();
      const at = (t) => one + t * one;
      const len = (t) => t * one;
      tl.addLabel('hero', 0).addLabel('showcase', one);
      tl
        // The strip and the preview's caption leave; the brackets close on the preview, which narrows to nothing, all
        // before the words come in.
        .to(q('.pj-strip-item'), { opacity: 0, y: -24, duration: len(0.3), stagger: len(0.04) }, at(0))
        .to(q('.pj-preview-text'), { opacity: 0, y: 16, duration: len(0.25) }, at(0))
        .fromTo(
          q('.pj-preview'),
          { clipPath: 'inset(0% 0% 0% 0%)' },
          { clipPath: 'inset(0% 50% 0% 50%)', duration: len(0.35), immediateRender: false },
          at(0)
        )
        .to(q('.pj-bracket-big[data-side="open"]'), { x: 330, duration: len(0.35) }, at(0))
        .to(q('.pj-bracket-big[data-side="close"]'), { x: -330, duration: len(0.35) }, at(0))
        .to(q('.pj-bracket-big'), { opacity: 0, duration: len(0.12), ease: 'none' }, at(0.25))
        // The dashed line erases from the left, behind the circle, which rolls away to the right.
        .to(
          q('.pj-line-showcase-dash'),
          { clipPath: `inset(0px ${-BLEED}px 0px ${FRAME.width + BLEED}px)`, duration: len(0.5), ease: 'power1.inOut' },
          at(0)
        )
        .to(q('.pj-line-showcase-circle'), { x: 760, rotation: 140, opacity: 0, duration: len(0.6), ease: 'power2.in' }, at(0))
        // The triangle turns upright onto the rule; the asterisk rises to the headline and grows.
        .to(q('.pj-line-showcase-triangle'), { ...TRIANGLE_UPRIGHT, duration: len(0.8) }, at(0.05))
        .to(
          q('.pj-asterisk'),
          {
            x: ASTERISK.github.left - ASTERISK.showcase.left,
            y: ASTERISK.github.top - ASTERISK.showcase.top,
            scale: ASTERISK.github.fontSize / ASTERISK.showcase.fontSize,
            duration: len(0.7),
          },
          at(0.05)
        )
        // The words rise in line by line, the arrow draws towards "Github", the second asterisk spins in and the
        // socials come up last.
        .fromTo(
          q('.pj-github-line'),
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: len(0.4), stagger: len(0.07), ease: 'power3.out' },
          at(0.4)
        )
        .fromTo(
          q('.pj-github-arrow'),
          { clipPath: `inset(0px ${FRAME.width - 1251}px 0px 0px)` },
          { clipPath: 'inset(0px 0px 0px 0px)', duration: len(0.3), ease: 'power1.inOut' },
          at(0.55)
        )
        .fromTo(
          q('.pj-asterisk-second'),
          { opacity: 0, scale: 0.2, rotation: -144 },
          { opacity: 1, scale: 1, rotation: 0, duration: len(0.45), ease: 'back.out(1.6)' },
          at(0.5)
        )
        .fromTo(
          q('.pj-social'),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: len(0.3), stagger: len(0.06) },
          at(0.65)
        )
        .addLabel('github', 2 * one)
        .set({}, {}, 2 * one);
      let rest = 0; // the scene the scroll last settled on (see settleOn)
      triggerRef.current = ScrollTrigger.create({
        id: 'pj-scenes',
        trigger: trackRef.current,
        start: 'top top',
        end: 'bottom bottom',
        animation: tl,
        // The scenes trail the scroll by a second, which gives the scroll some weight.
        scrub: 1,
        snap: {
          snapTo: (progress, self) => (rest = settleOn(progress, self.direction, rest)),
          // Judge where the scroll stopped, not where its momentum would carry it: with inertia a quick flick counts
          // as a long scroll and skips scenes.
          inertia: false,
          duration: { min: 0.4, max: 0.9 },
          delay: 0.15,
          ease: 'power2.inOut',
        },
        onUpdate: (self) => {
          const next = sceneAt(self.progress);
          // Back to the hero lets go of the chosen project, so coming back shows the resting image; on to the Github
          // scene lets go of the one pointed at.
          if (next !== 'showcase' && sceneRef.current !== next) {
            clearTimeout(lingerRef.current);
            setPeek(null);
            if (next === 'hero') onSelectRef.current(null);
          }
          sceneRef.current = next;
          setScene(next);
        },
      });
      sceneRef.current = sceneAt(triggerRef.current.progress);
      rest = nearestScene(triggerRef.current.progress);
      setScene(sceneRef.current);
    },
    { scope: trackRef }
  );

  // In the Github scene the asterisks spin in place; leaving it, they settle where their arms look as at rest.
  useEffect(() => {
    const glyphs = trackRef.current.querySelectorAll('.pj-asterisk-glyph');
    if (scene !== 'github') {
      gsap.to(glyphs, {
        rotation: (i, el) => Math.round(gsap.getProperty(el, 'rotation') / (360 / ARMS)) * (360 / ARMS),
        duration: 0.4,
        ease: 'power2.out',
        overwrite: true,
      });
      return undefined;
    }
    const spin = gsap.to(glyphs, { rotation: '+=360', duration: SPIN_S, ease: 'none', repeat: -1, overwrite: true });
    return () => spin.kill();
  }, [scene]);

  // Reaching the strip with the keyboard brings the showcase in; reaching the Github scene's links brings that in.
  const toShowcase = () => {
    const top = showcaseScrollTop();
    if (top !== null && sceneRef.current !== 'showcase') window.scrollTo({ top, behavior: 'smooth' });
  };
  const toGithub = () => {
    const st = triggerRef.current;
    if (st && sceneRef.current !== 'github') window.scrollTo({ top: st.end, behavior: 'smooth' });
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
          <span className="pj-github-arrow" style={{ '--arrow': `url(${githubArrow})` }} aria-hidden="true" />

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
          {/* The asterisk and the hint beside it open the shown project's book too, for the pointer; the preview is the
              link for the keyboard and assistive tech. */}
          <a
            className="pj-asterisk"
            style={ASTERISK.showcase}
            href={project ? `?p=${project.slug}` : undefined}
            data-active={Boolean(project) || undefined}
            tabIndex={-1}
            aria-hidden="true"
            onClick={open}
            onPointerEnter={hold}
            onPointerLeave={letGo}
          >
            <span className="pj-asterisk-glyph">*</span>
          </a>
          <span className="pj-asterisk-second" style={ASTERISK.second} aria-hidden="true">
            <span className="pj-asterisk-glyph">*</span>
          </span>
          <a
            className="pj-hint"
            style={HINT}
            href={project ? `?p=${project.slug}` : undefined}
            data-shown={Boolean(project) || undefined}
            tabIndex={-1}
            aria-hidden="true"
            onClick={open}
            onPointerEnter={hold}
            onPointerLeave={letGo}
          >
            {SHOWCASE.hint}
          </a>

          {/* The strip comes before the preview it controls, so Tab reaches it first. */}
          <Strip selected={selected} peek={peek} onSelect={onSelect} onPeek={pointAt} onFocusStrip={toShowcase} />

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
            onPointerEnter={hold}
            onPointerLeave={letGo}
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
          {/* The Github scene, read in order as one sentence with the link in it. */}
          <p className="pj-github">
            <span className="pj-github-line" style={GITHUB_LINES[0]}>
              {GITHUB.lines[0]}
            </span>{' '}
            <a
              className="pj-github-line pj-github-link"
              style={GITHUB_LINK}
              href={GITHUB.link.href}
              target="_blank"
              rel="noopener"
              onFocus={toGithub}
            >
              {GITHUB.link.label}
            </a>{' '}
            <span className="pj-github-line" style={GITHUB_LINES[1]}>
              {GITHUB.lines[1]}
            </span>{' '}
            <span className="pj-github-line" style={GITHUB_LINES[2]}>
              {GITHUB.lines[2]}
            </span>
            <span className="pj-github-line pj-github-bang" style={GITHUB_BANG} aria-hidden="true">
              {GITHUB.bang}
            </span>
          </p>
          <nav className="pj-socials" aria-label="Socials">
            {SOCIALS.map((social) => (
              <a
                key={social.key}
                className="pj-social"
                style={times(SOCIAL_X[social.key], SOCIAL_BASELINE, 20, 27)}
                href={social.href}
                target="_blank"
                rel="noopener"
                onFocus={toGithub}
              >
                {social.label}
              </a>
            ))}
          </nav>
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

// Narrow or upright windows: the hero, then the projects as a list of cards that open their books, then the Github scene's
// words and the socials.
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
      <p className="pj-flow-github">
        <span className="pj-flow-asterisk" aria-hidden="true">
          *
        </span>{' '}
        {GITHUB.lines[0]}{' '}
        <a href={GITHUB.link.href} target="_blank" rel="noopener">
          {GITHUB.link.label}
        </a>{' '}
        {GITHUB.lines[1]} {GITHUB.lines[2]}{' '}
        <span className="pj-github-bang" aria-hidden="true">
          {GITHUB.bang}
        </span>
      </p>
      <nav className="pj-flow-socials" aria-label="Socials">
        {SOCIALS.map((social) => (
          <a key={social.key} className="pj-social" href={social.href} target="_blank" rel="noopener">
            {social.label}
          </a>
        ))}
      </nav>
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
