# 06 · Home: the folder stack

The `home` frame (`1:2`) is 1728 × 1117. Folders are stacked so 004 is at the back (top of the screen) and 001 at the front (bottom). Each `folder-N-fix` group holds a **preview** (papers peeking out) and a **cover** (the folder front with its tab). Full per-layer data: `docs/sheets/home.md`.

| Folder | Cover top (y) | Tab x | Colour | Label | Number / timestamp | On the site |
|---|---|---|---|---|---|---|
| 004 | 132 | 278 | `#61604E` | (hidden name) under a black bar with red "REDACTED" | -001- · 20260101-132303 | **No** |
| 003 | 314 | 105 | `#5B6066` | PROJECTS (tracking 15) | -003- · 20260123-011103 | Yes |
| 002 | 473 | 227 | `#BEB298` | PROFESSIONAL with a red "INFO" overprinted at 70 % | -002- · 20260114-230252 | Yes |
| 001 | 678 | 119 | `#8E8878` | PERSONAL INFO | -001- · 20260101-132303 | Yes |

## Cover construction

- `Rectangle 1`: the folder body, 1728 × 378, solid colour.
- `Rectangle 3`: the tab, a 326 × 61 vector with rounded shoulders, same colour (exported as `exports/svg/folder-tab-shape.svg`).
- `texture`: the paper texture image over both, **Color Burn**.
- Group drop shadow x 2, y −10, blur 14, black 80 % (001, 004) or 50 % (002, 003), so each folder casts a shadow up onto the one behind.
- Tab text: Fira Code SemiBold. Label 30 px `#ECECEC` with tracking 3 (PROJECTS 15); number and timestamp 15 px, `#0B0B0B` on the light folders and `#A0A0A0` on the dark ones. All with Texture r1 n0.3.
- The `folder-N-fix` group adds Noise (0.5, black 25 %) and, for 002–004, a drop shadow x 1, y −4, blur 19, black 100 %.

## Previews (what peeks out of each folder)

- 001: a scaled copy of the personal-info sheet image rotated −86°, the headphones polaroid (personal photo 1, 342², rotated −78°, 10 px frame) and a large paperclip.
- 002: the professional sheet image rotated −90°, and the desk polaroid (professional photo 1, 316², rotated −75°, 5 px frame).
- 003: one image `folder-3-preview-home` (1625 × 541, rotated −86.6°) showing the edges of the project cards.
- 004: three blank papers (`empty-paper-0..2`) with small drop shadows.

## What this means for code

The covers are solid colours, one texture and a tab shape, so they can be CSS (a colour, the shared texture with `mix-blend-mode: color-burn`, a clip-path or SVG for the tab) with the tab text as real text. The previews are composites of existing images and can stay as images, or be assembled from the same sheet and photo assets.
