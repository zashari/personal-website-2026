import { BRAND, NAV } from './content';

// The header shared by /home and /about: the "Zashari" logotype with its small spaced label, as a header link (on /home
// it leads to /about, ABOUT ME, and on /about back home, HOME), and the other nav items. Styles in brand.css.

// A link without a destination yet (href: null in content.js) still looks and behaves like a link (pointer, hover,
// keyboard focus) but does nothing when clicked, and tells assistive tech it is not available yet.
const preventNavigation = (event) => event.preventDefault();

export function MaybeLink({ href, className, style, children }) {
  if (!href) {
    return (
      <a className={className} style={style} href="#" aria-disabled="true" onClick={preventNavigation}>
        {children}
      </a>
    );
  }
  const external = /^https?:/.test(href);
  return (
    <a
      className={className}
      style={style}
      href={href}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {children}
    </a>
  );
}

// The label opens up on hover by sliding each letter (letter n moves n x 0.15em). A transform renders at sub-pixel
// precision on the compositor, where animating letter-spacing snaps glyphs a whole pixel at a time and looks stiff.
export function SpacedLabel({ text }) {
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

// Optical left alignment: glyphs carry their own side bearings (and the Italianno Z a swash), so a title and its label
// that start at the same x do not start inking at the same x. Each title is nudged by the gap measured in Chrome at
// 4x (title ink minus label ink, in em of the title size). Re-measure if a title or label's first letter changes.
const LOGO_INK_SHIFT = 0.0625;
const TITLE_INK_SHIFT = { work: 0.025, workflow: -0.0125, contact: -0.025 };

export function NavItem({ id, title, label, href }) {
  return (
    <MaybeLink href={href} className="home-link home-nav-item">
      <span className="home-nav-title" style={{ marginLeft: `${TITLE_INK_SHIFT[id] ?? 0}em` }}>
        {title}
      </span>
      <SpacedLabel text={label} />
    </MaybeLink>
  );
}

// A link back to the page the visitor just came from (the logotype's HOME on /about and /projects): when the previous
// history entry is that page, a plain click goes back through history instead, so the browser restores the page as
// they left it (scroll position included) and the history does not grow home, about, home, about. Only same-site
// entries are visible to the Navigation API, so a visitor who arrived from elsewhere simply follows the link.
export function backIfPrevious(event) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const nav = window.navigation;
  const previous = nav?.currentEntry && nav.entries()[nav.currentEntry.index - 1];
  if (!previous?.url || new URL(previous.url).pathname !== event.currentTarget.pathname) return;
  event.preventDefault();
  nav.back();
}

export function BrandLink({ href, label, onClick }) {
  return (
    <a className="home-link home-nav-item" href={href} onClick={onClick}>
      <span className="home-nav-title" style={{ marginLeft: `${LOGO_INK_SHIFT}em` }}>
        <span className="home-logo" aria-label="Zashari">
          <span className="home-logo-z" aria-hidden="true">
            Z
          </span>
          <span className="home-logo-rest" aria-hidden="true">
            ashari
          </span>
        </span>
      </span>
      <SpacedLabel text={label} />
    </a>
  );
}

// /home's header nav: the logotype (ABOUT ME) and Work on the left, Workflow and Contact me on the right.
export function HomeNav() {
  const item = (entry) => (
    <NavItem key={entry.key} id={entry.key} title={entry.title} label={entry.label} href={entry.href} />
  );
  return (
    <nav className="home-nav" aria-label="Main">
      <div className="home-nav-group">
        <BrandLink href={BRAND.href} label={BRAND.label} />
        {item(NAV[0])}
      </div>
      <div className="home-nav-group">{NAV.slice(1).map(item)}</div>
    </nav>
  );
}
