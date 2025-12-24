import PropTypes from 'prop-types';
import './Folder.css';

const Folder = ({ folderNumber, coverImage, previewImage, onCoverClick }) => {
  const handleCoverClick = () => {
    if (onCoverClick) {
      onCoverClick();
    }
  };

  return (
    <div className={`folder folder-${folderNumber}`}>
      {previewImage && (
        <img 
          src={previewImage} 
          alt={`Folder ${folderNumber} Preview`} 
          className="folder-preview" 
        />
      )}
      <img 
        src={coverImage} 
        alt={`Folder ${folderNumber}`} 
        className="folder-cover" 
        onClick={handleCoverClick}
        style={{ cursor: onCoverClick ? 'pointer' : 'default' }}
      />
    </div>
  );
};

Folder.propTypes = {
  folderNumber: PropTypes.number.isRequired,
  coverImage: PropTypes.string.isRequired,
  previewImage: PropTypes.string,
  onCoverClick: PropTypes.func,
};

export default Folder;

