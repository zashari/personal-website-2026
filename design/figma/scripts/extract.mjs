#!/usr/bin/env node
// Pulls the personal-web-2026 Figma file and writes one normalized JSON spec per design area into design/figma/data.
// usage: node design/figma/scripts/extract.mjs [path/to/cached-file.json]
// The token is read from FIGMA_TOKEN or from D:/workspace/@zaky-ashari/.env.figma (kept outside the repo).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DATA = path.join(ROOT, 'data');
const ENV_FILE = 'D:/workspace/@zaky-ashari/.env.figma';

function loadEnv() {
  const env = { FIGMA_TOKEN: process.env.FIGMA_TOKEN, FIGMA_FILE: process.env.FIGMA_FILE };
  if (fs.existsSync(ENV_FILE)) {
    for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^(\w+)=(.*)$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].trim();
    }
  }
  if (!env.FIGMA_TOKEN || !env.FIGMA_FILE) throw new Error(`FIGMA_TOKEN and FIGMA_FILE must be set (env or ${ENV_FILE})`);
  return env;
}

async function loadFile(cached) {
  if (cached) return JSON.parse(fs.readFileSync(cached, 'utf8'));
  const { FIGMA_TOKEN, FIGMA_FILE } = loadEnv();
  const res = await fetch(`https://api.figma.com/v1/files/${FIGMA_FILE}?geometry=paths`, { headers: { 'X-Figma-Token': FIGMA_TOKEN } });
  if (!res.ok) throw new Error(`Figma API ${res.status}: ${await res.text()}`);
  return res.json();
}

// Design areas. Desktop is the source of truth; phone is diffed against it (see phone-vs-desktop.json).
export const AREAS = {
  'personal-info': { front: '10:105', back: '77:613', phoneFront: '104:44', phoneBack: '104:596' },
  'professional-info': { front: '36:547', back: '77:787', phoneFront: '104:218', phoneBack: '104:628' },
  'projects-page-1': { front: '66:71', back: '77:1040', phoneFront: '104:471', phoneBack: '104:697' },
  'projects-page-2': { front: '47:2', back: '77:934', phoneFront: '104:365', phoneBack: '104:660' },
};
const HOME = { desktop: '1:2', phone: '104:739' };
const ASSETS = '87:11';
const REFERENCES = '4:74';

const hex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
const round = (v, d = 2) => (v == null ? v : Math.round(v * 10 ** d) / 10 ** d);
// Figma's rotation is positive clockwise on screen (see relativeTransform), the same sense as CSS rotate().
const deg = (rad) => round((rad * 180) / Math.PI, 2);

function paint(p) {
  if (p.visible === false) return null;
  const out = { type: p.type };
  if (p.type === 'SOLID') out.color = hex(p.color);
  if (p.opacity != null && p.opacity !== 1) out.opacity = round(p.opacity, 3);
  if (p.blendMode && p.blendMode !== 'NORMAL') out.blendMode = p.blendMode;
  if (p.type === 'IMAGE') {
    out.imageRef = p.imageRef;
    out.scaleMode = p.scaleMode;
    if (p.filters) out.filters = p.filters;
    if (p.imageTransform) out.imageTransform = p.imageTransform.map((r) => r.map((v) => round(v, 4)));
  }
  if (p.type?.startsWith('GRADIENT')) out.stops = p.gradientStops.map((s) => ({ color: hex(s.color), alpha: round(s.color.a, 3), at: round(s.position, 3) }));
  return out;
}

function effect(e) {
  if (e.visible === false) return null;
  const out = { type: e.type };
  for (const k of ['radius', 'spread', 'noiseSize', 'density', 'clipToShape', 'showShadowBehindNode']) if (e[k] != null) out[k] = e[k];
  if (e.color) out.color = hex(e.color), out.alpha = round(e.color.a, 3);
  if (e.offset) out.offset = { x: round(e.offset.x), y: round(e.offset.y) };
  if (e.blendMode && e.blendMode !== 'NORMAL') out.blendMode = e.blendMode;
  return out;
}

function textStyle(s) {
  return {
    family: s.fontFamily,
    style: s.fontStyle,
    weight: s.fontWeight,
    size: s.fontSize,
    lineHeightPx: round(s.lineHeightPx),
    lineHeight: s.lineHeightUnit === 'INTRINSIC_%' ? 'auto' : s.lineHeightUnit === 'PIXELS' ? `${round(s.lineHeightPx)}px` : `${round(s.lineHeightPercentFontSize ?? s.lineHeightPercent)}%`,
    letterSpacing: round(s.letterSpacing),
    align: s.textAlignHorizontal,
    ...(s.textCase && { textCase: s.textCase }),
    ...(s.textDecoration && { textDecoration: s.textDecoration }),
    ...(s.paragraphSpacing && { paragraphSpacing: s.paragraphSpacing }),
    ...(s.italic && { italic: true }),
  };
}

