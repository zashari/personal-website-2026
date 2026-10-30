import { useRef } from 'react';
import { HomeNav } from '../home/Brand';
import ModeSwitch from '../home/ModeSwitch';
import { useTheme } from '../home/theme';
import ContactStage from './ContactStage';

// /contact: the contact section on its own, under /home's header (where "Contact me" leads from every page) and over
// the colour mode switch, as in the Figma frame.
export default function ContactApp() {
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const [theme, setTheme] = useTheme();
  return (
    <main className="home cta-page">
      {/* Header and switch first: the stage measures them as it lays out, after their refs are set. */}
      <header className="home-header" ref={headerRef}>
        <HomeNav />
      </header>
      <ModeSwitch theme={theme} onChange={setTheme} ref={footerRef} />
      <ContactStage headerRef={headerRef} footerRef={footerRef} />
    </main>
  );
}
