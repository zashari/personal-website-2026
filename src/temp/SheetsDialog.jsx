import { useMemo, useState } from 'react';
import Modal from './viewer/Modal';
import { folderSheet, photoView, projectPages } from './sheets';

// Holds the dialog state the main App keeps (page, direction, open photo) for one opened folder.
export default function SheetsDialog({ folder, onClose }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [navigationDirection, setNavigationDirection] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);

  const sheet = useMemo(() => folderSheet(folder, (id) => setActivePhoto(photoView(id))), [folder]);
  const pages = useMemo(() => (folder === 3 ? projectPages() : null), [folder]);

  const handlePageChange = (direction) => {
    if (!pages) return;
    const total = Object.keys(pages).length;
    setNavigationDirection(direction);
    if (direction === 'next') setCurrentPage((p) => (p % total) + 1);
    else if (direction === 'prev') setCurrentPage((p) => ((p - 2 + total) % total) + 1);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      sheet={sheet ?? pages[currentPage]}
      activeFolder={folder}
      currentPage={currentPage}
      onPageChange={handlePageChange}
      folderPages={pages}
      navigationDirection={navigationDirection}
      activePhoto={activePhoto}
      onClosePhoto={() => setActivePhoto(null)}
    />
  );
}
