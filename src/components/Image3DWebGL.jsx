import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import './Image3DWebGL.css';

// Paper mesh component that renders inside the Canvas
const PaperMesh = ({
  frontTexture,
  backTexture,
  rotation,
  scale,
  position,
  aspectRatio,
  hotspots,
  onHotspotPositionsUpdate,
}) => {
  const groupRef = useRef();
  const { viewport, camera, size } = useThree();

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

  // Project 3D position to 2D screen coordinates
  const projectToScreen = useCallback((worldPos) => {
    const vector = worldPos.clone();
    vector.project(camera);

    // Convert from normalized device coordinates to screen pixels
    const x = (vector.x + 1) / 2 * size.width;
    const y = -(vector.y - 1) / 2 * size.height;

    return { x, y, z: vector.z };
  }, [camera, size]);

  // Apply transforms and calculate hotspot screen positions
  useFrame(() => {
    if (!groupRef.current) return;

    // Apply transforms to the mesh group
    groupRef.current.rotation.x = THREE.MathUtils.degToRad(rotation.x);
    groupRef.current.rotation.y = THREE.MathUtils.degToRad(rotation.y);
    groupRef.current.scale.setScalar(scale);
    groupRef.current.position.x = position.x * (viewport.width / size.width);
    groupRef.current.position.y = -position.y * (viewport.height / size.height);

    // Calculate hotspot screen positions
    if (hotspots && hotspots.length > 0 && onHotspotPositionsUpdate) {
      const positions = hotspots.map((hotspot) => {
        // Parse percentage values
        const topPercent = parseFloat(hotspot.top) / 100;
        const leftPercent = parseFloat(hotspot.left) / 100;
        const widthPercent = parseFloat(hotspot.width) / 100;
        const heightPercent = parseFloat(hotspot.height) / 100;

        // Calculate 3D position on the paper plane
        // Paper is centered at origin, so we need to offset from center
        const halfWidth = planeSize.width / 2;
        const halfHeight = planeSize.height / 2;

        // Convert percentage to local 3D coordinates
        // Left edge is at -halfWidth, top edge is at +halfHeight
        const localX = -halfWidth + leftPercent * planeSize.width + (widthPercent * planeSize.width) / 2;
        const localY = halfHeight - topPercent * planeSize.height - (heightPercent * planeSize.height) / 2;
        const localZ = 0.01; // Slightly in front of the paper

        // Create local position vector
        const localPos = new THREE.Vector3(localX, localY, localZ);

        // Transform to world coordinates using the group's matrix
        groupRef.current.updateMatrixWorld();
        const worldPos = localPos.applyMatrix4(groupRef.current.matrixWorld);

        // Project to screen coordinates
        const screenPos = projectToScreen(worldPos);

        // Calculate screen dimensions for the hotspot
        // Project corners to get width/height in screen space
        const cornerTL = new THREE.Vector3(
          -halfWidth + leftPercent * planeSize.width,
          halfHeight - topPercent * planeSize.height,
          0.01
        ).applyMatrix4(groupRef.current.matrixWorld);

        const cornerTR = new THREE.Vector3(
          -halfWidth + (leftPercent + widthPercent) * planeSize.width,
          halfHeight - topPercent * planeSize.height,
          0.01
        ).applyMatrix4(groupRef.current.matrixWorld);

        const cornerBL = new THREE.Vector3(
          -halfWidth + leftPercent * planeSize.width,
          halfHeight - (topPercent + heightPercent) * planeSize.height,
          0.01
        ).applyMatrix4(groupRef.current.matrixWorld);

        const cornerBR = new THREE.Vector3(
          -halfWidth + (leftPercent + widthPercent) * planeSize.width,
          halfHeight - (topPercent + heightPercent) * planeSize.height,
          0.01
        ).applyMatrix4(groupRef.current.matrixWorld);

        const screenTL = projectToScreen(cornerTL);
        const screenTR = projectToScreen(cornerTR);
        const screenBL = projectToScreen(cornerBL);
        const screenBR = projectToScreen(cornerBR);

        // Calculate bounding box for the quadrilateral
        const minX = Math.min(screenTL.x, screenTR.x, screenBL.x, screenBR.x);
        const maxX = Math.max(screenTL.x, screenTR.x, screenBL.x, screenBR.x);
        const minY = Math.min(screenTL.y, screenTR.y, screenBL.y, screenBR.y);
        const maxY = Math.max(screenTL.y, screenTR.y, screenBL.y, screenBR.y);

        const boundingWidth = maxX - minX;
        const boundingHeight = maxY - minY;

        // Calculate clip-path polygon points relative to bounding box
        const clipPath = `polygon(
          ${((screenTL.x - minX) / boundingWidth) * 100}% ${((screenTL.y - minY) / boundingHeight) * 100}%,
          ${((screenTR.x - minX) / boundingWidth) * 100}% ${((screenTR.y - minY) / boundingHeight) * 100}%,
          ${((screenBR.x - minX) / boundingWidth) * 100}% ${((screenBR.y - minY) / boundingHeight) * 100}%,
          ${((screenBL.x - minX) / boundingWidth) * 100}% ${((screenBL.y - minY) / boundingHeight) * 100}%
        )`;

        return {
          x: minX,
          y: minY,
          width: boundingWidth,
          height: boundingHeight,
          clipPath,
          visible: screenPos.z < 1, // Only visible if in front of camera
        };
      });

      onHotspotPositionsUpdate(positions);
    }
  });

  return (
    <group ref={groupRef}>
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

    const loadTexture = (src, flipHorizontal = false) => {
      return new Promise((resolve, reject) => {
        loader.load(
          src,
          (texture) => {
            // High quality texture settings
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = 16;

            // Flip horizontally for back side
            if (flipHorizontal) {
              texture.wrapS = THREE.RepeatWrapping;
              texture.repeat.x = -1;
            }

            resolve(texture);
          },
          undefined,
          reject
        );
      });
    };

    Promise.all([
      loadTexture(frontSrc, false),
      loadTexture(backSrc || frontSrc, true) // Flip back side horizontally
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

const Image3DWebGL = ({
  imageSrc,
  backImageSrc,
  alt,
  isActive = true,
  hotspots = [],
  onPhotoClick,
  // Controlled transform props (for shared transform in stacks)
  transform,
  onTransformChange,
}) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalRotation, setInternalRotation] = useState({ x: 0, y: 0 });
  const [internalScale, setInternalScale] = useState(1);
  const [internalPosition, setInternalPosition] = useState({ x: 0, y: 0 });
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hotspotScreenPositions, setHotspotScreenPositions] = useState([]);

  // Use controlled or internal state
  const isControlled = transform !== undefined;
  const rotation = isControlled ? transform.rotation : internalRotation;
  const scale = isControlled ? transform.scale : internalScale;
  const position = isControlled ? transform.position : internalPosition;

  // State setters that work in both controlled and uncontrolled modes
  const setRotation = useCallback((valueOrUpdater) => {
    if (isControlled && onTransformChange) {
      const newRotation = typeof valueOrUpdater === 'function'
        ? valueOrUpdater(transform.rotation)
        : valueOrUpdater;
      onTransformChange({ ...transform, rotation: newRotation });
    } else {
      setInternalRotation(valueOrUpdater);
    }
  }, [isControlled, onTransformChange, transform]);

  const setScale = useCallback((newScale) => {
    if (isControlled && onTransformChange) {
      onTransformChange({ ...transform, scale: newScale });
    } else {
      setInternalScale(newScale);
    }
  }, [isControlled, onTransformChange, transform]);

  const setPosition = useCallback((newPosition) => {
    if (isControlled && onTransformChange) {
      onTransformChange({ ...transform, position: newPosition });
    } else {
      setInternalPosition(newPosition);
    }
  }, [isControlled, onTransformChange, transform]);

  // Reset when paper becomes inactive (only in uncontrolled mode)
  useEffect(() => {
    if (!isActive && !isControlled) {
      setInternalRotation({ x: 0, y: 0 });
      setInternalScale(1);
      setInternalPosition({ x: 0, y: 0 });
    }
  }, [isActive, isControlled]);

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
  }, [isDragging, lastMouse, setRotation]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch support for mobile
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState(null);

  const getTouchDistance = (touches) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches) => {
    if (touches.length < 2) return null;
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      // Single finger - start rotation
      setIsDragging(true);
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      // Two fingers - start pinch zoom
      setIsDragging(false);
      setLastPinchDistance(getTouchDistance(e.touches));
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
      // Single finger - rotate
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouch.x;
      const deltaY = touch.clientY - lastTouch.y;

      setRotation(prev => ({
        x: prev.x + deltaY * 0.5,
        y: prev.y + deltaX * 0.5
      }));

      setLastTouch({ x: touch.clientX, y: touch.clientY });
    } else if (e.touches.length === 2 && lastPinchDistance !== null) {
      // Two fingers - pinch zoom
      const newDistance = getTouchDistance(e.touches);
      if (newDistance) {
        const pinchScale = newDistance / lastPinchDistance;
        const newScale = Math.max(1, Math.min(3, scale * pinchScale));

        // Reset to center when at initial scale (1)
        if (newScale <= 1) {
          setPosition({ x: 0, y: 0 });
          setScale(1);
          setLastPinchDistance(newDistance);
          return;
        }

        // Get pinch center for zoom-to-point
        const container = containerRef.current;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const containerCenterX = containerRect.left + containerRect.width / 2;
          const containerCenterY = containerRect.top + containerRect.height / 2;

          const touchCenter = getTouchCenter(e.touches);
          const touchX = touchCenter.x - containerCenterX;
          const touchY = touchCenter.y - containerCenterY;
          const adjustedTouchX = isBackside ? -touchX : touchX;

          const pointX = (adjustedTouchX - position.x) / scale;
          const pointY = (touchY - position.y) / scale;

          const newPositionX = adjustedTouchX - pointX * newScale;
          const newPositionY = touchY - pointY * newScale;

          setPosition({ x: newPositionX, y: newPositionY });
        }

        setScale(newScale);
        setLastPinchDistance(newDistance);
      }
    }
  }, [isDragging, lastTouch, lastPinchDistance, scale, position, isBackside, setRotation, setScale, setPosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastPinchDistance(null);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();

    const container = containerRef.current;
    if (!container) return;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(1, Math.min(3, scale * delta));

    // Reset to center when at initial scale (1)
    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 });
      setScale(1);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const containerCenterY = containerRect.top + containerRect.height / 2;

    // Cursor position relative to container center
    const mouseX = e.clientX - containerCenterX;
    const mouseY = e.clientY - containerCenterY;
    const adjustedMouseX = isBackside ? -mouseX : mouseX;

    // Calculate the point on the paper that's under the cursor (in paper coordinates)
    const pointX = (adjustedMouseX - position.x) / scale;
    const pointY = (mouseY - position.y) / scale;

    // Calculate new position to keep that point under the cursor (no clamping)
    const newPositionX = adjustedMouseX - pointX * newScale;
    const newPositionY = mouseY - pointY * newScale;

    setPosition({ x: newPositionX, y: newPositionY });
    setScale(newScale);
  }, [scale, position, isBackside, setScale, setPosition]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleWheel, handleTouchMove]);

  const handleTextureLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleHotspotPositionsUpdate = useCallback((positions) => {
    setHotspotScreenPositions(positions);
  }, []);

  return (
    <div
      ref={containerRef}
      className="image-3d-webgl-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
            <PaperMesh
              frontTexture={textures.front}
              backTexture={textures.back}
              rotation={rotation}
              scale={scale}
              position={position}
              aspectRatio={textures.aspectRatio}
              hotspots={hotspots}
              onHotspotPositionsUpdate={handleHotspotPositionsUpdate}
            />
          )}
        </TextureLoader>
      </Canvas>

      {/* HTML Hotspot overlay - positioned using projected screen coordinates */}
      {hotspots.length > 0 && !isBackside && (
        <div className="image-3d-webgl-hotspot-layer">
          {hotspots.map((hotspot, index) => {
            const screenPos = hotspotScreenPositions[index];
            if (!screenPos) return null;

            const hotspotStyle = {
              position: 'absolute',
              left: `${screenPos.x}px`,
              top: `${screenPos.y}px`,
              width: `${Math.max(screenPos.width, 10)}px`,
              height: `${Math.max(screenPos.height, 10)}px`,
              clipPath: screenPos.clipPath,
              WebkitClipPath: screenPos.clipPath,
              // Debug colors (invisible in production)
              background: 'transparent',
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
      )}
    </div>
  );
};

export default Image3DWebGL;
