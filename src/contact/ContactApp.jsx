import { useRef } from 'react';
import { backIfPrevious, HomeNav } from '../home/Brand';
import ModeSwitch from '../home/ModeSwitch';
import { useTheme } from '../home/theme';
import ContactStage from './ContactStage';
import { HOME } from './content';

const BRAND = { ...HOME, onClick: backIfPrevious };

// /contact: the contact section on its own, under /home's header (where "Contact me" leads from every page; its
// logotype leads home, HOME) and over the colour mode switch, as in the Figma frame.
export default function ContactApp() {
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const [theme, setTheme] = useTheme();
  return (
    <main className="home cta-page">
      {/* Header and switch first: the stage measures them as it lays out, after their refs are set. */}
      <header className="home-header" ref={headerRef}>
        <HomeNav brand={BRAND} />
      </header>
      <ModeSwitch theme={theme} onChange={setTheme} ref={footerRef} />
      <ContactStage headerRef={headerRef} footerRef={footerRef} />
    </main>
  );
}
