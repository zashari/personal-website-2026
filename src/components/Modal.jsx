import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image3DWebGL from './Image3DWebGL';
import ProjectStack from './ProjectStack';
import './Modal.css';

const Modal = ({ isOpen, onClose, imageSrc, backImageSrc, alt, activeFolder, currentPage, onPageChange, folderPages, navigationDirection, hotspots, activePhoto, onPhotoClick, onClosePhoto }) => {
  // Touch swipe detection for folder-3 navigation
  const touchStartRef = useRef({ x: 0, y: 0 });
  const overlayRef = useRef(null);
  const photoOverlayRef = useRef(null);
  const swipeDetectedRef = useRef(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches);
  const [isLoading, setIsLoading] = useState(true);
  const [isPhotoLoading, setIsPhotoLoading] = useState(true);

  // Reset loading state when modal opens or folder changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen, activeFolder]);

  // Reset photo loading state when photo changes
  useEffect(() => {
    if (activePhoto) {
      setIsPhotoLoading(true);
    }
  }, [activePhoto]);

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handlePhotoLoadComplete = useCallback(() => {
    setIsPhotoLoading(false);
  }, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      // Only use screen width for mobile detection (touchscreen desktops should remain desktop)
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Move focus into the dialog when it opens. Hand it back to the folder on close only when the
  // folder was opened from the keyboard; a mouse user would otherwise get a focus ring and a peek.
  // preventScroll keeps the clipped folder scene from shifting.
  useEffect(() => {
    if (!isOpen) return undefined;
    const opener = document.activeElement;
    const openedFromKeyboard = opener?.matches?.(':focus-visible') ?? false;
    overlayRef.current?.focus({ preventScroll: true });
    return () => {
      if (openedFromKeyboard) opener.focus({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!activePhoto) return undefined;
    photoOverlayRef.current?.focus({ preventScroll: true });
    return () => {
      // Skip when the whole viewer is closing; the effect above restores focus then.
      if (overlayRef.current?.isConnected) overlayRef.current.focus({ preventScroll: true });
    };
  }, [activePhoto]);

  const handleTouchStart = useCallback((e) => {
    swipeDetectedRef.current = false;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    // Disable swipe navigation on mobile for folder-3 (use buttons instead)
    if (activeFolder !== 3 || activePhoto || isMobile) return;

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
  }, [activeFolder, activePhoto, isMobile, onPageChange]);

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
      // On mobile, we use buttons instead of swipe, so no text guide needed
      return isMobile
        ? null
        : 'Press [←] [→] to navigate pages.';
    }
    return null;
  };

  const getCloseGuide = () => {
    return isMobile
      ? 'Exit'
      : 'Press [esc] to close.';
  };

  // The phone "Exit" labels act as buttons; give them button semantics and keyboard activation.
  const tappable = (action) => ({
    role: 'button',
    tabIndex: 0,
    onClick: (e) => { e.stopPropagation(); action(); },
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        action();
      }
    },
  });

  const getPhotoCloseGuide = () => {
    return isMobile
      ? 'Exit'
      : 'Press [esc] to close photo.';
  };

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={activeFolder === 3 ? `Projects, page ${currentPage}` : alt}
      tabIndex={-1}
    >
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
        {/* Loading Indicator */}
        {isLoading && (
          <div className="modal-loading">
            <span className="modal-loading-text">Loading</span>
            <span className="modal-loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </div>
        )}
        {activeFolder === 3 && folderPages ? (
          <ProjectStack
            pages={folderPages}
            currentPage={currentPage}
            navigationDirection={navigationDirection}
            onLoadComplete={handleLoadComplete}
          />
        ) : (
          <Image3DWebGL
            key={`folder-${activeFolder}`}
            imageSrc={imageSrc}
            backImageSrc={backImageSrc}
            alt={alt}
            hotspots={hotspots}
            onPhotoClick={onPhotoClick}
            onLoadComplete={handleLoadComplete}
          />
        )}
      </div>
      {/* Hide parent guide when photo modal is open */}
      {!activePhoto && (
        <div className="modal-guide-container">
          {getNavigationGuide() && (
            <div className="modal-guide-text">
              {getNavigationGuide()}
            </div>
          )}
          {/* Mobile navigation buttons for folder-3 */}
          {isMobile && activeFolder === 3 ? (
            <div className="modal-nav-buttons">
              <button
                className="modal-nav-btn"
                onClick={(e) => { e.stopPropagation(); onPageChange('prev'); }}
                aria-label="Previous page"
              >
                &lt;
              </button>
              <div
                className="modal-close-text modal-close-text--tappable"
                {...tappable(onClose)}
              >
                {getCloseGuide()}
              </div>
              <button
                className="modal-nav-btn"
                onClick={(e) => { e.stopPropagation(); onPageChange('next'); }}
                aria-label="Next page"
              >
                &gt;
              </button>
            </div>
          ) : (
            <div
              className={`modal-close-text ${isMobile ? 'modal-close-text--tappable' : ''}`}
              {...(isMobile ? tappable(onClose) : {})}
            >
              {getCloseGuide()}
            </div>
          )}
        </div>
      )}

      {/* Nested Photo Modal */}
      {activePhoto && (
        <div
          ref={photoOverlayRef}
          className="photo-modal-overlay"
          onClick={onClosePhoto}
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.alt}
          tabIndex={-1}
        >
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Photo Loading Indicator */}
            {isPhotoLoading && (
              <div className="modal-loading">
                <span className="modal-loading-text">Loading</span>
                <span className="modal-loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            )}
            <Image3DWebGL
              imageSrc={activePhoto.front}
              backImageSrc={activePhoto.back}
              alt={activePhoto.alt}
              onLoadComplete={handlePhotoLoadComplete}
            />
          </div>
          <div className="modal-guide-container">
            <div
              className={`modal-close-text ${isMobile ? 'modal-close-text--tappable' : ''}`}
              {...(isMobile ? tappable(onClosePhoto) : {})}
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
