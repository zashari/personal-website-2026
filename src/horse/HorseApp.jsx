import { useEffect, useRef } from 'react';
import ModeSwitch from '../home/ModeSwitch';
import { useTheme } from '../home/theme';
import { gallop } from './gallop';

// /horse, a test page: the galloping horse (gallop.js) in the middle of the page, with the site's DARK / LIGHT switch
// along the bottom edge; the horse takes the mode's accent.
export default function HorseApp() {
  const [theme, setTheme] = useTheme();
  const canvasRef = useRef(null);
  useEffect(() => gallop(canvasRef.current), []);
  return (
    <>
      <canvas className="horse" ref={canvasRef} role="img" aria-label="A horse galloping, drawn in halftone marks" />
      <div className="horse-mode">
        <ModeSwitch theme={theme} onChange={setTheme} />
      </div>
    </>
  );
}
