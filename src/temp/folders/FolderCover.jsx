import { useEffect, useId, useState } from 'react';
import { FOLDER_TABS } from '../content/dossier';
import { image } from '../sheets/primitives';
import { textureUrl } from '../../constants/images';

// A folder cover drawn in SVG from the Figma recipe (design/figma/docs/06-home-folders.md): solid body and
// tab, the shared paper texture in Color Burn, a shadow cast up onto the folder behind, and the tab text
// as real Fira Code. The viewBox matches the old cover images (1728 wide, starting 24 px above the tab)
// so the folder stack in Folder.css lines up exactly as before.

const TAB = 'M20.6518 17.2047C25.6046 6.70155 36.174 0 47.7863 0L278.506 0C293.042 0 305.398 10.467 309.463 24.423C312.046 33.2903 315.451 42.9705 319.608 50.5C321.91 54.6694 326 61 326 61L0 61L20.6518 17.2047Z';
const WIDTH = 1728;
const BODY_TOP = 61;
const BODY_HEIGHT = 378;
const PAD_TOP = 24;
const ASCENT = 0.935; // Fira Code: Figma puts the baseline this far into the line box

// Per folder, from data/home.json (home-frame px, so folder 002 sits 2 px right): body x, tab x, colours, text boxes, the texture crop and shadow strength.
const FOLDERS = {
  1: { x: 0, tab: 119, height: 463, fill: '#8e8878', ink: '#0b0b0b', shadow: 0.8, label: { cx: 282, top: 20, tracking: 3 }, number: { x: 354, top: 5 }, stamp: { x: 165, top: 5 }, crop: [0.1254, 0.0003] },
  2: { x: 2, tab: 227, height: 467, fill: '#beb298', ink: '#0b0b0b', shadow: 0.5, label: { cx: 389.5, top: 22, tracking: 3 }, overprint: { cx: 390, top: 36 }, number: { x: 462, top: 7 }, stamp: { x: 273, top: 7 }, crop: [0.0635, 0.6211] },
  3: { x: 0, tab: 105, height: 467, fill: '#5b6066', ink: '#a0a0a0', shadow: 0.5, label: { cx: 268.5, top: 22, tracking: 15 }, number: { x: 340, top: 7 }, stamp: { x: 151, top: 7 }, crop: [0.1437, 0.281] },
};

// The texture fill shows 82 % × 26 % of the photo (Figma image transform), offset per folder.
const TEXTURE_SCALE = [0.8205, 0.2605];

export default function FolderCover({ folderNumber, onLoad }) {
  const id = useId();
  const f = FOLDERS[folderNumber];
  const tab = FOLDER_TABS[folderNumber];
  // An SVG <image> has no <picture>-style fallback, so pick AVIF or WebP the way the WebGL loader does.
  const [textureSrc, setTextureSrc] = useState(null);
  useEffect(() => {
    textureUrl(image('folder-texture')).then(setTextureSrc);
  }, []);
  const texW = WIDTH / TEXTURE_SCALE[0];
  const texH = (BODY_TOP + BODY_HEIGHT) / TEXTURE_SCALE[1];
  const shape = `M${f.x} ${BODY_TOP}h${WIDTH}v${BODY_HEIGHT}h${-WIDTH}Z`;

  return (
    <svg className="folder-cover folder-cover-svg" viewBox={`0 ${-PAD_TOP} ${WIDTH} ${f.height}`} role="img" aria-label={`${tab.label}${tab.overprint ? ` ${tab.overprint}` : ''} ${tab.number}`}>
      <defs>
        <clipPath id={`${id}-shape`}>
          <path d={shape} />
          <path d={TAB} transform={`translate(${f.tab} 0)`} />
        </clipPath>
        <filter id={`${id}-shadow`} x="-5%" y="-20%" width="110%" height="130%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`${id}-print`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="1.2" />
        </filter>
      </defs>
      <g>
        {/* Figma's drop shadow (x 2, y −10, blur 14) as its own blurred silhouette under the cover. Safari
            loses the texture's Color Burn when the blended group itself carries a filter. */}
        <g filter={`url(#${id}-shadow)`} transform="translate(2 -10)" fill="#000" fillOpacity={f.shadow}>
          <path d={shape} />
          <path d={TAB} transform={`translate(${f.tab} 0)`} />
        </g>
        <g clipPath={`url(#${id}-shape)`}>
          <rect x={f.x} y="0" width={WIDTH} height={BODY_TOP + BODY_HEIGHT} fill={f.fill} />
          <image
            href={textureSrc ?? undefined}
            x={f.x - f.crop[0] * texW}
            y={-f.crop[1] * texH}
            width={texW}
            height={texH}
            preserveAspectRatio="none"
            style={{ mixBlendMode: 'color-burn' }}
            onLoad={onLoad}
            onError={onLoad}
          />
        </g>
        <g className="folder-tab-text" filter={`url(#${id}-print)`}>
          <text x={f.stamp.x} y={f.stamp.top + 15 * ASCENT} fontSize="15" fill={f.ink}>{tab.stamp}</text>
          <text x={f.number.x} y={f.number.top + 15 * ASCENT} fontSize="15" fill={f.ink}>{tab.number}</text>
          <text x={f.label.cx} y={f.label.top + 30 * ASCENT} fontSize="30" fill="#ececec" textAnchor="middle" letterSpacing={f.label.tracking}>{tab.label}</text>
          {tab.overprint && (
            <text x={f.overprint.cx} y={f.overprint.top + 25 * ASCENT} fontSize="25" fill="#891414" fillOpacity="0.7" textAnchor="middle" letterSpacing="2.5">{tab.overprint}</text>
          )}
        </g>
      </g>
    </svg>
  );
}
