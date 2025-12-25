import { useRef, useState, useEffect } from 'react';
import './Image3D.css';

const Image3D = ({ imageSrc, backImageSrc, alt, isActive = true }) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const wrapperRef = useRef(null);
  const baseSizeRef = useRef({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

  // Reset rotation, scale, and position when paper becomes inactive (goes to back)
  useEffect(() => {
    if (!isActive) {
      setRotation({ x: 0, y: 0 });
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isActive]);

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMouse.x;
      const deltaY = e.clientY - lastMouse.y;
      
      setRotation(prev => ({
        x: prev.x + deltaY * 0.5,
        y: prev.y + deltaX * 0.5
      }));
      
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    const image = imageRef.current;
    if (!container || !wrapper || !image) return;

    // Get mouse position relative to container center
    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const containerCenterY = containerRect.top + containerRect.height / 2;
    
    // Mouse position relative to container center
    const mouseX = e.clientX - containerCenterX;
    const mouseY = e.clientY - containerCenterY;

    // Check if we're viewing the backside (Y rotation is around 180 degrees)
    // Normalize rotation to 0-360 range
    const normalizedRotY = ((rotation.y % 360) + 360) % 360;
    const isBackside = normalizedRotY > 90 && normalizedRotY < 270;
    
    // Invert X coordinate when viewing backside
    const adjustedMouseX = isBackside ? -mouseX : mouseX;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, scale * delta));
    
    // Reset position if zooming out to scale 1
    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 });
      setScale(newScale);
      return;
    }
    
    // Get base size - use stored value if available, otherwise calculate from current size
    let baseWidth = baseSizeRef.current.width;
    let baseHeight = baseSizeRef.current.height;
    
    if (baseWidth === 0 || baseHeight === 0) {
      // Fallback: calculate from current rendered size
      const imageRect = image.getBoundingClientRect();
      baseWidth = imageRect.width / scale;
      baseHeight = imageRect.height / scale;
    }
    
    // Calculate scaled dimensions
    const scaledWidth = baseWidth * newScale;
    const scaledHeight = baseHeight * newScale;
    
    // Container dimensions
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // Calculate the point under cursor before zoom (in current scale space)
    // This is the point in the base (unscaled) coordinate system
    const pointX = (adjustedMouseX - position.x) / scale;
    const pointY = (mouseY - position.y) / scale;
    
    // Calculate new position to keep the same point under cursor
    let newPositionX = adjustedMouseX - pointX * newScale;
    let newPositionY = mouseY - pointY * newScale;
    
    // Calculate bounds to keep paper visible
    // The paper is centered, so at position (0,0) the center is at container center
    // When scaled, we need to ensure edges don't go outside container
    // maxOffset = half the difference between scaled size and container size
    const maxOffsetX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - containerHeight) / 2);
    
    // Clamp position to bounds
    newPositionX = Math.max(-maxOffsetX, Math.min(maxOffsetX, newPositionX));
    newPositionY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newPositionY));
    
    setPosition({ x: newPositionX, y: newPositionY });
    setScale(newScale);
  };

  // Store base size when image loads (at scale 1)
  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const updateBaseSize = () => {
      if (scale === 1 && image.complete) {
        const imageRect = image.getBoundingClientRect();
        baseSizeRef.current = {
          width: imageRect.width,
          height: imageRect.height
        };
      }
    };

    if (image.complete) {
      updateBaseSize();
    } else {
      image.addEventListener('load', updateBaseSize);
      return () => image.removeEventListener('load', updateBaseSize);
    }
  }, [imageSrc, scale]);

  // Clamp position to bounds whenever scale changes (safety net)
  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;

    if (scale <= 1) {
      setPosition(prev => {
        if (prev.x !== 0 || prev.y !== 0) {
          return { x: 0, y: 0 };
        }
        return prev;
      });
      return;
    }

    // Use requestAnimationFrame to ensure DOM has updated after scale change
    const rafId = requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      
      // Use stored base size or calculate from current
      let baseWidth = baseSizeRef.current.width;
      let baseHeight = baseSizeRef.current.height;
      
      if (baseWidth === 0 || baseHeight === 0) {
        const imageRect = image.getBoundingClientRect();
        baseWidth = imageRect.width / scale;
        baseHeight = imageRect.height / scale;
      }
      
      const scaledWidth = baseWidth * scale;
      const scaledHeight = baseHeight * scale;
      
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      
      const maxOffsetX = Math.max(0, (scaledWidth - containerWidth) / 2);
      const maxOffsetY = Math.max(0, (scaledHeight - containerHeight) / 2);
      
      setPosition(prev => {
        const clampedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, prev.x));
        const clampedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, prev.y));
        
        if (clampedX !== prev.x || clampedY !== prev.y) {
          return { x: clampedX, y: clampedY };
        }
        return prev;
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [scale]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (e) => handleMouseMove(e);
    const handleUp = () => handleMouseUp();
    const handleWheelEvent = (e) => handleWheel(e);

    container.addEventListener('mousemove', handleMove);
    container.addEventListener('mouseup', handleUp);
    container.addEventListener('mouseleave', handleUp);
    container.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      container.removeEventListener('mousemove', handleMove);
      container.removeEventListener('mouseup', handleUp);
      container.removeEventListener('mouseleave', handleUp);
      container.removeEventListener('wheel', handleWheelEvent);
    };
  }, [isDragging, lastMouse, scale, position, rotation]);

  return (
    <div 
      ref={containerRef}
      className="image-3d-container"
      onMouseDown={handleMouseDown}
    >
      <div 
        ref={wrapperRef}
        className="image-3d-wrapper"
        style={{
          transform: `
            perspective(1000px) 
            rotateX(${rotation.x}deg) 
            rotateY(${rotation.y}deg) 
            scale(${scale})
            translate(${position.x}px, ${position.y}px)
          `,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div className="image-3d-card">
          <div className="image-3d-face image-3d-face-front">
            <img 
              ref={imageRef}
              src={imageSrc} 
              alt={alt} 
              className="image-3d-img"
              draggable={false}
            />
          </div>
          {backImageSrc && (
            <div className="image-3d-face image-3d-face-back">
              <img 
                src={backImageSrc} 
                alt={`${alt} - Back`} 
                className="image-3d-img"
                draggable={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Image3D;
