import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import './FlipBook3D.css';

// Single page component with front and back textures
const Page = ({ frontImage, backImage, position, flipAngle = 0, isLeftPage = false }) => {
  const meshRef = useRef();
  const [frontTexture, setFrontTexture] = useState(null);
  const [backTexture, setBackTexture] = useState(null);

  // Load textures
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    if (frontImage) {
      loader.load(frontImage, (texture) => {
        texture.flipY = false;
        setFrontTexture(texture);
      });
    }
    
    if (backImage) {
      loader.load(backImage, (texture) => {
        texture.flipY = false;
        setBackTexture(texture);
      });
    }
  }, [frontImage, backImage]);

  // Animate flip rotation
  useFrame(() => {
    if (meshRef.current) {
      const baseRotation = isLeftPage ? 0 : Math.PI;
      meshRef.current.rotation.y = baseRotation + flipAngle;
    }
  });

  const materials = useMemo(() => {
    const frontMat = new THREE.MeshStandardMaterial({
      map: frontTexture,
      side: THREE.FrontSide,
      transparent: true,
    });
    
    const backMat = new THREE.MeshStandardMaterial({
      map: backTexture,
      side: THREE.BackSide,
      transparent: true,
    });
    
    return [frontMat, backMat];
  }, [frontTexture, backTexture]);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1.4, 0.01]} />
      <primitive object={materials[0]} attach="material-0" />
      <primitive object={materials[1]} attach="material-1" />
    </mesh>
  );
};

// Book scene component
const BookScene = ({ pages, currentPage, onPageChange }) => {
  const [flipProgress, setFlipProgress] = useState(0);
  const previousPageRef = useRef(currentPage);

  useEffect(() => {
    if (previousPageRef.current !== currentPage) {
      setFlipProgress(0);
      
      const duration = 1200; // 1.2 second animation
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth flip (ease-in-out cubic)
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        setFlipProgress(eased);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setFlipProgress(0);
          previousPageRef.current = currentPage;
        }
      };
      
      animate();
    } else {
      // Reset flip progress when page doesn't change
      setFlipProgress(0);
    }
  }, [currentPage]);

  const page1 = pages[0];
  const page2 = pages[1];

  // Calculate flip angle: 
  // When currentPage = 1: flipAngle = 0 (show page 1)
  // When currentPage = 2: flipAngle = PI (flip to show page 2)
  // During animation: flipAngle interpolates from 0 to PI
  const targetFlipAngle = currentPage === 1 ? 0 : Math.PI;
  const flipAngle = previousPageRef.current === currentPage 
    ? targetFlipAngle 
    : targetFlipAngle * flipProgress;

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      <pointLight position={[0, 0, 5]} intensity={0.3} />
      
      {/* Book spine/center */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[0.05, 1.4, 0.02]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      
      {/* Page 1 - Left page (flips from left edge) */}
      <Page
        frontImage={page1?.front}
        backImage={page1?.back}
        position={[-0.5, 0, 0]}
        flipAngle={flipAngle}
        isLeftPage={true}
      />
      
      {/* Page 2 - Right page (stays in place, becomes visible when page 1 flips) */}
      <Page
        frontImage={page2?.front}
        backImage={page2?.back}
        position={[0.5, 0, 0]}
        flipAngle={0}
        isLeftPage={false}
      />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2.5}
        maxDistance={6}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate={false}
      />
    </>
  );
};

// Main FlipBook3D component
const FlipBook3D = ({ pages, currentPage, onPageChange }) => {
  return (
    <div className="flipbook-3d-container">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 3.5]} fov={45} />
        <BookScene pages={pages} currentPage={currentPage} onPageChange={onPageChange} />
      </Canvas>
    </div>
  );
};

export default FlipBook3D;

