# 05 · Sheet layouts

Plain-language layout of each front, with the measurements that matter for rebuilding it. All values are Figma px from the sheet's top-left (see each `docs/sheets/*.front.md` for every layer). The paper itself is 595 wide; anything beyond (polaroids, project cards) overhangs onto the background.

## Shared letterhead (all four fronts)

- "DEPARTMENT OF" + redaction bar on line 1, a second bar on line 2: David Libre 20, at x 60. The bars are 126 × 13 rectangles (`#000000` / `#131313`) with 6 px brush strokes roughening both ends.
- "West Java, 202512-1802": David Libre 10, 40 px below the first line.
- Personal-info header top is y 49.7; professional y 41; projects y 17.
- Projects pages add the circular **ISP-DIV seal** image (70 × 64) at the top right (x 501, y 5).

## Personal info (613 × 860)

| Block | Position | Notes |
|---|---|---|
| FILE COPY stamp | 165, 80 (223 × 51) | JMH Black 40, `#B10F0F` 50 %, overlapping the letterhead |
| Polaroids | photo 2 at 384, 1.7 (155²); photo 1 at 450, 45.7 (163²) rotated 7.12° | Paperclip 62 × 106 at 515, 0, rotated 14.86° |
| Content box | 57, 113, 516 × 723 | 2 px black border, inside |
| SUBJECT INFO | title at 70, 122 | Rows at y 146 (Name, Blood Type), 174 (Aliases, Gender), 202 (Address), 230 (Phone, Email). Labels Times New Normal 16, values JMH 16, dotted 1 px underline 21 px below the row top |
| Right column | x 357 | Blood Type, Gender |
| Highlighter | 70, 225, 481 × 33 | `#F0E849` 50 %, an irregular vector shape behind phone + email |
| Separator 1 | y 275 | dotted 2 px, x 60–570 |
| EDUCATION | title 79, 292; entries at y 319 and 340 | years "[2021-2025]" JMH 16 at x 100; text JMH 12 at x 186 |
| Separator 2 | y 378 | |
| SUBJECT SUMMARY | centred title at 246, 385 | |
| Table | heads at y 408 (JMH Bold 12); columns at x 88, 178, 254, 444 | Rows start y 440, 485, 556, 640, 685; observation column 175 wide, JMH 10, line 12.85 |
| Separator 3 | y 744 | |
| Footer | Status at 74, 803 ("\| APPROVED \|" JMH Black 16 red); QR image 84 × 84 at 277, 748; Date at 402, 806 | QR uses Color Burn |

## Professional info (616 × 865)

| Block | Position | Notes |
|---|---|---|
| Polaroids | photo 2 (115²) at 386, 6 rotated 180°; photo 1 (161.5²) at 454, 4.6 rotated 15° | Two small paperclips (18 × 48) at 391, 0 and 543, 18; 5 px frames |
| Title | "OFFICIAL RECORD: PROFESSIONAL OPERATIONS LOG" Times New Normal 16 at 57, 120; "ER/9-S" JMH Bold 12 at the right | |
| Content box | 57, 143, 516 × 699 | |
| Intro | photo (118², Darken) at 86, 152; paragraph JMH 10 at 218, 152 (331 wide) | Red 2 px hand-drawn arrow (78 × 28) from the photo to the caption "Subject working at ████ \| Taken by Agent-G1" (company name scribbled out) |
| Separator | y 280 | |
| Mission grid | heads at y 293 (TIMELINE / ENTITY / UNIT / OPERATIONAL DETAILS, JMH Bold 10) at x 86, 158, 267 | Three rows, JMH 8, details column 266 wide, lead phrase bold |
| Separators | horizontal y 478.6; vertical x 298 from 478.6 to 738 | |
| Technical loadout | left column x 76, from y 500 | "----------TECHNICAL LOADOUT----------" rule in Times New Normal 12; "[01]"/"[02]" JMH Black 8; label/value pairs JMH 8 |
| Protocol & arsenal | right column x 326, from y 500 | CATEGORY / AUTHORIZED / BANNED (red `#AB0000`) / NOTE, right-aligned labels |
| Velocity benchmark | x 326, y 608 | paragraph JMH 8, 211 wide |
| Separator | y 738 | |
| Footer | as personal-info, shifted to y 809–812 | |

## Projects pages (645 × 843)

| Block | Position | Notes |
|---|---|---|
| Title | "OFFICIAL RECORD: HIGHLIGTED PROJECTS" at 60, 88; "HP/3-A" or "HP/3-B" at 513, 88 | The Figma text has the typo "HIGHLIGTED" |
| Cards | at y 121, 360, 599; each 580 × 236 from x 65 (overhangs to 645) | see 02-paper-construction.md |
| QR | 204 × 204 at x 82, 16 px below the card top | Darken blend. Blurred ones: Layer blur 4 + Texture r17 n4, with a diagonal stamp |
| Stamp | JMH Bold 30 red, rotated −45°, 1 px `#848484` outside stroke, drop shadow 0 4 4 | "[TBD]" (page 1, card 1), "[CLASSIFIED]" and "[ASSET-LOST]" (page 2) |
| Text column | x 286, 329 wide | Category heading JMH Bold 16 at card top + 23, 2 px rule under it; Title / Date rows (Times 14 label, JMH 12 value, dotted underline 300 wide); Description label and JMH 9 body |
| Empty slot | page 2, y 599 | dashed outline only, "[submit project here]" centred |

Body text in the projects descriptions has mixed runs (bold "TECH:", "FEATURES:", red privacy note); see `runs` in `data/sheets/projects-page-*.front.json`.
