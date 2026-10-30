// Every word on /home. Positions live in HomeApp.jsx; change only the text here.
// A link with href: null is clickable but does nothing yet; give it an address when its page exists.

export const BRAND = { label: 'ABOUT ME', href: '/about/' };

export const NAV = [
  { key: 'work', title: 'Work', label: 'MY PROJECTS', href: '/projects/' },
  { key: 'workflow', title: 'Workflow', label: 'THE PROCESS', href: null },
  { key: 'contact', title: 'Contact me', label: 'FOR ANY PROJECTS', href: '/contact/' },
];

export const NAME = { first: 'Zaky', last: 'Ashari' };

export const ROLES = ['AI/ML Engineer', 'Software Engineer', 'Business'];

export const SOCIALS = [
  { key: 'tiktok', label: 'Tiktok', href: 'https://www.tiktok.com/@jatbzoss' },
  { key: 'github', label: 'Github', href: 'https://github.com/zashari' },
  { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/a.zakyashari' },
];

// Colour mode switch at the bottom: first option sits bottom-left, second bottom-right.
export const MODES = [
  { key: 'dark', label: 'DARK' },
  { key: 'light', label: 'LIGHT' },
];

// The small tilted note beside the photo, next to the sparkle.
export const TOUCH_LABEL = 'TOUCH ME';

export const PHOTO_ALT = 'Zaky Ashari walking away from the arumi coffee stand at night';
