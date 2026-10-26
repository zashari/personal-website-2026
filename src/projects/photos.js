// Photos on /projects, by project key (built by scripts/build-projects-assets.mjs from the Figma frames' own images).
import heroThumbAvif from './assets/images/hero-thumb.avif';
import heroThumbWebp from './assets/images/hero-thumb.webp';
import heroAvif from './assets/images/hero-preview.avif';
import heroWebp from './assets/images/hero-preview.webp';
import fraudThumbAvif from './assets/images/fraud-thumb.avif';
import fraudThumbWebp from './assets/images/fraud-thumb.webp';
import fraudAvif from './assets/images/fraud-preview.avif';
import fraudWebp from './assets/images/fraud-preview.webp';
import alzheimerThumbAvif from './assets/images/alzheimer-thumb.avif';
import alzheimerThumbWebp from './assets/images/alzheimer-thumb.webp';
import alzheimerAvif from './assets/images/alzheimer-preview.avif';
import alzheimerWebp from './assets/images/alzheimer-preview.webp';
import arumiThumbAvif from './assets/images/arumi-thumb.avif';
import arumiThumbWebp from './assets/images/arumi-thumb.webp';
import arumiAvif from './assets/images/arumi-preview.avif';
import arumiWebp from './assets/images/arumi-preview.webp';
import deepfakeThumbAvif from './assets/images/deepfake-thumb.avif';
import deepfakeThumbWebp from './assets/images/deepfake-thumb.webp';
import deepfakeAvif from './assets/images/deepfake-preview.avif';
import deepfakeWebp from './assets/images/deepfake-preview.webp';
import gamifiedThumbAvif from './assets/images/gamified-thumb.avif';
import gamifiedThumbWebp from './assets/images/gamified-thumb.webp';
import gamifiedAvif from './assets/images/gamified-preview.avif';
import gamifiedWebp from './assets/images/gamified-preview.webp';
import siteAvif from './assets/images/gamified-site-preview.avif';
import siteWebp from './assets/images/gamified-site-preview.webp';
import standAvif from '../home/assets/images/reel/13.avif';
import standWebp from '../home/assets/images/reel/13.webp';
import cameraAvif from '../home/assets/images/reel/12.avif';
import cameraWebp from '../home/assets/images/reel/12.webp';

// The hero's photo inside its brackets; it grows into the showcase's preview on scroll.
export const HERO_PHOTO = { thumb: { avif: heroThumbAvif, webp: heroThumbWebp }, large: { avif: heroAvif, webp: heroWebp } };

// Each project's photo: thumb on the showcase strip, large on its book's cover and pages.
export const PHOTOS = {
  fraud: { thumb: { avif: fraudThumbAvif, webp: fraudThumbWebp }, large: { avif: fraudAvif, webp: fraudWebp } },
  alzheimer: {
    thumb: { avif: alzheimerThumbAvif, webp: alzheimerThumbWebp },
    large: { avif: alzheimerAvif, webp: alzheimerWebp },
  },
  arumi: { thumb: { avif: arumiThumbAvif, webp: arumiThumbWebp }, large: { avif: arumiAvif, webp: arumiWebp } },
  deepfake: {
    thumb: { avif: deepfakeThumbAvif, webp: deepfakeThumbWebp },
    large: { avif: deepfakeAvif, webp: deepfakeWebp },
  },
  gamified: {
    thumb: { avif: gamifiedThumbAvif, webp: gamifiedThumbWebp },
    large: { avif: gamifiedAvif, webp: gamifiedWebp },
  },
};

// What the showcase's big preview shows for a project: its photo, or a screenshot where there is one.
export const PREVIEWS = {
  ...Object.fromEntries(Object.entries(PHOTOS).map(([key, photo]) => [key, photo.large])),
  gamified: { avif: siteAvif, webp: siteWebp },
};

// The full-bleed photo facing the text on a story spread (Book.jsx).
export const STORY_PHOTOS = {
  arumi: { avif: standAvif, webp: standWebp },
  deepfake: { avif: cameraAvif, webp: cameraWebp },
  gamified: { avif: siteAvif, webp: siteWebp },
};
