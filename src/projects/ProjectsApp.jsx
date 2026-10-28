import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Book from './Book';
import Showcase, { showcaseScrollTop } from './Showcase';
import { BrandLink, backIfPrevious } from '../home/Brand';
import ModeSwitch from '../home/ModeSwitch';
import { useTheme } from '../home/theme';
import { HEADING, HOME } from './content';
import { PROJECTS } from './work';

// /projects, opened by Work in the header: the hero and the showcase of projects (Showcase.jsx), and a project's book
// when one is chosen. The logotype header stays fixed on top and the colour mode switch on the bottom edge; their
// heights are handed to the CSS as --header-h and --footer-h, which keep the book's sticky stage clear of both. They
// change as fonts load and as the header wraps on phones, so they are measured, not assumed.
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

// The open book lives in the address (?p=slug), so a project can be linked to and the browser's Back returns to the
// showcase. The showcase's scroll position is kept in its history entry and restored on the way back, with focus on
// the project that was open.
const KEY_OF = Object.fromEntries(Object.entries(PROJECTS).map(([key, p]) => [p.slug, key]));
const bookInUrl = () => KEY_OF[new URLSearchParams(window.location.search).get('p')] ?? null;

// The showcase's place on the scroll, half way down the scenes (Showcase.jsx); the stage is laid out a frame or two
// after the view mounts, so this waits for it. Narrow windows have no scenes, and their projects end the page.
function scrollToShowcase(tries = 10) {
  const top = showcaseScrollTop();
  if (top !== null) window.scrollTo({ top, behavior: 'instant' });
  else if (tries > 0) requestAnimationFrame(() => scrollToShowcase(tries - 1));
  else window.scrollTo({ top: document.documentElement.scrollHeight - window.innerHeight, behavior: 'instant' });
}

// Once the showcase has rendered: put focus back on the project that was open, without scrolling to it.
function focusProject(key) {
  requestAnimationFrame(() => document.querySelector(`[data-project="${key}"]`)?.focus({ preventScroll: true }));
}

function useProjectRoute(onReturn) {
  const [open, setOpen] = useState(bookInUrl);
  // Where to scroll once the view has rendered: a number, or 'showcase' for the showcase's place on the scroll.
  const pendingScroll = useRef(0);
  const back = useRef(null);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    const onPopState = (event) => {
      const key = bookInUrl();
      pendingScroll.current = key ? 0 : (event.state?.listY ?? 'showcase');
      back.current = key ? null : (event.state?.last ?? null);
      setOpen(key);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useLayoutEffect(() => {
    const target = pendingScroll.current;
    pendingScroll.current = null;
    if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'instant' });
    else if (target === 'showcase') scrollToShowcase();
    if (!open && back.current) {
      onReturn(back.current);
      focusProject(back.current);
      back.current = null;
    }
  }, [open, onReturn]);

  const openBook = (key) => {
    window.history.replaceState({ ...window.history.state, listY: window.scrollY, last: key }, '');
    window.history.pushState({ fromShowcase: true }, '', `?p=${PROJECTS[key].slug}`);
    pendingScroll.current = 0;
    setOpen(key);
  };
  const closeBook = () => {
    // Opened from the showcase: step back to it. Arrived on the book's own address: go to the showcase as a new entry.
    if (window.history.state?.fromShowcase) {
      window.history.back();
      return;
    }
    window.history.pushState({ last: open }, '', window.location.pathname);
    pendingScroll.current = 'showcase';
    back.current = open;
    setOpen(null);
  };
  return { open, openBook, closeBook };
}

// Opening or closing fades the way out (0.3 s) before the next view fades in (projects.css); it runs under reduced
// motion too, as the owner wants.
function fadeOut(selector, done) {
  const view = document.querySelector(selector);
  if (!view) {
    done();
    return;
  }
  gsap.to(view, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: done });
}

export default function ProjectsApp() {
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  useHeightVar(headerRef, '--header-h');
  useHeightVar(footerRef, '--footer-h');
  const [theme, setTheme] = useTheme();
  // The project the showcase's preview rests on; none at first, so it keeps the hero's photo.
  const [selected, setSelected] = useState(bookInUrl);
  const { open, openBook, closeBook } = useProjectRoute(setSelected);
  const [busy, setBusy] = useState(false);

  const onOpen = (key) => {
    if (busy) return;
    setBusy(true);
    setSelected(key);
    fadeOut('.projects .pj', () => {
      setBusy(false);
      openBook(key);
    });
  };
  const onClose = () => {
    if (busy) return;
    setBusy(true);
    fadeOut('.projects .bk-section', () => {
      setBusy(false);
      closeBook();
    });
  };

  return (
    <>
      <header className="home-header projects-header" ref={headerRef}>
        {/* In the nav's row, as on /about, so the link is only as wide as the logotype: on its own it would stretch
            across the header, over the showcase's strip. */}
        <nav className="home-nav" aria-label="Main">
          <div className="home-nav-group">
            <BrandLink href={HOME.href} label={HOME.label} onClick={backIfPrevious} />
          </div>
        </nav>
      </header>
      <main className="projects" data-view={open ? 'book' : 'showcase'}>
        <h1 className="home-visually-hidden">{open ? PROJECTS[open].title : HEADING}</h1>
        {open ? (
          <Book key={open} project={open} onClose={onClose} />
        ) : (
          <Showcase selected={selected} onSelect={setSelected} onOpen={onOpen} />
        )}
      </main>
      <footer className="projects-footer" ref={footerRef}>
        <ModeSwitch theme={theme} onChange={setTheme} />
      </footer>
    </>
  );
}
