#!/usr/bin/env node
// Downloads renders, reusable assets and the original image fills from the Figma file into design/figma/exports.
// usage: node design/figma/scripts/export.mjs [path-prefix]   (run extract.mjs first; it writes data/image-refs.json)
// With a prefix such as layers/, only matching renders are fetched and image fills are skipped.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'exports');
const ENV_FILE = 'D:/workspace/@zaky-ashari/.env.figma';

const env = Object.fromEntries(
  fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/).map((l) => l.match(/^(\w+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].trim()])
);
const TOKEN = process.env.FIGMA_TOKEN ?? env.FIGMA_TOKEN;
const FILE = process.env.FIGMA_FILE ?? env.FIGMA_FILE;

// [output path, node id, format, scale]. Renders are previews of the full design; assets are pieces the code rebuild reuses.
const JOBS = [
  ['renders/personal-info.front.png', '10:105', 'png', 1],
  ['renders/personal-info.back.png', '77:613', 'png', 1],
  ['renders/professional-info.front.png', '36:547', 'png', 1],
  ['renders/professional-info.back.png', '77:787', 'png', 1],
  ['renders/projects-page-1.front.png', '66:71', 'png', 1],
  ['renders/projects-page-1.back.png', '77:1040', 'png', 1],
  ['renders/projects-page-2.front.png', '47:2', 'png', 1],
  ['renders/projects-page-2.back.png', '77:934', 'png', 1],
  ['renders/home.png', '1:2', 'png', 1],
  ['renders/assets-board.png', '87:11', 'png', 0.5],
  ['assets/empty-paper@4x.png', '68:234', 'png', 4],
  ['assets/empty-paper-base@4x.png', '68:235', 'png', 4],
  ['assets/project-card@4x.png', '66:100', 'png', 4],
  ['assets/project-card-short@4x.png', '48:237', 'png', 4],
  ['assets/photo-personal-1-back@4x.png', '97:19', 'png', 4],
  ['assets/photo-personal-2-back@4x.png', '97:12', 'png', 4],
  ['assets/photo-professional-1-back@4x.png', '101:32', 'png', 4],
  ['assets/photo-professional-2-back@4x.png', '101:33', 'png', 4],
  ['assets/folder-1-cover@2x.png', '69:420', 'png', 2],
  ['assets/folder-2-cover@2x.png', '69:421', 'png', 2],
  ['assets/folder-3-cover@2x.png', '69:422', 'png', 2],
  ['assets/folder-4-cover@2x.png', '69:423', 'png', 2],
  // Paper layers on their own, so the blank sheet can be composited exactly (scripts/build-temp-assets.mjs).
  ['layers/personal-info.base@4x.png', '10:111', 'png', 4],
  ['layers/personal-info.texture@4x.png', '46:10', 'png', 4],
  ['layers/professional-info.base@4x.png', '36:548', 'png', 4],
  ['layers/professional-info.texture@4x.png', '46:14', 'png', 4],
  ['layers/projects.base@4x.png', '66:72', 'png', 4],
  ['layers/projects.texture@4x.png', '66:97', 'png', 4],
  // Single unrotated pieces, rendered with Figma's own crop of their image fill.
  ['layers/staple@8x.png', '66:105', 'png', 8],
  ['layers/paperclip@8x.png', '43:150', 'png', 8],
  ['svg/redaction-header.svg', '11:224', 'svg', 1],
  ['svg/redaction-address.svg', '18:80', 'svg', 1],
  ['svg/redaction-inline.svg', '30:127', 'svg', 1],
  ['svg/scribble-company.svg', '104:322', 'svg', 1],
  ['svg/red-arrow.svg', '104:328', 'svg', 1],
  ['svg/folder-tab-shape.svg', '4:79', 'svg', 1],
];

const ONLY = process.argv[2];

const api = async (url) => {
  const res = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } });
  if (!res.ok) throw new Error(`${url} -> ${res.status} ${await res.text()}`);
  return res;
};

async function save(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${file} -> ${res.status}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

async function renders() {
  const groups = Map.groupBy(JOBS.filter(([out]) => !ONLY || out.startsWith(ONLY)), ([, , format, scale]) => `${format}@${scale}`);
  for (const [key, jobs] of groups) {
    const [format, scale] = key.split('@');
    const ids = jobs.map(([, id]) => id).join(',');
    const extra = format === 'svg' ? '&svg_outline_text=false&svg_include_id=true' : '';
    const { images, err } = await (await api(`https://api.figma.com/v1/images/${FILE}?ids=${ids}&format=${format}&scale=${scale}${extra}`)).json();
    if (err) throw new Error(err);
    for (const [out, id] of jobs) {
      if (!images[id]) { console.warn(`no render for ${id} (${out})`); continue; }
      await save(images[id], path.join(OUT, out));
      console.log(`rendered ${out}`);
    }
  }
}

// Original uploads behind every image fill, named after the layer that uses them.
async function imageFills() {
  const refs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'image-refs.json'), 'utf8'));
  const { meta } = await (await api(`https://api.figma.com/v1/files/${FILE}/images`)).json();
  const manifest = {};
  for (const [ref, uses] of Object.entries(refs)) {
    const url = meta.images[ref];
    if (!url) { console.warn(`no download URL for ${ref}`); continue; }
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = buf.subarray(1, 4).toString() === 'PNG' ? 'png' : buf[0] === 0xff ? 'jpg' : buf.subarray(8, 12).toString() === 'WEBP' ? 'webp' : 'bin';
    const label = uses[0].split(' / ').pop().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'image';
    const file = `images/${label}-${ref.slice(0, 8)}.${ext}`;
    fs.mkdirSync(path.join(OUT, 'images'), { recursive: true });
    fs.writeFileSync(path.join(OUT, file), buf);
    manifest[ref] = { file, bytes: buf.length, usedBy: uses };
    console.log(`image ${file} (${Math.round(buf.length / 1024)} KB)`);
  }
  fs.writeFileSync(path.join(OUT, 'images', 'manifest.json'), JSON.stringify(manifest, null, 2));
}

await renders();
if (!ONLY) await imageFills();
