import { useLayoutEffect, useState } from 'react';
import { BRAND, NAME, NAV, PHOTO_ALT, ROLES, SOCIALS } from './content';
import spiral from './assets/golden-spiral.svg';
import photoAvif from './assets/images/photo.avif';
import photoWebp from './assets/images/photo.webp';

// The page is the Figma frame "home" (1920 x 1080, page version-2), drawn in Figma px and scaled to fit the window.
const FRAME = { width: 1920, height: 1080 };
const SPIRAL_BLEED = 2000; // matches BLEED in scripts/build-home-assets.mjs

// Vertical metrics per font, in em (all four set USE_TYPO_METRICS, so every browser uses these).
const METRICS = {
  italianno: { ascent: 0.8, descent: 0.45, cap: 0.577 },
  openSans: { ascent: 2189 / 2048, descent: 600 / 2048, cap: 1462 / 2048 },
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

const NAV_X = { work: 330, workflow: 1238, contact: 1562 };
const SOCIAL_X = { tiktok: 742, github: 920, instagram: 1096 };

const TITLE = { font: 'openSans', size: 50, lineHeight: 68.0908 };
const LABEL = { font: 'openSans', size: 20, lineHeight: 27.2363, capTrim: true };
const SMALL_SERIF = { font: 'times', size: 20, capTrim: true };

function MaybeLink({ href, className, children }) {
  if (!href) return <span className={className}>{children}</span>;
  const external = /^https?:/.test(href);
  return (
    <a className={className} href={href} {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>
      {children}
    </a>
  );
}

function useFitScale() {
  const fit = () => Math.min(window.innerWidth / FRAME.width, window.innerHeight / FRAME.height);
  const [scale, setScale] = useState(fit);
  useLayoutEffect(() => {
    const onResize = () => setScale(fit());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return scale;
}

export default function HomeApp() {
  const scale = useFitScale();

  return (
    <main className="home">
      <div className="home-stage" style={{ width: FRAME.width, height: FRAME.height, '--scale': scale }}>
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

        <p className="home-roles" style={textBox({ x: 1328, y: 780, lineHeight: 25, ...SMALL_SERIF })}>
          {ROLES.map((role, i) => (
            <span key={role}>
              {i > 0 && <br />}
              {role}
            </span>
          ))}
        </p>

        <h1 className="home-name">
          <span style={textBox({ x: 517, y: 485, font: 'times', size: 100, lineHeight: 110 })}>{NAME.first}</span>{' '}
          <span style={textBox({ x: 1111, y: 485, font: 'times', size: 100, lineHeight: 110 })}>{NAME.last}</span>
        </h1>

        <nav className="home-nav">
          <MaybeLink href={BRAND.href} className="home-link home-nav-item">
            <span className="home-logo-z" style={textBox({ x: 85, y: 112, font: 'italianno', size: 75, lineHeight: 93.75, capTrim: true })}>
              Z
            </span>
            <span className="home-logo-rest" style={textBox({ x: 119, y: 102, ...TITLE })}>
              ashari
            </span>
            <span className="home-nav-label" style={textBox({ x: 85, y: 194, ...LABEL })}>
              {BRAND.label}
            </span>
          </MaybeLink>
          {NAV.map((item) => (
            <MaybeLink key={item.key} href={item.href} className="home-link home-nav-item">
              <span className="home-nav-title" style={textBox({ x: NAV_X[item.key], y: 102, ...TITLE })}>
                {item.title}
              </span>
              <span className="home-nav-label" style={textBox({ x: NAV_X[item.key], y: 194, ...LABEL })}>
                {item.label}
              </span>
            </MaybeLink>
          ))}
        </nav>
      </div>
    </main>
  );
}
