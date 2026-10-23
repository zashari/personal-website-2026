import { PROJECTS } from '../content/dossier';
import { textureImage } from '../../constants/images';
import { PersonalBack, PersonalFront, WIDTH as PW, HEIGHT as PH } from './PersonalSheet';
import { ProfessionalBack, ProfessionalFront, WIDTH as RW, HEIGHT as RH } from './ProfessionalSheet';
import { ProjectsBack, ProjectsFront, WIDTH as JW, HEIGHT as JH } from './ProjectsSheet';
import PhotoBack, { photoNoteText } from './PhotoBack';
import './sheets.css';

// What each folder opens. Sheets are built per open so photo clicks reach the current handler.
export function folderSheet(folder, onPhotoOpen) {
  if (folder === 1) return { label: 'Personal info', aspect: PW / PH, front: <PersonalFront onPhotoOpen={onPhotoOpen} />, back: <PersonalBack /> };
  if (folder === 2) return { label: 'Professional info', aspect: RW / RH, front: <ProfessionalFront onPhotoOpen={onPhotoOpen} />, back: <ProfessionalBack /> };
  return null;
}

// Projects pages keyed 1..n, the shape ProjectStack expects.
export function projectPages() {
  return Object.fromEntries(PROJECTS.pages.map((page, i) => [
    i + 1,
    { label: `Projects, page ${i + 1} (${page.code})`, aspect: JW / JH, front: <ProjectsFront pageIndex={i} />, back: <ProjectsBack pageIndex={i} /> },
  ]));
}

// The photo viewer: the framed photo from the main site on the front, the handwritten note built as text on the back.
const PHOTO_FILES = {
  personal1: 'personal-paper-photo-1',
  personal2: 'personal-paper-photo-2',
  professional1: 'professional-paper-photo-1',
  professional2: 'professional-paper-photo-2',
};

function PhotoFace({ source, alt }) {
  return (
    <picture>
      <source type="image/avif" srcSet={source.avif} />
      <img src={source.webp} alt={alt} className="photo-face" draggable={false} decoding="async" />
    </picture>
  );
}

export function photoView(id) {
  return {
    alt: `Photo. On the back: ${photoNoteText(id)}`,
    front: <PhotoFace source={textureImage(`${PHOTO_FILES[id]}-front`)} alt="" />,
    back: <PhotoBack id={id} />,
  };
}
