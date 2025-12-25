import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import './Image3DWebGL.css';

// Paper mesh component that renders inside the Canvas
const PaperMesh = ({
  frontTexture,
  backTexture,
  rotation,
  aspectRatio,
  onSizeCalculated
}) => {
  const meshRef = useRef();
  const { viewport, size } = useThree();

  // Calculate plane size to fit viewport while maintaining aspect ratio
  const planeSize = useMemo(() => {
    const maxWidth = viewport.width * 0.85;
    const maxHeight = viewport.height * 0.85;

    let width, height;
    if (aspectRatio > maxWidth / maxHeight) {
      width = maxWidth;
      height = maxWidth / aspectRatio;
    } else {
      height = maxHeight;
      width = maxHeight * aspectRatio;
    }

    return { width, height };
  }, [viewport, aspectRatio]);

  // Calculate and report pixel size to parent
  useEffect(() => {
    if (onSizeCalculated && planeSize.width > 0) {
      // Convert Three.js units to pixels
      // viewport.width corresponds to size.width pixels
      const pixelPerUnit = size.width / viewport.width;
      const pixelWidth = planeSize.width * pixelPerUnit;
      const pixelHeight = planeSize.height * pixelPerUnit;
      onSizeCalculated({ width: pixelWidth, height: pixelHeight });
    }
  }, [planeSize, viewport, size, onSizeCalculated]);

  // Create materials for front and back
  const materials = useMemo(() => {
    const frontMaterial = new THREE.MeshBasicMaterial({
      map: frontTexture,
      side: THREE.FrontSide,
      transparent: true,
    });

    const backMaterial = new THREE.MeshBasicMaterial({
      map: backTexture,
      side: THREE.BackSide,
      transparent: true,
    });

    return [frontMaterial, backMaterial];
  }, [frontTexture, backTexture]);

  // Apply rotation from parent state
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.degToRad(rotation.x);
      meshRef.current.rotation.y = THREE.MathUtils.degToRad(rotation.y);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Front face */}
      <mesh material={materials[0]}>
        <planeGeometry args={[planeSize.width, planeSize.height]} />
      </mesh>
      {/* Back face */}
      <mesh material={materials[1]}>
        <planeGeometry args={[planeSize.width, planeSize.height]} />
      </mesh>
    </group>
  );
};

// Texture loader component
const TextureLoader = ({ frontSrc, backSrc, children, onLoad }) => {
  const [textures, setTextures] = useState({ front: null, back: null, aspectRatio: 1 });

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let disposed = false;

    const loadTexture = (src) => {
      return new Promise((resolve, reject) => {
        loader.load(
          src,
          (texture) => {
            // High quality texture settings - no mipmaps, linear filtering
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            texture.colorSpace = THREE.SRGBColorSpace;
            // Enable anisotropic filtering for better quality at angles
            texture.anisotropy = 16;
            resolve(texture);
          },
          undefined,
          reject
        );
      });
    };

    Promise.all([
      loadTexture(frontSrc),
      loadTexture(backSrc || frontSrc)
    ]).then(([front, back]) => {
      if (disposed) {
        front.dispose();
        back.dispose();
        return;
      }
      const aspectRatio = front.image.width / front.image.height;
      setTextures({ front, back, aspectRatio });
      if (onLoad) onLoad({ width: front.image.width, height: front.image.height, aspectRatio });
    }).catch(console.error);

    return () => {
      disposed = true;
    };
  }, [frontSrc, backSrc, onLoad]);

  // Cleanup textures on unmount
  useEffect(() => {
    return () => {
      if (textures.front) textures.front.dispose();
      if (textures.back) textures.back.dispose();
    };
  }, [textures]);

  if (!textures.front || !textures.back) {
    return null;
  }

  return children(textures);
};

// Camera controller for zoom
const CameraController = ({ scale, position }) => {
  const { camera } = useThree();

  useFrame(() => {
    // Adjust camera Z based on scale (inverse relationship)
    const baseZ = 5;
    camera.position.z = baseZ / scale;
    // Position camera to create panning effect
    camera.position.x = -position.x * 0.01 / scale;
    camera.position.y = position.y * 0.01 / scale;
    camera.updateProjectionMatrix();
  });

  return null;
};

// Component to report paper size from inside Canvas
const PaperSizeReporter = ({ aspectRatio, onSizeCalculated }) => {
  const { viewport, size } = useThree();

  useEffect(() => {
    if (!onSizeCalculated) return;

    const maxWidth = viewport.width * 0.85;
    const maxHeight = viewport.height * 0.85;

    let width, height;
    if (aspectRatio > maxWidth / maxHeight) {
      width = maxWidth;
      height = maxWidth / aspectRatio;
    } else {
      height = maxHeight;
      width = maxHeight * aspectRatio;
    }

    // Convert Three.js units to pixels
    const pixelPerUnit = size.width / viewport.width;
    const pixelWidth = width * pixelPerUnit;
    const pixelHeight = height * pixelPerUnit;

    onSizeCalculated({ width: pixelWidth, height: pixelHeight });
  }, [viewport, size, aspectRatio, onSizeCalculated]);

  return null;
};

