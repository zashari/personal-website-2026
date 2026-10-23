# 02 · How the paper is built

Every sheet, front and back, is built from the same two photographs. Only their rotation and the side of the punched holes change.

## Layers, bottom to top

1. **Base paper**: an `Intersect` boolean, 595 × 841 (A4 in points), filled with one image (`ebdf8584`, exported as `exports/images/intersect-ebdf8584.jpg`, 11.7 MB original) at scale mode *Fill*. It carries a Figma image filter **temperature +0.46**, which is what makes the paper warm.
2. **Punched holes**: the boolean subtracts **20 circles, ⌀23 px, every ~44.1 px** down one edge. The hole centres sit at x = 15 + 11.5 on fronts (left edge) and at x ≈ 575–607 on backs (right edge, because the back is the mirror). The first hole starts near the top edge (y ≈ 14.7 on personal-info, ≈ −4.2 on the projects pages, so the top hole is cut off there).
3. **Texture**: a `texture` rectangle, 595 × 843, with a second image (`2fa3789c`, `exports/images/texture-2fa3789c.jpg`, 7.1 MB), blend mode **Linear Burn**, opacity 100 %. It is **rotated +90° (clockwise) on personal-info and −90° on professional-info and both projects pages**. That rotation is why the personal-info back matches its front exactly once mirrored, while the other sheets only roughly match.

The ASSETS board has the same stack as `empty-paper` (`68:234`), exported as `exports/assets/empty-paper@4x.png` (2380 × 3372). The same base without the texture is `empty-paper-base@4x.png`.

## Per sheet

| Sheet | Paper box (x, y, w × h) | Holes on | Texture rotation |
|---|---|---|---|
| personal-info front | 0, 17.7, 595 × 842 | left, x 15 | +90° |
| personal-info back | 18, 18, 595 × 841 | right, x 575 | +90° |
| professional-info front | 0, 24, 595 × 841 | left, x 15 | −90° |
| professional-info back | 20.5, 25, 595 × 841 | right, x 577.5 | −90° |
| projects-page-1 / 2 front | 0, 0, 595 × 841 | left, x 15 | −90° |
| projects-page-1 / 2 back | 50, 0, 595 × 841 | right, x 607 | −90° |

The space above or beside the paper inside each sheet's bounding box is where the polaroids, paperclips and project cards stick out past the edge; on the site that area shows the navy background.

## Project cards (projects pages)

Each card (`project-N`) is a strip of a different paper pasted on the sheet:

- `CONTAINER › Rectangle 17`: solid **#EDE3C9**, 580 × 236, extending 50 px past the sheet's right edge.
- `CONTAINER › texture`: the same texture image, rotated 180°, **Linear Burn**.
- Group drop shadow: x 1, y 2, blur 4, black at 25 %.
- `Rectangle 18`: an outline 513 × 237, 1 px black, inside, **dashes 4 4**, round caps. It is the cut line on the sheet and does not follow the card's overhang.
- Two `stapler` images (`67cd4af0`, a 41 KB PNG) at the card's left end, rotated (30° / 150° on card 1, 90° and 120° on the others; clockwise-positive).

The empty third slot on page 2 is only the dashed outline with "[submit project here]" in Times New Normal 14.

## What this means for code

- One base image and one texture image serve all eight sheet sides. The fronts differ only by texture rotation (+90° or −90°) and where the holes are cut, so the site needs at most two paper images, and the back can be the front mirrored in CSS.
- CSS has no Linear Burn blend mode. Either composite the two images once at build time (simplest, exact) or approximate with `mix-blend-mode: multiply` / `color-burn`.
- The holes are a mask: a repeating radial gradient on `mask-image`, 20 holes, ⌀23 at 44.1 spacing, or a boolean-cut PNG with alpha as today.
