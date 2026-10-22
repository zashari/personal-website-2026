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

const Folder = ({ folderNumber, coverImage, previewImage, onCoverClick, onImageSettled }) => {
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
          alt={`Folder ${folderNumber} Preview`}
          className="folder-preview"
          onSettled={onImageSettled}
        />
      )}
      <FolderPicture
        image={coverImage}
        alt={`Folder ${folderNumber}`}
        className="folder-cover"
        onSettled={onImageSettled}
        onClick={handleCoverClick}
        style={{ cursor: onCoverClick ? 'pointer' : 'default' }}
      />
    </div>
  );
};

export default Folder;
