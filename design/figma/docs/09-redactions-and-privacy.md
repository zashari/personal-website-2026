# 09 · Redactions and privacy

The black bars in the design are drawn **on top of real text**. In Figma the words under them are still there: on personal-info the address field holds a real street address, and the blood-type field, the department and company names, and the café names in the table are real too. The flattened PNGs hide them, but they would leak the moment that text went into HTML.

## How these files handle it

`scripts/extract.mjs` finds every dark bar or thick brush stroke (fill or stroke darker than `#505050`, bars taller than 4 px, strokes 4 px or wider) and checks which text glyphs it covers, using each text layer's rendered ink bounds. For every covered layer it:

- replaces the covered characters with `█` (single-line text, estimated per character and erring wide), or the whole text when it wraps and the layer name doesn't already say "REDACTED";
- removes the layer name, because Figma names text layers after their content;
- records `redactedBy` (the bar node IDs) and `textLength`.

Result, checked by searching every file in `design/figma` for the hidden words: none of them appear.

| Sheet | Layer | Stored as |
|---|---|---|
| all fronts | header department line | `DEPARTMENT O█ ███████████` / `███████████` (the visible text on the site is "DEPARTMENT OF") |
| personal-info | address value | fully masked (the site shows "P" … "1" at the bar ends) |
| personal-info | blood type value | `█` |
| personal-info | table OPS / HABIT and LAST SEEN observations | the layer-name version, which already says REDACTED |
| professional-info | photo caption | `Subject working at ████████ █ Taken by Agent-G1` |
| home | folder 004 label | `██████████` (and its red "REDACTED" label, masked as a side effect) |

## What is still exposed

- **Figma itself**: anyone with access to the file can read the hidden text. If the file is ever shared publicly, delete the real words and type placeholders under the bars.
- **`exports/assets/folder-4-cover@2x.png`**: the top of the folder 004 name shows above its bar in Figma's own render. That export is local only (git-ignored) and folder 004 isn't on the site.
- **The live site** is safe today because the text is flattened into the PNGs.

## Rule for the code rebuild

Never put the real hidden words in the HTML, the JS bundle or alt text. A redaction should be an empty element (a bar with `aria-label="redacted"`) sized to the hidden text's length, with only the visible fragments as text (for example "P", then the bar, then "1"). `data/` already carries only masked strings and lengths, so a build that reads from it can't leak them.
