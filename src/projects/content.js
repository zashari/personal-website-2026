// Every word on /projects outside the projects themselves (those are in work.js, with each book's words).

export const HEADING = 'Projects by Zaky Ashari';

// The header is only the logotype, leading back home, as on /about.
export const HOME = { label: 'HOME', href: '/home/' };

// The hero, a line per entry: "Things / I've / *( photo ) / Done". Read as one sentence by assistive tech.
export const HERO = { lines: ['THINGS', 'I’VE', 'DONE'], label: 'Things I’ve done' };

// The showcase: the strip of projects (a tab list) and the big preview, which opens the project's book.
export const SHOWCASE = {
  stripLabel: 'Projects',
  open: (title) => `Open the book: ${title}`,
};
