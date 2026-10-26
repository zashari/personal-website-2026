import lines from './assets/lines.svg';
import { FRAME, textAt } from './frame';
import './frame-decoration.css';

const NUMBERS = Array.from({ length: 7 }, (_, i) => ({
  label: String(i + 1).padStart(2, '0'),
  ...textAt({ x: 77 + 269 * i, baseline: 1037.09, size: 16, lineHeight: 25 }),
}));

// The frame's decoration, shared by /about and /projects: the hand-drawn lines and the row of numbers 01 to 07 along
// its foot, in Figma px. Render it inside a 1920 x 1080 stage the page places and scales; the dashed line
// (.frame-dash in frame-decoration.css) runs through each page's own middle, so each page places that itself.
export default function FrameDecoration() {
  return (
    <>
      <div className="frame-numbers" aria-hidden="true">
        {NUMBERS.map(({ label, ...box }) => (
          <span key={label} style={box}>
            {label}
          </span>
        ))}
      </div>
      <img className="frame-lines" src={lines} alt="" width={FRAME.width} height={FRAME.height} draggable={false} />
    </>
  );
}
