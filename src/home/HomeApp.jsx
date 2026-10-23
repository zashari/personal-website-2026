import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BRAND, MODES, NAME, NAV, PHOTO_ALT, ROLES, SOCIALS, TOUCH_LABEL } from './content';
import spiral from './assets/golden-spiral.svg';
import photoAvif from './assets/images/photo.avif';
import photoWebp from './assets/images/photo.webp';
import Book from './Book';
import SphereLens, { LENS_SUPPORTED } from './SphereLens';
import Strands from './Strands';

// Frames for the hover reel, in file order (01, 02, ...), each as an AVIF and WebP pair.
const REEL_URLS = import.meta.glob('./assets/images/reel/*.{avif,webp}', { eager: true, query: '?url', import: 'default' });
const REEL = Object.keys(REEL_URLS)
  .filter((file) => file.endsWith('.avif'))
  .sort()
  .map((avif) => ({ avif: REEL_URLS[avif], webp: REEL_URLS[avif.replace(/.avif$/, '.webp')] }));
const REEL_INTERVAL_MS = 200;

// The artwork is the Figma frame "home" (1920 x 1080, page version-2), drawn in Figma px on a stage. The stage is
// scaled so its focus box (photo, name, roles and socials, down to the frame's bottom edge) fills the space under the
// header. The header itself is ordinary fluid HTML (see home.css).
const FRAME = { width: 1920, height: 1080 };
// Below this the 20 px Figma text drops under ~11 px, so short screens (a phone on its side) scroll instead.
const MIN_SCALE = 0.55;
const SPIRAL_BLEED = 2000; // matches BLEED in scripts/build-home-assets.mjs

// Landscape keeps the Figma arrangement. Portrait narrows the focus to the photo column, so the name sits on the
// photo and the roles move under it.
const LAYOUTS = {
  wide: {
    focus: { x: 400, y: 217, width: 1120, height: 863 },
    first: { x: 517, y: 485 },
    last: { x: 1111, y: 485 },
    roles: { x: 1328, y: 780 },
    touch: { x: 260.6, y: 775.6 },
  },
  tall: {
    focus: { x: 640, y: 217, width: 640, height: 863 },
    first: { x: 667, y: 485 },
    last: { x: 962, y: 485 },
    roles: { x: 742, y: 892 },
    // Figma's spot (left of the photo) is outside the narrow focus; use the free space under the photo instead.
    touch: { x: 1080, y: 872 },
  },
};

// Vertical metrics per font, in em (all set USE_TYPO_METRICS, so every browser uses these).
const METRICS = {
  times: { ascent: 0.75, descent: 0.25, cap: 0.7 },
};

// Figma's y is the top of the text box. With leading trimmed to cap height, that is the cap top of the first line,
// so move the CSS line box up by the space above the cap: half the leading plus ascent minus cap height.
function textBox({ x, y, font, size, lineHeight, capTrim = false }) {
  let top = y;
  if (capTrim) {
    const m = METRICS[font];
    top -= (lineHeight - (m.ascent + m.descent) * size) / 2 + (m.ascent - m.cap) * size;
  }
  return { left: x, top, fontSize: size, lineHeight: `${lineHeight}px` };
}

const SOCIAL_X = { tiktok: 742, github: 920, instagram: 1096 };
const SMALL_SERIF = { font: 'times', size: 20, capTrim: true };
const NAME_TEXT = { font: 'times', size: 100, lineHeight: 110 };

// A link without a destination yet (href: null in content.js) still looks and behaves like a link (pointer, hover,
// keyboard focus) but does nothing when clicked, and tells assistive tech it is not available yet.
const preventNavigation = (event) => event.preventDefault();

