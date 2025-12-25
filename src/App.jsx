import { useState } from 'react';
import { Beams, Folder, Modal } from './components';
import { FOLDERS, BEAMS_CONFIG } from './constants/folders';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // For Folder 3 pages
  const [navigationDirection, setNavigationDirection] = useState(null); // 'next' | 'prev'

  const folderImages = {
    1: {
      front: '/assets/paper-personal-info.png',
      back: '/assets/paper-personal-info-back.png',
      alt: 'Personal Info'
    },
    2: {
      front: '/assets/paper-professional-info.png',
      back: '/assets/paper-professional-info-back.png',
      alt: 'Professional Info'
    },
    3: {
      pages: {
        1: {
          front: '/assets/paper-projects-page-1.png',
          back: '/assets/paper-projects-page-1-back.png',
          alt: 'Projects - Page 1'
        },
        2: {
          front: '/assets/paper-projects-page-2.png',
          back: '/assets/paper-projects-page-2-back.png',
          alt: 'Projects - Page 2'
        }
      }
    }
  };

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
      {/* Beams background */}
      <div className="beams-container">
        <Beams {...BEAMS_CONFIG} />
      </div>

      <div className="container">
        {FOLDERS.map((folder) => (
          <Folder
            key={folder.number}
            folderNumber={folder.number}
            coverImage={folder.coverImage}
            previewImage={folder.previewImage}
            onCoverClick={folder.number === 1 || folder.number === 2 || folder.number === 3 ? () => handleFolderClick(folder.number) : undefined}
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
      />
    </div>
  );
}

export default App;

