# 12 · Rebuild mapping: Figma feature → code

How each thing in the Figma file would become code if the sheets are rebuilt as HTML/CSS (the plan discussed on 2026-10-23: real text over image paper, CSS 3D viewer instead of WebGL). Nothing here has been implemented.

## Units

Every sheet is 595 × 841 (A4 in points) plus overhang. Express everything in sheet units so the sheet scales as one piece: a container query on the sheet and `--u: calc(100cqw / 613)` (personal-info width), then `font-size: calc(16 * var(--u))` for a 16 px Figma size. The positions in `data/` map 1:1.

## Mapping

| Figma | Code |
|---|---|
| `Intersect` paper + `texture` (Linear Burn) | One pre-composited paper image per texture rotation (2 variants cover all sheets), AVIF at ~2400 px. Back = same image, `transform: scaleX(-1)` |
| 20 punched holes | `mask-image` with a repeating radial gradient (⌀23 at 44.1 spacing) or keep the holes in the paper image's alpha |
| Content box, 2 px inside stroke, Texture r4 | `border: calc(2 * var(--u)) solid #000` plus the shared rough-edge SVG filter |
| Separator, 2 px dash 1 3 round | inline SVG line with `stroke-dasharray` (exact) |
| Field underline, 1 px dash 1 3 | SVG line or `background-image` dots under each value |
| Card outline, 1 px dash 4 4 | `border: 1px dashed` (close) or SVG rect (exact) |
| Text, Texture r1 n0.1 | `mix-blend-mode: multiply` on the ink layer plus one `feTurbulence` / `feDisplacementMap` filter |
| "FILE COPY", "\| APPROVED \|", QR stamps | Real text in JMH Typewriter Black/Bold with the stamp filter; QR stamps `rotate(-45deg)`, 1 px `#848484` text stroke, drop shadow 0 4 4 |
| Redaction bars + brush ends | An empty `<span class="redact" aria-label="redacted">` with width from `textLength`, black, rough-edge filter or a small SVG cap at each end. See 09 |
| Highlighter (`#F0E849` 50 %) | Background on the contact row with an irregular `border-radius` and multiply |
| Red arrow | Inline SVG from `exports/svg/red-arrow.svg` (3 KB) |
| Polaroids (image + 5/10 px `#F2F2F2` inside stroke) | `<img>` with padding/background frame, rotation from `data/`, flip to a back card with Royal Brand (or substitute) text |
| Paperclip, stapler, ISP-DIV seal | Keep as small PNG/AVIF images (48 KB, 41 KB, 295 KB originals) |
| QR codes (`github`, `qr`) | Keep the images, or regenerate as SVG at build time from the target URL (needs the URLs; not in Figma) |
| Blurred QR (Layer blur 4 + Texture r17) | `filter: blur()` on the QR plus the stamp |
| Project card (`#EDE3C9` + texture, shadow 1 2 4 25 %) | `exports/assets/project-card@4x.png` as background, or cream colour + shared texture with multiply; `box-shadow` |
| Mixed-style text runs | `<strong>` / `<span class="red">` inside the paragraph, generated from `runs` |
| Folder covers | Solid colour + texture (`color-burn`) + tab shape (`clip-path` from `folder-tab-shape.svg`) + Fira Code label |
| Folder 004 | Skip unless it should go live |

## Fonts to self-host

JMH Typewriter 400/700/900, Times New Normal 400, David Libre 400 (OFL), Fira Code 600 (OFL), Royal Brand 400. Three of them are "all rights reserved" (see 03-typography.md); clear the licences or swap before publishing them as web fonts.

## Open questions

1. Font licences for JMH Typewriter, Times New Normal and Royal Brand.
2. The QR codes' target URLs, if they should be generated instead of kept as images.
3. Whether to fix the "HIGHLIGTED" typo.
4. Whether folder 004 is meant to ship.
5. Whether to keep one combined paper image (exact) or rebuild the Linear Burn texture in CSS (smaller, approximate).
