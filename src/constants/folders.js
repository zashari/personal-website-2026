export const FOLDERS = [
  {
    number: 3,
    coverImage: '/assets/folder-3-cover.png',
    previewImage: '/assets/folder-3-preview-home.png',
  },
  {
    number: 2,
    coverImage: '/assets/folder-2-cover.png',
    previewImage: '/assets/folder-2-preview-home.png',
  },
  {
    number: 1,
    coverImage: '/assets/folder-1-cover.png',
    previewImage: '/assets/folder-1-preview-home.png',
  },
];

// Beams background configuration (preserved for easy revert)
export const BEAMS_CONFIG = {
  beamWidth: 10,
  beamHeight: 30,
  beamNumber: 12,
  lightColor: '#ffffff',
  speed: 7,
  noiseIntensity: 0.5,
  scale: 0.2,
  rotation: 30,
};

// GridScan background configuration
export const GRID_SCAN_CONFIG = {
  sensitivity: 0.55,
  lineThickness: 1,
  linesColor: '#F9F7FC', // RGB: 249, 247, 252
  gridScale: 0.02,
  scanColor: '#E7DFE7', // RGB: 231, 223, 231
  scanOpacity: 0.4,
  scanDirection: 'forward',
  enablePost: false,
  bloomIntensity: 0.6,
  chromaticAberration: 0.002,
  noiseIntensity: 0.01,
  scanGlow: 0.5,
};

