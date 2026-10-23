import { GITHUB_URL, PROJECTS } from '../content/dossier';
import { Paper, Piece, QrCode, Rich, Rule, Sheet, Text, at, u } from './primitives';
import { Letterhead, mirrorX } from './shared';

// Highlighted projects, folder 003: three card slots per page. Positions from
// design/figma/docs/sheets/projects-page-1.front.md and projects-page-2.front.md.
export const WIDTH = 645;
export const HEIGHT = 843;

const PAPER = { x: 0, y: 0, w: 595, h: 843 };
const SLOTS = [121.04, 360.04, 599.04];
const CARD = { x: 65, w: 580, h: 236 };
const CUT = { x: 63, w: 513, h: 237 };

// Two staples per card, as placed in Figma: centre (x, y below the card top) and rotation. Pages alternate
// between the two Figma layouts so a longer list of projects keeps the hand-stapled look.
const STAPLE = { w: 9.56, h: 46.57 };
const STAPLES = [
  [[[83.79, 22.56, 30], [83.79, 210.56, 150]], [[89.29, 17.78, 90], [78.65, 210.73, -165]], [[76.78, 34.29, 0], [89.56, 212.79, 120]]],
  [[[91.73, 12.65, 75], [91.29, 219.78, -90]], [[86.85, 22.85, -45], [92.29, 214.78, 90]], [[83.79, 22.56, 30], [83.79, 210.56, 150]]],
];

function Staples({ page, slot, top }) {
  return STAPLES[page % 2][slot].map(([cx, cy, rotate]) => (
    <Piece key={`${cx}-${cy}`} name="stapler" x={cx - STAPLE.w / 2} y={top + cy - STAPLE.h / 2} w={STAPLE.w} h={STAPLE.h} rotate={rotate} />
  ));
}

function CutLine({ top }) {
  return (
    <svg className="sheet-rule" style={at(CUT.x, top, CUT.w, CUT.h)} viewBox={`0 0 ${CUT.w} ${CUT.h}`} aria-hidden="true">
      <rect x="0.5" y="0.5" width={CUT.w - 1} height={CUT.h - 1} fill="none" stroke="#000" strokeWidth="1" strokeDasharray="4 4" strokeLinecap="round" />
    </svg>
  );
}

function ProjectText({ project, top }) {
  return (
    <article className="project-text" aria-label={project.title}>
      <Text x={286} y={top + 23} size={16} weight={700} as="h3">{project.category}</Text>
      <Rule x={286} y={top + 45} length={334} weight={2} color="#252525" />
      <Text x={286} y={top + 52} font="form" size={14}>Title:</Text>
      <Text x={319} y={top + 51} size={12}>{project.title}</Text>
      <Rule x={315} y={top + 67} length={300} dash="1 3" />
      <Text x={286} y={top + 72} font="form" size={14}>Date:</Text>
      <Text x={319} y={top + 71} size={12}>{project.date}</Text>
      <Rule x={315} y={top + 87} length={300} dash="1 3" />
      <Text x={286} y={top + 91} font="form" size={14}>Description:</Text>
      <Text x={286} y={top + 108} w={329} size={9} className="project-desc"><Rich text={project.description} /></Text>
    </article>
  );
}

export function ProjectsFront({ pageIndex }) {
  const page = PROJECTS.pages[pageIndex];
  const filled = page.projects.slice(0, SLOTS.length);
  const emptySlot = filled.length < SLOTS.length ? SLOTS[filled.length] : null;
  return (
    <Sheet width={WIDTH} height={HEIGHT}>
      <Paper name="paper-projects" {...PAPER} />
      <Piece name="seal" x={501} y={5.04} w={70} h={64} className="projects-seal" />
      {filled.map((project, slot) => (
        <div key={project.title} className="project-slot">
          <CutLine top={SLOTS[slot]} />
          <div className="project-card" style={at(CARD.x, SLOTS[slot], CARD.w, CARD.h)}>
            <Paper name="card-paper" x={0} y={0} w={CARD.w} h={CARD.h} />
          </div>
          <QrCode url={GITHUB_URL} x={82} y={SLOTS[slot] + 16} size={204} blurred={Boolean(project.stamp)} />
          <Staples page={pageIndex} slot={slot} top={SLOTS[slot]} />
        </div>
      ))}
      {emptySlot != null && <CutLine top={emptySlot} />}
      <div className="sheet-ink">
        <Letterhead top={17.1} />
        <Text x={60} y={88.04} font="form" size={16}>{PROJECTS.title}</Text>
        <Text x={513} y={88.04} size={12} weight={700}>{page.code}</Text>
        {filled.map((project, slot) => <ProjectText key={project.title} project={project} top={SLOTS[slot]} />)}
        {emptySlot != null && (
          <Text x={CUT.x} y={emptySlot + 107} w={CUT.w} font="form" size={14} align="center">{PROJECTS.emptySlot}</Text>
        )}
      </div>
      {filled.map((project, slot) => project.stamp && (
        <div key={project.title} className="project-stamp" style={{ ...at(184 - 120, SLOTS[slot] + 118 - 20, 240, 40), fontSize: u(30), lineHeight: u(40) }}>
          {project.stamp}
        </div>
      ))}
    </Sheet>
  );
}

// The back: paper seen from behind, with the overhanging card strips showing past its edge.
export function ProjectsBack({ pageIndex }) {
  const count = Math.min(PROJECTS.pages[pageIndex].projects.length, SLOTS.length);
  return (
    <Sheet width={WIDTH} height={HEIGHT}>
      {SLOTS.slice(0, count).map((top) => (
        <div key={top} className="project-card" style={at(mirrorX(WIDTH, CARD.x, CARD.w), top, CARD.w, CARD.h)}>
          <Paper name="card-paper" x={0} y={0} w={CARD.w} h={CARD.h} mirrored />
        </div>
      ))}
      <Paper name="paper-projects" {...PAPER} x={mirrorX(WIDTH, PAPER.x, PAPER.w)} mirrored />
    </Sheet>
  );
}