// Splits a text layer into runs that share one style override, so mixed-style text ("NOTE:" in red) is visible.
function runs(n) {
  const overrides = n.characterStyleOverrides || [];
  if (!overrides.some(Boolean)) return undefined;
  const out = [];
  for (let i = 0; i < n.characters.length; i++) {
    const id = overrides[i] || 0;
    const last = out[out.length - 1];
    if (last && last.override === id) last.text += n.characters[i];
    else out.push({ override: id, text: n.characters[i] });
  }
  return out.map(({ override, text }) => {
    const o = override ? n.styleOverrideTable[override] : null;
    const style = {};
    if (o) {
      for (const k of ['fontFamily', 'fontStyle', 'fontWeight', 'fontSize', 'textDecoration', 'letterSpacing']) if (o[k] != null) style[k] = o[k];
      if (o.fills) style.fills = o.fills.map(paint).filter(Boolean);
    }
    return { text, ...(o && { style }) };
  });
}

function normalize(n, origin, trail = []) {
  const b = n.absoluteBoundingBox;
  const rec = {
    id: n.id,
    name: n.name,
    type: n.type,
    path: trail.join(' / '),
    ...(b && { box: { x: round(b.x - origin.x), y: round(b.y - origin.y), w: round(b.width), h: round(b.height) } }),
  };
  const rb = n.absoluteRenderBounds;
  if (n.type === 'TEXT' && rb) rec.inkBox = { x: round(rb.x - origin.x), y: round(rb.y - origin.y), w: round(rb.width), h: round(rb.height) };
  if (n.visible === false) rec.hidden = true;
  if (n.rotation) {
    rec.rotationDeg = deg(n.rotation);
    // box is the rotated extent; this is the layer's own size, rotated about the box centre.
    if (n.size) rec.size = { w: round(n.size.x), h: round(n.size.y) };
  }
  if (n.opacity != null && n.opacity !== 1) rec.opacity = round(n.opacity, 3);
  if (n.blendMode && !['PASS_THROUGH', 'NORMAL'].includes(n.blendMode)) rec.blendMode = n.blendMode;
  const fills = (n.fills || []).map(paint).filter(Boolean);
  if (fills.length) rec.fills = fills;
  const strokes = (n.strokes || []).map(paint).filter(Boolean);
  if (strokes.length) {
    rec.stroke = { paints: strokes, weight: n.strokeWeight, align: n.strokeAlign };
    if (n.strokeDashes) rec.stroke.dashes = n.strokeDashes;
    if (n.strokeCap && n.strokeCap !== 'NONE') rec.stroke.cap = n.strokeCap;
  }
  if (n.cornerRadius) rec.cornerRadius = n.cornerRadius;
  if (n.rectangleCornerRadii) rec.cornerRadii = n.rectangleCornerRadii;
  const effects = (n.effects || []).map(effect).filter(Boolean);
  if (effects.length) rec.effects = effects;
  if (n.booleanOperation) rec.booleanOperation = n.booleanOperation;
  if (n.isMask) rec.isMask = true;
  if (n.type === 'TEXT') {
    rec.text = n.characters;
    rec.style = textStyle(n.style);
    rec.autoResize = n.style.textAutoResize;
    const r = runs(n);
    if (r) rec.runs = r;
  }
  // Simple outlines are kept inline; brush strokes run to ~50 KB each and are exported as SVG files instead.
  const geometry = n.fillGeometry?.length ? n.fillGeometry : n.strokeGeometry;
  if (n.type === 'VECTOR' && geometry?.length) {
    const d = geometry.map((g) => g.path);
    if (d.join('').length <= 4000) rec.svgPath = d;
    else rec.svgPathOmitted = 'complex brush path, see exports/';
  }
  return rec;
}

