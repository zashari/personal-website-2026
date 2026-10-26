import { useLayoutEffect, useRef } from 'react';
import Book from '../home/Book';
import { BrandLink, NavItem, backIfPrevious } from '../home/Brand';
import { CURRENT, HEADING, HOME, NAV } from './content';

// /projects: the work book from /home on a page of its own, opened by Work in the header. The header stays fixed on
// top while the book turns under it; its height is handed to book.css as --header-h, which keeps the sticky stage
// below it. It changes as fonts load and as the header wraps on phones, so it is measured, not assumed.
function useHeaderHeight(headerRef) {
  useLayoutEffect(() => {
    const header = headerRef.current;
    const root = document.documentElement;
    const update = () => root.style.setProperty('--header-h', `${header.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--header-h');
    };
  }, [headerRef]);
}

export default function ProjectsApp() {
  const headerRef = useRef(null);
  useHeaderHeight(headerRef);
  return (
    <>
      <header className="home-header projects-header" ref={headerRef}>
        <nav className="home-nav" aria-label="Main">
          <div className="home-nav-group">
            <BrandLink href={HOME.href} label={HOME.label} onClick={backIfPrevious} />
          </div>
          <div className="home-nav-group">
            {NAV.map((item) => (
              <NavItem
                key={item.key}
                id={item.key}
                title={item.title}
                label={item.label}
                href={item.href}
                current={item.key === CURRENT}
              />
            ))}
          </div>
        </nav>
      </header>
      <main className="projects">
        <h1 className="home-visually-hidden">{HEADING}</h1>
        <Book />
      </main>
    </>
  );
}