const Image3DWebGL = ({
  imageSrc,
  backImageSrc,
  alt,
  isActive = true,
  hotspots = [],
  onPhotoClick
}) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const [paperPixelSize, setPaperPixelSize] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset when paper becomes inactive
  useEffect(() => {
    if (!isActive) {
      setRotation({ x: 0, y: 0 });
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isActive]);

  // Check if viewing backside
  const isBackside = useMemo(() => {
    const normalizedRotY = ((rotation.y % 360) + 360) % 360;
    return normalizedRotY > 90 && normalizedRotY < 270;
  }, [rotation.y]);

  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMouse.x;
      const deltaY = e.clientY - lastMouse.y;

      setRotation(prev => ({
        x: prev.x + deltaY * 0.5,
        y: prev.y + deltaX * 0.5
      }));

      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, lastMouse]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, scale * delta));

    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 });
      setScale(newScale);
      return;
    }

    // Cursor-centered zoom logic
    const container = containerRef.current;
    if (!container) {
      setScale(newScale);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const containerCenterY = containerRect.top + containerRect.height / 2;

    const mouseX = e.clientX - containerCenterX;
    const mouseY = e.clientY - containerCenterY;
    const adjustedMouseX = isBackside ? -mouseX : mouseX;

    // Use actual paper pixel size for calculations
    const baseWidth = paperPixelSize.width || containerRect.width * 0.85;
    const baseHeight = paperPixelSize.height || containerRect.height * 0.85;

    const scaledWidth = baseWidth * newScale;
    const scaledHeight = baseHeight * newScale;

    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const pointX = (adjustedMouseX - position.x) / scale;
    const pointY = (mouseY - position.y) / scale;

    let newPositionX = adjustedMouseX - pointX * newScale;
    let newPositionY = mouseY - pointY * newScale;

    const maxOffsetX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - containerHeight) / 2);

    newPositionX = Math.max(-maxOffsetX, Math.min(maxOffsetX, newPositionX));
    newPositionY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newPositionY));

    setPosition({ x: newPositionX, y: newPositionY });
    setScale(newScale);
  }, [scale, position, isBackside, paperPixelSize]);

  // Event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  const handleTextureLoad = useCallback((size) => {
    setImageAspectRatio(size.aspectRatio);
    setIsLoaded(true);
  }, []);

  const handlePaperSizeCalculated = useCallback((size) => {
    setPaperPixelSize(size);
  }, []);

  // Calculate hotspot container style - matches the paper position and transforms
  const hotspotLayerStyle = useMemo(() => {
    return {
      width: `${paperPixelSize.width}px`,
      height: `${paperPixelSize.height}px`,
      transform: `
        perspective(1000px)
        rotateX(${rotation.x}deg)
        rotateY(${rotation.y}deg)
        scale(${scale})
        translate(${position.x / scale}px, ${-position.y / scale}px)
      `,
      transformStyle: 'preserve-3d',
    };
  }, [rotation, scale, position, paperPixelSize]);

  return (
    <div
      ref={containerRef}
      className="image-3d-webgl-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance'
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        <TextureLoader
          frontSrc={imageSrc}
          backSrc={backImageSrc}
          onLoad={handleTextureLoad}
        >
          {(textures) => (
            <>
              <PaperMesh
                frontTexture={textures.front}
                backTexture={textures.back}
                rotation={rotation}
                aspectRatio={textures.aspectRatio}
              />
              <CameraController scale={scale} position={position} />
              <PaperSizeReporter
                aspectRatio={textures.aspectRatio}
                onSizeCalculated={handlePaperSizeCalculated}
              />
            </>
          )}
        </TextureLoader>
      </Canvas>

      {/* HTML Hotspot overlay - positioned to match the paper */}
      {isLoaded && hotspots.length > 0 && paperPixelSize.width > 0 && !isBackside && (
        <div className="image-3d-webgl-hotspot-layer">
          <div
            className="image-3d-webgl-hotspot-container"
            style={hotspotLayerStyle}
          >
            {hotspots.map((hotspot, index) => {
              const hotspotStyle = {
                top: hotspot.top,
                left: hotspot.left,
                width: hotspot.width,
                height: hotspot.height,
                transform: hotspot.rotation ? `rotate(${hotspot.rotation})` : undefined,
                ...(hotspot.debugColor && {
                  background: `${hotspot.debugColor}66`,
                  border: `2px solid ${hotspot.debugColor}`,
                }),
              };

              if (hotspot.type === 'photo' && onPhotoClick) {
                return (
                  <div
                    key={index}
                    className="image-3d-webgl-hotspot"
                    style={hotspotStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onPhotoClick(hotspot.photo);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    title={hotspot.title || ''}
                    role="button"
                    tabIndex={0}
                  />
                );
              }

              return (
                <a
                  key={index}
                  href={hotspot.href}
                  target={hotspot.target || '_blank'}
                  rel="noopener noreferrer"
                  className="image-3d-webgl-hotspot"
                  style={hotspotStyle}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  title={hotspot.title || ''}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Image3DWebGL;
