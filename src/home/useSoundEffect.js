import { useEffect } from 'react';

// Short sound effects on /home (the photo reel's shutter, the spheres appearing), through Web Audio: each file is
// decoded once and every play starts a fresh copy at once, with none of an <audio> element's start-up lag.
//
// Why the engine is shaped like this (measured on Windows 11 + Chrome; reports/Web Audio UI sound latency.md):
// - Opening the audio device from cold took about 2.1 s. Chrome closes it 5 s after a context stops, and 35 s after a
//   running context last made a sound (30 s on a silent fake output, then the 5 s close). A context made or resumed
//   inside the click pays that same cost, so starting late cannot make the first sound fast; keeping the device open
//   does: a sound on an open device came out in 10-60 ms.
// - So after the first gesture the context keeps running with a constant signal of 1e-6 (-120 dBFS: below hearing and
//   below a 16-bit output's smallest step, and too quiet for Chrome's "playing audio" tab icon), which keeps Chrome on
//   the real device. It stops after KEEP_ALIVE_MS without pointer or key activity (laptop batteries), and the next
//   pointer movement brings it back, usually well before the next click.
// - One context for the page's whole life, outside React: closing and remaking it (React StrictMode mounts effects
//   twice) would close the device again.
//
// Browsers only allow sound after the visitor has interacted with the site. A click (TOUCH ME) is such an interaction,
// so its sound always plays, though as the very first one the device still has to open; a hover (the reel) is not, so
// on a direct visit hovering stays silent until the first click, tap or key press anywhere on the page. Coming from
// /about with a click, Chrome allows sound straight away.
const GESTURES = ['pointerdown', 'keydown', 'touchend'];
const ACTIVITY = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'];
const KEEP_ALIVE_LEVEL = 1e-6;
const KEEP_ALIVE_MS = 2 * 60 * 1000;

const Context = window.AudioContext ?? window.webkitAudioContext;

// A resume still waiting when the page goes away rejects; there is nothing left to start then.
const ignoreRejected = () => {};

let engine = null;

function getEngine() {
  if (engine || !Context) return engine;
  const ctx = new Context();
  const buffers = new Map(); // src -> Promise<AudioBuffer>
  let keepAlive = null;
  let idleTimer = 0;
  // A gesture marks the context as waking: a click's pointerdown or keydown comes before the click, so a sound played
  // by the click itself is queued and starts the moment the context does.
  let waking = false;

  const startKeepAlive = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(stopKeepAlive, KEEP_ALIVE_MS);
    if (keepAlive || ctx.state !== 'running' || !window.ConstantSourceNode) return;
    keepAlive = new ConstantSourceNode(ctx, { offset: KEEP_ALIVE_LEVEL });
    keepAlive.connect(ctx.destination);
    keepAlive.start();
  };
  function stopKeepAlive() {
    clearTimeout(idleTimer);
    keepAlive?.stop();
    keepAlive = null;
  }

  // Pointer movement arrives many times a second; re-arming the idle timer once a second is plenty.
  let lastWake = 0;
  const wake = () => {
    if (document.hidden) return;
    const now = performance.now();
    if (keepAlive && now - lastWake < 1000) return;
    lastWake = now;
    if (ctx.state === 'running') startKeepAlive();
    else if (waking) ctx.resume().then(startKeepAlive, ignoreRejected);
  };
  const onGesture = () => {
    waking = true;
    wake();
  };
  // Hidden or left (the back/forward cache may keep the page whole): suspend, and pick up again on return.
  const onVisibility = () => {
    if (document.hidden) {
      stopKeepAlive();
      ctx.suspend();
    } else wake();
  };
  const onPageHide = () => {
    stopKeepAlive();
    ctx.suspend();
  };
  const onPageShow = (event) => event.persisted && wake();

  GESTURES.forEach((type) => window.addEventListener(type, onGesture, true));
  ACTIVITY.forEach((type) => window.addEventListener(type, wake, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);
  // Allowed already (arriving from /about with a click): start at once. Otherwise this waits for a gesture.
  ctx.resume().then(startKeepAlive, ignoreRejected);

  engine = {
    ctx,
    load(src) {
      if (!buffers.has(src)) {
        buffers.set(
          src,
          fetch(src)
            .then((response) => response.arrayBuffer())
            .then((data) => ctx.decodeAudioData(data))
        );
      }
      return buffers.get(src);
    },
    // A sound queued on a context that is not waking would burst out later, all at once, so it is skipped.
    canPlay: () => ctx.state === 'running' || (ctx.state === 'suspended' && waking && !document.hidden),
  };
  return engine;
}

// Returns { play, stop }. play() starts the sound (overlapping any copy still playing); stop() fades out every copy
// of it still playing, over fadeSeconds.
export function useSoundEffect(src) {
  const sound = useSoundState(src);

  const play = () => {
    const { engine: e, buffer, voices } = sound;
    if (!e || !buffer || !e.canPlay()) return;
    const { ctx } = e;
    if (ctx.state === 'suspended') ctx.resume().catch(ignoreRejected);
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
    const { engine: e, voices } = sound;
    if (!e) return;
    const now = e.ctx.currentTime;
    for (const { source, gain } of voices) {
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + fadeSeconds);
      source.stop(now + fadeSeconds);
    }
    voices.clear();
  };

  return { play, stop };
}

// Per-sound state kept outside React's render cycle: the decoded buffer arrives once, and the playing copies are
// tracked so stop() can fade them.
const states = new Map(); // src -> { engine, buffer, voices }

function useSoundState(src) {
  if (!states.has(src)) states.set(src, { engine: null, buffer: null, voices: new Set() });
  const state = states.get(src);
  useEffect(() => {
    const e = getEngine();
    if (!e) return;
    state.engine = e;
    e.load(src).then(
      (buffer) => {
        state.buffer = buffer;
      },
      (error) => console.error(`Home page: the sound ${src} could not be loaded`, error)
    );
  }, [src, state]);
  return state;
}
