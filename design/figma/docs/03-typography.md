# 03 · Typography

Six families are used. Source: `data/fonts.json` (every family, style, size and where it appears) and the per-sheet tables in `docs/sheets/`. Sizes are Figma px. On the site a sheet is drawn at roughly 1 Figma px = 1.5–2 CSS px depending on the viewport, so sizes should be expressed relative to the sheet width, not as fixed px.

## Families and roles

| Family | Styles used | Role | Where |
|---|---|---|---|
| **JMH Typewriter** | Regular 400, Bold 700, Black 900 | All typed values and body text; table headings; project headings; the "FILE COPY", "\| APPROVED \|" and "[CLASSIFIED]" stamps | Every sheet (113 layers) |
| **Times New Normal** | Regular 400 | Form labels and section titles: "SUBJECT INFO", "EDUCATION", "SUBJECT SUMMARY", "Name:", "Aliases:", "Phone Num:", "Title:", "Date:", "Description:", "Status:", "OFFICIAL RECORD: …", the "----- PROTOCOL & ARSENAL -----" rules | Every sheet (36 layers) |
| **David Libre** | Regular 400 | Letterhead: "DEPARTMENT OF …" (20) and "West Java, 202512-1802" (10) | Every sheet header |
| **Fira Code** | SemiBold 600 | Folder tabs: label (30), file number "-001-" and timestamp "20260101-132303" (15) | Home folders |
| **Royal Brand** | Regular 400 | Handwriting in red ink on the polaroid backs | ASSETS › photos |
| JMH Typewriter Thin | (installed, unused) | — | — |

## Size scale in use

| Family / style | Size | Line height | Used for |
|---|---|---|---|
| David Libre | 20 | 20 (100 %) | Department line, two lines |
| David Libre | 10 | 10 | Location / file number line |
| Times New Normal | 16 | 17.6 | Section titles, form labels on personal-info, "OFFICIAL RECORD" titles |
| Times New Normal | 14 | 15.4 | Project card labels (Title:, Date:, Description:) |
| Times New Normal | 12 | 13.2 | Footer labels (Status:, Date:), professional panel rules |
| JMH Typewriter Regular | 16 | 20.56 | Form values (name, aliases, phone, email), education years |
| JMH Typewriter Regular | 12 | 15.42 | Education entries, dates, project titles |
| JMH Typewriter Regular | 10 | 12.85 | Subject-summary table cells, professional intro paragraph |
| JMH Typewriter Regular | 9 | 11.57 | Project descriptions |
| JMH Typewriter Regular | 8 | 10.28 | Professional timeline and loadout text; red warning lines |
| JMH Typewriter Bold | 16 | 20.56 | Project category headings (AI ENGINEERING …) |
| JMH Typewriter Bold | 12 | 15.42 | Table column heads, file codes (ER/9-S, HP/3-A) |
| JMH Typewriter Bold | 10 / 8 | 12.85 / 10.28 | Timeline column heads; loadout labels |
| JMH Typewriter Bold | 30 | 38.55 | Diagonal QR stamps, red #891414, rotated 45° |
| JMH Typewriter Black | 40 | 51.41 | "FILE COPY", #B10F0F at 50 % |
| JMH Typewriter Black | 16 | 20.56 | "\| APPROVED \|", #891414, tracking 1.6 |
| JMH Typewriter Black | 8 | 10.28 | "[01]", "[02]" loadout headings |
| Fira Code SemiBold | 30 | 39.36 | Folder labels, tracking 3 (PROJECTS 15, folder 004 9) |
| Fira Code SemiBold | 25 | 32.8 | The red "INFO" overprinted on folder 002, tracking 2.5, 70 % |
| Fira Code SemiBold | 15 | 19.68 | Folder file number and timestamp |
| Royal Brand | 15–30 | ~1.76 × size | Polaroid back notes |

Line heights are Figma's "auto" (intrinsic) values, so they come from each font's own metrics: ~1.285 × size for JMH Typewriter, 1.1 × for Times New Normal, 1.0 × for David Libre.

Mixed styles inside one layer (from `runs` in the JSON):
- Professional timeline: the lead phrase is Bold ("Active Mission.", "Completed Mission.", "Independent Ops.") and the rest Regular.
- Professional intro: "NOTE:" in red #891414.
- Projects: "TECH:", "FEATURES:", "OPTIMIZATION:", "OUTCOME:" and "STATUS ALERT:" bold; privacy note and 'Ghost Protocol' in red.

## Licences (read from the installed font files on 2026-10-23)

| Family | Copyright / licence in the font file | Web use |
|---|---|---|
| JMH Typewriter | "Copyright (c) 2018 by joorgemoron@gmail.com. All rights reserved." No licence text or URL. | **Not cleared.** Aggregators list it as free for personal use. Already self-hosted as an ASCII subset on the site; needs the author's permission (Jorge Morán, joorgemoron@gmail.com). |
| Times New Normal | "Copyright (c) 2020 by juwandasadja@gmail.com. All rights reserved." Designer: Juwanda Azi Mayuswa. | **Not cleared.** No public licence found; ask the designer, or substitute. |
| Royal Brand | "Royal Brand © (Heinzel Std). 2023. All Rights Reserved", www.heinzelstd.com. | **Free for personal use only**; commercial and web-font licences are sold by Heinzel Std (also on Fontspring). A personal portfolio is a grey area; buy the web licence or substitute. |
| David Libre | SIL Open Font License 1.1 (Google Fonts). | Free to self-host. |
| Fira Code | SIL Open Font License 1.1. | Free to self-host. |

Font files on this machine: `%LOCALAPPDATA%\Microsoft\Windows\Fonts\` (`JMH Typewriter*.ttf`, `Times New Normal Regular.ttf`, `RoyalBrand-Regular.otf`). David Libre and Fira Code are not installed locally; Figma serves them as Google fonts.

Fallbacks if a licence can't be cleared: Special Elite (Apache 2.0) or Courier Prime (OFL) for JMH Typewriter; a Times-like OFL serif such as Libertinus Serif or TeX Gyre Termes for Times New Normal; Caveat or Reenie Beanie (OFL) for Royal Brand.
