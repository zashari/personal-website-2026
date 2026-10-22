import PropTypes from 'prop-types';
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

const imageShape = PropTypes.shape({
  avif: PropTypes.string.isRequired,
  webp: PropTypes.string.isRequired,
  fallback: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
});

FolderPicture.propTypes = {
  image: imageShape.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  onSettled: PropTypes.func,
};

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

Folder.propTypes = {
  folderNumber: PropTypes.number.isRequired,
  coverImage: imageShape.isRequired,
  previewImage: imageShape,
  onCoverClick: PropTypes.func,
  onImageSettled: PropTypes.func,
};

export default Folder;
