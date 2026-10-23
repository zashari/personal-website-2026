// SVG filters the sheets reference with filter: url(#…). Rendered once per page.
//  dossier-rough: wobbles an edge a little (felt-tip redaction bars).
//  dossier-stamp: rubber-stamp ink, a warped outline with speckled gaps where the ink didn't take.
//  dossier-worn: frays printed rules and borders (Figma's Texture effect, radius 4).
//  dossier-scramble: the unreadable QR codes (Figma: layer blur 4 + Texture radius 17).
export default function InkFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id="dossier-rough" x="-5%" y="-20%" width="110%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="8" />
        <feDisplacementMap in="SourceGraphic" scale="2.5" />
      </filter>
      <filter id="dossier-stamp" x="-5%" y="-10%" width="110%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="2" result="warp" />
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="2" result="warped" />
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="5" result="speckle" />
        <feColorMatrix in="speckle" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1.75" result="holes" />
        <feComposite in="warped" in2="holes" operator="in" />
      </filter>
      <filter id="dossier-worn" x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="1" seed="11" result="grain" />
        <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.6" result="frayed" />
        <feGaussianBlur in="frayed" stdDeviation="0.35" />
      </filter>
      <filter id="dossier-scramble" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="2" seed="4" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" result="warped" />
        <feGaussianBlur in="warped" stdDeviation="3.2" />
      </filter>
    </svg>
  );
}
