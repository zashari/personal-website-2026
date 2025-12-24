# Personal Website

A personal website featuring a skeuomorphic file cabinet design with animated beams background.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
  ├── components/          # React components
  │   ├── Beams.jsx       # Animated beams background component
  │   ├── Folder.jsx      # Folder component
  │   ├── GridScan.jsx    # Grid scan background component
  │   ├── Image3D.jsx     # 3D interactive image component
  │   ├── Modal.jsx       # Modal component
  │   └── Folder.css      # Folder styles
  ├── constants/          # Configuration constants
  │   └── folders.js      # Folder and beams configuration
  ├── App.jsx             # Main application component
  ├── App.css             # Application styles
  ├── index.css           # Global styles
  └── main.jsx            # Application entry point

public/
  └── assets/             # Static assets (folder images and paper documents)
```

## Technologies

- React 18
- Vite
- Three.js
- @react-three/fiber
- @react-three/drei
