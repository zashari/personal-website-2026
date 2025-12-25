import React, { useEffect } from 'react';
import Image3D from './Image3D';
import FlipBook3D from './FlipBook3D';
import './Modal.css';

const Modal = ({ isOpen, onClose, imageSrc, backImageSrc, alt, activeFolder, currentPage, onPageChange, folderImages }) => {
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

  // For Folder 3, use FlipBook3D with both pages
  if (activeFolder === 3 && folderImages?.[3]?.pages) {
    const pages = [
      {
        front: folderImages[3].pages[1].front,
        back: folderImages[3].pages[1].back,
      },
      {
        front: folderImages[3].pages[2].front,
        back: folderImages[3].pages[2].back,
      },
    ];

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <FlipBook3D 
            pages={pages}
            currentPage={currentPage}
            onPageChange={(page) => {
              if (page === 1) onPageChange('prev');
              if (page === 2) onPageChange('next');
            }}
          />
        </div>
        <div className="modal-guide-container">
          <div className="modal-guide-text">
            Press [←] [→] to navigate pages.
          </div>
          <div className="modal-close-text">Press [esc] to close.</div>
        </div>
      </div>
    );
  }

  // For folders 1 and 2, use Image3D
  const imageKey = `folder-${activeFolder}`;

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
        <div className="modal-close-text">Press [esc] to close.</div>
      </div>
    </div>
  );
};

export default Modal;

