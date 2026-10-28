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
import cameraAvif from '../home/assets/images/reel/12.avif';
import cameraWebp from '../home/assets/images/reel/12.webp';

// The clips of the projects' showcase photos, the user's GIFs as videos (scripts/encode-gif-video.mjs), and their first
// frames.
import arumiClip from './assets/media/arumi.mp4';
import arumiClipPoster from './assets/media/arumi-poster.webp';
import fraudClip from './assets/media/fraud.mp4';
import fraudClipPoster from './assets/media/fraud-poster.webp';
import gamifiedClip from './assets/media/gamified.mp4';
import gamifiedClipPoster from './assets/media/gamified-poster.webp';
import deepfakeClip from './assets/media/deepfake.mp4';
import deepfakeClipPoster from './assets/media/deepfake-poster.webp';

// The showcase's resting image (animated), which the hero's photo turns into once it has grown into the preview.
import showcaseRest from './assets/images/me.webp';

export const SHOWCASE_REST = showcaseRest;

// The hero's photo inside its brackets; it grows into the showcase's preview on scroll.
export const HERO_PHOTO = {
  thumb: { avif: heroThumbAvif, webp: heroThumbWebp },
  large: { avif: heroAvif, webp: heroWebp },
};

// Each project's photo: thumb on the showcase strip, large in the showcase's preview and on its book's cover and pages.
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

// Projects whose photo moves on the showcase: the clip plays over the thumbnail while it is pointed at, and over the
// preview while the project is shown there.
export const CLIPS = {
  fraud: { src: fraudClip, poster: fraudClipPoster },
  arumi: { src: arumiClip, poster: arumiClipPoster },
  gamified: { src: gamifiedClip, poster: gamifiedClipPoster },
  deepfake: { src: deepfakeClip, poster: deepfakeClipPoster },
};

// The full-bleed photo facing the text on a story spread (Book.jsx).
export const STORY_PHOTOS = {
  deepfake: { avif: cameraAvif, webp: cameraWebp },
};
