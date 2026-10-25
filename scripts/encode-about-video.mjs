#!/usr/bin/env node
// Encodes the /about photo clips: each source becomes src/about/assets/media/wave-<name>.mp4, a silent H.264 loop, and
// wave-<name>-poster.webp, its first frame (shown until the video plays). Which clip the page shows is chosen in
// src/about/clips.js. There is no ffmpeg here, so Chrome does the work: WebCodecs decodes and scales each frame
// (ImageDecoder for the GIF, createImageBitmap for the stills), VideoEncoder encodes it, and mp4-muxer writes the file.
// Frames keep hard cuts, as a flipbook would show them; nothing is blended between frames.
// usage: npm i --no-save playwright mp4-muxer && node scripts/encode-about-video.mjs [sequence|gif ...]  (default: all)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';
import { chromium } from 'playwright';

const SOURCES = {
  // The image sequence (137 JPEG frames, 2560 x 1440): every 5th frame (1, 6 ... 136), each held 0.2 s. Scaled to
  // 1440 x 810, enough for the 713 x 396 CSS px it is shown at on a 2x screen.
  sequence: { frames: '.tmp/about-me/image-seq', step: 5, interval: 0.2, width: 1440, height: 810 },
  // The original GIF (800 x 450, 200 frames, 0.02 s each): every frame at its own timing and size.
  gif: { gif: '.tmp/about-me/gif-version.gif' },
};
const BITRATE = 3_000_000; // the water's fine ripples smear below this
const OUT = 'src/about/assets/media';
const ORIGIN = 'http://localhost:9'; // WebCodecs needs a secure context; nothing listens here, Playwright answers

const muxerScript = fs.readFileSync(
  path.join(path.dirname(createRequire(import.meta.url).resolve('mp4-muxer')), 'mp4-muxer.js')
);

function stills({ frames, step }) {
  const files = fs
    .readdirSync(frames)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
    .sort()
    .filter((_, i) => i % step === 0);
  if (!files.length) throw new Error(`no frames in ${frames}`);
  return files.map((name) => path.join(frames, name));
}

// Runs in the page: decodes the source frame by frame, encodes it, and returns the MP4 as base64.
async function encodeInPage({ kind, count, width, height, interval, bitrate }) {
  let decoder = null;
  if (kind === 'gif') {
    decoder = new ImageDecoder({ data: await (await fetch('/source.gif')).arrayBuffer(), type: 'image/gif' });
    await decoder.tracks.ready;
    count = decoder.tracks.selectedTrack.frameCount;
    const { image } = await decoder.decode({ frameIndex: 0 });
    width = image.displayWidth;
    height = image.displayHeight;
    interval = image.duration / 1e6;
    image.close();
  }
  const fps = Math.round(1 / interval);

  const { Muxer, ArrayBufferTarget } = window.Mp4Muxer;
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

  let time = 0;
  for (let i = 0; i < count; i++) {
    let source;
    let duration;
    if (decoder) {
      source = (await decoder.decode({ frameIndex: i })).image;
      duration = source.duration;
    } else {
      const blob = await (await fetch(`/frame/${i}`)).blob();
      source = await createImageBitmap(blob, { resizeWidth: width, resizeHeight: height, resizeQuality: 'high' });
      duration = Math.round(interval * 1e6);
    }
    const frame = new VideoFrame(source, { timestamp: time, duration });
    encoder.encode(frame, { keyFrame: i % fps === 0 }); // a keyframe a second
    frame.close();
    source.close();
    time += duration;
  }
  await encoder.flush();
  if (failure) throw failure;
  muxer.finalize();

  const bytes = new Uint8Array(muxer.target.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { base64: btoa(binary), count, width, height, seconds: time / 1e6 };
}

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SOURCES);
const browser = await chromium.launch({ channel: 'chrome' });
for (const name of names) {
  const source = SOURCES[name];
  if (!source) throw new Error(`unknown source "${name}"; use one of ${Object.keys(SOURCES).join(', ')}`);
  const files = source.frames ? stills(source) : [];

  const page = await browser.newPage();
  await page.route(`${ORIGIN}/**`, (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/source.gif') return route.fulfill({ body: fs.readFileSync(source.gif) });
    if (url.pathname.startsWith('/frame/'))
      return route.fulfill({ body: fs.readFileSync(files[+url.pathname.slice(7)]) });
    if (url.pathname.endsWith('.js')) return route.fulfill({ body: muxerScript, contentType: 'text/javascript' });
    return route.fulfill({ body: '<!doctype html><title>encode</title>', contentType: 'text/html' });
  });
  await page.goto(`${ORIGIN}/`);
  await page.addScriptTag({ url: `${ORIGIN}/mp4-muxer.js` });
  const result = await page.evaluate(encodeInPage, {
    kind: source.gif ? 'gif' : 'stills',
    count: files.length,
    width: source.width,
    height: source.height,
    interval: source.interval,
    bitrate: BITRATE,
  });
  await page.close();

  const video = `${OUT}/wave-${name}.mp4`;
  fs.writeFileSync(video, Buffer.from(result.base64, 'base64'));
  // A video poster is a single URL with no fallback, so WebP (every current browser) rather than AVIF.
  const first = source.gif ? sharp(source.gif, { page: 0 }) : sharp(files[0]);
  await first.resize(result.width, result.height).webp({ quality: 80 }).toFile(`${OUT}/wave-${name}-poster.webp`);
  const size = (fs.statSync(video).size / 1e6).toFixed(2);
  console.log(`${video}: ${result.count} frames, ${result.width} x ${result.height}, ${result.seconds} s, ${size} MB`);
}
await browser.close();
