import React, { useEffect } from 'react';
import Image3D from './Image3D';
import './Modal.css';

const Modal = ({ isOpen, onClose, imageSrc, backImageSrc, alt, activeFolder, currentPage, onPageChange }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (activeFolder === 3) {
        // Handle page navigation for Folder 3
        if (e.key === 'ArrowRight' && currentPage < 2) {
          onPageChange('next');
        } else if (e.key === 'ArrowLeft' && currentPage > 1) {
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
  }, [isOpen, onClose, activeFolder, currentPage, onPageChange]);

  if (!isOpen) return null;

  // Create a unique key that changes when page changes to reset Image3D state
  const imageKey = activeFolder === 3 ? `folder-3-page-${currentPage}` : `folder-${activeFolder}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <Image3D 
          key={imageKey}
          imageSrc={imageSrc} 
          backImageSrc={backImageSrc} 
          alt={alt} 
        />
      </div>
      <div className="modal-guide-container">
        {activeFolder === 3 && (
          <div className="modal-guide-text">
            Press [←] [→] to navigate pages.
          </div>
        )}
        <div className="modal-close-text">Press [esc] to close.</div>
      </div>
    </div>
  );
};

export default Modal;

