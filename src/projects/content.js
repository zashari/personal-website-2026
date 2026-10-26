// Every word on /projects outside the book. The book's own words (projects, spreads, captions) are in
// src/home/work.js, shared with the book on /home.

import { NAV as HOME_NAV } from '../home/content';

export const HEADING = 'Projects by Zaky Ashari';

// The header's logotype leads back home; its small label says so (on /home the same logotype reads ABOUT ME).
export const HOME = { label: 'HOME', href: '/home/' };

// The other header items are /home's; Work is this page, so it shows as the current one.
export const NAV = HOME_NAV;
export const CURRENT = 'work';
