#!/usr/bin/env node
// Turns the /about image sequence (137 JPEG frames, 2560 x 1440) into src/about/assets/media/wave.mp4: every 5th
// frame (1, 6, 11 ... 136), each held exactly 0.2 s with hard cuts as a flipbook would show them, as an H.264 clip
// at 5 fps. There is no ffmpeg here, so Chrome does the work: WebCodecs scales and encodes each frame
// (createImageBitmap, VideoEncoder), and mp4-muxer writes the file.
// usage: npm i --no-save playwright mp4-muxer && node scripts/encode-about-video.mjs [frames dir] [seconds] [step]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const FRAMES = process.argv[2] ?? '.tmp/about-me/image-seq';
const INTERVAL_S = Number(process.argv[3] ?? 0.2);
const STEP = Number(process.argv[4] ?? 5); // use every STEP-th frame, starting with the first
const OUT = 'src/about/assets/media/wave.mp4';
// Shown at most 713 x 396 CSS px (the Figma frame at full size), so 1440 x 810 covers a 2x screen.
const SIZE = { width: 1440, height: 810 };
const BITRATE = 3_000_000; // the water's fine ripples smear below this
const ORIGIN = 'http://localhost:9'; // WebCodecs needs a secure context; nothing listens here, Playwright answers

const muxerScript = fs.readFileSync(
  path.join(path.dirname(createRequire(import.meta.url).resolve('mp4-muxer')), 'mp4-muxer.js')
);
const files = fs
  .readdirSync(FRAMES)
  .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
  .sort()
  .filter((_, i) => i % STEP === 0);
if (!files.length) throw new Error(`no frames in ${FRAMES}`);

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.route(`${ORIGIN}/**`, (route) => {
  const url = new URL(route.request().url());
  if (url.pathname.startsWith('/frame/')) {
    return route.fulfill({ body: fs.readFileSync(path.join(FRAMES, files[Number(url.pathname.slice(7))])) });
  }
  if (url.pathname.endsWith('.js')) return route.fulfill({ body: muxerScript, contentType: 'text/javascript' });
  return route.fulfill({ body: '<!doctype html><title>encode</title>', contentType: 'text/html' });
});
await page.goto(`${ORIGIN}/`);
await page.addScriptTag({ url: `${ORIGIN}/mp4-muxer.js` });

const result = await page.evaluate(
  async ({ count, width, height, bitrate, interval }) => {
    const { Muxer, ArrayBufferTarget } = window.Mp4Muxer;
    const fps = Math.round(1 / interval);
    const muxer = new Muxer({
      target: new ArrayBufferTarget(),
      video: { codec: 'avc', width, height, frameRate: fps },
      fastStart: 'in-memory',
    });
    let failure = null;
    const encoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => (failure = e),
    });
    const config = { codec: 'avc1.640028', width, height, bitrate, framerate: fps, avc: { format: 'avc' } };
    if (!(await VideoEncoder.isConfigSupported(config)).supported) throw new Error('H.264 encoding is not supported');
    encoder.configure(config);

    const duration = Math.round(interval * 1e6);
    for (let i = 0; i < count; i++) {
      const blob = await (await fetch(`/frame/${i}`)).blob();
      const bitmap = await createImageBitmap(blob, { resizeWidth: width, resizeHeight: height, resizeQuality: 'high' });
      const frame = new VideoFrame(bitmap, { timestamp: i * duration, duration });
      encoder.encode(frame, { keyFrame: i % fps === 0 }); // a keyframe a second
      frame.close();
      bitmap.close();
    }
    await encoder.flush();
    if (failure) throw failure;
    muxer.finalize();

    const bytes = new Uint8Array(muxer.target.buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return { base64: btoa(binary), seconds: (count * duration) / 1e6 };
  },
  { count: files.length, ...SIZE, bitrate: BITRATE, interval: INTERVAL_S }
);
await browser.close();

fs.writeFileSync(OUT, Buffer.from(result.base64, 'base64'));
const size = (fs.statSync(OUT).size / 1e6).toFixed(2);
console.log(`${OUT}: ${files.length} frames, ${SIZE.width} x ${SIZE.height}, ${result.seconds} s, ${size} MB`);
