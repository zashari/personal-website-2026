import { MODES } from './content';
import './mode-switch.css';

// The DARK / LIGHT switch along the bottom edge, shared by /home, /about and /projects: DARK bottom-left, LIGHT
// bottom-right, on the header's side margins. Each page places the bar (mode-switch.css says how); ref lets a page
// measure it to keep its content clear.
export default function ModeSwitch({ theme, onChange, ref }) {
  return (
    <div className="home-mode" ref={ref} role="group" aria-label="Colour mode">
      {MODES.map((mode) => (
        <button
          key={mode.key}
          type="button"
          className="home-mode-option"
          aria-pressed={theme === mode.key}
          onClick={() => onChange(mode.key)}
        >
          <span className="home-mode-label">{mode.label}</span>
          <span className="home-mode-line" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
