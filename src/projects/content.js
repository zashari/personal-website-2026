// Every word on /projects outside the projects themselves (those are in work.js, with each book's words).

export const HEADING = 'Projects by Zaky Ashari';

// The header is only the logotype, leading back home, as on /about.
export const HOME = { label: 'HOME', href: '/home/' };

// The hero, a line per entry: "Things / I've / *( photo ) / Done". Read as one sentence by assistive tech.
export const HERO = { lines: ['THINGS', 'I’VE', 'DONE'], label: 'Things I’ve done' };

// The third scene, after the showcase: a pointer to the rest of the work on Github, and the socials from /home.
export const GITHUB = {
  // Line by line as the Figma frame breaks it; "Github" and "!!" are set apart in the accent.
  lines: ['Please visit my', 'profile to discover all of my', 'projects'],
  link: { label: 'Github', href: 'https://github.com/zashari' },
  bang: '!!',
  label: 'Please visit my Github profile to discover all of my projects!',
};

// The showcase: the strip of projects (a tab list) and the big preview, which opens the project's book.
export const SHOWCASE = {
  stripLabel: 'Projects',
  open: (title) => `Open the book: ${title}`,
  // Beside the asterisk while a project is in the preview: the preview opens its book.
  hint: 'Click here for project detail',
};
