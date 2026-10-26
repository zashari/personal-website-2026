import { useEffect, useRef } from 'react';
import { ISSUE, PROJECTS } from './work';
import './shelf.css';

// The /projects shelf: one book per project, lying flat and stacked, seen spine-on. Scrolling moves them through the
// window; the book in the middle is seen square to its spine, the ones above tilt to show their underside and the
// ones below their top cover, and they haze over toward the top and bottom edges (after the user's prototype,
// .tmp/projects-desktop-light.png). Choosing a book opens it (ProjectsApp.jsx).
//
// Each book is a real link (title as text, ?p=slug as its address) holding a CSS 3D box. The tilt is a scroll-driven
// animation on the box (shelf.css), run by the browser off the main thread; where scroll-driven animations are
// missing, useFallbackTilt sets the same transform from script. The edge haze is two fixed bands, so no book is
// blurred while it moves. Research: reports/Book stack project picker.md.

const ORDER = Object.keys(PROJECTS);
const pad = (n) => String(n).padStart(2, '0');
const SUPPORTS_VIEW_TIMELINE = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');

// Keep in step with --tilt in shelf.css: the angle at the window's top and bottom edges.
const MAX_TILT = 54;

function useFallbackTilt(listRef) {
  useEffect(() => {
    if (SUPPORTS_VIEW_TIMELINE) return undefined;
    const boxes = [...listRef.current.querySelectorAll('.shelf-box')];
    let frame = 0;
    const update = () => {
      frame = 0;
      const root = getComputedStyle(document.documentElement);
      const top = parseFloat(root.getPropertyValue('--header-h')) || 0;
      const bottom = window.innerHeight - (parseFloat(root.getPropertyValue('--footer-h')) || 0);
      for (const box of boxes) {
        // The same progress as view(): 0 as the item's top meets the bottom inset, 1 as its bottom leaves the top.
        const item = box.closest('.shelf-item').getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (bottom - item.top) / (bottom - top + item.height)));
        box.style.transform = `perspective(var(--perspective)) rotateX(${((progress * 2 - 1) * MAX_TILT).toFixed(2)}deg)`;
      }
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [listRef]);
}

function Spine({ project }) {
  const p = PROJECTS[project];
  return (
    <span className="shelf-box" aria-hidden="true">
      <span className="shelf-face" data-face="top" />
      <span className="shelf-face" data-face="bottom" />
      <span className="shelf-face shelf-spine" data-face="spine">
        <span className="shelf-label">
          <span className="shelf-title">{p.title}</span>
          <span className="shelf-meta">{p.category}</span>
        </span>
        <span className="shelf-mark">{pad(ORDER.indexOf(project) + 1)}</span>
      </span>
    </span>
  );
}

// onOpen(key) opens a book; focusKey, when set, is the book to give focus to (the one just closed).
export default function Shelf({ onOpen, focusKey }) {
  const listRef = useRef(null);
  useFallbackTilt(listRef);
  useEffect(() => {
    if (!focusKey) return;
    listRef.current.querySelector(`[data-project="${focusKey}"]`)?.focus({ preventScroll: true });
  }, [focusKey]);

  const open = (event, key) => {
    // A modified click (new tab, new window) follows the link as usual.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpen(key);
  };
  // A book reached with the keyboard is brought to the middle, where it is square and sharp.
  const onFocus = (event) => {
    if (event.target.matches(':focus-visible')) event.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  return (
    <nav className="shelf" aria-label={ISSUE.shelfLabel}>
      <ol className="shelf-list" ref={listRef}>
        {ORDER.map((key) => {
          const p = PROJECTS[key];
          return (
            <li key={key} className="shelf-item" style={{ '--book': p.color }}>
              <a
                className="shelf-book"
                href={`?p=${p.slug}`}
                data-project={key}
                onClick={(event) => open(event, key)}
                onFocus={onFocus}
              >
                <span className="home-visually-hidden">
                  {p.title}, {p.category}, {p.date}
                </span>
                <Spine project={key} />
              </a>
            </li>
          );
        })}
      </ol>
      <span className="shelf-haze" data-edge="top" aria-hidden="true" />
      <span className="shelf-haze" data-edge="bottom" aria-hidden="true" />
    </nav>
  );
}
