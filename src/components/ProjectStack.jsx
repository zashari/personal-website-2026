import { useState, useEffect, useRef, useCallback } from 'react';
import Image3DWebGL from './Image3DWebGL';
import './ProjectStack.css';

const DEFAULT_TRANSFORM = {
  rotation: { x: 0, y: 0 },
  scale: 1,
  position: { x: 0, y: 0 },
};

const ProjectStack = ({ pages, currentPage, navigationDirection, onLoadComplete }) => {
  const totalPages = Object.keys(pages).length;

  // Initialize stack with all pages in order (page 1 on top initially)
  const [stack, setStack] = useState(() => {
    // Stack order: bottom to top, so [2, 3, 4, ..., n, 1] means page 1 is on top
    const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
    // Rotate so page 1 is at the end (top of stack)
    return [...allPages.slice(1), allPages[0]];
  });

  // Shared transform state for the entire stack
  const [stackTransform, setStackTransform] = useState(DEFAULT_TRANSFORM);

  const [animatingPage, setAnimatingPage] = useState(null);
  const [slideDirection, setSlideDirection] = useState(null); // 'right' | 'left'
  const [animationPhase, setAnimationPhase] = useState(null); // 'slide-out' | 'slide-back'
  const prevPageRef = useRef(currentPage);

  // Reset transform when page changes
  const handleTransformChange = useCallback((newTransform) => {
    setStackTransform(newTransform);
  }, []);

  useEffect(() => {
    const prevPage = prevPageRef.current;

    if (prevPage !== currentPage && navigationDirection) {
      const incomingPage = currentPage;
      // Use navigation direction from props (not calculated from page numbers)
      // 'next' -> slide from right, 'prev' -> slide from left
      const direction = navigationDirection === 'next' ? 'right' : 'left';

      // Reset transform when changing pages
      setStackTransform(DEFAULT_TRANSFORM);

      // Phase 1: Slide out (stays behind)
      setAnimatingPage(incomingPage);
      setSlideDirection(direction);
      setAnimationPhase('slide-out');

      // Phase 2: At midpoint, update stack order
      const midpointTimer = setTimeout(() => {
        setAnimationPhase('slide-back');
        // Circular carousel: move previous page to back, incoming page to top
        setStack(prev => {
          // Remove incoming page from its current position
          const withoutIncoming = prev.filter(p => p !== incomingPage);
          // Remove prev page from its current position
          const withoutBoth = withoutIncoming.filter(p => p !== prevPage);
          // Prev page goes to back (start of array), incoming goes to top (end of array)
          return [prevPage, ...withoutBoth, incomingPage];
        });
      }, 400); // Half of the animation (0.4s)

      // Clear animation state after complete
      const completeTimer = setTimeout(() => {
        setAnimatingPage(null);
        setSlideDirection(null);
        setAnimationPhase(null);
      }, 800);

      prevPageRef.current = currentPage;
      return () => {
        clearTimeout(midpointTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [currentPage, navigationDirection]);

  // Get the page data for rendering
  const getPageData = (pageNum) => pages[pageNum];

  // Determine z-index and animation classes for each page
  const getPageStyle = (pageNum) => {
    const stackIndex = stack.indexOf(pageNum);
    const isInStack = stackIndex !== -1;
    const isAnimating = animatingPage === pageNum;

    if (isAnimating && slideDirection) {
      if (animationPhase === 'slide-out') {
        // Phase 1: Sliding out, stays behind current top
        return {
          zIndex: 0, // Behind everything
          className: `project-page slide-out-${slideDirection}`
        };
      } else if (animationPhase === 'slide-back') {
        // Phase 2: Sliding back, now on top
        return {
          zIndex: stack.length + 1,
          className: `project-page slide-back-${slideDirection}`
        };
      }
    }

    if (isInStack) {
      return {
        zIndex: stackIndex + 1,
        className: 'project-page in-stack'
      };
    }

    // Page not yet in stack and not animating
    return {
      zIndex: 0,
      className: 'project-page hidden-behind'
    };
  };

  return (
    <div className="project-stack-container">
      {/* Render all pages */}
      {Object.keys(pages).map((pageKey) => {
        const pageNum = parseInt(pageKey);
        const pageData = getPageData(pageNum);
        const { zIndex, className } = getPageStyle(pageNum);

        // Page is active (interactive) only when it's on top of the stack
        const isTopOfStack = stack[stack.length - 1] === pageNum;

        return (
          <div
            key={`page-${pageNum}`}
            className={className}
            style={{ zIndex }}
          >
            <Image3DWebGL
              imageSrc={pageData.front}
              backImageSrc={pageData.back}
              alt={pageData.alt}
              isActive={isTopOfStack}
              transform={stackTransform}
              onTransformChange={isTopOfStack ? handleTransformChange : undefined}
              onLoadComplete={isTopOfStack ? onLoadComplete : undefined}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ProjectStack;
