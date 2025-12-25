import React, { useEffect } from 'react';
import Image3DWebGL from './Image3DWebGL';
import ProjectStack from './ProjectStack';
import './Modal.css';

const Modal = ({ isOpen, onClose, imageSrc, backImageSrc, alt, activeFolder, currentPage, onPageChange, folderPages, navigationDirection, hotspots, activePhoto, onPhotoClick, onClosePhoto }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        // If photo modal is open, close it first
        if (activePhoto) {
          onClosePhoto();
        } else {
          onClose();
        }
      } else if (activeFolder === 3 && !activePhoto) {
        // Handle page navigation for Folder 3 (circular - both directions always work)
        // Only when photo modal is not open
        if (e.key === 'ArrowRight') {
          onPageChange('next');
        } else if (e.key === 'ArrowLeft') {
          onPageChange('prev');
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, activeFolder, currentPage, onPageChange, activePhoto, onClosePhoto]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {activeFolder === 3 && folderPages ? (
          <ProjectStack
            pages={folderPages}
            currentPage={currentPage}
            navigationDirection={navigationDirection}
          />
        ) : (
          <Image3DWebGL
            key={`folder-${activeFolder}`}
            imageSrc={imageSrc}
            backImageSrc={backImageSrc}
            alt={alt}
            hotspots={hotspots}
            onPhotoClick={onPhotoClick}
          />
        )}
      </div>
      <div className="modal-guide-container">
        {activeFolder === 3 && (
          <div className="modal-guide-text">
            Press [←] [→] to navigate pages.
          </div>
        )}
        <div className="modal-close-text">Press [esc] to close.</div>
      </div>

      {/* Nested Photo Modal */}
      {activePhoto && (
        <div className="photo-modal-overlay" onClick={onClosePhoto}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <Image3DWebGL
              imageSrc={activePhoto.front}
              backImageSrc={activePhoto.back}
              alt={activePhoto.alt}
            />
          </div>
          <div className="modal-guide-container">
            <div className="modal-close-text">Press [esc] to close photo.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;

