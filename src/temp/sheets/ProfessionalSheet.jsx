import { PROFESSIONAL as P } from '../content/dossier';
import arrowUrl from '../assets/red-arrow.svg?url';
import { Frame, Paper, Picture, Piece, Polaroid, PolaroidBack, Rich, Rule, Sheet, Text, at } from './primitives';
import { FormFooterInk, FormFooterQr, FormFooterStamps, Letterhead, mirrorX, rotated } from './shared';

// Professional info, folder 002. Positions from design/figma/docs/sheets/professional-info.front.md.
export const WIDTH = 616;
export const HEIGHT = 865;

const PAPER = { x: 0, y: 21, w: 595, h: 843 };
const FRAME = 5;
const tilted = rotated(454.04, 4.57, 161.5, 161.5, 131.87, 131.87);
const PHOTOS = [
  { id: 'professional2', name: 'photo-professional-2', alt: 'Zaky debating model architectures with a friend', x: 386, y: 6, size: 115, rotate: 0 },
  { id: 'professional1', name: 'photo-professional-1', alt: 'Zaky relaxing at his desk', x: tilted.x, y: tilted.y, size: tilted.w, rotate: 15 },
];
const CLIPS = [
  { x: 391, y: 0, w: 18.34, h: 48.09 },
  { x: 543, y: 18, w: 18.34, h: 48.09 },
];

export function ProfessionalFront({ onPhotoOpen }) {
  return (
    <Sheet width={WIDTH} height={HEIGHT}>
      <Paper name="paper-professional" {...PAPER} />
      <Picture name="photo-professional-desk" alt="Zaky at work on a laptop" className="professional-desk" style={at(86, 152.22, 118.07, 118.07)} />
      <div className="sheet-ink">
        <Letterhead top={41.06} />
        <Text x={57} y={120.15} font="form" size={16}>{P.title}</Text>
        <Text x={531} y={120.15} size={12} weight={700}>{P.code}</Text>
        <Frame x={57} y={143.18} w={516} h={698.79} />

        <Text x={218} y={152.19} w={331} size={10}><Rich text={P.intro} /></Text>
        <img src={arrowUrl} alt="" className="sheet-piece" style={at(194, 233.29, 82, 38.4)} draggable={false} />
        <Text x={279} y={257.31} size={10}><Rich text={P.caption} /></Text>
        <Rule x={60} y={280.34} length={510} weight={2} dash="1 3" className="is-worn" />

        <div className="professional-missions sheet-type" style={at(86, 293.35, 447)} role="table" aria-label="Operational record">
          <div role="row" className="professional-missions-head">
            {P.missions.columns.map((c) => <div role="columnheader" key={c}>{c}</div>)}
          </div>
          {P.missions.rows.map((row) => (
            <div role="row" key={row.entity} className="professional-missions-row">
              <div role="cell">{row.timeline}</div>
              <div role="cell">{row.entity}{row.place && <><br />{row.place}</>}</div>
              <div role="cell" className="is-justified"><Rich text={row.details} /></div>
            </div>
          ))}
        </div>
        <Rule x={60} y={478.56} length={510} weight={2} dash="1 3" className="is-worn" />
        <Rule x={298} y={478.56} length={259.29} vertical />

        <div className="professional-column sheet-type" style={at(76, 500.59, 197)}>
          <div className="professional-rule sheet-form">{P.loadout.title}</div>
          {P.loadout.groups.map((group, i) => (
            <div key={group.number} className={`professional-loadout professional-loadout-${i + 1}`}>
              <div className="professional-loadout-heading">
                <span>{group.number}</span><span>{group.heading}</span>
              </div>
              {group.items.map((item) => (
                <div key={item.label} className="professional-pair">
                  <strong>{item.label}</strong>
                  <span className="is-justified">{item.text}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="professional-column sheet-type" style={at(326, 500.59, 212)}>
          <div className="professional-rule sheet-form">{P.protocol.title}</div>
          <div className="professional-protocol">
            {P.protocol.items.map((item) => (
              <div key={item.label} className="professional-pair">
                <strong className={item.alert ? 'professional-alert' : undefined}>{item.label}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <div className="professional-rule professional-velocity-title sheet-form">{P.velocity.title}</div>
          <p className="is-justified professional-velocity">{P.velocity.text}</p>
        </div>

        <Rule x={57} y={737.86} length={510} weight={2} dash="1 3" className="is-worn" />
        <FormFooterInk top={812.94} />
        <FormFooterStamps top={812.94} />
      </div>
      <FormFooterQr top={812.94} />
      {PHOTOS.map((p) => (
        <Polaroid key={p.id} {...p} frame={FRAME} onOpen={() => onPhotoOpen?.(p.id)} />
      ))}
      {CLIPS.map((c) => <Piece key={c.x} name="paperclip" {...c} />)}
    </Sheet>
  );
}

export function ProfessionalBack() {
  return (
    <Sheet width={WIDTH} height={HEIGHT}>
      {PHOTOS.map((p) => (
        <PolaroidBack key={p.id} x={mirrorX(WIDTH, p.x, p.size)} y={p.y} size={p.size} rotate={-p.rotate} frame={FRAME} />
      ))}
      <Paper name="paper-professional" {...PAPER} x={mirrorX(WIDTH, PAPER.x, PAPER.w)} mirrored />
      {CLIPS.map((c) => <Piece key={c.x} name="paperclip" {...c} x={mirrorX(WIDTH, c.x, c.w)} flip />)}
    </Sheet>
  );
}
