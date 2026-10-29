// Prints /resume to the PDF its "Download the PDF" link serves (public/resume/zaky-ashari-resume.pdf): the page's own
// print stylesheet (src/resume/resume.css) lays it out on A4, so the page and the PDF stay one document. Chrome writes
// a tagged PDF (real, selectable text in reading order, which applicant tracking systems parse) with an outline from
// the headings. The phone number is not on the web page (src/resume/content.js); it is put into the PDF only, here.
// Run it again whenever src/resume/content.js changes. It fails unless the result is exactly two pages.
// usage: npm i --no-save playwright && node scripts/build-resume-pdf.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public/resume/zaky-ashari-resume.pdf');
const PAGES = 2;

const server = await createServer({ root: ROOT, logLevel: 'error', server: { port: 0, host: '127.0.0.1' } });
await server.listen();
// content.js imports without extensions, as Vite does; Vite loads it.
const { PHONE } = await server.ssrLoadModule('/src/resume/content.js');
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage();
  await page.goto(new URL('/resume/', server.resolvedUrls.local[0]).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(({ label, href }) => {
    const item = document.querySelector('[data-phone]');
    const link = Object.assign(document.createElement('a'), { href, textContent: label, className: 'rs-link' });
    item.replaceChildren(link);
    item.hidden = false;
  }, PHONE);
  await page.emulateMedia({ media: 'print' });
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
  if (pages !== PAGES) throw new Error(`The resume prints on ${pages} pages, not ${PAGES}; tighten src/resume/resume.css`);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, pdf);
  console.log(`${path.relative(ROOT, OUT)}: ${pages} pages, ${Math.round(pdf.length / 1024)} kB`);
} finally {
  await browser.close();
  await server.close();
}
