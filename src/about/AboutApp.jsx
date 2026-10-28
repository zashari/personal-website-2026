import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CLIP_LABEL, EDUCATION, EDUCATION_TITLE, HOME, INTRO, NAV, PAGE_TITLE, RESUME, SOUND } from './content';
import { BrandLink, MaybeLink, NavItem, backIfPrevious } from '../home/Brand';
import ModeSwitch from '../home/ModeSwitch';
import { useTheme } from '../home/theme';
import { SOUND_SWITCH_ATTR, useWaveSound } from './useWaveSound';
import FrameDecoration from './FrameDecoration';
import { DASH_BLEED, DASH_Y, FRAME, fitFrame, textAt } from './frame';
import clip from './assets/media/wave.mp4';
import poster from './assets/media/wave-poster.webp';
import waves from './assets/media/waves.mp3';

// The artwork is the Figma frame "aboutme-desktop" (1920 x 1080, page version-2; dark 2041:40, light 2042:103),
// drawn in Figma px on a stage scaled to fit the window, as on /home. Narrow or upright screens get the same content
// as an ordinary column instead (see useLayout). Above it sits /home's header logotype, in the same place and size,
// as the way back home.

const INTRO_BOX = { ...textAt({ x: 121, baseline: 121.094, size: 16, lineHeight: 25 }), width: 713 };
const CLIP_BOX = { left: 124, top: 342, width: 713, height: 396 };
const EDUCATION_TITLE_BOX = textAt({ x: 858, baseline: 410.416, size: 30, lineHeight: 40.86, font: 'sans' });
// Year and first title line baselines per entry. The Binus lines are two Figma text boxes, 27 px apart.
const EDUCATION_AT = {
  binus: { x: 858, years: 456.094, title: 488.334, lineHeight: 27 },
  aws: { x: 1371, years: 456.094, title: 488.334, lineHeight: 25 },
  telkom: { x: 858, years: 609.094, title: 641.334, lineHeight: 25 },
};
// The resume link: the sparkle box's top-left, and the text's offset from there.
const RESUME_AT = { x: 351, y: 858 };
const RESUME_TEXT = textAt({ x: 422 - RESUME_AT.x, baseline: 892.094 - RESUME_AT.y, size: 16, lineHeight: 25 });
// Under the clip, as far below it as the intro text ends above it (14 px), and on the intro's left edge.
const SOUND_BOX = { left: 121, top: CLIP_BOX.top + CLIP_BOX.height + 14, fontSize: 16, lineHeight: '25px' };

// The same eight-point sparkle as TOUCH ME on /home (58 x 58, Figma's own paths).
const SPARKLE_PATHS = [
  'M58 29C58 45.0163 29 29 29 58C12.9837 58 29 29 0 29C0 12.9837 29 29 29 0C45.0163 0 29 29 58 29Z',
  'M49.7579 49.2511C38.5736 60.7154 29 29 8.74888 49.758C-2.71541 38.5736 29 29 8.24205 8.74891C19.4264 -2.71538 29 29 49.2511 8.24208C60.7154 19.4265 29 29 49.7579 49.2511Z',
];

// "BINUS UNIVERSITY @BANDUNG": the @ stays upright and the city after it is set in italics.
function TitleLine({ text }) {
  const [before, city] = text.split('@');
  if (city === undefined) return text;
  return (
    <>
      {before}@<em>{city}</em>
    </>
  );
}

function EducationTitle({ lines: titleLines }) {
  return titleLines.map((line, i) => (
    <span key={line} className="about-edu-line">
      {i > 0 && <br />}
      <TitleLine text={line} />
    </span>
  ));
}

// The wave clip: the GIF from the design, as a silent looping video (scripts/encode-gif-video.mjs). muted is set on
// the element itself as well, since React only sets the property and iOS checks the attribute before it autoplays.
function WaveClip({ className, style }) {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    video.muted = true;
    video.defaultMuted = true;
    const play = () => video.play().catch((error) => console.error('About page: the wave clip could not start', error));
    play();
    // Back or Forward can restore the page whole from the back/forward cache, with the clip paused and this effect not
    // run again.
    const onPageShow = (event) => event.persisted && play();
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);
  return (
    <video
      ref={ref}
      className={className}
      style={style}
      src={clip}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-label={CLIP_LABEL}
    />
  );
}

function Sparkle() {
  return (
    <svg className="about-sparkle" width="58" height="58" viewBox="0 0 58 58" aria-hidden="true">
      <g className="about-sparkle-spin">
        {SPARKLE_PATHS.map((d) => (
          <path key={d} d={d} fill="currentColor" />
        ))}
      </g>
    </svg>
  );
}

function Header({ headerRef, variant }) {
  return (
    <header className="home-header about-header" ref={headerRef} data-variant={variant}>
      <nav className="home-nav" aria-label="Main">
        <div className="home-nav-group">
          <BrandLink href={HOME.href} label={HOME.label} onClick={backIfPrevious} />
        </div>
        <div className="home-nav-group">
          {NAV.map((item) => (
            <NavItem key={item.key} id={item.key} title={item.title} label={item.label} href={item.href} />
          ))}
        </div>
      </nav>
    </header>
  );
}

