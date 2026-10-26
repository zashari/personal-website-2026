import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Book from './Book';
import Shelf from './Shelf';
import { HomeNav, backIfPrevious } from '../home/Brand';
import ModeSwitch from '../home/ModeSwitch';
import { useTheme } from '../home/theme';
import { CURRENT, HEADING, HOME } from './content';
import { PROJECTS } from './work';

// /projects, opened by Work in the header: a shelf of books, one per project, and a project's book when one is
// chosen. /home's header stays fixed on top and the colour mode switch on the bottom edge; their heights are handed
// to the CSS as --header-h and --footer-h, which keep the shelf's middle and the book's sticky stage clear of both.
// They change as fonts load and as the header wraps on phones, so they are measured, not assumed.
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
// shelf. The shelf's scroll position is kept in its history entry and restored on the way back, with focus on the
// book that was open.
const KEY_OF = Object.fromEntries(Object.entries(PROJECTS).map(([key, p]) => [p.slug, key]));
const MIDDLE = Object.keys(PROJECTS)[Math.floor(Object.keys(PROJECTS).length / 2)];
const bookInUrl = () => KEY_OF[new URLSearchParams(window.location.search).get('p')] ?? null;

// The scroll position that puts a book in the middle of the space between the fixed bars. Computed rather than
// scrollIntoView, which would also move the browser's starting point for Tab to that book.
function middleOf(key) {
  const book = document.querySelector(`[data-project="${key}"]`);
  if (!book) return 0;
  const root = getComputedStyle(document.documentElement);
  const top = parseFloat(root.getPropertyValue('--header-h')) || 0;
  const bottom = window.innerHeight - (parseFloat(root.getPropertyValue('--footer-h')) || 0);
  const rect = book.getBoundingClientRect();
  return window.scrollY + rect.top + rect.height / 2 - (top + bottom) / 2;
}

function useProjectRoute() {
  const [open, setOpen] = useState(bookInUrl);
  const [focusKey, setFocusKey] = useState(null);
  // Where to scroll once the view has rendered: a number, or a project key whose book goes to the middle of the shelf.
  // The shelf opens on its middle book, so books lie both above and below it, as in the prototype.
  const pendingScroll = useRef(bookInUrl() ? 0 : MIDDLE);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    const onPopState = (event) => {
      const key = bookInUrl();
      if (key) {
        pendingScroll.current = 0;
      } else {
        pendingScroll.current = event.state?.shelfY ?? event.state?.last ?? 0;
        setFocusKey(event.state?.last ?? null);
      }
      setOpen(key);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useLayoutEffect(() => {
    const target = pendingScroll.current;
    pendingScroll.current = null;
    if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'instant' });
    else if (target) window.scrollTo({ top: middleOf(target), behavior: 'instant' });
  }, [open]);

  const openBook = (key) => {
    window.history.replaceState({ ...window.history.state, shelfY: window.scrollY, last: key }, '');
    window.history.pushState({ fromShelf: true }, '', `?p=${PROJECTS[key].slug}`);
    pendingScroll.current = 0;
    setOpen(key);
  };
  const closeBook = () => {
    // Opened from the shelf: step back to it. Arrived on the book's own address: go to the shelf as a new entry.
    if (window.history.state?.fromShelf) {
      window.history.back();
      return;
    }
    window.history.pushState({ last: open }, '', window.location.pathname);
    pendingScroll.current = open;
    setFocusKey(open);
    setOpen(null);
  };
  return { open, focusKey, openBook, closeBook };
}

// Choosing a book: the others fall away, the chosen one comes to the middle and is drawn out toward the reader, then
// its book opens in place (book.css fades it in). Closing fades the book before the shelf returns. About 0.7 s in
// all, the length the design skills give an authored focal moment; it runs under reduced motion too, as the owner
// wants (see the Book.jsx header).
function chooseBook(key, done) {
  const chosen = document.querySelector(`[data-project="${key}"]`)?.closest('.shelf-item');
  if (!chosen) {
    done();
    return;
  }
  const rect = chosen.getBoundingClientRect();
  const root = getComputedStyle(document.documentElement);
  const top = parseFloat(root.getPropertyValue('--header-h')) || 0;
  const bottom = window.innerHeight - (parseFloat(root.getPropertyValue('--footer-h')) || 0);
  const others = [...document.querySelectorAll('.shelf-item')].filter((item) => item !== chosen);
  gsap
    .timeline({ onComplete: done })
    .to(others, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0)
    .to(chosen, { y: (top + bottom) / 2 - (rect.top + rect.height / 2), duration: 0.45, ease: 'power3.inOut' }, 0)
    .to(chosen, { scale: 1.12, opacity: 0, duration: 0.25, ease: 'power2.in' }, 0.45);
}

export default function ProjectsApp() {
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  useHeightVar(headerRef, '--header-h');
  useHeightVar(footerRef, '--footer-h');
  const [theme, setTheme] = useTheme();
  const { open, focusKey, openBook, closeBook } = useProjectRoute();
  const [busy, setBusy] = useState(false);

  const onOpen = (key) => {
    if (busy) return;
    setBusy(true);
    chooseBook(key, () => {
      setBusy(false);
      openBook(key);
    });
  };
  const onClose = () => {
    if (busy) return;
    setBusy(true);
    gsap.to('.projects .bk-section', {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        setBusy(false);
        closeBook();
      },
    });
  };

  return (
    <>
      <header className="home-header projects-header" ref={headerRef}>
        <HomeNav current={CURRENT} brand={HOME} onBrandClick={backIfPrevious} />
      </header>
      <main className="projects" data-view={open ? 'book' : 'shelf'}>
        <h1 className="home-visually-hidden">{open ? PROJECTS[open].title : HEADING}</h1>
        {open ? <Book key={open} project={open} onClose={onClose} /> : <Shelf onOpen={onOpen} focusKey={focusKey} />}
      </main>
      <footer className="projects-footer" ref={footerRef}>
        <ModeSwitch theme={theme} onChange={setTheme} />
      </footer>
    </>
  );
}
