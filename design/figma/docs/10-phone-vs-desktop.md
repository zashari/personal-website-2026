# 10 · Phone vs desktop

`DESIGN-PHONE` (`104:42`) has the same structure as `DESIGN-DESKTOP` (`87:12`): front sheets, back sheets and a 1728 × 1117 `home` frame. The extractor compares every text layer by its path and name (`data/phone-vs-desktop.json`):

- text content: identical
- font family, size and weight: identical
- position relative to the sheet: identical within 1 px
- layers present on only one side: none

So the phone board is a copy, not a separate mobile design. On the site, the phone layout is done in CSS (`Folder.css` widens the folders to 180 % / 220 % of the viewport at ≤768 px / ≤480 px) and the same sheet images are shown. A code rebuild can treat desktop as the single source and handle mobile purely with layout rules.

The loose `paper-personal-info` group (`104:44`) outside both boards is the phone copy of the personal-info front; it matches desktop too.
