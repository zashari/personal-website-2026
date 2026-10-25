import { useEffect, useRef } from 'react';

// Short sound effects on /home (the photo reel's shutter, the spheres appearing), through Web Audio: each file is
// decoded once and every play starts a fresh copy at once, with none of an <audio> element's start-up lag. All effects
// share one audio context, made when the first one mounts and closed when the last one goes.
//
// Browsers only allow sound after the visitor has interacted with the site. A click (TOUCH ME) is such an interaction,
// so its sound always plays; a hover (the reel) is not, so on a direct visit hovering stays silent until the first
// click, tap or key press anywhere on the page. Coming from /about with a click, Chrome allows sound straight away.
const GESTURES = ['pointerdown', 'keydown', 'touchend'];

const Context = window.AudioContext ?? window.webkitAudioContext;

// A resume still waiting when the page closes the context rejects; there is nothing left to start then.
const ignoreClosed = () => {};

let shared = null;

function acquire() {
  if (shared) {
    shared.users += 1;
    return shared.ctx;
  }
  const ctx = new Context();
  // resume() goes through now if sound is allowed already; otherwise the first gesture repeats it. Leaving the page
  // suspends it (the back/forward cache may keep the page whole), and coming back resumes it.
  // A gesture marks the context as waking: a click's pointerdown or keydown comes first, so a sound played by the
  // click itself can be queued and starts the moment the context does.
  const removeGestures = () => GESTURES.forEach((type) => window.removeEventListener(type, onGesture, true));
  function start() {
    if (ctx.state === 'suspended' && !document.hidden) ctx.resume().then(removeGestures, ignoreClosed);
  }
  function onGesture() {
    shared.waking = true;
    start();
  }
  const onPageHide = () => ctx.suspend();
  const onPageShow = (event) => event.persisted && start();
  GESTURES.forEach((type) => window.addEventListener(type, onGesture, true));
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);
  start();
  shared = {
    ctx,
    users: 1,
    waking: false,
    dispose: () => {
      removeGestures();
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      ctx.close();
    },
  };
  return ctx;
}

function release() {
  shared.users -= 1;
  if (shared.users > 0) return;
  shared.dispose();
  shared = null;
}

// Returns { play, stop }. play() starts the sound (overlapping any copy still playing); stop() fades out every copy
// still playing, over fadeSeconds.
export function useSoundEffect(src) {
  const sound = useRef({ ctx: null, buffer: null, voices: new Set() });

  useEffect(() => {
    if (!Context) return undefined;
    const state = sound.current;
    state.ctx = acquire();
    let cancelled = false;
    fetch(src)
      .then((response) => response.arrayBuffer())
      .then((data) => state.ctx.decodeAudioData(data))
      .then((buffer) => {
        if (!cancelled) state.buffer = buffer;
      })
      .catch((error) => console.error(`Home page: the sound ${src} could not be loaded`, error));
    return () => {
      cancelled = true;
      state.voices.clear();
      state.ctx = null;
      state.buffer = null;
      release();
    };
  }, [src]);

  const play = () => {
    const { ctx, buffer, voices } = sound.current;
    if (!ctx || !buffer) return;
    // A sound queued on a context that is not waking would burst out later, all at once, so it is skipped.
    if (ctx.state !== 'running' && !(ctx.state === 'suspended' && shared?.waking)) return;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    const voice = { source, gain };
    voices.add(voice);
    source.onended = () => voices.delete(voice);
    source.start();
  };

  const stop = (fadeSeconds = 0.25) => {
    const { ctx, voices } = sound.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    for (const { source, gain } of voices) {
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + fadeSeconds);
      source.stop(now + fadeSeconds);
    }
    voices.clear();
  };

  return { play, stop };
}
