// Gamified Personal Website's book: two spreads drawn in Figma (design/figma/data/gamified-page-*.svg), rebuilt with
// FigmaBook.jsx.
import { useId } from 'react';
import { Hint, Logotype, Photo, Sheet, Text, plain } from './FigmaBook';
import { PHOTOS } from './assets/books/gamified/figma';
import { GAMIFIED_BOOK as G } from './work';
import './gamified.css';

// The body text: Host Grotesk Medium 10/11 in black, justified.
const column = { font: 'grotesk', size: 10, lineHeight: 11, weight: 500, color: '#000', justify: true };
const header = { font: 'condensed', size: 20, weight: 800 };

// The cover's headline: pale grey at 20% over the photo, in a black glow that stays outside the letters, so the photo
// shows through them. CSS text-shadow would darken the letters from behind, so this is SVG with Figma's own filter.
function GlowHeadline() {
  const filter = useId();
  return (
    <svg className="fb-path" viewBox="0 0 768 536" aria-hidden="true">
      <defs>
        {/* Figma's: the letters' shape at full strength (their fill is only 20%), blurred, cut out where they are. */}
        <filter id={filter} x="10" y="125" width="379" height="290" filterUnits="userSpaceOnUse">
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feGaussianBlur stdDeviation="8" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <text
        filter={`url(#${filter})`}
        fill="#c4c4c4"
        fillOpacity="0.2"
        fontFamily="Open Sans"
        fontSize="65"
        fontWeight="800"
      >
        {G.headline.map((line, i) => (
          <tspan key={line} x="26" y={188.216 + 70 * i}>
            {line}
          </tspan>
        ))}
      </text>
    </svg>
  );
}

// Pages 1 and 2: the interrogation-room photo across both pages and the title over it.
function CoverSpread() {
  return (
    <Sheet>
      <Photo {...PHOTOS['s1-cover-gamified-1']} />
      <GlowHeadline />
      <Hint>{G.hint}</Hint>
      <Text lines={[G.kicker]} {...header} x={497} baseline={49.2773} />
      <Text lines={[G.date]} {...header} x={511} baseline={501.277} />
    </Sheet>
  );
}

// Pages 3 and 4: the dossier on the left page; on the right, how the site was made, round a print and the design file.
function SiteSpread() {
  return (
    <Sheet>
      <Photo {...PHOTOS['s2-image']} />
      <Text lines={[G.feature]} {...header} x={77} baseline={518.759} shadow />
      <Photo {...PHOTOS['s2-personal-paper-photo-1-front']} />
      <Text lines={G.idea} {...column} x={562} baseline={44} width={174} />
      <Text lines={G.vibe} {...column} x={562} baseline={119} width={174} />
      <Text lines={G.week} {...column} x={409} baseline={197} width={327} />
      <Photo {...PHOTOS['s2-image-3']} />
      <Text lines={[G.designFile]} font="grotesk" x={543} baseline={386.3} size={8} weight={800} color="#fa0000" />
      <Text lines={G.stack} {...column} x={409} baseline={412} width={327} />
      <Text lines={[G.stackEnd]} {...column} justify={false} x={609.096} baseline={456} />
      <Logotype x={499} baseline={498.275} />
      <Hint x={678} baseline={517.655}>
        {G.end}
      </Hint>
    </Sheet>
  );
}

export const GAMIFIED_LAYOUTS = {
  gamifiedCover: CoverSpread,
  gamifiedSite: SiteSpread,
};

export function GamifiedIndex() {
  return (
    <article>
      <h2>{plain(G.headline)}</h2>
      <p>
        {G.kicker}, {G.date}.
      </p>
      <h3>{G.feature}</h3>
      <p>{plain(G.idea)}</p>
      <p>{plain(G.vibe)}</p>
      <p>
        {plain(G.week)} <a href={G.site}>Visit the site</a>
      </p>
      <p>
        {plain(G.stack)} {G.stackEnd}
      </p>
    </article>
  );
}