function MaybeLink({ href, className, children }) {
  if (!href) {
    return (
      <a className={className} href="#" aria-disabled="true" onClick={preventNavigation}>
        {children}
      </a>
    );
  }
  const external = /^https?:/.test(href);
  return (
    <a className={className} href={href} {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>
      {children}
    </a>
  );
}

// Optical left alignment: glyphs carry their own side bearings (and the Italianno Z a swash), so a title and its label
// that start at the same x do not start inking at the same x. Each title is nudged by the gap measured in Chrome at
// 4x (title ink minus label ink, in em of the title size). Re-measure if a title or label's first letter changes.
const TITLE_INK_SHIFT = { brand: 0.0625, work: 0.025, workflow: -0.0125, contact: -0.025 };

// The label opens up on hover by sliding each letter (letter n moves n x 0.15em). A transform renders at sub-pixel
// precision on the compositor, where animating letter-spacing snaps glyphs a whole pixel at a time and looks stiff.
function SpacedLabel({ text }) {
  return (
    <span className="home-nav-label">
      <span className="home-visually-hidden">{text}</span>
      {[...text].map((char, i) => (
        <span key={i} className="home-nav-letter" aria-hidden="true" style={{ '--i': i }}>
          {char}
        </span>
      ))}
    </span>
  );
}

// The centre photo. While the pointer is over it, the photos in REEL play in turn every 0.2s, looping, as hard cuts
// like a flipbook; leaving shows the original again. Frames keep their own aspect ratio, fitted inside the photo's box. The frames are stacked under the photo and only mounted once the
// page is idle, so they never compete with the first paint, and every switch is instant because each is already decoded.
function PhotoReel() {
  const [frame, setFrame] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const timer = useRef(null);
  const images = useRef([]);

  // Chrome drops the decoded pixels of hidden images, so a frame shown cold flashes empty for tens of ms while it
  // decodes. img.decode() decodes ahead: each frame is decoded during the previous one's 0.2s, ready to paint at once.
  const prepare = (i) => images.current[i]?.decode().catch(() => {});

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1200));
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    const handle = idle(() => setMounted(true));
    return () => {
      cancel(handle);
      clearInterval(timer.current);
    };
  }, []);

  const start = () => {
    if (!mounted || !REEL.length) return;
    clearInterval(timer.current);
    let current = 0;
    setFrame(current);
    prepare(1 % REEL.length);
    timer.current = setInterval(() => {
      current = (current + 1) % REEL.length;
      setFrame(current);
      prepare((current + 1) % REEL.length);
    }, REEL_INTERVAL_MS);
  };
  const stop = () => {
    clearInterval(timer.current);
    setFrame(-1);
  };

  return (
    <div className="home-photo home-reel" data-playing={frame >= 0 || undefined} onPointerEnter={start} onPointerLeave={stop}>
      <picture className="home-reel-base">
        <source type="image/avif" srcSet={photoAvif} />
        <img src={photoWebp} alt={PHOTO_ALT} width={486} height={607} draggable={false} />
      </picture>
      {mounted &&
        REEL.map((src, i) => (
          <picture key={src.avif} className="home-reel-frame" data-active={i === frame || undefined} aria-hidden="true">
            <source type="image/avif" srcSet={src.avif} />
            <img
              ref={(el) => {
                images.current[i] = el;
              }}
              src={src.webp}
              alt=""
              width={486}
              height={607}
              draggable={false}
              fetchPriority="low"
              onLoad={i === 0 ? () => prepare(0) : undefined}
            />
          </picture>
        ))}
    </div>
  );
}

// Figma group "random" (light 2016:10 / dark 2030:312): an eight-point sparkle with "TOUCH ME" level beside it, in the
// accent colour. The sparkle paths are Figma's own (58 x 58). Placement was measured from the 4x frame exports
// (.tmp/home-desktop*.png) after the API rate limit: sparkle centred at frame (289.6, 804.6), text box at (329, 797).
// The group's origin is the sparkle box's top-left; the text sits at its offset from there.
const SPARKLE_PATHS = [
  'M58 29C58 45.0163 29 29 29 58C12.9837 58 29 29 0 29C0 12.9837 29 29 29 0C45.0163 0 29 29 58 29Z',
  'M49.7579 49.2511C38.5736 60.7154 29 29 8.74888 49.758C-2.71541 38.5736 29 29 8.24205 8.74891C19.4264 -2.71538 29 29 49.2511 8.24208C60.7154 19.4265 29 29 49.7579 49.2511Z',
];
// top is 0.85 px below the metric value (21.4): Chrome sets these capitals that much higher than Figma does.
const TOUCH_TEXT_OFFSET = { left: 68.4, top: 22.25 };

