import { PHOTO_NOTES } from '../content/dossier';
import { Sheet, Text, u } from './primitives';

// The back of a polaroid as a 320 × 320 card with the handwritten note in Royal Brand, red ink.
// Positions from design/figma/docs/sheets/assets-board.md (ASSETS › photos › *-back).
const SIZE = 320;
const FRAME = 10;

const LAYOUT = {
  personal1: { location: [23, 20, 268, 30], detailSize: 15, note: [23, 133, 258, 18], date: [206, 269, 20] },
  personal2: { location: [23, 20, 254, 30], note: [23, 181, 266, 20], date: [206, 269, 20] },
  professional1: { note: [28, 33, 264, 15], date: [121, 261, 15] },
  professional2: { note: [28, 88, 264, 15], date: [28, 267, 15] },
};

export default function PhotoBack({ id }) {
  const text = PHOTO_NOTES[id];
  const layout = LAYOUT[id];
  return (
    <Sheet width={SIZE} height={SIZE} className="photo-back">
      <div className="photo-back-card" style={{ borderWidth: u(FRAME) }} />
      <div className="photo-back-ink">
        {layout.location && (
          <Text x={layout.location[0]} y={layout.location[1]} w={layout.location[2]} font="hand" size={layout.location[3]}>
            {text.location}
            {text.locationDetail && <span style={{ fontSize: u(layout.detailSize) }}> {text.locationDetail}</span>}
          </Text>
        )}
        <Text x={layout.note[0]} y={layout.note[1]} w={layout.note[2]} font="hand" size={layout.note[3]}>{text.note}</Text>
        <Text x={layout.date[0]} y={layout.date[1]} font="hand" size={layout.date[2]}>{text.date}</Text>
      </div>
    </Sheet>
  );
}

// Plain-text version for screen readers and the dialog label.
export const photoNoteText = (id) => {
  const t = PHOTO_NOTES[id];
  return [t.location, t.locationDetail, t.note.replace(/\n/g, ' '), t.date].filter(Boolean).join(' ');
};
