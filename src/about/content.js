// Every word on /about. Positions live in AboutApp.jsx; change only the text here.
// A link with href: null is clickable but does nothing yet; give it an address when its target exists.

import { NAV as HOME_NAV } from '../home/content';

export const PAGE_TITLE = 'About Zaky Ashari';

export const INTRO =
  "I'm a Computer Science graduate with 3+ years of experience across AI engineering, full-stack development, and " +
  'software architecture. My journey has taken me from building machine learning systems for fraud detection, ' +
  'biometrics, and medical imaging at GDP Labs, to shipping production software at marketbetter.ai, and architecting ' +
  "AI-powered platforms at Ashari Tech. Beyond technology, I've also ventured into entrepreneurship as part of Arumi " +
  "Coffee's founding team, getting hands-on with product development, business operations, and everything in " +
  'between. Different fields, same curiosity: I enjoy solving problems, building things, and turning ideas into reality.';

export const CLIP_LABEL = 'Zaky Ashari standing at the shore at dusk, looking out over the waves';

export const EDUCATION_TITLE = 'EDUCATION';

// Each line is set as written. A word after @ (the city) is set in italics.
export const EDUCATION = [
  { key: 'binus', years: '2017 - 2021', lines: ['SCHOOL OF COMPUTER SCIENCE,', 'BINUS UNIVERSITY @BANDUNG'] },
  { key: 'aws', years: '2023', lines: ['AWS ACADEMY CLOUD FOUNDATION,', 'DICODING'] },
  { key: 'telkom', years: '2017 - 2021', lines: ['COMPUTER AND NETWORK', 'ENGINEERING,TELKOM SCHOOL', '@MAKASSAR'] },
];

export const RESUME = { label: 'Check my resume here', href: '/resume/' };

// The header's logotype leads back home; its small label says so (on /home the same logotype reads ABOUT ME).
export const HOME = { label: 'HOME', href: '/home/' };

// The other header items are /home's, with the same words and destinations.
export const NAV = HOME_NAV;

// The sea plays on arrival. Browsers only allow sound after the visitor has interacted with the site, so a direct
// visit starts it on the first click, tap or key press instead; this switch turns it off and on.
export const SOUND = { on: 'Sound on', off: 'Sound off', label: 'Sound of the waves' };

