import { useEffect, useRef } from 'react';
import './CarbonSheet.css';

// Background: the back of a used carbon sheet. Every document typed through it left a mirrored,
// duller impression in the wax, so the sheet carries the dossier itself, several times over.

const TYPE_FACE = '"JMH Typewriter", "Courier New", monospace';

const DOSSIER_LINES = [
  'DEPARTMENT OF', 'SUBJECT INFO', 'Name: Zaky Ashari', 'Aliases: "Jat", "Zashari", "Jatbzos"', 'Gender: Male',
  'Phone Num: +62 81248777317', 'Email: izzat.zaky@gmail.com', 'EDUCATION',
  '[2021-2025] Computer Science, BINUS University', '[2019-2021] Computer Network & Engineering', 'SUBJECT SUMMARY',
  'CATEGORY   STATUS   OBSERVATION / DETAILS', 'PSYCH   STABLE   Subject displays "Developer Persona."',
  'OPS / HABIT   REMOTE   Works 7 days/week', 'GAMING   LOCKED   Restricted to Fortnite & Mobile Legends',
  'Status: | APPROVED |', 'Date: December 20th, 2025', 'OFFICIAL RECORD: HIGHLIGHTED PROJECTS', 'AI ENGINEERING',
  "Title: Alzheimer's Disease Detection", 'SOFTWARE ENGINEERING', 'MLOps ENGINEERING', '[CLASSIFIED]', '[ASSET-LOST]',
  'West Java, 202512-1802',
];

const IMPRESSION_RGB = '160, 172, 220';
const PASSES = 4; // documents typed through the sheet
const MAX_DPR = 2;

// Seeded so the sheet keeps the same impressions across resizes and visits.
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function typeSize(width) {
  return Math.max(12, Math.min(17, width / 85));
}

function grainPattern(ctx) {
  const tile = document.createElement('canvas');
  tile.width = tile.height = 256;
  const g = tile.getContext('2d');
  const img = g.createImageData(256, 256);
  const rand = mulberry32(7);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = rand();
    const light = v > 0.5;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = light ? 255 : 0;
    img.data[i + 3] = Math.abs(v - 0.5) * 2 * 255 * 0.09;
  }
  g.putImageData(img, 0, 0);
  return ctx.createPattern(tile, 'repeat');
}

