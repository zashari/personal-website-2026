// Alzheimer's Disease Classification's book: four spreads drawn in Figma (design/figma/data/alzheimer-page-*.svg), each
// drawn as Figma's own SVG with its photos as WebP (scripts/build-book-svg.mjs, svgLayouts in FigmaBook.jsx), as its
// grain-textured and glowing lettering needs.
import { SvgIndex, svgLayouts } from './FigmaBook';
import { SPREADS, TEXT } from './assets/books/alzheimer/figma';
import { ALZHEIMER_BOOK as A } from './work';
import './alzheimer.css';

export const ALZHEIMER_LAYOUTS = svgLayouts('alzheimer', SPREADS);

export function AlzheimerIndex() {
  return <SvgIndex title={A.title} headings={A.headings} text={TEXT} />;
}
