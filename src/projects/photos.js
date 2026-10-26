// Photos on /projects, by project key: the cover strip of each book (on its open cover and on its front cover in the
// shelf), and the photo facing the text on the story spread. Placeholders from the /home reel and /temp until there
// are project shots.
import gatheringAvif from '../home/assets/images/reel/06.avif';
import gatheringWebp from '../home/assets/images/reel/06.webp';
import sketchAvif from '../home/assets/images/reel/03.avif';
import sketchWebp from '../home/assets/images/reel/03.webp';
import lampAvif from '../home/assets/images/reel/02.avif';
import lampWebp from '../home/assets/images/reel/02.webp';
import cardsAvif from '../home/assets/images/reel/05.avif';
import cardsWebp from '../home/assets/images/reel/05.webp';
import cameraAvif from '../home/assets/images/reel/12.avif';
import cameraWebp from '../home/assets/images/reel/12.webp';
import deskAvif from '../temp/assets/images/photo-professional-desk.avif';
import deskWebp from '../temp/assets/images/photo-professional-desk.webp';
import workAvif from '../temp/assets/images/photo-professional-1.avif';
import workWebp from '../temp/assets/images/photo-professional-1.webp';

export const COVER_PHOTOS = {
  alzheimer: { avif: gatheringAvif, webp: gatheringWebp },
  viewer: { avif: sketchAvif, webp: sketchWebp },
  pipeline: { avif: lampAvif, webp: lampWebp },
  fraud: { avif: cardsAvif, webp: cardsWebp },
  uplink: { avif: cameraAvif, webp: cameraWebp },
};

export const STORY_PHOTOS = {
  viewer: { avif: deskAvif, webp: deskWebp },
  pipeline: { avif: workAvif, webp: workWebp },
};
