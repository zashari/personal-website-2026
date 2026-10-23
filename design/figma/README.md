# Figma reference: personal-web-2026

Everything learned from the Figma file behind zashari.website, organised for rebuilding the site's paper sheets as real HTML/CSS instead of flattened PNGs. Nothing on the live site was changed to produce this.

- File: `personal-web-2026` (key `jAxLoNzeWmOLNro5e5gpvJ`), read through the Figma REST API on 2026-10-23.
- Version extracted: `2413464093192304879`, last modified 2026-10-23 07:50 UTC (see `data/meta.json`).
- Units: Figma px. The site's PNG masters in `design/source` were exported at exactly 4× (a 613 × 860 sheet is 2452 × 3440 px).

## Read in this order

| # | Doc | What it covers |
|---|---|---|
| 1 | [docs/01-file-structure.md](docs/01-file-structure.md) | Pages, top-level groups, which node is which sheet, node IDs |
| 2 | [docs/02-paper-construction.md](docs/02-paper-construction.md) | How a sheet's paper is built: base photo, punched holes, texture layer, blend modes, card strips |
| 3 | [docs/03-typography.md](docs/03-typography.md) | Every font, its role, sizes, weights, and licence status |
| 4 | [docs/04-colours-strokes-effects.md](docs/04-colours-strokes-effects.md) | Palette, line styles (dotted, dashed), shadows, Figma's Texture and Noise effects |
| 5 | [docs/05-sheet-layouts.md](docs/05-sheet-layouts.md) | Layout of each sheet in plain words with the key measurements |
| 6 | [docs/06-home-folders.md](docs/06-home-folders.md) | The folder stack on the home page, including the unused folder 004 |
| 7 | [docs/07-photos-polaroids.md](docs/07-photos-polaroids.md) | Polaroid fronts, frames, positions, and the handwritten backs |
| 8 | [docs/08-assets-and-exports.md](docs/08-assets-and-exports.md) | Every exported file and original image, and what uses it |
| 9 | [docs/09-redactions-and-privacy.md](docs/09-redactions-and-privacy.md) | Real text hidden under redaction bars, and how it is kept out of these files and the site |
| 10 | [docs/10-phone-vs-desktop.md](docs/10-phone-vs-desktop.md) | The DESIGN-PHONE board compared with DESIGN-DESKTOP |
| 11 | [docs/11-figma-vs-live-site.md](docs/11-figma-vs-live-site.md) | How the Figma file compares with what is deployed today |
| 12 | [docs/12-rebuild-mapping.md](docs/12-rebuild-mapping.md) | How each Figma feature translates to code, and open questions |

Per-layer reference tables (every text layer with font, size, colour and position; every line, box and image) are generated into [docs/sheets/](docs/sheets/):

- `personal-info.front.md`, `personal-info.back.md`
- `professional-info.front.md`, `professional-info.back.md`
- `projects-page-1.front.md`, `projects-page-1.back.md`
- `projects-page-2.front.md`, `projects-page-2.back.md`
- `home.md` (folders), `assets-board.md` (photos and their backs, paper, stapler, logo)

## Folder layout

```
design/figma/
├── README.md            this index
├── docs/                hand-written explanations (01–12) and generated sheet tables (sheets/)
├── data/                machine-readable specs extracted from Figma, one JSON per sheet side
│   ├── meta.json        file version and extraction time
│   ├── sheets/*.json    every layer of each sheet: box, fills, strokes, effects, text and style runs
│   ├── home.json        folder stack
│   ├── assets.json      ASSETS board
│   ├── references.json  REFERENCES mood board
│   ├── fonts.json       every font style used, sizes and where
│   ├── image-refs.json  every image fill and the layers that use it
│   └── phone-vs-desktop.json
├── exports/             downloaded from Figma; not committed (see .gitignore), re-create with scripts/export.mjs
│   ├── renders/         1× previews of each sheet side and the home frame
│   ├── assets/          4× blank paper, project card, photo backs; 2× folder covers
│   ├── svg/             redaction marks, scribble, red arrow, folder tab shape
│   └── images/          the original uploads behind every image fill, plus manifest.json
└── scripts/
    ├── extract.mjs      Figma API → data/*.json (masks redacted text)
    ├── build-docs.mjs   data/*.json → docs/sheets/*.md
    └── export.mjs       Figma API → exports/
```

## Refreshing after a Figma edit

The token lives outside the repo in `D:/workspace/@zaky-ashari/.env.figma` (`FIGMA_TOKEN=…`, `FIGMA_FILE=…`). From the repo root:

```
node design/figma/scripts/extract.mjs
node design/figma/scripts/build-docs.mjs
node design/figma/scripts/export.mjs
```

The sheet node IDs are listed at the top of `scripts/extract.mjs`; update them if sheets are re-created rather than edited.