function TouchMe({ x, y, pressed, onToggle }) {
  return (
    <button type="button" className="home-touch" style={{ left: x, top: y }} aria-pressed={pressed} onClick={onToggle}>
      <svg className="home-touch-sparkle" width="58" height="58" viewBox="0 0 58 58">
        <g className="home-touch-spin">
          {SPARKLE_PATHS.map((d) => (
            <path key={d} d={d} fill="currentColor" />
          ))}
        </g>
      </svg>
      <span className="home-touch-label" style={TOUCH_TEXT_OFFSET}>
        {TOUCH_LABEL}
      </span>
    </button>
  );
}

// Strands spheres scattered over the artwork while TOUCH ME is on, after the reference layout. Centre (x, y) and sphere
// diameter d are in Figma px; Strands draws its sphere at 84% of its box, so each box is d / 0.84 square. The spheres
// are dark glass in both modes, so none may sit under dark text (header, roles, socials, TOUCH ME, mode switch).
const SPHERES = {
  // Wide: cut by the top edge behind the photo, on the left edge, cut by the bottom edge, behind the photo's lower
  // right (left of the roles at x 1328, above the socials at y 1023), on the right edge, and one over the photo's
  // lower-left corner, under the white name.
  wide: [
    { id: 'top', x: 930, y: 70, d: 300, depth: 0.7 },
    { id: 'left', x: 40, y: 680, d: 300, depth: 1.1 },
    // Right of the DARK switch even on 1024 px-wide screens, left of Tiktok (x 742).
    { id: 'bottom', x: 620, y: 1130, d: 260, depth: 0.85 },
    { id: 'right-low', x: 1170, y: 860, d: 300, depth: 0.6 },
    { id: 'right-edge', x: 1960, y: 400, d: 300, depth: 1 },
    { id: 'front', x: 735, y: 720, d: 300, depth: 1.2, front: true },
  ],
  // Tall (phones): the narrow photo column leaves room only at its edges, so four smaller spheres sit half behind the
  // photo's sides and corners, clear of the header, roles, socials and TOUCH ME.
  tall: [
    { id: 'top', x: 1240, y: 300, d: 160, depth: 0.7 },
    { id: 'left', x: 640, y: 380, d: 200, depth: 1.1 },
    { id: 'right', x: 1280, y: 700, d: 200, depth: 0.85 },
    { id: 'bottom', x: 640, y: 960, d: 180, depth: 1 },
  ],
};
const SPHERE_FADE_MS = 450; // matches .home-spheres transition in home.css

// Spheres use Strands' dark glass in dark mode and clear glass in light mode (lightMode stays off); SphereLens
// bends the page behind them in both modes.
const SPHERE_CLEAR = { light: 1, dark: 0 };

// Focus lens, after React Bits ShapeBlur (https://reactbits.dev/animations/shape-blur): the spot under the cursor on a
// sphere goes out of focus. ShapeBlur only blurs a shape it draws itself, so its lens (size, softness, blur, easing)
// is rebuilt here as a backdrop blur above each sphere, masked to a soft circle at the cursor and clipped to the
// sphere; it blurs the sphere and whatever shows through it alike, in both modes. Softness and blur live in home.css.
const FOCUS_SIZE = 0.3; // lens radius as a share of the box (ShapeBlur lensSize)
const FOCUS_REACH = 0.42 + FOCUS_SIZE / 2; // the lens wakes within the sphere plus half its own radius, in box units
const FOCUS_FOLLOW = 10; // ShapeBlur's easing rates, per second: position toward the cursor, power in and out
const FOCUS_FADE = 4;

