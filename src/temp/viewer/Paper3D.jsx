import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './Paper3D.css';

// The paper viewer rebuilt with CSS 3D transforms instead of WebGL. It reproduces the original
// Image3DWebGL feel: drag to rotate (0.5° per px), flip to the back, wheel or pinch zoom 1–3× toward the
// pointer. The sheet is real DOM, so links, text and focus work directly on it.
//
// Zoom changes the sheet's layout width rather than scaling a transform, so the browser lays the text
// out again at the new size and it stays sharp at 3×.

const DEFAULT_TRANSFORM = { rotation: { x: 0, y: 0 }, scale: 1, position: { x: 0, y: 0 } };
const FIT = 0.85; // the original plane filled 85 % of the viewer
const MIN_SCALE = 1;
const MAX_SCALE = 3;
// The original camera: 50° vertical field of view, so the eye sits 1 / (2·tan 25°) viewer-heights away.
const PERSPECTIVE = 1 / (2 * Math.tan((25 * Math.PI) / 180));

export { DEFAULT_TRANSFORM };

export default function Paper3D({ front, back, aspect, label, isActive = true, transform, onTransformChange, onLoadComplete }) {
  const containerRef = useRef(null);
  const sheetRef = useRef(null);
  const pointers = useRef(new Map());
  const pinch = useRef(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [internal, setInternal] = useState(DEFAULT_TRANSFORM);
  const [ready, setReady] = useState(false);

  const controlled = transform !== undefined;
  const current = controlled ? transform : internal;
  // Latest transform for handlers that fire between renders (wheel, pointer moves); update() keeps it current too.
  const currentRef = useRef(current);
  useLayoutEffect(() => {
    currentRef.current = current;
  });

  const update = useCallback((next) => {
    const value = typeof next === 'function' ? next(currentRef.current) : next;
    currentRef.current = value;
    if (controlled) onTransformChange?.(value);
    else setInternal(value);
  }, [controlled, onTransformChange]);

  useEffect(() => {
    if (!isActive && !controlled) setInternal(DEFAULT_TRANSFORM);
  }, [isActive, controlled]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    const observer = new ResizeObserver(([entry]) => {
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keep the sheet hidden behind the dialog's Loading text until the fonts and every image on both faces
  // have decoded, as the WebGL viewer did, so it never appears half drawn.
  useEffect(() => {
    let cancelled = false;
    const images = [...sheetRef.current.querySelectorAll('img')];
    Promise.all([document.fonts.ready, ...images.map((img) => img.decode().catch(() => {}))]).then(() => {
      if (cancelled) return;
      setReady(true);
      onLoadComplete?.();
    });
    return () => { cancelled = true; };
  }, [onLoadComplete]);

  const baseWidth = Math.min(box.width * FIT, box.height * FIT * aspect);

  // Which side faces the viewer: the sheet's normal after rotateX then rotateY points at the camera
  // when cos(x)·cos(y) > 0. Used to hide the far face outright rather than trusting backface-visibility,
  // which Safari ignores once a face holds filtered or blended content.
  const toRad = Math.PI / 180;
  const isBackside = Math.cos(current.rotation.x * toRad) * Math.cos(current.rotation.y * toRad) < 0;

  // Zoom by `factor` keeping the point under (clientX, clientY) still.
  const zoomAt = useCallback((factor, clientX, clientY) => {
    const { scale, position } = currentRef.current;
    const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));
    if (next <= MIN_SCALE) {
      update((t) => ({ ...t, scale: MIN_SCALE, position: { x: 0, y: 0 } }));
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const px = clientX - (rect.left + rect.width / 2);
    const py = clientY - (rect.top + rect.height / 2);
    const k = next / scale;
    update((t) => ({ ...t, scale: next, position: { x: px - (px - position.x) * k, y: py - (py - position.y) * k } }));
  }, [update]);

  useEffect(() => {
    const el = containerRef.current;
    const onWheel = (e) => {
      if (!isActive) return;
      e.preventDefault();
      zoomAt(e.deltaY > 0 ? 0.9 : 1.1, e.clientX, e.clientY);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt, isActive]);

  const onPointerDown = (e) => {
    if (!isActive || (e.pointerType === 'mouse' && e.button !== 0)) return;
    // Links and photos on the sheet take their own clicks instead of starting a drag.
    if (e.target.closest('a, button')) return;
    containerRef.current.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e) => {
    const last = pointers.current.get(e.pointerId);
    if (!last) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      update((t) => ({ ...t, rotation: { x: t.rotation.x + dy * 0.5, y: t.rotation.y + dx * 0.5 } }));
    } else if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt(distance / pinch.current, (a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch.current = distance;
    }
  };

  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  const { rotation, scale, position } = current;
  const sheetStyle = {
    width: `${baseWidth * scale}px`,
    aspectRatio: aspect,
    transform: `translate(-50%, -50%) translate3d(${position.x}px, ${position.y}px, 0) rotateX(${-rotation.x}deg) rotateY(${rotation.y}deg)`,
  };

  return (
    <div
      ref={containerRef}
      className="paper3d"
      style={{ perspective: `${box.height * PERSPECTIVE}px` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div ref={sheetRef} className={`paper3d-sheet${baseWidth && ready ? '' : ' is-measuring'}`} style={sheetStyle} role="document" aria-label={label}>
        {/* The face turned away is hidden and takes no clicks. Safari both draws and hit-tests a
            backface-hidden face here, so the back (later in the DOM) would cover the front and swallow
            clicks on its photos and links. */}
        <div className={`paper3d-face${isBackside ? ' is-away' : ''}`} aria-hidden={isBackside}>{front}</div>
        <div className={`paper3d-face paper3d-face--back${isBackside ? '' : ' is-away'}`} aria-hidden={!isBackside}>{back}</div>
      </div>
    </div>
  );
}
