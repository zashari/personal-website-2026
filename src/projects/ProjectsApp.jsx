import { useLayoutEffect, useRef } from 'react';
import Book from './Book';
import { HomeNav, backIfPrevious } from '../home/Brand';
import ModeSwitch from '../home/ModeSwitch';
import { useTheme } from '../home/theme';
import { CURRENT, HEADING, HOME } from './content';

// /projects: the work book, opened by Work in the header. /home's header stays fixed on top and the colour mode
// switch on the bottom edge while the book turns between them; their heights are handed to book.css as --header-h
// and --footer-h, which keep the sticky stage clear of both. They change as fonts load and as the header wraps on
// phones, so they are measured, not assumed.
function useHeightVar(ref, name) {
  useLayoutEffect(() => {
    const element = ref.current;
    const root = document.documentElement;
    const update = () => root.style.setProperty(name, `${element.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty(name);
    };
  }, [ref, name]);
}

export default function ProjectsApp() {
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  useHeightVar(headerRef, '--header-h');
  useHeightVar(footerRef, '--footer-h');
  const [theme, setTheme] = useTheme();
  return (
    <>
      <header className="home-header projects-header" ref={headerRef}>
        <HomeNav current={CURRENT} brand={HOME} onBrandClick={backIfPrevious} />
      </header>
      <main className="projects">
        <h1 className="home-visually-hidden">{HEADING}</h1>
        <Book />
      </main>
      <footer className="projects-footer" ref={footerRef}>
        <ModeSwitch theme={theme} onChange={setTheme} />
      </footer>
    </>
  );
}