function useSphereFocus(active, variant, layerRef) {
  useEffect(() => {
    const layer = layerRef.current;
    if (!active || !layer) return undefined;
    const lenses = [...layer.querySelectorAll('.home-sphere-focus')].map((el) => ({
      el,
      x: 0.5,
      y: 0.5,
      tx: 0.5,
      ty: 0.5,
      power: 0,
      target: 0,
    }));
    let raf = 0;
    let last = 0;
    const tick = (now) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const follow = 1 - Math.exp(-dt * FOCUS_FOLLOW);
      const fade = 1 - Math.exp(-dt * FOCUS_FADE);
      let moving = false;
      for (const lens of lenses) {
        lens.x += (lens.tx - lens.x) * follow;
        lens.y += (lens.ty - lens.y) * follow;
        lens.power += (lens.target - lens.power) * fade;
        if (Math.abs(lens.target - lens.power) < 0.002) lens.power = lens.target;
        else moving = true;
        if (Math.abs(lens.tx - lens.x) > 0.001 || Math.abs(lens.ty - lens.y) > 0.001) moving = true;
        lens.el.style.setProperty('--focus-x', `${(lens.x * 100).toFixed(2)}%`);
        lens.el.style.setProperty('--focus-y', `${(lens.y * 100).toFixed(2)}%`);
        lens.el.style.setProperty('--focus-power', lens.power.toFixed(3));
      }
      raf = moving ? requestAnimationFrame(tick) : 0;
      if (!raf) last = 0;
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (event) => {
      for (const lens of lenses) {
        const rect = lens.el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        lens.target = Math.hypot(x - 0.5, y - 0.5) < FOCUS_REACH ? 1 : 0;
        if (!lens.target) continue;
        // A lens waking from nothing starts at the cursor instead of sliding in from where it last was.
        if (lens.power < 0.01) {
          lens.x = x;
          lens.y = y;
        }
        lens.tx = x;
        lens.ty = y;
      }
      wake();
    };
    const onLeave = () => {
      for (const lens of lenses) lens.target = 0;
      wake();
    };
    window.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [active, variant, layerRef]);
}

function SphereLayer({ front, state, variant, theme }) {
  const layerRef = useRef(null);
  useSphereFocus(state !== 'off', variant, layerRef);
  if (state === 'off') return null;
  const lens = LENS_SUPPORTED;
  return (
    <div
      ref={layerRef}
      className="home-spheres"
      data-state={state}
      data-front={front || undefined}
      data-lens={lens || undefined}
      aria-hidden="true"
    >
      {!front && lens && <SphereLens />}
      {SPHERES[variant].filter((s) => !!s.front === front).map((s) => {
        const box = s.d / 0.84;
        const place = { left: s.x - box / 2, top: s.y - box / 2, width: box, height: box, '--depth': s.depth };
        return (
          <Fragment key={s.id}>
            <div className="home-sphere" style={place}>
              <Strands respectReducedMotion={false} clear={SPHERE_CLEAR[theme]} />
            </div>
            <div className="home-sphere-focus" style={{ ...place, '--focus-r': `${box * FOCUS_SIZE}px` }} />
          </Fragment>
        );
      })}
    </div>
  );
}

// off -> entering (mounted, transparent) -> on (faded in) -> leaving (fading out) -> off (unmounted, WebGL freed).
// The visitor starts and stops the spheres themselves, so they move even under reduced motion.
// Repel: while the spheres are on, they drift a little away from the cursor, as like poles of a magnet push apart. The cursor's
// offset from the window centre (-1..1 on each axis) is mirrored and scaled to at most REPEL_MAX Figma px (times each
// sphere's depth), then eased toward with a soft lag so the spheres float rather than follow. The offset is written to
// CSS variables on the stage, so no React render happens per frame.
const REPEL_MAX = 12;
const REPEL_LAG_S = 0.45; // time constant of the easing; time-based so it feels the same at any frame rate

function useRepel(active, stageRef) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!active || !stage) return undefined;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    let last = 0;
    const tick = (now) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
      last = now;
      const k = 1 - Math.exp(-dt / REPEL_LAG_S);
      current.x += (target.x - current.x) * k;
      current.y += (target.y - current.y) * k;
      stage.style.setProperty('--repel-x', `${current.x.toFixed(3)}px`);
      stage.style.setProperty('--repel-y', `${current.y.toFixed(3)}px`);
      const settled = Math.abs(target.x - current.x) < 0.01 && Math.abs(target.y - current.y) < 0.01;
      raf = settled ? 0 : requestAnimationFrame(tick);
      if (!raf) last = 0;
    };
    const onMove = (event) => {
      target.x = -((event.clientX - window.innerWidth / 2) / (window.innerWidth / 2)) * REPEL_MAX;
      target.y = -((event.clientY - window.innerHeight / 2) / (window.innerHeight / 2)) * REPEL_MAX;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      stage.style.removeProperty('--repel-x');
      stage.style.removeProperty('--repel-y');
    };
  }, [active, stageRef]);
}

