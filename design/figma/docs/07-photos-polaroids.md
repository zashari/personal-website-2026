# 07 · Photos and polaroids

Four photos, each a square image with a light frame, clickable on the site to flip and read a handwritten note. Sources: `ASSETS › photos` (`97:2`) and the `photos` group of each sheet. Original uploads are in `exports/images/` (see 08).

## Fronts

| Photo | Original | On the sheet | Frame |
|---|---|---|---|
| personal 2 (crowd) | `personal-paper-photo-2-front-4e9f88fd.jpg` (2.1 MB) | 155² at 384, 1.7, no rotation | 10 px `#F2F2F2` inside stroke |
| personal 1 (headphones) | `personal-paper-photo-1-front-44f62151.jpg` (1.2 MB) | 163² at 450, 45.7, rotated 7.12° | 10 px |
| professional 2 | `professional-paper-photo-2-front-ab6f1d6b.jpg` | 115² at 386, 6, rotated 180° (image upside down then flipped) | 5 px |
| professional 1 (desk, green) | `professional-paper-photo-1-front-94812a94.jpg` | 161.5² at 454, 4.6, rotated 15° | 5 px |
| professional intro photo | `img-6600-2-14defb7a.jpg` | 118² at 86, 152 inside the content box, Darken blend, no frame | — |

The frame is a stroke on the image rectangle, not a separate card: the image fills the whole square and the stroke is drawn inside it. In code that is a `<img>` with `outline`/`box-shadow: inset` or padding plus background; the original photos have no frame baked in.

## Backs (handwritten notes)

Each back is a white 320² card with a 10 px `#F2F2F2` frame and Royal Brand text in `#891414`, Texture r2 n0.1.

| Back | Text | Sizes |
|---|---|---|
| personal 2 | "Location: Train station" · "subject was spotted at a train sta…" · "10/11/2025" | 30 / 20 / 20 |
| personal 1 | "Location: 6.9169° S, 107.6086° E" · "The subject always seems to wear headphones or a headset while commuting from Node A to Node B" · "11/01/2025" | 30 / 18 / 20 |
| professional 2 | "Footage captured via spy glasses …" · "12/01/2025" | 15 / 15 |
| professional 1 | "The subject appears consistently r…" · "11/30/2025" | 15 / 15 |

Full text is in `data/assets.json` (layers under `ASSETS / photos`). The backs are also exported as images: `exports/assets/photo-*-back@4x.png`.

## Paperclip

One PNG (`paperclip-e0ac8cc3.png`, 48 KB) reused everywhere, cropped through the vector's image transform. Personal-info uses it at 62 × 106 rotated 14.86°; professional uses two at 18 × 48 unrotated; the home preview uses it at 209 × 127.

## What this means for code

Photos stay images (they are content). Frames, rotation and placement become CSS; the backs become real text in a handwriting font, so editing a note means editing text.
