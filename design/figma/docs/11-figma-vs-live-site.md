# 11 · Figma vs the live site

Compared on 2026-10-23: Figma file version `2413464093192304879` against the PNG masters in `design/source` (which the site encodes to AVIF/WebP) and the site code on `main`.

## The sheets match

Each 1× Figma render was compared with its 4× master scaled down to the same size:

| Sheet side | Mean difference (0–255) | Pixels off by more than 40 |
|---|---|---|
| personal-info front / back | 5.7 / 4.6 | 1.3 % / 0.2 % |
| professional-info front / back | 5.9 / 3.9 | 1.7 % / 0.3 % |
| projects-page-1 front / back | 8.3 / 3.7 | 4.7 % / 0.2 % |
| projects-page-2 front / back | 7.7 / 3.6 | 3.5 % / 0.1 % |

A side-by-side of projects page 1 shows the same content and layout. The masters are slightly darker and more contrasty, which accounts for the higher numbers on the text-heavy projects pages: Figma's Texture effect is randomised per render, and the masters were exported at 4× where the grain renders differently. No content differs.

## Differences worth knowing

| Topic | Figma | Live site |
|---|---|---|
| Folder 004 | Exists (hidden-name folder, olive drab) | Not shipped; three folders |
| Fonts | JMH Typewriter **Regular, Bold and Black**; Times New Normal; David Libre; Fira Code; Royal Brand | Self-hosts only JMH Typewriter 400 and 700 (ASCII subset). Black 900 ("FILE COPY", "\| APPROVED \|", "[01]") and the other four families exist only inside the images |
| Clickable areas | Exact layer positions (e.g. personal photo 2 at x 384 of 613 = 62.6 %, photo 1 at 450 = 73.4 %, phone value at 163, 230) | Hand-tuned percentages in `src/App.jsx` (`left: '62.5%'`, `'75%'`, `top: '26.5%'` …) that approximate them |
| Title text | "OFFICIAL RECORD: HIGHLIGTED PROJECTS" (typo) | Same typo, baked into the image |
| Phone layout | A copy of desktop | CSS widens the folders on small screens |
| Background | Grey `#ABABAB` home frame, navy `#141828` behind sheets | Navy carbon-sheet canvas (`CarbonSheet.jsx`) |
| Folder covers | Solid colour + texture + tab, text as Fira Code | One 3456 px image per cover with the text baked in |

## Practical consequence

The Figma file is a faithful, current source for the site. A code rebuild can take positions, sizes, colours and fonts from `data/` directly instead of measuring the PNGs, and the clickable areas become exact because links would be real text.