function flatten(root, origin) {
  const out = [];
  const walk = (n, trail) => {
    out.push(normalize(n, origin, trail));
    // Boolean children only describe the punched-hole shape; keep the operation, summarize the operands.
    if (n.type === 'BOOLEAN_OPERATION') {
      const ellipses = [];
      const visit = (c) => { if (c.type === 'ELLIPSE') ellipses.push(c); (c.children || []).forEach(visit); };
      visit(n);
      if (ellipses.length) {
        const bs = ellipses.map((e) => e.absoluteBoundingBox);
        out[out.length - 1].holes = {
          count: ellipses.length,
          diameter: round(bs[0].width),
          x: round(bs[0].x - origin.x),
          ys: bs.map((bb) => round(bb.y - origin.y)).sort((a, b) => a - b),
        };
      }
      return;
    }
    (n.children || []).forEach((c) => walk(c, [...trail, n.name]));
  };
  walk(root, []);
  return out;
}

const overlap = (a, b) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
};

const isDark = (p) => p.type === 'SOLID' && parseInt(p.color.slice(1, 3), 16) < 0x50 && (p.opacity ?? 1) > 0.9;
// Expands a hairline brush stroke to the area its ink actually covers.
const inked = (n) => (n.stroke && n.box.h < n.stroke.weight ? { ...n.box, y: n.box.y - n.stroke.weight / 2, h: n.box.h + n.stroke.weight } : n.box);

// Replaces every character a bar touches with a block, estimating glyph positions from an even advance per line.
// Wrapped paragraphs can't be mapped that way; they fall back to the layer name when Figma already wrote REDACTED
// into it, and are blanked entirely otherwise. Masking errs wide: a partly covered glyph is masked too.
function maskText(t, bars) {
  const lines = t.text.split('\n');
  const lh = t.style.lineHeightPx;
  const wrapped = t.box.h > lines.length * lh * 1.25;
  if (wrapped) return /\bREDACTED\b/.test(t.name) ? t.name : '█'.repeat(t.text.length);
  const advance = t.box.w / Math.max(...lines.map((l) => l.length));
  return lines.map((line, i) => {
    const top = t.box.y + i * lh;
    const covering = bars.filter((b) => Math.min(top + lh, b.y + b.h) - Math.max(top, b.y) >= 0.3 * Math.min(lh, b.h));
    return [...line].map((ch, j) => {
      const x0 = t.box.x + (j - 0.5) * advance;
      const x1 = t.box.x + (j + 1.5) * advance;
      return covering.some((b) => x1 > b.x && x0 < b.x + b.w) && ch !== ' ' ? '█' : ch;
    }).join('');
  }).join('\n');
}

// Dark bars and thick brush strokes over text are redactions. The words under them are real in Figma
// (an address, a blood type, company names), so the specs must never carry them.
function markRedactions(nodes) {
  const bars = nodes.filter((n) => n.box && ['RECTANGLE', 'VECTOR'].includes(n.type) && (
    (n.fills?.some(isDark) && n.box.h > 4) ||
    (n.stroke && n.stroke.weight >= 4 && n.stroke.paints.some(isDark))
  ));
  // Overlap is measured on the glyphs' rendered ink, so a stamp whose line box merely grazes a bar (FILE COPY) is left alone.
  for (const t of nodes.filter((n) => n.type === 'TEXT')) {
    const ink = t.inkBox ?? t.box;
    const lh = t.style.lineHeightPx;
    // A bar only redacts a line it covers for a good part of the line height; this skips stamps that merely touch a bar.
    const hits = bars.filter((bar) => {
      const b = inked(bar);
      const h = Math.min(ink.y + ink.h, b.y + b.h) - Math.max(ink.y, b.y);
      return overlap(ink, b) > 0 && h >= 0.3 * Math.min(lh, b.h);
    });
    if (!hits.length) continue;
    t.redactedBy = hits.map((h) => h.id);
    t.textLength = t.text.length;
    t.text = maskText(t, hits.map(inked));
    delete t.runs;
    delete t.name;
  }
  for (const bar of bars) bar.role = 'redaction-mark';
  return nodes;
}

function area(idx, id) {
  const root = idx[id];
  const nodes = flatten(root, root.absoluteBoundingBox);
  return { id, name: root.name, size: { w: round(root.absoluteBoundingBox.width), h: round(root.absoluteBoundingBox.height) }, nodes: markRedactions(nodes) };
}

const textKey = (n) => `${n.path} / ${n.name}`;

