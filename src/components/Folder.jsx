import { FOLDER_IMAGE_SIZES } from '../constants/folders';
import './Folder.css';

const FolderPicture = ({ image, alt, className, onSettled, ...imgProps }) => (
  <picture>
    <source type="image/avif" srcSet={image.avif} sizes={FOLDER_IMAGE_SIZES} />
    <source type="image/webp" srcSet={image.webp} sizes={FOLDER_IMAGE_SIZES} />
    <img
      src={image.fallback}
      width={image.width}
      height={image.height}
      alt={alt}
      className={className}
      onLoad={onSettled}
      onError={onSettled}
      decoding="async"
      fetchPriority="high"
      {...imgProps}
    />
  </picture>
);

const Folder = ({ folderNumber, label, coverImage, previewImage, onCoverClick, onImageSettled }) => {
  const handleCoverClick = () => {
    if (onCoverClick) {
      onCoverClick();
    }
  };

  return (
    <div className={`folder folder-${folderNumber}`}>
      {previewImage && (
        <FolderPicture
          image={previewImage}
          alt=""
          className="folder-preview"
          onSettled={onImageSettled}
        />
      )}
      <button
        type="button"
        className="folder-cover-button"
        onClick={handleCoverClick}
        aria-label={`Open ${label}`}
        style={{ cursor: onCoverClick ? 'pointer' : 'default' }}
      >
        <FolderPicture
          image={coverImage}
          alt=""
          className="folder-cover"
          onSettled={onImageSettled}
        />
      </button>
    </div>
  );
};

export default Folder;
