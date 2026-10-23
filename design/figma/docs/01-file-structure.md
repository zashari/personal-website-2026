# 01 · File structure

The file has one page, **Page 1**, holding a 17674 × 5079 frame called **FINAL** and a small **Frame 1** with the web logo.

## FINAL, left to right

| Group | Node | What it holds |
|---|---|---|
| REFERENCES | `4:74` | Seven mood-board images (classified dossiers, a "TARGET DOSSIER", a connected-classroom surface). Inspiration only, not used on the site. |
| ASSETS | `87:11` | Source pieces: the four polaroid photos with their handwritten backs, the paper `texture`, an `empty-paper` (blank sheet with punched holes), the `stapler`, the `web-logo`. |
| DESIGN-DESKTOP | `87:12` | The design the site was exported from. Contains `back-paper-details`, `front-paper-details` and the `home` frame. |
| DESIGN-PHONE | `104:42` | A copy of DESIGN-DESKTOP; no differences in any text, font or position (see 10-phone-vs-desktop.md). |
| paper-personal-info | `104:44` | A loose copy of the personal-info sheet sitting outside the groups, belonging to the phone board. |
| background | `87:2` | The board background rectangle. |

## DESIGN-DESKTOP

| Piece | Node | Size (Figma px) | Site file it became |
|---|---|---|---|
| front › paper-personal-info | `10:105` | 613 × 860 | `paper-personal-info.png` |
| front › paper-professional-info | `36:547` | 616 × 865 | `paper-professional-info.png` |
| front › paper-projects-page-1 | `66:71` | 645 × 843 (650 with shadow) | `paper-projects-page-1.png` |
| front › paper-projects-page-2 | `47:2` | 645 × 843 | `paper-projects-page-2.png` |
| back › paper-personal-info-back | `77:613` | 613 × 861 | `paper-personal-info-back.png` |
| back › paper-professional-info-back | `77:787` | 616 × 866 | `paper-professional-info-back.png` |
| back › paper-projects-page-1 | `77:1040` | 645 × 843 | `paper-projects-page-1-back.png` |
| back › paper-projects-page-2 | `77:934` | 645 × 843 | `paper-projects-page-2-back.png` |
| home (frame) | `1:2` | 1728 × 1117 | the four `folder-N-cover` / `folder-N-preview-home` images |
| home › folder-1-fix … folder-4-fix | `4:76`, `4:83`, `4:90`, `4:97` | 1728 wide | folder 004 is not on the site |
| ASSETS › photos | `97:2` | 320 × 320 each | `personal-paper-photo-*`, `professional-paper-photo-*` |

## How a sheet group is organised

Every front sheet follows the same structure (names as in Figma):

- `Intersect`: the paper itself, an image clipped by a boolean that subtracts 20 circles (the punched holes).
- `texture`: a second image laid over the paper with the Linear Burn blend mode.
- `header`: "DEPARTMENT OF …" in David Libre, the "West Java, 202512-1802" line, and `Group 8` (the redaction bars plus `Group 7`, the brush strokes that rough up their ends).
- `title` (professional and projects): "OFFICIAL RECORD: …" plus a file code (`ER/9-S`, `HP/3-A`, `HP/3-B`).
- `content`: the bordered box (`Rectangle 13`, 2 px black inside stroke) with named sections (`section-1`, `education`, `table`, `mission-grid`, `technical`, `protocol`, `velocity`, `status`, `date`, the `github` QR image) separated by dotted `separator` lines.
- `photos`: the polaroids (image rectangles with a light inside stroke as the frame) and `paperclip` images.
- Projects pages instead have `project-1`…`project-3` cards, each with a `CONTAINER` (cream rectangle plus texture), a dashed outline, a `qr` image, `stapler` images, `title` / `date` / `desc` groups and an optional rotated stamp (`[TBD]`, `[CLASSIFIED]`, `[ASSET-LOST]`).

Layer names are mostly meaningful (`name`, `aliases`, `blood-type`, `row-1`…). Some are leftovers (`Group 19`, `Vector 20`, two groups both called `binus`, two rows both called `row-2` in the professional mission grid). The extractor keeps full paths so these stay distinguishable.
