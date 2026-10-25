import { useEffect, useRef } from 'react';

// A camera shutter for each cut of the photo reel. It goes through Web Audio: the 0.19 s click is decoded once and
// each call starts a fresh copy at once, with none of an <audio> element's start-up lag, so it lands on the cut.
//
// Browsers only allow sound after the visitor has interacted with the site. Hovering does not count, so on a direct
// visit the reel stays silent until the first click, tap or key press anywhere on the page; coming from /about with a
// click, Chrome allows it straight away. Until then a cut simply makes no sound.
const GESTURES = ['pointerdown', 'keydown', 'touchend'];

const Context = window.AudioContext ?? window.webkitAudioContext;

// A resume still waiting when the page closes the context rejects; there is nothing left to start then.
const ignoreClosed = () => {};

// Returns a function that plays the shutter once.
export function useShutterSound(src) {
  const audio = useRef(null);

  useEffect(() => {
    if (!Context) return undefined;
    const ctx = new Context();
    const state = { ctx, buffer: null };
    audio.current = state;

    let cancelled = false;
    fetch(src)
      .then((response) => response.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => {
        if (!cancelled) state.buffer = buffer;
      })
      .catch((error) => console.error('Home page: the shutter sound could not be loaded', error));

    // resume() goes through now if sound is allowed already; otherwise the first gesture repeats it. Leaving the page
    // suspends it (the back/forward cache may keep the page whole), and coming back resumes it.
    const removeGestures = () => GESTURES.forEach((type) => window.removeEventListener(type, start, true));
    function start() {
      if (ctx.state === 'suspended' && !document.hidden) ctx.resume().then(removeGestures, ignoreClosed);
    }
    const onPageHide = () => ctx.suspend();
    const onPageShow = (event) => event.persisted && start();
    GESTURES.forEach((type) => window.addEventListener(type, start, true));
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
    start();

    return () => {
      cancelled = true;
      audio.current = null;
      removeGestures();
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      ctx.close();
    };
  }, [src]);

  return () => {
    const state = audio.current;
    if (!state?.buffer || state.ctx.state !== 'running') return;
    const source = state.ctx.createBufferSource();
    source.buffer = state.buffer;
    source.connect(state.ctx.destination);
    source.start();
  };
}
