import { responsiveImage } from './images';

// width/height are the master sizes; they only reserve the aspect ratio before the image arrives.
export const FOLDERS = [
  {
    number: 3,
    coverImage: { ...responsiveImage('folder-3-cover'), width: 3456, height: 934 },
    previewImage: { ...responsiveImage('folder-3-preview-home'), width: 1625, height: 541 },
  },
  {
    number: 2,
    coverImage: { ...responsiveImage('folder-2-cover'), width: 3456, height: 934 },
    previewImage: { ...responsiveImage('folder-2-preview-home'), width: 1683, height: 408 },
  },
  {
    number: 1,
    coverImage: { ...responsiveImage('folder-1-cover'), width: 3456, height: 926 },
    previewImage: { ...responsiveImage('folder-1-preview-home'), width: 1701, height: 380 },
  },
];

// Folders span 100vw, 180vw at <=768px and 220vw at <=480px (see Folder.css).
export const FOLDER_IMAGE_SIZES = '(max-width: 480px) 220vw, (max-width: 768px) 180vw, 100vw';
