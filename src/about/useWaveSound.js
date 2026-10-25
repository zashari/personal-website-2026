import { useEffect, useRef, useState } from 'react';

// The sound of the waves, looped for as long as the page is open. It goes through Web Audio rather than an <audio>
// element: a buffer loops without the gap an MP3 leaves at its seam, and a gain node fades it in and out.
//
// It starts on arrival when the browser allows sound. Chrome does when the visitor came from another page of the
// site with a click (the ABOUT ME link on /home); a direct visit, and Safari and Firefox, need a gesture on this page
// first, so the first click, tap or key press anywhere starts it. Turning it off is remembered, and a later visit
// then stays quiet until the visitor turns it on again.
const SOUND_KEY = 'zashari-about-sound';
const FADE_IN_S = 1.6;
const FADE_OUT_S = 0.4;
const GESTURES = ['pointerdown', 'keydown', 'touchend'];
// Put this attribute on the sound switch (see AboutApp.jsx).
export const SOUND_SWITCH_ATTR = 'data-sound-switch';
const SWITCH_SELECTOR = `[${SOUND_SWITCH_ATTR}]`;

function storedOff() {
  try {
    return localStorage.getItem(SOUND_KEY) === 'off';
  } catch {
    return false; // storage blocked: sound is on by default
  }
}

function storeOff(off) {
  try {
    localStorage.setItem(SOUND_KEY, off ? 'off' : 'on');
  } catch {
    // Storage blocked (private mode, site data off): the choice lasts for this visit only.
  }
}

// A resume still waiting when the page closes the context rejects; there is nothing left to start then.
const ignoreClosed = () => {};

const Context = window.AudioContext ?? window.webkitAudioContext;

// Returns { supported, on, toggle }. on is true only while the sound is audible; while the browser still holds it
// back, the switch reads off, and pressing it (or anything else) starts it. Without Web Audio there is no sound and
// no switch.
export function useWaveSound(src) {
  const [wanted, setWanted] = useState(() => !storedOff());
  const [running, setRunning] = useState(false);
  const audio = useRef(null);

  // One context for the page's lifetime: decode the file once, start the looping source, and leave the gain at 0.
  useEffect(() => {
    if (!Context) return undefined;
    const ctx = new Context();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    audio.current = { ctx, gain };
    const onState = () => setRunning(ctx.state === 'running');
    ctx.addEventListener('statechange', onState);
    onState();

    let cancelled = false;
    fetch(src)
      .then((response) => response.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => {
        if (cancelled) return;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);
        source.start();
      })
      .catch((error) => console.error('About page: the wave sound could not be loaded', error));

    return () => {
      cancelled = true;
      audio.current = null;
      ctx.removeEventListener('statechange', onState);
      ctx.close();
    };
  }, [src]);

  // Follow the visitor's choice: fade in (resuming the context, which may wait for a gesture) or fade out and suspend.
  useEffect(() => {
    const state = audio.current;
    if (!state) return undefined;
    const { ctx, gain } = state;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    if (!wanted) {
      gain.gain.linearRampToValueAtTime(0, now + FADE_OUT_S);
      const timer = setTimeout(() => ctx.state === 'running' && ctx.suspend(), FADE_OUT_S * 1000);
      return () => clearTimeout(timer);
    }
    gain.gain.linearRampToValueAtTime(1, now + FADE_IN_S);

    // resume() goes through now if sound is allowed already; otherwise it waits, and the first gesture repeats it.
    // The switch itself is left to its own click handler, which would otherwise see the sound already started by its
    // pointerdown and turn it straight off again.
    const removeGestures = () => GESTURES.forEach((type) => window.removeEventListener(type, onGesture, true));
    const start = () => {
      if (ctx.state === 'suspended' && !document.hidden) ctx.resume().then(removeGestures, ignoreClosed);
    };
    const onGesture = (event) => {
      if (!(event.target instanceof Element && event.target.closest(SWITCH_SELECTOR))) start();
    };
    GESTURES.forEach((type) => window.addEventListener(type, onGesture, true));
    start();

    // A hidden tab goes quiet, and picks up again when shown.
    const onVisibility = () => (document.hidden ? ctx.suspend() : start());
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      removeGestures();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [wanted]);

  const on = wanted && running;
  const toggle = () => {
    if (on) {
      storeOff(true);
      setWanted(false);
      return;
    }
    // Resume inside the click itself: Safari only lets a context start from within the gesture.
    audio.current?.ctx.resume().catch(ignoreClosed);
    storeOff(false);
    setWanted(true);
  };

  return { supported: !!Context, on, toggle };
}
