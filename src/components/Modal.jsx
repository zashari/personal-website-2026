import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image3DWebGL from './Image3DWebGL';
import ProjectStack from './ProjectStack';
import './Modal.css';

const Modal = ({ isOpen, onClose, imageSrc, backImageSrc, alt, activeFolder, currentPage, onPageChange, folderPages, navigationDirection, hotspots, activePhoto, onPhotoClick, onClosePhoto }) => {
  // Touch swipe detection for folder-3 navigation
  const touchStartRef = useRef({ x: 0, y: 0 });
  const swipeDetectedRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTouchStart = useCallback((e) => {
    swipeDetectedRef.current = false;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (activeFolder !== 3 || activePhoto) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;

    // Only trigger swipe if horizontal movement is significant and greater than vertical
    const minSwipeDistance = 50;
    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
      e.stopPropagation();
      swipeDetectedRef.current = true;

      if (deltaX > 0) {
        // Swipe right -> previous page
        onPageChange('prev');
      } else {
        // Swipe left -> next page
        onPageChange('next');
      }
    }
  }, [activeFolder, activePhoto, onPageChange]);

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

  // Guide text based on device type
  const getNavigationGuide = () => {
    if (activeFolder === 3) {
      return isMobile
        ? 'Swipe left/right to navigate pages.'
        : 'Press [←] [→] to navigate pages.';
    }
    return null;
  };

  const getCloseGuide = () => {
    return isMobile
      ? 'Tap here to close.'
      : 'Press [esc] to close.';
  };

  const getPhotoCloseGuide = () => {
    return isMobile
      ? 'Tap here to close photo.'
      : 'Press [esc] to close photo.';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => {
          e.stopPropagation();
          // Block ghost clicks after swipe
          if (swipeDetectedRef.current) {
            swipeDetectedRef.current = false;
            e.preventDefault();
          }
        }}
        onTouchStart={activeFolder === 3 ? handleTouchStart : undefined}
        onTouchEnd={activeFolder === 3 ? handleTouchEnd : undefined}
      >
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
        {getNavigationGuide() && (
          <div className="modal-guide-text">
            {getNavigationGuide()}
          </div>
        )}
        <div
          className={`modal-close-text ${isMobile ? 'modal-close-text--tappable' : ''}`}
          onClick={isMobile ? (e) => { e.stopPropagation(); onClose(); } : undefined}
        >
          {getCloseGuide()}
        </div>
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
            <div
              className={`modal-close-text ${isMobile ? 'modal-close-text--tappable' : ''}`}
              onClick={isMobile ? (e) => { e.stopPropagation(); onClosePhoto(); } : undefined}
            >
              {getPhotoCloseGuide()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
