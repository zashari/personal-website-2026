import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BrandLink, MaybeLink, NavItem, backIfPrevious } from '../home/Brand';
import ModeSwitch from '../home/ModeSwitch';
import { useTheme } from '../home/theme';
import {
  ACHIEVEMENTS,
  CERTIFICATIONS,
  CONTACT,
  EDUCATION,
  EXPERIENCE,
  FOOTER,
  HOME,
  MORE_PROJECTS,
  NAME,
  NAV,
  PAGE_TITLE,
  PDF,
  PROJECTS,
  ROLES,
  SECTIONS,
  SKILLS,
  STAR,
  STRENGTHS,
  SUMMARY,
  TITLE_BLOCK,
} from './content';

// /resume: the owner's CV as one drafting sheet in the site's style (no Figma frame; see reports/Resume page design and
// tech.md). A title block and the name open it; then seven numbered sections, each with its number and name in a rail
// on the left (sticky on wide screens, the 01 to 07 of /about's frame) and the entries on the right, each entry with
// its dates and a dimension line of its length in a narrow column of its own. The logotype header is fixed on top and
// the colour mode switch on the bottom edge, as on /projects. The print stylesheet (resume.css) turns the same page
// into the two A4 sheets of the PDF.

const SECTION_KEYS = Object.keys(SECTIONS);
const pad = (n) => String(n).padStart(2, '0');

// **bold** and _italic_ as marked in content.js.
function Rich({ text }) {
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/).map((part, i) => {
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

// The months from one CV date to the next, counting both ends ("09/2025 - 06/2026" is ten months); an open end runs to
// this month.
function monthsBetween(from, to) {
  const [fy, fm] = from.iso.split('-').map(Number);
  const now = new Date();
  const [ty, tm] = to.iso ? to.iso.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1];
  return Math.max(1, (ty - fy) * 12 + (tm - fm) + 1);
}

function lengthLabel(months) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years && `${years} yr`, rest && `${rest} mo`].filter(Boolean).join(' ');
}

// The dates of an entry, and under them a dimension line as long as the entry lasted, on one scale for the whole page
// (the longest entry spans the column), with the length written on it as a drawing writes a dimension.
const LONGEST = Math.max(...[...EXPERIENCE, ...PROJECTS].map((e) => monthsBetween(e.from, e.to)));

function Dates({ entry, dimension = true }) {
  const months = monthsBetween(entry.from, entry.to);
  return (
    <div className="rs-dates">
      <p className="rs-period">
        <time dateTime={entry.from.iso}>{entry.from.label}</time>
        <span aria-hidden="true"> — </span>
        <span className="rs-visually-hidden"> to </span>
        {entry.to.iso ? <time dateTime={entry.to.iso}>{entry.to.label}</time> : entry.to.label}
      </p>
      {entry.place && <p className="rs-place">{entry.place}</p>}
      {dimension && (
        <p className="rs-dimension" style={{ '--span': months / LONGEST }}>
          <span className="rs-dimension-line" aria-hidden="true" />
          <span className="rs-dimension-label">{lengthLabel(months)}</span>
        </p>
      )}
    </div>
  );
}

function Section({ id, index, children }) {
  return (
    <section className="rs-section" id={id} aria-labelledby={`${id}-title`} data-section={id}>
      <h2 className="rs-section-head" id={`${id}-title`}>
        <span className="rs-section-number" aria-hidden="true">
          {pad(index + 1)}
        </span>
        <span className="rs-section-name">{SECTIONS[id]}</span>
      </h2>
      <div className="rs-section-body">{children}</div>
    </section>
  );
}

// An entry's reference, as a drawing numbers its parts: EXP-01, PRJ-02.
const ref = (prefix, i) => `${prefix}-${pad(i + 1)}`;