function paintSheet(canvas, width, height) {
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const rand = mulberry32(20260101);
  const between = (a, b) => a + rand() * (b - a);

  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, '#1b2036');
  base.addColorStop(0.55, '#141828');
  base.addColorStop(1, '#10131f');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  const size = typeSize(width);
  const advance = size * 0.62;
  ctx.font = `${size}px ${TYPE_FACE}`;
  ctx.textBaseline = 'top';
  for (let pass = 0; pass < PASSES; pass++) {
    const pageWidth = Math.min(width, 820);
    const columns = Math.ceil(width / pageWidth) + 1;
    const strength = 0.2 - pass * 0.035;
    for (let col = 0; col < columns; col++) {
      ctx.save();
      const originX = col * pageWidth + between(-60, 60) - pass * 37;
      ctx.translate(originX + pageWidth / 2, between(-10, 30));
      ctx.rotate(between(-0.03, 0.03));
      ctx.scale(-1, 1); // the back of the sheet reads mirrored
      ctx.translate(-pageWidth / 2, 0);
      let y = 26 + pass * 11;
      let line = Math.floor(between(0, DOSSIER_LINES.length));
      while (y < height) {
        const text = DOSSIER_LINES[line++ % DOSSIER_LINES.length];
        const x = 40 + (line % 4 === 0 ? 120 : 0);
        [...text].forEach((ch, k) => {
          ctx.fillStyle = `rgba(${IMPRESSION_RGB}, ${strength * (0.55 + rand() * 0.45)})`;
          ctx.fillText(ch, x + k * advance + between(-0.4, 0.4), y + between(-0.6, 0.6));
        });
        // A typist x-ing out a mistake
        if (rand() < 0.12) {
          ctx.fillStyle = `rgba(${IMPRESSION_RGB}, ${strength * 0.9})`;
          const count = Math.floor(between(4, 12));
          for (let k = 0; k < count; k++) ctx.fillText('x', x + (text.length + 1 + k) * advance, y);
        }
        y += size * (rand() < 0.2 ? 3.2 : 1.85);
      }
      ctx.restore();
    }
  }

  ctx.fillStyle = grainPattern(ctx);
  ctx.fillRect(0, 0, width, height);

  const vignette = ctx.createRadialGradient(width / 2, height * 0.3, height * 0.2, width / 2, height * 0.4, height * 1.1);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function ordinal(day) {
  if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`;
  return `${day}${['th', 'st', 'nd', 'rd'][day % 10] || 'th'}`;
}

// The visit leaves its own impression, dated the way the dossier dates things.
function todayLine(date = new Date()) {
  return `Date: ${MONTHS[date.getMonth()]} ${ordinal(date.getDate())}, ${date.getFullYear()}`;
}

// Types one fresh, mirrored line onto the overlay canvas. Each key lands bright and settles into the wax.
function typeFreshLine(canvas, width, height, { animate }) {
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  const size = typeSize(width) * 1.06;
  const advance = size * 0.62;
  const text = todayLine();
  const rightEdge = Math.min(width - 32, width * 0.5 + 360);
  const y = Math.max(40, height * 0.16);
  const rand = mulberry32(Date.now() & 0xffff);

  const keys = [];
  let at = 0;
  [...text].forEach((ch, k) => {
    at += ch === ' ' ? 150 + rand() * 90 : 70 + rand() * 80;
    keys.push({ ch, k, at, jitterX: (rand() - 0.5) * 0.8, jitterY: (rand() - 0.5) * 1.2 });
  });

  const SETTLE_MS = 650;
  const draw = (elapsed) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${size}px ${TYPE_FACE}`;
    ctx.textBaseline = 'top';
    ctx.translate(rightEdge, y);
    ctx.scale(-1, 1);
    for (const key of keys) {
      if (elapsed < key.at) break;
      const age = Math.min(1, (elapsed - key.at) / SETTLE_MS);
      ctx.fillStyle = `rgba(${IMPRESSION_RGB}, ${0.5 - age * 0.24})`;
      ctx.fillText(key.ch, key.k * advance + key.jitterX, key.jitterY);
    }
  };

  const total = keys[keys.length - 1].at + SETTLE_MS;
  if (!animate) {
    draw(total);
    return () => {};
  }
  let frame = 0;
  let start = 0;
  const startDelay = window.setTimeout(() => {
    const tick = (now) => {
      start ||= now;
      const elapsed = now - start;
      draw(elapsed);
      if (elapsed < total) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }, 700);
  return () => {
    window.clearTimeout(startDelay);
    cancelAnimationFrame(frame);
  };
}

const CarbonSheet = () => {
  const baseRef = useRef(null);
  const strikeRef = useRef(null);
  const sheenRef = useRef(null);

  // Paint the sheet once fonts are ready, and again when the viewport really changes size
  // (not for the few pixels a phone's address bar takes when it hides).
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let painted = { width: 0, height: 0 };
    let stopTyping = () => {};
    let resizeTimer = 0;
    let cancelled = false;

    const paint = (animateStrike) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      painted = { width, height };
      paintSheet(baseRef.current, width, height);
      stopTyping();
      stopTyping = typeFreshLine(strikeRef.current, width, height, { animate: animateStrike });
    };

    document.fonts.load(`16px ${TYPE_FACE}`).catch((error) => {
      console.warn('CarbonSheet: typewriter font failed to load, using fallback', error);
    }).finally(() => {
      if (!cancelled) paint(!reducedMotion);
    });

    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const widthChanged = window.innerWidth !== painted.width;
        const heightChanged = Math.abs(window.innerHeight - painted.height) > 120;
        if (widthChanged || heightChanged) paint(false);
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelled = true;
      stopTyping();
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // The wax sheen drifts toward the pointer, the way light catches a carbon sheet. Only runs while it moves.
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return undefined;

    const sheen = sheenRef.current;
    const current = { x: 0.42, y: 0.28 };
    const target = { ...current };
    let frame = 0;

    const step = () => {
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      sheen.style.setProperty('--sheen-x', `${(current.x * 100).toFixed(2)}%`);
      sheen.style.setProperty('--sheen-y', `${(current.y * 100).toFixed(2)}%`);
      const settled = Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001;
      frame = settled ? 0 : requestAnimationFrame(step);
    };

    const handleMove = (e) => {
      target.x = e.clientX / window.innerWidth;
      target.y = e.clientY / window.innerHeight;
      if (!frame) frame = requestAnimationFrame(step);
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handleMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="carbon-sheet" aria-hidden="true">
      <canvas ref={baseRef} className="carbon-sheet-layer" />
      <canvas ref={strikeRef} className="carbon-sheet-layer" />
      <div ref={sheenRef} className="carbon-sheet-layer carbon-sheet-sheen" />
    </div>
  );
};

export default CarbonSheet;
