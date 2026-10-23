// Builds the images the /temp page needs from the Figma exports (design/figma/exports, see design/figma/README.md):
// blank papers composited exactly as Figma draws them, plus the small pieces placed around the text.
// Run with `node scripts/build-temp-assets.mjs` after `node design/figma/scripts/export.mjs`. Output is committed.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const EXPORTS = 'design/figma/exports';
const OUT = 'src/temp/assets/images';

const AVIF = { quality: 60, effort: 6 };
const WEBP = { quality: 82, alphaQuality: 90, effort: 5 };

// Figma stacks a texture over the base photo with Linear Burn (base + texture - 1). Where the base is cut away
// (the punched holes) the texture is drawn on nothing, so it shows as is; that is why the holes look pale.
async function compositePaper(name, baseOffsetY) {
  const tex = sharp(path.join(EXPORTS, 'layers', `${name}.texture@4x.png`)).ensureAlpha();
  const { width, height } = await tex.metadata();
  const t = await tex.raw().toBuffer();
  // sharp runs extract before extend within one pipeline, so pad first and crop in a second pass.
  const padded = await sharp(path.join(EXPORTS, 'layers', `${name}.base@4x.png`))
    .ensureAlpha()
    .extend({ top: baseOffsetY, bottom: 64, right: 64, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const base = await sharp(padded).extract({ left: 0, top: 0, width, height }).raw().toBuffer();
  const out = Buffer.alloc(t.length);
  for (let i = 0; i < t.length; i += 4) {
    const a = base[i + 3] / 255;
    for (let c = 0; c < 3; c++) {
      const burned = Math.max(0, base[i + c] + t[i + c] - 255);
      out[i + c] = Math.round(a * burned + (1 - a) * t[i + c]);
    }
    out[i + 3] = 255;
  }
  return sharp(out, { raw: { width, height, channels: 4 } }).removeAlpha();
}

// Cuts out what a Figma layer shows of its image fill. imageTransform maps the layer's unit square onto the
// image's unit square (u = a·x + b·y + c, v = d·x + e·y + f), so each output pixel samples the image there.
async function cropFill(file, [[a, b, c], [d, e, f]], width, height) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(width * height * 4);
  const at = (x, y, ch) => data[(Math.min(info.height - 1, Math.max(0, y)) * info.width + Math.min(info.width - 1, Math.max(0, x))) * 4 + ch];
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const x = (px + 0.5) / width;
      const y = (py + 0.5) / height;
      const sx = (a * x + b * y + c) * info.width - 0.5;
      const sy = (d * x + e * y + f) * info.height - 0.5;
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const fx = sx - x0;
      const fy = sy - y0;
      for (let ch = 0; ch < 4; ch++) {
        const top = at(x0, y0, ch) * (1 - fx) + at(x0 + 1, y0, ch) * fx;
        const bottom = at(x0, y0 + 1, ch) * (1 - fx) + at(x0 + 1, y0 + 1, ch) * fx;
        out[(py * width + px) * 4 + ch] = Math.round(top * (1 - fy) + bottom * fy);
      }
    }
  }
  return sharp(out, { raw: { width, height, channels: 4 } });
}

async function encode(img, name, { width, alpha = false, quality } = {}) {
  const buf = await (width ? img.resize({ width, withoutEnlargement: true }) : img).png().toBuffer();
  await sharp(buf).avif({ ...AVIF, ...(alpha && { quality: 70 }), ...(quality && { quality }) }).toFile(path.join(OUT, `${name}.avif`));
  await sharp(buf).webp(WEBP).toFile(path.join(OUT, `${name}.webp`));
  const kb = (f) => Math.round(fs.statSync(path.join(OUT, f)).size / 1024);
  console.log(`${name}: avif ${kb(`${name}.avif`)} KB, webp ${kb(`${name}.webp`)} KB`);
}

const image = (file) => sharp(path.join(EXPORTS, file));
const fill = (prefix) => {
  const file = fs.readdirSync(path.join(EXPORTS, 'images')).find((f) => f.startsWith(prefix));
  if (!file) throw new Error(`No exported image fill starting with ${prefix}; run design/figma/scripts/export.mjs`);
  return image(path.join('images', file));
};

fs.mkdirSync(OUT, { recursive: true });

// Base offsets are the base layer's top minus the texture's top, at 4x (data/sheets/*.front.json).
// Papers are pure grain, so they take heavy compression; 2000 px covers a sheet ~650 px wide zoomed 3x.
const PAPER = { width: 2000, quality: 45 };
await encode(await compositePaper('personal-info', 3), 'paper-personal', PAPER);
await encode(await compositePaper('professional-info', 12), 'paper-professional', PAPER);
await encode(await compositePaper('projects', 0), 'paper-projects', PAPER);
await encode(image('assets/project-card@4x.png'), 'card-paper', { width: 1740 });

// Pieces laid around the text. Sizes allow the 3x zoom of a sheet shown about 900 px tall.
const fillFile = (prefix) => path.join(EXPORTS, 'images', fs.readdirSync(path.join(EXPORTS, 'images')).find((f) => f.startsWith(prefix)));
// Image transforms and layer sizes from data/sheets/professional-info.front.json (paperclip) and projects-page-1 (staple), at 8x.
await encode(await cropFill(fillFile('paperclip-'), [[0.2961, 0, 0.3631], [0, 0.7253, 0.0816]], 147, 385), 'paperclip', { alpha: true });
await encode(await cropFill(fillFile('stapler-'), [[0.0804, -0.2261, 0.8588], [0.0805, 0.6789, 0.0312]], 76, 373), 'stapler', { alpha: true });
await encode(fill('image-removebg-preview-1-'), 'seal', { width: 420, alpha: true });
await encode(fill('personal-paper-photo-2-front-'), 'photo-personal-2', { width: 900 });
await encode(fill('personal-paper-photo-1-front-'), 'photo-personal-1', { width: 900 });
await encode(fill('professional-paper-photo-2-front-'), 'photo-professional-2', { width: 700 });
await encode(fill('professional-paper-photo-1-front-'), 'photo-professional-1', { width: 900 });
await encode(fill('img-6600-2-'), 'photo-professional-desk', { width: 700 });
await encode(fill('texture-'), 'folder-texture', { width: 2048 });
