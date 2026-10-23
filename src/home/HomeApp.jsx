import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BRAND, MODES, NAME, NAV, PHOTO_ALT, ROLES, SOCIALS } from './content';
import spiral from './assets/golden-spiral.svg';
import photoAvif from './assets/images/photo.avif';
import photoWebp from './assets/images/photo.webp';

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
  },
  tall: {
    focus: { x: 640, y: 217, width: 640, height: 863 },
    first: { x: 667, y: 485 },
    last: { x: 962, y: 485 },
    roles: { x: 742, y: 892 },
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
  const pos = LAYOUTS[layout?.variant ?? 'wide'];

  return (
    <main className="home" style={{ minHeight: layout?.pageHeight }}>
      <div
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

        <PhotoReel />

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
  );
}
