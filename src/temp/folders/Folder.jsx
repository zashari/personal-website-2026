import { FOLDER_IMAGE_SIZES } from '../../constants/folders';
import FolderCover from './FolderCover';
import '../../components/Folder.css';
import './Folder.css';

// src/components/Folder.jsx with the cover drawn in code; the preview papers stay the existing images.
const Folder = ({ folderNumber, label, previewImage, onCoverClick, onImageSettled }) => (
  <div className={`folder folder-${folderNumber}`}>
    {previewImage && (
      <picture>
        <source type="image/avif" srcSet={previewImage.avif} sizes={FOLDER_IMAGE_SIZES} />
        <source type="image/webp" srcSet={previewImage.webp} sizes={FOLDER_IMAGE_SIZES} />
        <img
          src={previewImage.fallback}
          width={previewImage.width}
          height={previewImage.height}
          alt=""
          className="folder-preview"
          onLoad={onImageSettled}
          onError={onImageSettled}
          decoding="async"
          fetchPriority="high"
        />
      </picture>
    )}
    <button type="button" className="folder-cover-button" onClick={onCoverClick} aria-label={`Open ${label}`}>
      <FolderCover folderNumber={folderNumber} onLoad={onImageSettled} />
    </button>
  </div>
);

export default Folder;
