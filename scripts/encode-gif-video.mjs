#!/usr/bin/env node
// Turns a GIF into a silent H.264 loop of the same frames, and its first frame as <name>-poster.webp (shown until the
// video plays). Made for the /about wave GIF (800 x 450, 200 frames at 50 fps, 38 MB -> wave.mp4, about 1.5 MB, the
// default), and used for the /projects clips too.
// There is no ffmpeg here, so Chrome does the work: WebCodecs decodes the GIF (ImageDecoder) and encodes each frame
// (VideoEncoder), and mp4-muxer writes the file.
// usage: npm i --no-save playwright mp4-muxer && node scripts/encode-gif-video.mjs [gif] [out.mp4] [bits per second]
//   /about: node scripts/encode-gif-video.mjs
//   /projects, Arumi Coffee: node scripts/encode-gif-video.mjs .tmp/arumi-project-details/arumi.gif //     src/projects/assets/media/arumi.mp4 2000000
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';
import { chromium } from 'playwright';

const GIF = process.argv[2] ?? '.tmp/about-me/gif-version.gif';
const VIDEO = process.argv[3] ?? 'src/about/assets/media/wave.mp4';
const BITRATE = Number(process.argv[4] ?? 3_000_000); // the waves' fine ripples smear below 3 Mbps
const ORIGIN = 'http://localhost:9'; // WebCodecs needs a secure context; nothing listens here, Playwright answers

const muxerScript = fs.readFileSync(
  path.join(path.dirname(createRequire(import.meta.url).resolve('mp4-muxer')), 'mp4-muxer.js')
);

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.route(`${ORIGIN}/**`, (route) => {
  const url = new URL(route.request().url());
  if (url.pathname === '/source.gif') return route.fulfill({ body: fs.readFileSync(GIF) });
  if (url.pathname.endsWith('.js')) return route.fulfill({ body: muxerScript, contentType: 'text/javascript' });
  return route.fulfill({ body: '<!doctype html><title>encode</title>', contentType: 'text/html' });
});
await page.goto(`${ORIGIN}/`);
await page.addScriptTag({ url: `${ORIGIN}/mp4-muxer.js` });

const result = await page.evaluate(async (bitrate) => {
  const decoder = new ImageDecoder({ data: await (await fetch('/source.gif')).arrayBuffer(), type: 'image/gif' });
  await decoder.tracks.ready;
  const count = decoder.tracks.selectedTrack.frameCount;
  const probe = (await decoder.decode({ frameIndex: 0 })).image;
  const width = probe.displayWidth;
  const height = probe.displayHeight;
  const fps = Math.round(1e6 / probe.duration);
  probe.close();

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

  // Every frame at the GIF's own timing, with hard cuts; nothing is blended between frames.
  let time = 0;
  for (let i = 0; i < count; i++) {
    const { image } = await decoder.decode({ frameIndex: i });
    const frame = new VideoFrame(image, { timestamp: time, duration: image.duration });
    encoder.encode(frame, { keyFrame: i % fps === 0 }); // a keyframe a second
    frame.close();
    time += image.duration;
    image.close();
  }
  await encoder.flush();
  if (failure) throw failure;
  muxer.finalize();

  const bytes = new Uint8Array(muxer.target.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { base64: btoa(binary), count, width, height, seconds: time / 1e6 };
}, BITRATE);
await browser.close();

const video = VIDEO;
fs.mkdirSync(path.dirname(video), { recursive: true });
fs.writeFileSync(video, Buffer.from(result.base64, 'base64'));
// A video poster is a single URL with no fallback, so WebP (every current browser) rather than AVIF.
await sharp(GIF, { page: 0 })
  .webp({ quality: 80 })
  .toFile(video.replace(/.mp4$/, '-poster.webp'));
const size = (fs.statSync(video).size / 1e6).toFixed(2);
console.log(`${video}: ${result.count} frames, ${result.width} x ${result.height}, ${result.seconds} s, ${size} MB`);
