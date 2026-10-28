// Deepfake Classification Research's book: four spreads drawn in Figma (design/figma/data/deepfake-page-*.svg). Their
// look rests on Figma's own effects (texture and noise, glows, see-through and photo-filled lettering), so each spread
// is Figma's SVG itself, drawn inline on the sheet with its photos as WebP (scripts/build-book-svg.mjs); its text is
// SVG text in the page's own fonts, at Figma's exact places.
import { Sheet } from './FigmaBook';
import { SPREADS, TEXT } from './assets/books/deepfake/figma';
import { DEEPFAKE_BOOK as D } from './work';
import './deepfake.css';

function svgSpread(svg) {
  return function SvgSpread() {
    return (
      <Sheet>
        {/* Figma's export, built from design/figma/data at build time; nothing from visitors goes in. */}
        <div className="fb-figma" dangerouslySetInnerHTML={{ __html: svg }} />
      </Sheet>
    );
  };
}

export const DEEPFAKE_LAYOUTS = Object.fromEntries(SPREADS.map((svg, i) => [`deepfake${i + 1}`, svgSpread(svg)]));

// The spreads' paragraphs (TEXT, in reading order) under the headings, which the drawn lettering splits up.
const PARAGRAPH_WORDS = 8;
export function DeepfakeIndex() {
  return (
    <article>
      <h2>Deepfake Classification Research</h2>
      {D.headings.map((headings, i) => (
        <section key={headings[0]}>
          {headings.map((heading) => (
            <h3 key={heading}>{heading}</h3>
          ))}
          {TEXT[i]
            .filter((words) => words.split(' ').length >= PARAGRAPH_WORDS)
            .map((words) => (
              <p key={words}>{words}</p>
            ))}
        </section>
      ))}
    </article>
  );
}
