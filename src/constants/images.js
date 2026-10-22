// Image URLs resolve through Vite so they are content-hashed and can be cached forever.
// The files are generated from design/source by scripts/optimize-images.mjs.
const FILES = import.meta.glob('../assets/images/*.{avif,webp}', { eager: true, query: '?url', import: 'default' });

const byName = Object.fromEntries(
  Object.entries(FILES).map(([key, url]) => [key.split('/').pop(), url])
);

const fileUrl = (file) => {
  const url = byName[file];
  if (!url) throw new Error(`Missing generated image ${file}; run npm run images`);
  return url;
};

// Width ladder of an image shown through <picture>, as srcset strings per format plus the largest WebP as fallback.
export function responsiveImage(name) {
  const pattern = new RegExp(`^${name}-(\\d+)w\\.webp$`);
  const widths = Object.keys(byName)
    .map((file) => Number(file.match(pattern)?.[1]))
    .filter(Boolean)
    .sort((a, b) => a - b);
  if (widths.length === 0) throw new Error(`No width ladder for ${name}; run npm run images`);
  const srcset = (ext) => widths.map((w) => `${fileUrl(`${name}-${w}w.${ext}`)} ${w}w`).join(', ');
  return {
    avif: srcset('avif'),
    webp: srcset('webp'),
    fallback: fileUrl(`${name}-${widths[widths.length - 1]}w.webp`),
  };
}

// A full-resolution texture source; the format is picked at load time by textureUrl().
export function textureImage(name) {
  return { avif: fileUrl(`${name}.avif`), webp: fileUrl(`${name}.webp`) };
}

const AVIF_PROBE = 'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAANZtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAAImlsb2MAAAAAREAAAQABAAAAAAD6AAEAAAAAAAAAFwAAACNpaW5mAAAAAAABAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAAVmlwcnAAAAA4aXBjbwAAAAxhdjFDgSACAAAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAABZpcG1hAAAAAAAAAAEAAQOBAgMAAAAfbWRhdBIACgc4AAYQENBpMgoYAAAAQAX172To';

let avifSupport;
function supportsAvif() {
  avifSupport ??= new Promise((resolve) => {
    const probe = new Image();
    probe.onload = () => resolve(probe.width > 0);
    probe.onerror = () => resolve(false);
    probe.src = AVIF_PROBE;
  });
  return avifSupport;
}

export async function textureUrl(source) {
  return (await supportsAvif()) ? source.avif : source.webp;
}
