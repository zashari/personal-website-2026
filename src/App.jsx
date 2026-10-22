import { useState, useCallback, useRef } from 'react';
import { Beams, Folder, Modal } from './components';
import { FOLDERS, BEAMS_CONFIG } from './constants/folders';
import { textureImage } from './constants/images';
import './App.css';

// Every folder has a cover and a preview image; the loading screen stays up until all of them settle.
const FOLDER_IMAGE_COUNT = FOLDERS.reduce((n, folder) => n + (folder.previewImage ? 2 : 1), 0);

// Texture sources are created once here so their identity is stable across renders.
const folderImages = {
  1: {
    front: textureImage('paper-personal-info'),
    back: textureImage('paper-personal-info-back'),
    alt: 'Personal Info',
    hotspots: [
      {
        top: '26.5%',
        left: '26%',
        width: '22%',
        height: '2.8%',
        href: 'https://wa.me/6281248777317',
        title: 'WhatsApp',
        debugColor: 'green',
      },
      {
        top: '26.5%',
        left: '57%',
        width: '30%',
        height: '2.8%',
        href: 'mailto:izzat.zaky@gmail.com',
        title: 'Email',
        debugColor: 'orange',
      },
      {
        top: '-2%',
        left: '62.5%',
        width: '25.5%',
        height: '20.2%',
        rotation: '0deg',
        type: 'photo',
        photo: {
          front: textureImage('personal-paper-photo-2-front'),
          back: textureImage('personal-paper-photo-2-back'),
          alt: 'Photo 2',
        },
        title: 'Photo 2',
        debugColor: 'red',
      },
      {
        top: '6%',
        left: '75%',
        width: '24%',
        height: '17%',
        rotation: '7.12deg',
        type: 'photo',
        photo: {
          front: textureImage('personal-paper-photo-1-front'),
          back: textureImage('personal-paper-photo-1-back'),
          alt: 'Photo 1',
        },
        title: 'Photo 1',
        debugColor: 'blue',
      },
    ],
  },
  2: {
    front: textureImage('paper-professional-info'),
    back: textureImage('paper-professional-info-back'),
    alt: 'Professional Info',
    hotspots: [
      {
        top: '0.5%',
        left: '62.5%',
        width: '19%',
        height: '13.5%',
        rotation: '0deg',
        type: 'photo',
        photo: {
          front: textureImage('professional-paper-photo-2-front'),
          back: textureImage('professional-paper-photo-2-back'),
          alt: 'Photo 2',
        },
        title: 'Photo 2',
        debugColor: 'red',
      },
      {
        top: '2.1%',
        left: '76.4%',
        width: '21.2%',
        height: '15.5%',
        rotation: '15deg',
        type: 'photo',
        photo: {
          front: textureImage('professional-paper-photo-1-front'),
          back: textureImage('professional-paper-photo-1-back'),
          alt: 'Photo 1',
        },
        title: 'Photo 1',
        debugColor: 'blue',
      },
    ],
  },
  3: {
    pages: {
      1: {
        front: textureImage('paper-projects-page-1'),
        back: textureImage('paper-projects-page-1-back'),
        alt: 'Projects - Page 1'
      },
      2: {
        front: textureImage('paper-projects-page-2'),
        back: textureImage('paper-projects-page-2-back'),
        alt: 'Projects - Page 2'
      }
    }
  }
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // For Folder 3 pages
  const [navigationDirection, setNavigationDirection] = useState(null); // 'next' | 'prev'
  const [activePhoto, setActivePhoto] = useState(null); // For photo popup

  const settledImagesRef = useRef(0);
  const handleImageSettled = useCallback(() => {
    settledImagesRef.current += 1;
    if (settledImagesRef.current >= FOLDER_IMAGE_COUNT) {
      setIsLoading(false);
    }
  }, []);

  const handleFolderClick = (folderNumber) => {
    setActiveFolder(folderNumber);
    setCurrentPage(1); // Reset to page 1 when opening Folder 3
    setNavigationDirection(null); // Reset navigation direction
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveFolder(null);
    setCurrentPage(1); // Reset page when closing
    setActivePhoto(null); // Reset photo when closing
  };

  const handlePhotoClick = (photo) => {
    setActivePhoto(photo);
  };

  const handleClosePhoto = () => {
    setActivePhoto(null);
  };

  const handlePageChange = (direction) => {
    if (activeFolder === 3) {
      const totalPages = Object.keys(folderImages[3].pages).length;
      setNavigationDirection(direction);

      if (direction === 'next') {
        // Circular: 1 -> 2 -> ... -> n -> 1
        setCurrentPage(prev => (prev % totalPages) + 1);
      } else if (direction === 'prev') {
        // Circular: 1 -> n -> n-1 -> ... -> 2 -> 1
        setCurrentPage(prev => ((prev - 2 + totalPages) % totalPages) + 1);
      }
    }
  };

  const getCurrentImages = () => {
    if (!activeFolder) return folderImages[1];

    if (activeFolder === 3) {
      return folderImages[3].pages[currentPage];
    }

    return folderImages[activeFolder];
  };

  const currentImages = getCurrentImages();

  return (
    <div className="app">
      {/* Loading screen covers the folders while their images load underneath */}
      {isLoading && (
        <div className="app-loading">
          <div className="app-loading-content">
            <span className="app-loading-text">Loading</span>
            <span className="app-loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </div>
        </div>
      )}

      {/* Beams background */}
      {!isLoading && (
        <div className="beams-container">
          <Beams {...BEAMS_CONFIG} />
        </div>
      )}

      <div className="container">
        {FOLDERS.map((folder) => (
          <Folder
            key={folder.number}
            folderNumber={folder.number}
            coverImage={folder.coverImage}
            previewImage={folder.previewImage}
            onCoverClick={folder.number === 1 || folder.number === 2 || folder.number === 3 ? () => handleFolderClick(folder.number) : undefined}
            onImageSettled={handleImageSettled}
          />
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        imageSrc={currentImages.front}
        backImageSrc={currentImages.back}
        alt={currentImages.alt}
        activeFolder={activeFolder}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        folderPages={activeFolder === 3 ? folderImages[3].pages : null}
        navigationDirection={navigationDirection}
        hotspots={currentImages.hotspots || []}
        activePhoto={activePhoto}
        onPhotoClick={handlePhotoClick}
        onClosePhoto={handleClosePhoto}
      />
    </div>
  );
}

export default App;