// Phones get neither TOUCH ME nor the spheres (no cursor to repel, and no WebGL running on a small battery).
const PHONE_QUERY = '(max-width: 767px)';

function useIsPhone() {
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches);
  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY);
    const onChange = () => setPhone(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return phone;
}

function useSpheres() {
  const [state, setState] = useState('off');
  const timer = useRef(null);
  useEffect(() => {
    if (state === 'entering') {
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setState('on')));
      return () => cancelAnimationFrame(raf);
    }
    if (state === 'leaving') {
      timer.current = setTimeout(() => setState('off'), SPHERE_FADE_MS);
      return () => clearTimeout(timer.current);
    }
    return undefined;
  }, [state]);
  const on = state === 'entering' || state === 'on';
  const toggle = () => setState(on ? 'leaving' : 'entering');
  return [state, on, toggle];
}

function NavItem({ id, title, label, href, children }) {
  return (
    <MaybeLink href={href} className="home-link home-nav-item">
      <span className="home-nav-title" style={{ marginLeft: `${TITLE_INK_SHIFT[id] ?? 0}em` }}>
        {children ?? title}
      </span>
      <SpacedLabel text={label} />
    </MaybeLink>
  );
}

// Fits the stage's focus box into the window below the header, centred, and picks the arrangement by the shape of
// that space. Width always fits; height may not, and then the page grows and scrolls. In the tall arrangement the
// socials sit above the colour-mode switch instead of beside it, so its height is kept clear. Re-runs when the window,
// the header (which wraps on phones and grows as fonts load) or the switch changes size.
function useStageLayout(headerRef, footerRef) {
  const [layout, setLayout] = useState(null);
  useLayoutEffect(() => {
    const header = headerRef.current;
    const footer = footerRef.current;
    const update = () => {
      const top = header.offsetTop + header.offsetHeight;
      const width = document.documentElement.clientWidth;
      const variant = width >= window.innerHeight - top ? 'wide' : 'tall';
      const reserved = variant === 'tall' ? footer.offsetHeight : 0;
      const height = Math.max(window.innerHeight - top - reserved, 1);
      const { focus } = LAYOUTS[variant];
      const scale = Math.min(width / focus.width, Math.max(height / focus.height, MIN_SCALE));
      const spare = Math.max(height - focus.height * scale, 0);
      setLayout({
        variant,
        scale,
        x: (width - focus.width * scale) / 2 - focus.x * scale,
        y: top + spare / 2 - focus.y * scale,
        pageHeight: top + spare + focus.height * scale + reserved,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    observer.observe(footer);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [headerRef, footerRef]);
  return layout;
}

// Light is the default. The choice is kept per browser; home/index.html applies it before first paint, so this only
// reads what is already on <html> and writes changes back.
const THEME_KEY = 'zashari-home-theme';
const THEME_COLOR = { light: '#dbd5c9', dark: '#202020' };

const THEME_FADE_MS = 600; // matches --theme-time in home.css

function useTheme() {
  const [theme, setThemeState] = useState(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'));
  const fadeTimer = useRef(null);
  const setTheme = (next) => {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => root.classList.remove('theme-switching'), THEME_FADE_MS);
    setThemeState(next);
  };
  useEffect(() => () => clearTimeout(fadeTimer.current), []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Storage can be blocked (private mode, site data off); the mode then lasts for this visit only.
    }
  }, [theme]);
  return [theme, setTheme];
}

function ModeSwitch({ theme, onChange, footerRef }) {
  return (
    <div className="home-mode" ref={footerRef} role="group" aria-label="Colour mode">
      {MODES.map((mode) => (
        <button
          key={mode.key}
          type="button"
          className="home-mode-option"
          aria-pressed={theme === mode.key}
          onClick={() => onChange(mode.key)}
        >
          <span className="home-mode-label">{mode.label}</span>
          <span className="home-mode-line" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export default function HomeApp() {
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const layout = useStageLayout(headerRef, footerRef);
  const [theme, setTheme] = useTheme();
  const [sphereState, spheresOn, toggleSpheres] = useSpheres();
  const stageRef = useRef(null);
  const isPhone = useIsPhone();
  useRepel(sphereState !== 'off' && !isPhone, stageRef);
  const pos = LAYOUTS[layout?.variant ?? 'wide'];

  return (
    <>
      <main className="home" style={{ minHeight: layout?.pageHeight }}>
        <div
          ref={stageRef}
          className="home-stage"
          data-layout={layout?.variant}
          style={{
            width: FRAME.width,
            height: FRAME.height,
            transform: layout && `translate(${layout.x}px, ${layout.y}px) scale(${layout.scale})`,
            visibility: layout ? undefined : 'hidden',
          }}
        >
          <img
            className="home-spiral"
            src={spiral}
            alt=""
            style={{ left: -SPIRAL_BLEED, top: -SPIRAL_BLEED }}
            width={FRAME.width + 2 * SPIRAL_BLEED}
            height={FRAME.height + 2 * SPIRAL_BLEED}
            draggable={false}
          />

          {!isPhone && <SphereLayer front={false} state={sphereState} variant={layout?.variant ?? 'wide'} theme={theme} />}

          {!isPhone && <TouchMe {...pos.touch} pressed={spheresOn} onToggle={toggleSpheres} />}

          <PhotoReel />

          {!isPhone && <SphereLayer front state={sphereState} variant={layout?.variant ?? 'wide'} theme={theme} />}

          <ul className="home-socials">
            {SOCIALS.map((s) => (
              <li key={s.key} style={textBox({ x: SOCIAL_X[s.key], y: 1023, lineHeight: 22, ...SMALL_SERIF })}>
                <MaybeLink href={s.href} className="home-link">
                  {s.label}
                </MaybeLink>
              </li>
            ))}
          </ul>

          <p className="home-roles" style={textBox({ ...pos.roles, lineHeight: 25, ...SMALL_SERIF })}>
            {ROLES.map((role, i) => (
              <span key={role}>
                {i > 0 && <br />}
                {role}
              </span>
            ))}
          </p>

          <h1 className="home-name">
            <span style={textBox({ ...pos.first, ...NAME_TEXT })}>{NAME.first}</span>{' '}
            <span style={textBox({ ...pos.last, ...NAME_TEXT })}>{NAME.last}</span>
          </h1>
        </div>

        <header className="home-header" ref={headerRef}>
          <nav className="home-nav" aria-label="Main">
            <div className="home-nav-group">
              <NavItem id="brand" href={BRAND.href} label={BRAND.label}>
                <span className="home-logo" aria-label="Zashari">
                  <span className="home-logo-z" aria-hidden="true">
                    Z
                  </span>
                  <span className="home-logo-rest" aria-hidden="true">
                    ashari
                  </span>
                </span>
              </NavItem>
              <NavItem id={NAV[0].key} title={NAV[0].title} label={NAV[0].label} href={NAV[0].href} />
            </div>
            <div className="home-nav-group">
              {NAV.slice(1).map((item) => (
                <NavItem key={item.key} id={item.key} title={item.title} label={item.label} href={item.href} />
              ))}
            </div>
          </nav>
        </header>

        <ModeSwitch theme={theme} onChange={setTheme} footerRef={footerRef} />
      </main>

      <Book />
    </>
  );
}
