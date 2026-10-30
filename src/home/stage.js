import { useLayoutEffect, useState } from 'react';

// The artwork of /home and of the contact section is a Figma frame (1920 x 1080) drawn in Figma px on a stage, which
// useStageLayout scales and places so a focus box of it (one per arrangement: wide follows Figma, tall is for upright
// windows) fills the space under the header.
export const FRAME = { width: 1920, height: 1080 };
// Below this the 20 px Figma text drops under ~11 px, so short screens (a phone on its side) scroll instead.
const MIN_SCALE = 0.55;

// Fits the stage's focus box into the window below the header, centred, and picks the arrangement by the shape of
// that space (or, with bottom, sets it on the bottom edge, so the frame's bottom row stays where /home has it). Width
// always fits; height may not, and then the page grows and scrolls. In the tall arrangement the
// socials sit above the colour-mode switch instead of beside it, so its height is kept clear. Re-runs when the window,
// the header (which wraps on phones and grows as fonts load) or the switch changes size.
export function useStageLayout(headerRef, footerRef, focusOf, { bottom = false } = {}) {
  const [layout, setLayout] = useState(null);
  useLayoutEffect(() => {
    const header = headerRef.current;
    const footer = footerRef.current;
    const update = () => {
      const top = header.offsetTop + header.offsetHeight;
      const width = document.documentElement.clientWidth;
      const variant = width >= window.innerHeight - top ? 'wide' : 'tall';
      const reserved = variant === 'tall' ? footer.offsetHeight : 0;
      const height = Math.max(window.innerHeight - top - reserved, 1);
      const focus = focusOf[variant];
      const scale = Math.min(width / focus.width, Math.max(height / focus.height, MIN_SCALE));
      const spare = Math.max(height - focus.height * scale, 0);
      setLayout({
        variant,
        scale,
        x: (width - focus.width * scale) / 2 - focus.x * scale,
        y: top + (bottom ? spare : spare / 2) - focus.y * scale,
        pageHeight: top + spare + focus.height * scale + reserved,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    observer.observe(footer);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [headerRef, footerRef, focusOf, bottom]);
  return layout;
}
