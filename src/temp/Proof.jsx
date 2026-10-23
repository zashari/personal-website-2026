import { folderSheet, projectPages } from './sheets';
import PhotoBack from './sheets/PhotoBack';

// /temp/?proof=personal-front&width=613 renders one sheet side flat on the navy background, at a fixed
// width, for side-by-side and pixel comparison with the Figma renders (design/figma/exports/renders).
const SHEETS = {
  personal: () => folderSheet(1),
  professional: () => folderSheet(2),
  'projects-1': () => projectPages()[1],
  'projects-2': () => projectPages()[2],
  ...Object.fromEntries(['personal1', 'personal2', 'professional1', 'professional2'].map((id) => [`photo-${id}`, () => ({ back: <PhotoBack id={id} /> })])),
};

export default function Proof({ sheet }) {
  const params = new URLSearchParams(window.location.search);
  const [name, side = 'front'] = sheet.split(/-(?=front$|back$)/);
  const width = Number(params.get('width')) || 613;
  const data = SHEETS[name]?.();
  if (!data) return <p style={{ color: '#fff' }}>Unknown sheet {sheet}. Try {Object.keys(SHEETS).map((s) => `${s}-front`).join(', ')}.</p>;
  return (
    <div style={{ width, background: '#141828' }}>
      {data[side]}
    </div>
  );
}
