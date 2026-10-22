# Personal Website

A skeuomorphic file cabinet: three dossier folders over a carbon-sheet background. Opening a folder shows its paper as a 3D sheet you can turn over and zoom.

## Setup

```bash
npm install
npm run dev      # development server
npm run build    # production build in dist/
npm run images   # re-encode images after changing a master in design/source
```

## Project Structure

```
design/source/          # PNG masters (not shipped); npm run images encodes them
scripts/
  └── optimize-images.mjs   # PNG masters -> AVIF/WebP in src/assets/images
src/
  ├── assets/
  │   ├── fonts/        # JMH Typewriter, subset to ASCII (WOFF2)
  │   └── images/       # generated AVIF/WebP (committed)
  ├── components/
  │   ├── CarbonSheet.jsx   # background: mirrored dossier impressions on carbon paper
  │   ├── Folder.jsx        # folder cover (button) and preview, via <picture>
  │   ├── Modal.jsx         # paper viewer dialog, loaded lazily with three.js
  │   ├── ProjectStack.jsx  # page stack for the Projects folder
  │   └── Image3DWebGL.jsx  # paper/photo as a WebGL plane: rotate, zoom, hotspots
  ├── constants/
  │   ├── folders.js    # folder images and sizes
  │   └── images.js     # hashed image URLs, srcset ladders, AVIF/WebP pick for textures
  ├── App.jsx
  └── main.jsx
public/
  ├── learning/         # /learning (served with the Cloudflare Worker in worker/)
  └── og-image.jpg, favicons, CNAME
```

## Technologies

- React 19 with React Compiler
- Vite 8
- three.js with @react-three/fiber 9 (paper viewer only)
- GitHub Pages deploy on Node 24 (.github/workflows/deploy.yml)
