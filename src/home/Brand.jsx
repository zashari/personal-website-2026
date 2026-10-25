// The "Zashari" logotype with its small spaced label, as a header link: on /home it leads to /about (ABOUT ME), and on
// /about back home (HOME). Styles in brand.css.

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

// Optical left alignment: the Italianno Z's swash starts inking right of its box, so the logotype is nudged to line up
// with its label (measured in Chrome at 4x, in em of the title size; see TITLE_INK_SHIFT in HomeApp.jsx).
const LOGO_INK_SHIFT = 0.0625;

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
