# 08 · Assets and exports

Everything under `exports/` was downloaded by `scripts/export.mjs` on 2026-10-23. The folder is git-ignored (about 100 MB); run the script to re-create it.

## exports/images: the original uploads (`manifest.json` lists every layer that uses each)

| File | Size | Used by |
|---|---|---|
| `intersect-ebdf8584.jpg` | 2730 × 4096, 11.4 MB | Base paper of every sheet side and `empty-paper` |
| `texture-2fa3789c.jpg` | 4096 × 3277, 6.9 MB | Texture over every sheet, project card and folder cover |
| `personal-paper-photo-2-front-4e9f88fd.jpg` | 1792², 2.1 MB | Personal photo 2 (crowd) |
| `personal-paper-photo-1-front-44f62151.jpg` | 1317², 1.2 MB | Personal photo 1 (headphones), folder 001 preview |
| `professional-paper-photo-2-front-ab6f1d6b.jpg` | 1600², 451 KB | Professional photo 2 |
| `professional-paper-photo-1-front-94812a94.jpg` | 1600², 567 KB | Professional photo 1 (desk), folder 002 preview |
| `img-6600-2-14defb7a.jpg` | 1600², 592 KB | Professional intro photo inside the content box |
| `paperclip-e0ac8cc3.png` | 483 × 517, 48 KB | Every paperclip |
| `stapler-67cd4af0.png` | 612 × 353, 41 KB | Staples on project cards |
| `github-3372f968.png` | 1024², 13 KB | The footer QR on personal and professional |
| `qr-b0fc8707.png`, `qr-21df3e55.png` | 500², 11 KB each | Project QR codes (one shared by several cards) |
| `image-removebg-preview-1-35bc4224.png` | 522 × 478, 295 KB | ISP-DIV seal on the projects header |
| `gemini-generated-image-…-faa07678.png` | 2816 × 1536, 5.3 MB | Web logo (ASSETS board) |
| `paper-personal-info-1-339ef950.png`, `paper-professional-info-1-5829b694.png`, `folder-3-preview-home-5f581924.png`, `empty-paper-2-4f180512.png` | ~600 × 860, ~1 MB each | Flattened sheet images used only inside the folder previews |
| `download-*.jpg`, `target-dossier-*.jpg`, `superficie-*.jpg` | small | REFERENCES mood board |

## exports/assets: rendered pieces for a code rebuild

| File | Size | What |
|---|---|---|
| `empty-paper@4x.png` | 2380 × 3372 | Blank sheet: base paper + holes + Linear Burn texture, ready to put text on |
| `empty-paper-base@4x.png` | 2380 × 3368 | The same without the texture layer |
| `project-card@4x.png` | 2320 × 945 | The card paper only: #EDE3C9 strip with the Linear Burn texture. No text, staples, outline or shadow, so it is a clean base for a code-built card |
| `project-card-short@4x.png` | 2084 × 980 | The empty slot on page 2: transparent, just the dashed outline and "[submit project here]" |
| `photo-*-back@4x.png` | 1280² | The four handwritten photo backs as images, for comparison |
| `folder-N-cover@2x.png` | 3512 × 934 | Each folder cover rendered from Figma, 004 included |

## exports/svg

| File | What |
|---|---|
| `redaction-header.svg`, `redaction-address.svg`, `redaction-inline.svg` | The black bars with their brush-stroke ends (no text inside) |
| `scribble-company.svg` | The grey scribble over the company name on professional-info |
| `red-arrow.svg` | The hand-drawn red arrow (2 px `#AB0000`) |
| `folder-tab-shape.svg` | The folder tab outline |

The redaction SVGs are large (150–950 KB) because each brush stroke is a detailed outline. For the site, a simpler hand-made SVG or a CSS bar with a rough-edge filter will look the same at a fraction of the size.

## exports/renders

1× previews of each sheet side (`renders/<sheet>.<side>.png`), the home frame and the ASSETS board. Useful as a quick visual index and as references for a screenshot diff.
