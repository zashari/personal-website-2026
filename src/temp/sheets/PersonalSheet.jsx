import { PERSONAL } from '../content/dossier';
import { Field, Frame, Paper, Piece, Polaroid, PolaroidBack, Rich, Rule, Sheet, Text, at, u } from './primitives';
import { FormFooterInk, FormFooterQr, FormFooterStamps, Letterhead, mirrorX, rotated } from './shared';

// Personal info, folder 001. Positions from design/figma/docs/sheets/personal-info.front.md.
export const WIDTH = 613;
export const HEIGHT = 860;

const PAPER = { x: 0, y: 17, w: 595, h: 843 };
const PHOTOS = [
  { id: 'personal2', name: 'photo-personal-2', alt: 'Zaky walking through a crowd', x: 384, y: 1.71, size: 155, rotate: 0 },
  { id: 'personal1', name: 'photo-personal-1', alt: 'Zaky putting on headphones', ...box(rotated(450, 45.71, 162.96, 162.96, 146, 146)), rotate: 7.12 },
];
const CLIP = { ...rotated(515.02, 0, 62.1, 105.74, 37.89, 99.35), rotate: 14.86 };
const FRAME = 10;

function box({ x, y, w }) {
  return { x, y, size: w };
}

const S = PERSONAL.subject;
const SUMMARY = PERSONAL.summary;

export function PersonalFront({ onPhotoOpen }) {
  return (
    <Sheet width={WIDTH} height={HEIGHT}>
      <Paper name="paper-personal" {...PAPER} />
      {/* Highlighter: Figma draws it at 50 % over the paper with a normal blend, so it stays outside the ink layer. */}
      <svg className="sheet-highlight" style={at(70, 225, 481, 33)} viewBox="0 0 481 33" aria-hidden="true">
        <path d="M5.5 1.47372L481 0L474 33L0 33L5.5 1.47372Z" fill="#f0e849" fillOpacity="0.5" />
      </svg>
      <div className="sheet-ink">
        <Letterhead top={49.71} />
        <Text x={165} y={80} size={40} weight={900} color="#b10f0f" className="sheet-stamp personal-file-copy">{PERSONAL.stamp}</Text>
        <Frame x={57} y={113} w={516} h={723} />

        <Text x={70} y={122} font="form" size={16}>{S.title}</Text>
        <Field y={146} labelX={79} valueX={125} lineX={121} lineW={223} {...S.name} />
        <Field y={146} labelX={357} valueX={438} lineX={433} lineW={81} {...S.bloodType} />
        <Field y={174} labelX={79} valueX={135} lineX={126} lineW={221} {...S.aliases} />
        <Field y={174} labelX={357} valueX={413} lineX={408} lineW={106} {...S.gender} />
        <Field y={202} labelX={79} valueX={135} lineX={135} lineW={404} {...S.address} />
        <Field y={230} labelX={79} valueX={163} lineX={160} lineW={140} {...S.phone} />
        <Field y={230} labelX={308} valueX={355} lineX={349} lineW={190} {...S.email} />
        <Rule x={60} y={275} length={510} weight={2} dash="1 3" className="is-worn" />

        <Text x={79} y={292} font="form" size={16}>{PERSONAL.education.title}</Text>
        <div className="personal-education" style={at(100, 319)}>
          {PERSONAL.education.entries.map((entry) => (
            <div key={entry.years} className="personal-education-row">
              <span className="sheet-type" style={{ fontSize: u(16) }}>{entry.years}</span>
              <span className="sheet-type" style={{ fontSize: u(12) }}>{entry.school}</span>
            </div>
          ))}
        </div>
        <Rule x={60} y={378} length={510} weight={2} dash="1 3" className="is-worn" />

        <Text x={57} y={385} w={516} font="form" size={16} align="center">{SUMMARY.title}</Text>
        <div className="personal-summary sheet-type" style={at(88, 408, 470)} role="table" aria-label={SUMMARY.title}>
          <div role="row" className="personal-summary-head">
            {SUMMARY.columns.map((c) => <div role="columnheader" key={c}>{c}</div>)}
          </div>
          {SUMMARY.rows.map((row) => (
            <div role="row" key={row.category} className="personal-summary-row">
              <div role="cell">{row.category}</div>
              <div role="cell">{row.status}</div>
              <div role="cell"><Rich text={row.details} /></div>
              <div role="cell">
                {row.protocol}
                {row.warning && <div className="personal-summary-warning ink-red">{row.warning}</div>}
              </div>
            </div>
          ))}
        </div>
        <Rule x={60} y={744} length={510} weight={2} dash="1 3" className="is-worn" />
        <FormFooterInk top={807} />
        <FormFooterStamps top={807} />
      </div>
      <FormFooterQr top={807} />
      {PHOTOS.map((p) => (
        <Polaroid key={p.id} {...p} frame={FRAME} onOpen={() => onPhotoOpen?.(p.id)} />
      ))}
      <Piece name="paperclip" {...CLIP} />
    </Sheet>
  );
}

// The back: the same paper seen from behind, the white backs of the photos peeking over the top edge and
// the paperclip wrapping round it.
export function PersonalBack() {
  return (
    <Sheet width={WIDTH} height={HEIGHT}>
      {PHOTOS.map((p) => (
        <PolaroidBack key={p.id} x={mirrorX(WIDTH, p.x, p.size)} y={p.y} size={p.size} rotate={-p.rotate} frame={FRAME} />
      ))}
      <Paper name="paper-personal" {...PAPER} x={mirrorX(WIDTH, PAPER.x, PAPER.w)} mirrored />
      <Piece name="paperclip" {...CLIP} x={mirrorX(WIDTH, CLIP.x, CLIP.w)} rotate={-CLIP.rotate} flip />
    </Sheet>
  );
}
