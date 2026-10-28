// Fraud Detection's book: four spreads drawn in Figma (design/figma/data/fraud-page-*.svg), rebuilt with FigmaBook.jsx.
import { Box, Hint, Path, Photo, Sheet, Text, plain } from './FigmaBook';
import { PATHS, PHOTOS } from './assets/books/fraud/figma';
import { FRAUD_BOOK as F } from './work';
import './fraud.css';

// The body text: Host Grotesk Medium 10/11 in black, justified.
const column = { font: 'grotesk', size: 10, lineHeight: 11, weight: 500, color: '#000', justify: true };
// The longer passages on dark panels: Times New Normal 12/13 in white, justified.
const passage = { font: 'times', size: 12, lineHeight: 13, width: 219, justify: true };
// Headers in Open Sans Condensed 20.
const header = { font: 'condensed', size: 20, weight: 800 };

// Pages 1 and 2: the masked portrait across both pages, the headline and what the project was.
function CoverSpread() {
  return (
    <Sheet>
      <Photo {...PHOTOS['s1-image']} />
      <Text lines={F.headline} x={13} baseline={268.216} size={65} lineHeight={70} weight={800} />
      <Hint>{F.hint}</Hint>
      <Box x={427} y={395} w={298} h={115} color="rgb(0 0 0 / 0.7)" />
      <Text lines={F.summary} {...header} x={440} baseline={426.259} lineHeight={23} width={272} justify shadow />
      <Text lines={[F.title]} {...header} x={502} baseline={55.7588} shadow />
    </Sheet>
  );
}

// Pages 3 and 4: the stakes over the photo, then the research beside the logotype.
function ResearchSpread() {
  return (
    <Sheet>
      <Photo {...PHOTOS['s2-image']} />
      <Hint baseline={513.655}>{F.hint}</Hint>
      <Text lines={F.stakes} {...passage} x={82} baseline={370.5} />
      <Text lines={[F.title]} {...header} x={26} baseline={49.2773} shadow />
      <Text lines={[F.years]} {...header} weight={400} x={269} baseline={49.2773} shadow />
      <Photo {...PHOTOS['s2-image-1']} />
      <Photo {...PHOTOS['s2-image-2']} />
      <Text lines={F.guesswork} {...column} x={413} baseline={236} width={135} />
      <Text lines={F.research} {...column} x={413} baseline={279} width={135} />
      <Text lines={F.goal} {...column} justify={false} x={604} baseline={44} />
      <Path {...PATHS['s2-line-9']} />
      <Text lines={['Z']} font="script" className="fb-logo-z" x={598} baseline={280.275} size={75} color="#000" />
      <Text
        lines={['ashari']}
        x={632}
        baseline={280.397}
        size={50}
        weight={500}
        color="#000"
        style={{ letterSpacing: '-0.13em' }}
      />
    </Sheet>
  );
}

// Pages 5 and 6: the stack on the left page, the product shot across the rest and the data work on a panel over it.
function MachineSpread() {
  return (
    <Sheet>
      <Photo {...PHOTOS['s3-image']} />
      <Text lines={F.machine} {...header} color="#000" align="center" x={48} baseline={49.2773} lineHeight={20} width={137} />
      <Text lines={F.stack} {...column} x={48} baseline={114} width={135} />
      <Hint baseline={513.655} color="#000">
        {F.hint}
      </Hint>
      <Box x={493} y={357} w={244} h={161} color="rgb(0 0 0 / 0.7)" />
      <Text lines={F.data} {...passage} x={505} baseline={375.5} />
    </Sheet>
  );
}

// Pages 7 and 8: the automation in three columns over its photo, and the agreement under the visor.
function AgreementSpread() {
  return (
    <Sheet>
      <Photo {...PHOTOS['s4-image']} />
      <Photo {...PHOTOS['s4-image-2']} />
      <Text lines={F.manual} {...column} x={34} baseline={55} width={96} />
      <Text lines={F.automated} {...column} x={142} baseline={55} width={96} />
      <Text lines={F.minio} {...column} x={250} baseline={55} width={99} />
      <Text lines={F.agreement} {...column} x={414} baseline={388} width={323} />
    </Sheet>
  );
}

export const FRAUD_LAYOUTS = {
  fraudCover: CoverSpread,
  fraudResearch: ResearchSpread,
  fraudMachine: MachineSpread,
  fraudAgreement: AgreementSpread,
};

// Paragraphs split at Figma's blank lines.
const paragraphs = (lines) =>
  lines
    .reduce((all, line) => (line === '' ? [...all, []] : [...all.slice(0, -1), [...all.at(-1), line]]), [[]])
    .map(plain);

export function FraudIndex() {
  return (
    <article>
      <h2>{plain(F.headline)}</h2>
      <p>
        Fraud Detection, {F.years}. {plain(F.summary)}
      </p>
      {[F.stakes, F.guesswork, F.research, F.goal].flatMap(paragraphs).map((text) => (
        <p key={text}>{text}</p>
      ))}
      <h3>{plain(F.machine)}</h3>
      {[F.stack, F.data, F.manual, F.automated, F.minio, F.agreement].flatMap(paragraphs).map((text) => (
        <p key={text}>{text}</p>
      ))}
    </article>
  );
}