function diff(desktop, phone) {
  const pick = (a) => new Map(a.nodes.filter((n) => n.type === 'TEXT').map((n) => [textKey(n), n]));
  const d = pick(desktop);
  const p = pick(phone);
  const changes = [];
  for (const [k, n] of d) {
    const m = p.get(k);
    if (!m) changes.push({ layer: k, change: 'missing on phone' });
    else {
      const delta = {};
      if (m.text !== n.text) delta.text = { desktop: n.text, phone: m.text };
      for (const s of ['family', 'size', 'weight']) if (m.style[s] !== n.style[s]) delta[s] = { desktop: n.style[s], phone: m.style[s] };
      if (Math.abs(m.box.x - n.box.x) > 1 || Math.abs(m.box.y - n.box.y) > 1) delta.position = { desktop: n.box, phone: m.box };
      if (Object.keys(delta).length) changes.push({ layer: k, ...delta });
    }
  }
  for (const k of p.keys()) if (!d.has(k)) changes.push({ layer: k, change: 'only on phone' });
  return changes;
}

async function main() {
  const file = await loadFile(process.argv[2]);
  const idx = {};
  const index = (n) => { idx[n.id] = n; (n.children || []).forEach(index); };
  index(file.document);
  fs.mkdirSync(path.join(DATA, 'sheets'), { recursive: true });

  const meta = { file: file.name, lastModified: file.lastModified, version: file.version, extractedAt: new Date().toISOString(), units: 'Figma px; the site PNG masters were exported at 4x' };
  fs.writeFileSync(path.join(DATA, 'meta.json'), JSON.stringify(meta, null, 2));

  const phoneDiff = {};
  for (const [name, ids] of Object.entries(AREAS)) {
    const front = area(idx, ids.front);
    const back = area(idx, ids.back);
    fs.writeFileSync(path.join(DATA, 'sheets', `${name}.front.json`), JSON.stringify(front, null, 2));
    fs.writeFileSync(path.join(DATA, 'sheets', `${name}.back.json`), JSON.stringify(back, null, 2));
    phoneDiff[name] = { front: diff(front, area(idx, ids.phoneFront)), back: diff(back, area(idx, ids.phoneBack)) };
  }
  const home = area(idx, HOME.desktop);
  fs.writeFileSync(path.join(DATA, 'home.json'), JSON.stringify(home, null, 2));
  phoneDiff.home = diff(home, area(idx, HOME.phone));
  fs.writeFileSync(path.join(DATA, 'phone-vs-desktop.json'), JSON.stringify(phoneDiff, null, 2));
  fs.writeFileSync(path.join(DATA, 'assets.json'), JSON.stringify(area(idx, ASSETS), null, 2));
  fs.writeFileSync(path.join(DATA, 'references.json'), JSON.stringify(area(idx, REFERENCES), null, 2));

  // Font usage across every area, so licensing and self-hosting can be checked in one place.
  const fonts = {};
  for (const f of fs.readdirSync(path.join(DATA, 'sheets')).map((x) => path.join(DATA, 'sheets', x)).concat(['home.json', 'assets.json'].map((x) => path.join(DATA, x)))) {
    const a = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const n of a.nodes.filter((x) => x.type === 'TEXT')) {
      const styles = [n.style, ...(n.runs || []).filter((r) => r.style?.fontFamily).map((r) => ({ family: r.style.fontFamily, style: r.style.fontStyle, weight: r.style.fontWeight, size: r.style.fontSize ?? n.style.size }))];
      for (const s of styles) {
        const key = `${s.family}|${s.style}|${s.weight}`;
        fonts[key] ??= { family: s.family, style: s.style, weight: s.weight, sizes: new Set(), usedIn: new Set(), layers: 0 };
        fonts[key].sizes.add(s.size);
        fonts[key].usedIn.add(path.basename(f, '.json'));
        fonts[key].layers++;
      }
    }
  }
  const fontList = Object.values(fonts).map((f) => ({ ...f, sizes: [...f.sizes].sort((a, b) => a - b), usedIn: [...f.usedIn].sort() })).sort((a, b) => a.family.localeCompare(b.family) || a.weight - b.weight);
  fs.writeFileSync(path.join(DATA, 'fonts.json'), JSON.stringify(fontList, null, 2));

  // Image fills referenced anywhere in the extracted areas.
  const refs = {};
  for (const f of fs.readdirSync(DATA, { recursive: true }).filter((x) => x.endsWith('.json'))) {
    const a = JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
    for (const n of a.nodes || []) for (const p of n.fills || []) if (p.imageRef) (refs[p.imageRef] ??= []).push(`${f.replace(/\\/g, '/')} :: ${n.path} / ${n.name ?? '(redacted)'}`);
  }
  fs.writeFileSync(path.join(DATA, 'image-refs.json'), JSON.stringify(refs, null, 2));
  console.log(`Wrote specs for ${Object.keys(AREAS).length} sheets, home, assets, references; ${fontList.length} font styles; ${Object.keys(refs).length} image refs.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
