import { useState, useCallback, useRef, lazy, Suspense } from 'react';
import { CarbonSheet } from '../components';
import Folder from './folders/Folder';
import { FOLDERS } from '../constants/folders';
import InkFilters from './InkFilters';
import './TempApp.css';

// /temp: the main page with every dossier sheet built as live text. The folders, background and dialog
// behave as on /; only the sheets differ. ?proof=<sheet> renders one sheet flat for screenshot checks.

const loadSheets = () => import('./SheetsDialog');
const SheetsDialog = lazy(loadSheets);
const Proof = lazy(() => import('./Proof'));

const FOLDER_IMAGE_COUNT = FOLDERS.reduce((n, folder) => n + (folder.previewImage ? 2 : 1), 0);
const proof = new URLSearchParams(window.location.search).get('proof');

const ModalChunkLoading = () => (
  <div className="app-loading app-loading--overlay">
    <div className="app-loading-content">
      <span className="app-loading-text">Loading</span>
      <span className="app-loading-dots">
        <span>.</span><span>.</span><span>.</span>
      </span>
    </div>
  </div>
);

function TempApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState(null);

  const settledImagesRef = useRef(0);
  const handleImageSettled = useCallback(() => {
    settledImagesRef.current += 1;
    if (settledImagesRef.current >= FOLDER_IMAGE_COUNT) {
      setIsLoading(false);
      loadSheets().catch((error) => console.error('Failed to prefetch the dossier sheets', error));
    }
  }, []);

  if (proof) {
    return (
      <Suspense fallback={null}>
        <InkFilters />
        <Proof sheet={proof} />
      </Suspense>
    );
  }

  return (
    <div className="app">
      <InkFilters />
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

      {!isLoading && <CarbonSheet />}

      <div className="container">
        {FOLDERS.map((folder) => (
          <Folder
            key={folder.number}
            folderNumber={folder.number}
            label={folder.label}
            previewImage={folder.previewImage}
            onCoverClick={() => setActiveFolder(folder.number)}
            onImageSettled={handleImageSettled}
          />
        ))}
      </div>

      {activeFolder && (
        <Suspense fallback={<ModalChunkLoading />}>
          <SheetsDialog folder={activeFolder} onClose={() => setActiveFolder(null)} />
        </Suspense>
      )}
    </div>
  );
}

export default TempApp;
