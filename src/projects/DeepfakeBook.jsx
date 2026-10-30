// Deepfake Classification Research's book: four spreads drawn in Figma (design/figma/data/deepfake-page-*.svg), each
// drawn as Figma's own SVG with its photos as WebP (scripts/build-book-svg.mjs, svgLayouts in FigmaBook.jsx).
import { SvgIndex, svgLayouts } from './FigmaBook';
import { SPREADS, TEXT } from './assets/books/deepfake/figma';
import { DEEPFAKE_BOOK as D, PROJECTS } from './work';
import './deepfake.css';

export const DEEPFAKE_LAYOUTS = svgLayouts('deepfake', SPREADS);

export function DeepfakeIndex() {
  return <SvgIndex title={PROJECTS.deepfake.title} headings={D.headings} text={TEXT} />;
}
