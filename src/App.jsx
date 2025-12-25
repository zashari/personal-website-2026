import { useState } from 'react';
import { Beams, Folder, Modal } from './components';
import { FOLDERS, BEAMS_CONFIG } from './constants/folders';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // For Folder 3 pages
  const [navigationDirection, setNavigationDirection] = useState(null); // 'next' | 'prev'
  const [activePhoto, setActivePhoto] = useState(null); // For photo popup

  const folderImages = {
    1: {
      front: '/assets/paper-personal-info.png',
      back: '/assets/paper-personal-info-back.png',
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
            front: '/assets/personal-paper-photo-2-front.png',
            back: '/assets/personal-paper-photo-2-back.png',
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
            front: '/assets/personal-paper-photo-1-front.png',
            back: '/assets/personal-paper-photo-1-back.png',
            alt: 'Photo 1',
          },
          title: 'Photo 1',
          debugColor: 'blue',
        },
      ],
    },
    2: {
      front: '/assets/paper-professional-info.png',
      back: '/assets/paper-professional-info-back.png',
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
            front: '/assets/professional-paper-photo-2-front.png',
            back: '/assets/professional-paper-photo-2-back.png',
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
            front: '/assets/professional-paper-photo-1-front.png',
            back: '/assets/professional-paper-photo-1-back.png',
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
        hotspots={currentImages.hotspots || []}
        activePhoto={activePhoto}
        onPhotoClick={handlePhotoClick}
        onClosePhoto={handleClosePhoto}
      />
    </div>
  );
}

export default App;

