import { useRef, useState, useEffect } from 'react';
import './Image3D.css';

const Image3D = ({ imageSrc, backImageSrc, alt }) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

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
    if (!container) return;

    // Get mouse position relative to container center
    const rect = container.getBoundingClientRect();
    const containerCenterX = rect.left + rect.width / 2;
    const containerCenterY = rect.top + rect.height / 2;
    
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
    
    // Calculate the point under cursor before zoom (in current scale space)
    const pointX = (adjustedMouseX - position.x) / scale;
    const pointY = (mouseY - position.y) / scale;
    
    // Calculate new position to keep the same point under cursor
    const newPositionX = adjustedMouseX - pointX * newScale;
    const newPositionY = mouseY - pointY * newScale;
    
    // Reset position if zooming out to scale 1
    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 });
    } else {
      setPosition({ x: newPositionX, y: newPositionY });
    }
    
    setScale(newScale);
  };

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
