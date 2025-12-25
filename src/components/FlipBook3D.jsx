import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import './FlipBook3D.css';

// Single page component with front and back textures
const Page = ({ frontImage, backImage, position, flipAngle = 0, isLeftPage = false }) => {
  const meshRef = useRef();
  const frontMatRef = useRef();
  const backMatRef = useRef();
  const [frontTexture, setFrontTexture] = useState(null);
  const [backTexture, setBackTexture] = useState(null);

  // Load textures
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    if (frontImage) {
      loader.load(
        frontImage,
        (texture) => {
          texture.flipY = false;
          texture.colorSpace = THREE.SRGBColorSpace;
          setFrontTexture(texture);
          if (frontMatRef.current) {
            frontMatRef.current.map = texture;
            frontMatRef.current.needsUpdate = true;
          }
        },
        undefined,
        (error) => {
          console.error('Error loading front texture:', error);
        }
      );
    }
    
    if (backImage) {
      loader.load(
        backImage,
        (texture) => {
          texture.flipY = false;
          texture.colorSpace = THREE.SRGBColorSpace;
          setBackTexture(texture);
          if (backMatRef.current) {
            backMatRef.current.map = texture;
            backMatRef.current.needsUpdate = true;
          }
        },
        undefined,
        (error) => {
          console.error('Error loading back texture:', error);
        }
      );
    }
  }, [frontImage, backImage]);

  // Animate flip rotation
  useFrame(() => {
    if (meshRef.current) {
      const baseRotation = isLeftPage ? 0 : Math.PI;
      meshRef.current.rotation.y = baseRotation + flipAngle;
    }
  });

  // Create materials
  const frontMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: frontTexture,
      side: THREE.FrontSide,
      transparent: true,
    });
    frontMatRef.current = mat;
    return mat;
  }, [frontTexture]);

  const backMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: backTexture,
      side: THREE.BackSide,
      transparent: true,
    });
    backMatRef.current = mat;
    return mat;
  }, [backTexture]);

  // Page dimensions - adjust to match typical paper aspect ratio
  const pageWidth = 1;
  const pageHeight = 1.4;

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[pageWidth, pageHeight, 0.01]} />
      <primitive object={frontMaterial} attach="material-0" />
      <primitive object={backMaterial} attach="material-1" />
    </mesh>
  );
};

// Book scene component
const BookScene = ({ pages, currentPage, onPageChange }) => {
  const [flipProgress, setFlipProgress] = useState(0);
  const previousPageRef = useRef(currentPage);

  // Initialize previousPageRef
  useEffect(() => {
    previousPageRef.current = currentPage;
  }, []);

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
    }
  }, [currentPage]);

  const page1 = pages?.[0];
  const page2 = pages?.[1];

  if (!page1 || !page2) {
    return null;
  }

  // Calculate flip angle: 
  // When currentPage = 1: flipAngle = 0 (show page 1)
  // When currentPage = 2: flipAngle = PI (flip to show page 2)
  // During animation: flipAngle interpolates from 0 to PI
  const targetFlipAngle = currentPage === 1 ? 0 : Math.PI;
  const isAnimating = previousPageRef.current !== currentPage;
  const flipAngle = isAnimating ? targetFlipAngle * flipProgress : targetFlipAngle;

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
        frontImage={page1.front}
        backImage={page1.back}
        position={[-0.5, 0, 0]}
        flipAngle={flipAngle}
        isLeftPage={true}
      />
      
      {/* Page 2 - Right page (stays in place, becomes visible when page 1 flips) */}
      <Page
        frontImage={page2.front}
        backImage={page2.back}
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
  if (!pages || pages.length < 2) {
    return (
      <div className="flipbook-3d-container">
        <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
          Loading pages...
        </div>
      </div>
    );
  }

  return (
    <div className="flipbook-3d-container">
      <Canvas
        gl={{ 
          antialias: true, 
          alpha: true,
          preserveDrawingBuffer: false,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        onCreated={(state) => {
          state.gl.setClearColor('#000000', 0);
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 3.5]} fov={45} />
        <BookScene pages={pages} currentPage={currentPage} onPageChange={onPageChange} />
      </Canvas>
    </div>
  );
};

export default FlipBook3D;