function Experience() {
  return (
    <ol className="rs-entries">
      {EXPERIENCE.map((job, i) => (
        <li key={job.key} className="rs-entry">
          <Dates entry={job} />
          <div className="rs-entry-body">
            <p className="rs-ref" aria-hidden="true">
              {ref('EXP', i)}
            </p>
            <h3 className="rs-role">{job.role}</h3>
            <p className="rs-org">{job.org}</p>
            <ul className={job.star ? 'rs-points rs-points-star' : 'rs-points'}>
              {job.points.map((point, p) => (
                <li key={p}>
                  {job.star && (
                    <abbr className="rs-star" title={STAR[p].long}>
                      {STAR[p].short}
                    </abbr>
                  )}
                  <span>
                    <Rich text={point} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Projects() {
  return (
    <>
      <ol className="rs-projects">
        {PROJECTS.map((project, i) => (
          <li key={project.key} className="rs-project">
            <p className="rs-ref" aria-hidden="true">
              {ref('PRJ', i)}
            </p>
            <h3 className="rs-role">
              {project.title} <span className="rs-org rs-org-inline">· {project.org}</span>
            </h3>
            <Dates entry={project} dimension={false} />
            <p className="rs-text">{project.text}</p>
            <p className="rs-links">
              {project.links
                ? project.links.map((link) => (
                    <MaybeLink key={link.href} href={link.href} className="rs-link">
                      {link.label} <span aria-hidden="true">↗</span>
                    </MaybeLink>
                  ))
                : <span className="rs-note">{project.note}</span>}
            </p>
          </li>
        ))}
      </ol>
      <p className="rs-more">
        <span className="rs-asterisk" aria-hidden="true">
          *
        </span>
        {MORE_PROJECTS.before}
        <MaybeLink href={MORE_PROJECTS.href} className="rs-link">
          {MORE_PROJECTS.label} <span aria-hidden="true">↗</span>
        </MaybeLink>
      </p>
    </>
  );
}

function Achievements() {
  return (
    <ol className="rs-achievements">
      {ACHIEVEMENTS.map((item) => (
        <li key={item.title}>
          <h3 className="rs-achievement-title">{item.title}</h3>
          <p className="rs-text">{item.text}</p>
        </li>
      ))}
    </ol>
  );
}

function Education() {
  return (
    <ol className="rs-entries rs-entries-compact">
      {EDUCATION.map((school) => (
        <li key={school.key} className="rs-entry">
          <Dates entry={school} dimension={false} />
          <div className="rs-entry-body">
            <h3 className="rs-role">{school.title}</h3>
            <p className="rs-org">{school.org}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Certifications() {
  return (
    <ol className="rs-entries rs-entries-compact">
      {CERTIFICATIONS.map((cert) => (
        <li key={cert.key} className="rs-entry">
          <div className="rs-dates">
            <p className="rs-period">
              <time dateTime={cert.date.iso}>{cert.date.label}</time>
            </p>
          </div>
          <div className="rs-entry-body">
            <h3 className="rs-role">
              <MaybeLink href={cert.href} className="rs-link rs-link-title">
                {cert.title} <span aria-hidden="true">↗</span>
              </MaybeLink>
            </h3>
            <p className="rs-place">
              <MaybeLink href={cert.issuer.href} className="rs-link rs-link-quiet">
                {cert.issuer.label}
              </MaybeLink>
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Skills() {
  return (
    <>
      <ul className="rs-skills" aria-label="Tools and technologies">
        {SKILLS.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
      <div className="rs-strengths">
        {STRENGTHS.map((group) => (
          <div key={group.key} className="rs-strength">
            <h3 className="rs-achievement-title">{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

const BODIES = {
  summary: () => (
    <p className="rs-summary">
      <Rich text={SUMMARY} />
    </p>
  ),
  experience: Experience,
  projects: Projects,
  achievements: Achievements,
  education: Education,
  certifications: Certifications,
  skills: Skills,
};

// The same eight-point sparkle as TOUCH ME on /home and the resume link on /about (58 x 58, Figma's own paths).
const SPARKLE_PATHS = [
  'M58 29C58 45.0163 29 29 29 58C12.9837 58 29 29 0 29C0 12.9837 29 29 29 0C45.0163 0 29 29 58 29Z',
  'M49.7579 49.2511C38.5736 60.7154 29 29 8.74888 49.758C-2.71541 38.5736 29 29 8.24205 8.74891C19.4264 -2.71538 29 29 49.2511 8.24208C60.7154 19.4265 29 29 49.7579 49.2511Z',
];

function Sparkle() {
  return (
    <svg className="rs-sparkle" width="58" height="58" viewBox="0 0 58 58" aria-hidden="true">
      <g className="rs-sparkle-spin">
        {SPARKLE_PATHS.map((d) => (
          <path key={d} d={d} fill="currentColor" />
        ))}
      </g>
    </svg>
  );
}

function Masthead() {
  return (
    <div className="rs-masthead">
      <div className="rs-identity">
        <h1 className="rs-name">
          <span className="rs-visually-hidden">{PAGE_TITLE}: </span>
          {NAME}
        </h1>
        <p className="rs-roles">
          {ROLES.map((role, i) => (
            <Fragment key={role}>
              {i > 0 && (
                <span className="rs-roles-slash" aria-hidden="true">
                  {' / '}
                </span>
              )}
              <span>{role}</span>
            </Fragment>
          ))}
        </p>
        <ul className="rs-contact" aria-label="Contact">
          {CONTACT.map((item) => (
            <li key={item.key}>
              <MaybeLink href={item.href} className="rs-link">
                {item.label}
              </MaybeLink>
            </li>
          ))}
          <li className="rs-phone" data-phone hidden />
        </ul>
      </div>
      <aside className="rs-title-block" aria-label="About this document">
        <dl>
          {TITLE_BLOCK.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <a className="rs-pdf" href={PDF.href} download>
          <Sparkle />
          <span className="rs-pdf-label">
            {PDF.label}
            <span className="rs-pdf-note">{PDF.note}</span>
          </span>
        </a>
      </aside>
    </div>
  );
}

// The rail's index: the seven sections, the one being read in the accent. On wide screens it stays beside the
// sections as they scroll by.
function useCurrentSection() {
  const [current, setCurrent] = useState(SECTION_KEYS[0]);
  useEffect(() => {
    const sections = SECTION_KEYS.map((key) => document.getElementById(key)).filter(Boolean);
    // A section counts as being read while it crosses a line a third of the way down the window.
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setCurrent(hit.target.id);
      },
      { rootMargin: '-33% 0px -66% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return current;
}

function Index({ current }) {
  return (
    <nav className="rs-index" aria-label="Sections">
      <ol>
        {SECTION_KEYS.map((key, i) => (
          <li key={key}>
            <a href={`#${key}`} aria-current={current === key ? 'true' : undefined}>
              <span className="rs-index-number">{pad(i + 1)}</span>
              <span className="rs-index-name">{SECTIONS[key]}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// The header and the switch are fixed; their heights go to the CSS as --header-h and --footer-h so the sheet starts
// below the one and ends above the other, as on /projects. They change as fonts load and as the header wraps on phones.
function useHeightVar(ref, name) {
  useLayoutEffect(() => {
    const element = ref.current;
    const root = document.documentElement;
    const update = () => root.style.setProperty(name, `${element.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty(name);
    };
  }, [ref, name]);
}

export default function ResumeApp() {
  const [theme, setTheme] = useTheme();
  const current = useCurrentSection();
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  useHeightVar(headerRef, '--header-h');
  useHeightVar(footerRef, '--footer-h');
  return (
    <>
      <header className="home-header rs-header" ref={headerRef}>
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
      <main className="rs">
        <div className="rs-lines" aria-hidden="true">
          <svg className="rs-circle" viewBox="0 0 600 600">
            <circle cx="300" cy="300" r="299" />
          </svg>
        </div>
        <Masthead />
        <div className="rs-sheet">
          <Index current={current} />
          <div className="rs-sections">
            {SECTION_KEYS.map((key, i) => {
              const Body = BODIES[key];
              return (
                <Section key={key} id={key} index={i}>
                  <Body />
                </Section>
              );
            })}
          </div>
        </div>
        <p className="rs-footer">{FOOTER}</p>
      </main>
      <div className="rs-mode" ref={footerRef}>
        <ModeSwitch theme={theme} onChange={setTheme} />
      </div>
    </>
  );
}
