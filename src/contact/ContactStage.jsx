import { useEffect, useRef, useState } from 'react';
import { textAt } from '../about/frame';
import { FRAME, useStageLayout } from '../home/stage';
import Socials from '../home/Socials';
import { gallop } from '../horse/gallop';
import { BRUSH, CIRCLE, RULE } from './lines';
import { EMAIL, HORSE_LABEL, LEAD, WORDS, WORDS_SPOKEN, WORD_MS } from './content';
import './contact.css';

// The contact section: the Figma frame "cta-desktop" (1920 x 1080) drawn in Figma px on a stage, which useStageLayout
// (stage.js) fits under the page's header like /home's. It is the page at /contact and the screen under /home's
// landing. The galloping horse sits in a hand-drawn circle on the left, crossed by a hand-drawn rule; on the right,
// "Let's get it done", the email (a mailto link) and a word that changes every half second after a brush stroke.

// Two arrangements: wide is Figma's; tall (upright windows) stacks the circle over the words, each group moved as one.
// focus is the box of the stage that useStageLayout fits to the window.
const ARRANGE = {
  wide: {
    // Centred on the frame and as wide as puts the email's right end (x 1846) on the header's right margin (3.2% of the
    // window in from the edge) whenever the width sets the scale: (1846 - x) / width = 0.968.
    focus: { x: 13.5, y: 217, width: 1893, height: 863 },
    art: { x: 0, y: 0 },
    words: { x: 0, y: 0 },
    socials: 0,
  },
  tall: {
    focus: { x: 470, y: 300, width: 980, height: 1020 },
    art: { x: 536, y: 0 }, // the circle's centre (424, 615) to the stage's middle
    words: { x: -441, y: 470 }, // the words (956 to 1846 wide) centred, under the circle
    socials: 260, // and the socials under them
  },
};
const STAGE_FOCUS = { wide: ARRANGE.wide.focus, tall: ARRANGE.tall.focus };

const HORSE = { x: 262, y: 499, width: 326, height: 234 }; // Figma's box for it, inside the circle
// Times New Normal set on the baseline the SVG export gives (checked against the frame's PNG).
const serif = (x, baseline, size) => textAt({ x, baseline, size, lineHeight: size * 1.2, font: 'times' });

function Horse() {
  const canvasRef = useRef(null);
  useEffect(() => gallop(canvasRef.current, { fit: { width: 1, height: 1 } }), []);
  return (
    <canvas
      ref={canvasRef}
      className="cta-horse"
      role="img"
      aria-label={HORSE_LABEL}
      style={{ left: HORSE.x, top: HORSE.y, width: HORSE.width, height: HORSE.height }}
    />
  );
}

// The word that changes. All of them share one grid cell, so the cell is as wide as the widest, and each sits at its
// right end; the first (the widest) stays hidden to hold the width.
function ChangingWord({ style }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), WORD_MS);
    return () => clearInterval(timer);
  }, []);
  return (
    <p className="cta-word" style={style}>
      <span className="cta-visually-hidden">{WORDS_SPOKEN}</span>
      <span className="cta-word-cell" aria-hidden="true">
        <span className="cta-word-sizer">{WORDS[0]}</span>
        <span>{WORDS[index]}</span>
      </span>
    </p>
  );
}

export default function ContactStage({ headerRef, footerRef, id }) {
  // On the bottom edge, so the socials stay put between /home's landing and this screen.
  const layout = useStageLayout(headerRef, footerRef, STAGE_FOCUS, { bottom: true });
  const at = ARRANGE[layout?.variant ?? 'wide'];
  const move = ({ x, y }) => ({ transform: `translate(${x}px, ${y}px)` });
  return (
    <section className="cta" id={id} aria-labelledby="cta-lead" style={{ minHeight: layout?.pageHeight }}>
      <div
        className="cta-stage"
        data-layout={layout?.variant}
        style={{
          width: FRAME.width,
          height: FRAME.height,
          transform: layout && `translate(${layout.x}px, ${layout.y}px) scale(${layout.scale})`,
          visibility: layout ? undefined : 'hidden',
        }}
      >
        <div className="cta-group" style={move(at.art)}>
          <svg className="cta-lines" viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} aria-hidden="true">
            <path className="cta-line" d={RULE} />
            <path className="cta-line" d={CIRCLE} />
          </svg>
          <Horse />
        </div>

        <div className="cta-group" style={move(at.words)}>
          <svg className="cta-lines" viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} aria-hidden="true">
            <path className="cta-brush" d={BRUSH} />
          </svg>
          <h2 id="cta-lead" className="cta-lead" style={serif(956, 545.5, 75)}>
            {LEAD}
          </h2>
          <a className="cta-email" href={EMAIL.href} style={serif(956, 651, 100)}>
            {EMAIL.label}
          </a>
          <ChangingWord style={serif(1408, 738.5, 75)} />
        </div>

        <Socials dy={at.socials} />
      </div>
    </section>
  );
}
