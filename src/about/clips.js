// The photo on /about is a short silent loop, and two versions of it exist. To switch, change CLIP below.
// To compare them without changing code, open the page with ?clip=gif or ?clip=sequence.
// Both are made by scripts/encode-about-video.mjs; only the one shown is downloaded by visitors.
import gifSrc from './assets/media/wave-gif.mp4';
import gifPoster from './assets/media/wave-gif-poster.webp';
import sequenceSrc from './assets/media/wave-sequence.mp4';
import sequencePoster from './assets/media/wave-sequence-poster.webp';

export const CLIPS = {
  // The image sequence: every 5th frame, each held 0.2 s (stop motion). 5.6 s loop, 2.3 MB.
  sequence: { src: sequenceSrc, poster: sequencePoster },
  // The original GIF: all 200 frames at their own 50 fps (smooth). 4 s loop, 1.5 MB.
  gif: { src: gifSrc, poster: gifPoster },
};

export const CLIP = 'gif';

export function currentClip() {
  const asked = new URLSearchParams(window.location.search).get('clip');
  return Object.hasOwn(CLIPS, asked) ? CLIPS[asked] : CLIPS[CLIP];
}
