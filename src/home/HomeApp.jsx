import { useLayoutEffect, useRef, useState } from 'react';
import { BRAND, NAME, NAV, PHOTO_ALT, ROLES, SOCIALS } from './content';
import spiral from './assets/golden-spiral.svg';
import photoAvif from './assets/images/photo.avif';
import photoWebp from './assets/images/photo.webp';

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

function MaybeLink({ href, className, children }) {
  if (!href) return <span className={className}>{children}</span>;
  const external = /^https?:/.test(href);
  return (
    <a className={className} href={href} {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>
      {children}
    </a>
  );
}

function NavItem({ title, label, href, children }) {
  return (
    <MaybeLink href={href} className="home-link home-nav-item">
      <span className="home-nav-title">{children ?? title}</span>
      <span className="home-nav-label">{label}</span>
    </MaybeLink>
  );
}

// Fits the stage's focus box into the window below the header, centred, and picks the arrangement by the shape of
// that space. Width always fits; height may not, and then the page grows and scrolls. Re-runs when the window or the
// header (which wraps on phones and grows as fonts load) changes size.
function useStageLayout(headerRef) {
  const [layout, setLayout] = useState(null);
  useLayoutEffect(() => {
    const header = headerRef.current;
    const update = () => {
      const top = header.offsetTop + header.offsetHeight;
      const width = document.documentElement.clientWidth;
      const height = Math.max(window.innerHeight - top, 1);
      const variant = width >= height ? 'wide' : 'tall';
      const { focus } = LAYOUTS[variant];
      const scale = Math.min(width / focus.width, Math.max(height / focus.height, MIN_SCALE));
      const spare = Math.max(height - focus.height * scale, 0);
      setLayout({
        variant,
        scale,
        x: (width - focus.width * scale) / 2 - focus.x * scale,
        y: top + spare / 2 - focus.y * scale,
        pageHeight: top + spare + focus.height * scale,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [headerRef]);
  return layout;
}

export default function HomeApp() {
  const headerRef = useRef(null);
  const layout = useStageLayout(headerRef);
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

        <picture>
          <source type="image/avif" srcSet={photoAvif} />
          <img className="home-photo" src={photoWebp} alt={PHOTO_ALT} width={486} height={607} draggable={false} />
        </picture>

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
            <NavItem href={BRAND.href} label={BRAND.label}>
              <span className="home-logo" aria-label="Zashari">
                <span className="home-logo-z" aria-hidden="true">
                  Z
                </span>
                <span className="home-logo-rest" aria-hidden="true">
                  ashari
                </span>
              </span>
            </NavItem>
            <NavItem title={NAV[0].title} label={NAV[0].label} href={NAV[0].href} />
          </div>
          <div className="home-nav-group">
            {NAV.slice(1).map((item) => (
              <NavItem key={item.key} title={item.title} label={item.label} href={item.href} />
            ))}
          </div>
        </nav>
      </header>
    </main>
  );
}