function SoundSwitch({ sound, style }) {
  return (
    <button
      type="button"
      className="about-sound"
      style={style}
      aria-pressed={sound.on}
      aria-label={SOUND.label}
      onClick={sound.toggle}
      {...{ [SOUND_SWITCH_ATTR]: '' }}
    >
      {sound.on ? SOUND.on : SOUND.off}
    </button>
  );
}

// Picks the stage or the column, and for the stage its scale and place: as large as fits the window below the
// header, centred across and resting on the bottom edge (where the mode switch sits). A window too short
// for MIN_SCALE scrolls. Re-runs when the window or the header (which grows as its fonts load) changes size.
function useLayout(headerRef) {
  const [layout, setLayout] = useState(null);
  useLayoutEffect(() => {
    const header = headerRef.current;
    const update = () => {
      const fit = fitFrame({
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
        headerHeight: header.offsetHeight,
      });
      setLayout(fit ? { variant: 'stage', ...fit } : { variant: 'flow' });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [headerRef]);
  return layout;
}

function Stage({ layout, theme, setTheme, sound }) {
  return (
    <main className="about about-stage-page" style={{ height: layout.pageHeight }}>
      <h1 className="about-visually-hidden">{PAGE_TITLE}</h1>
      <div
        className="about-stage"
        style={{
          width: FRAME.width,
          height: FRAME.height,
          transform: `translate(${layout.x}px, ${layout.y}px) scale(${layout.scale})`,
        }}
      >
        <FrameDecoration />
        <span
          className="frame-dash"
          aria-hidden="true"
          style={{ left: -DASH_BLEED, top: DASH_Y, width: FRAME.width + 2 * DASH_BLEED }}
        />

        <section className="about-education" aria-labelledby="about-education-title">
          <h2 id="about-education-title" className="about-edu-heading" style={EDUCATION_TITLE_BOX}>
            {EDUCATION_TITLE}
          </h2>
          <ul>
            {EDUCATION.map((entry) => {
              const at = EDUCATION_AT[entry.key];
              return (
                <li key={entry.key}>
                  <span
                    className="about-edu-years"
                    style={textAt({ x: at.x, baseline: at.years, size: 16, lineHeight: 25 })}
                  >
                    {entry.years}
                  </span>
                  <span
                    className="about-edu-title"
                    style={textAt({ x: at.x, baseline: at.title, size: 25, lineHeight: at.lineHeight })}
                  >
                    <EducationTitle lines={entry.lines} />
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <MaybeLink href={RESUME.href} className="about-resume" style={{ left: RESUME_AT.x, top: RESUME_AT.y }}>
          <Sparkle />
          <span className="about-resume-label" style={RESUME_TEXT}>
            {RESUME.label}
          </span>
        </MaybeLink>

        <WaveClip className="about-clip" style={CLIP_BOX} />
        <p className="about-intro" style={INTRO_BOX}>
          {INTRO}
        </p>
        {sound.supported && <SoundSwitch sound={sound} style={SOUND_BOX} />}
      </div>
      <ModeSwitch theme={theme} onChange={setTheme} />
    </main>
  );
}

function Flow({ theme, setTheme, sound }) {
  return (
    <main className="about about-flow">
      <h1 className="about-visually-hidden">{PAGE_TITLE}</h1>
      <p className="about-intro">{INTRO}</p>
      <div className="about-flow-clip">
        <span className="frame-dash" aria-hidden="true" />
        <WaveClip className="about-clip" />
      </div>
      {sound.supported && <SoundSwitch sound={sound} />}
      <section className="about-education" aria-labelledby="about-education-title">
        <h2 id="about-education-title" className="about-edu-heading">
          {EDUCATION_TITLE}
        </h2>
        <ul>
          {EDUCATION.map((entry) => (
            <li key={entry.key}>
              <span className="about-edu-years">{entry.years}</span>
              <span className="about-edu-title">
                <EducationTitle lines={entry.lines} />
              </span>
            </li>
          ))}
        </ul>
      </section>
      <MaybeLink href={RESUME.href} className="about-resume">
        <Sparkle />
        <span className="about-resume-label">{RESUME.label}</span>
      </MaybeLink>
      <ModeSwitch theme={theme} onChange={setTheme} />
    </main>
  );
}

export default function AboutApp() {
  const headerRef = useRef(null);
  const layout = useLayout(headerRef);
  const [theme, setTheme] = useTheme();
  const sound = useWaveSound(waves);
  const props = { theme, setTheme, sound };
  return (
    <>
      <Header headerRef={headerRef} variant={layout?.variant} />
      {layout?.variant === 'stage' && <Stage layout={layout} {...props} />}
      {layout?.variant === 'flow' && <Flow {...props} />}
    </>
  );
}
