# 04 · Colours, strokes and effects

## Palette

| Colour | Where |
|---|---|
| `#252525` | All ink text (typewriter, labels, letterhead) |
| `#000000` | Content box border, dotted separators and underlines, dashed card outlines, one header redaction bar |
| `#131313` | Redaction bars and their brush-stroke ends |
| `#3E3E3E` | Inline redaction scribbles inside table text (6 px brush) and the scribble over the company name on professional-info (5 px) |
| `#891414` | Red ink: "\| APPROVED \|", "[TBD]" / "[CLASSIFIED]" / "[ASSET-LOST]", "PERFORMATIVE WANNABE DETECTED !!", "NOTE:", privacy notes, handwriting on photo backs, folder 004's "REDACTED" |
| `#B10F0F` @ 50 % | "FILE COPY" stamp |
| `#AB0000` | "BANNED" label and the hand-drawn red arrow (2 px) on professional-info |
| `#F0E849` @ 50 % | Highlighter strip behind phone and email (personal-info) |
| `#EDE3C9` | Project card paper |
| `#F2F2F2` | Polaroid frames: inside stroke, 10 px on personal-info and the ASSETS board, 5 px on professional-info and its folder preview |
| `#FFFFFF` | Photo back cards |
| `#848484` | 1 px outside stroke around the three diagonal QR stamps ([TBD], [CLASSIFIED], [ASSET-LOST]) |
| Folders | 001 `#8E8878` (olive grey), 002 `#BEB298` (kraft), 003 `#5B6066` (slate), 004 `#61604E` (olive drab) |
| Folder text | labels `#ECECEC`; numbers/timestamps `#0B0B0B` on 001/002, `#A0A0A0` on 003/004 |
| Home frame | `#ABABAB` (Figma backdrop only; the site uses the navy carbon sheet) |

## Line styles

| Style | Spec | Used for |
|---|---|---|
| Content box | 2 px `#000000`, inside | The bordered form on personal and professional |
| Section separator | 2 px `#000000`, **dash 1 3**, round cap (gives a dotted look) | Horizontal and vertical dividers inside the box |
| Field underline | 1 px `#000000`, **dash 1 3**, round cap | Under every form value and project Title/Date |
| Card outline | 1 px `#000000`, inside, **dash 4 4**, round cap | Project card cut lines |
| Project heading rule | 2 px `#252525`, square cap | Under "AI ENGINEERING" etc. |
| Redaction brush | 6 px `#131313`, round cap, short wobbly vectors | The torn ends of every black bar |
| Inline scribble | 6 px `#3E3E3E` | Hiding a word inside a table cell |

## Effects

Figma's newer **Texture** effect (grainy, eroded edges) is on almost every text layer and line. It is what makes the type look printed rather than digital.

| Effect | Settings | Count | On |
|---|---|---|---|
| Texture | radius 1, noise 0.1 | 169 | Nearly all sheet text, underlines, separators |
| Texture | radius 0.5, noise 0.1 | 8 | Letterhead text |
| Texture | radius 2, noise 0.1 | 6 | Handwriting on photo backs |
| Texture | radius 4, noise 0.1 | 9 | Content box border and section separators (personal, professional) |
| Texture | radius 17, noise 4 | 3 | Blurred QR codes (with Layer blur 4) |
| Texture | radius 1, noise 0.3 | 14 | Folder tab text |
| Texture | radius 1, noise 1 | 1 | "FILE COPY" |
| Drop shadow | x 1, y 2, blur 4, black 25 % | 11 | Project cards |
| Drop shadow | x 0, y 4, blur 4, black 25 % | 3 | Diagonal QR stamps |
| Drop shadow | x 0, y −4, blur 4, black 25 % | 3 | Folder 004 preview papers |
| Drop shadow | x 2, y −10, blur 14, black 50–80 % | 4 | Folder covers (shadow cast upward onto the folder behind) |
| Drop shadow | x 1, y −4, blur 19, black 100 % | 3 | Folder groups 002–004 (001 has none, it sits in front) |
| Noise | size 0.5, density 1, black 25 % | 4 | Whole folder groups 001–004 |
| Layer blur | 4 | 3 | Blurred QR codes |
| Layer blur | 2 | 1 | Web logo |

Blend modes: `texture` layers use **Linear Burn** (paper, cards) or **Color Burn** (folders and the github QR); QR images and one photo use **Darken**.

## Equivalents in code

- Texture effect → an SVG filter per element class: `feTurbulence` (fine noise) driving `feDisplacementMap` (eroded edges) plus a speckle mask (`feComposite in`). One filter definition, reused; radius ≈ displacement scale.
- Noise effect → a small tiled noise PNG or an `feTurbulence` overlay at 25 % multiply.
- Dash 1 3 round cap → SVG line with `stroke-dasharray: 1 3; stroke-linecap: round` (CSS `dotted` borders render differently per browser, so SVG or a `background` gradient matches Figma more exactly).
- Linear / Color Burn → bake at build time, or `mix-blend-mode: color-burn` (exists) and multiply as an approximation of linear burn (which CSS lacks).
