// Arumi Coffee's book: four spreads drawn in Figma (design/figma/data/arumi-page-*.svg), rebuilt with FigmaBook.jsx.
import { Box, Hint, Photo, Sheet, Text, plain } from './FigmaBook';
import { PHOTOS } from './assets/books/arumi/figma';
import { ARUMI_BOOK as A } from './work';
import './arumi.css';

// The body text: Host Grotesk 10/11 in light grey, justified.
const column = { font: 'grotesk', size: 10, lineHeight: 11, color: '#d2d2d2', justify: true };

// Pages 1 and 2: the title, the date and a strip of photo across the gutter.
function CoverSpread() {
  return (
    <Sheet>
      <Text lines={[A.title]} x={32} baseline={56.2588} size={20} weight={500} />
      <Text lines={[A.date]} x={669} baseline={54.8191} size={15} />
      <Photo {...PHOTOS['s1-image']} />
      <Hint x={615} shadow={false}>
        {A.hint}
      </Hint>
    </Sheet>
  );
}

// Pages 3 and 4: one photo across both pages, the headline over it and the founder's words in a box.
function SunsetSpread() {
  return (
    <Sheet>
      <Photo {...PHOTOS['s2-image']} />
      <Text lines={A.headline} x={26} baseline={88.397} size={50} lineHeight={68} weight={800} shadow />
      <Hint>{A.hint}</Hint>
      <Box x={512} y={413} w={229} h={88} color="rgb(0 0 0 / 0.75)" />
      <Text lines={A.quote} font="times" x={517} baseline={429.5} size={12} lineHeight={13} />
      <Text lines={['-']} font="times" x={517} baseline={490.5} size={12} lineHeight={13} />
      <Text lines={[A.quoteBy]} font="times" x={524} baseline={490.5} size={12} lineHeight={13} />
    </Sheet>
  );
}

// Pages 5 and 6: how it started, a photo per moment.
function PlanSpread() {
  return (
    <Sheet>
      <Photo {...PHOTOS['s3-image-main']} />
      <Text lines={A.opened} x={26} baseline={400} width={325} {...column} />
      <Text lines={A.plan} font="condensed" x={26} baseline={79.397} size={50} lineHeight={50} weight={800} shadow />
      <Hint baseline={495.879} size={10}>
        {A.hint}
      </Hint>
      <Photo {...PHOTOS['s3-image-bottom']} />
      <Photo {...PHOTOS['s3-image-main-2']} />
      <Photo {...PHOTOS['s3-image-top']} />
      <Text lines={A.revamp} x={589} baseline={90} width={150} {...column} />
      <Text lines={A.vibe} x={589} baseline={398} width={150} {...column} />
    </Sheet>
  );
}

// Pages 7 and 8: the signature drink running out of its photo, and the people behind it.
function TeamSpread() {
  return (
    <Sheet>
      <Photo {...PHOTOS['s4-mont-blanc-left']} />
      <Text lines={[A.title]} font="condensed" x={133} baseline={67.7588} size={20} weight={800} shadow />
      <Hint>{A.end}</Hint>
      <Photo {...PHOTOS['s4-image']} />
      <Photo {...PHOTOS['s4-mont-blanc-right']} />
      <Text lines={A.hiatus} x={568} baseline={288} width={174} {...column} />
      <Text lines={A.today} x={568} baseline={177} width={174} {...column} />
      <Text lines={A.team} x={568} baseline={44} width={174} {...column} />
      <Text lines={A.dream} x={461} baseline={455} width={84} {...column} />
      <Text lines={A.hats} x={422} baseline={44} width={123} {...column} justifyLast />
    </Sheet>
  );
}

export const ARUMI_LAYOUTS = {
  arumiCover: CoverSpread,
  arumiSunset: SunsetSpread,
  arumiPlan: PlanSpread,
  arumiTeam: TeamSpread,
};

export function ArumiIndex() {
  return (
    <article>
      <h2>Arumi Coffee</h2>
      <p>{A.date}</p>
      <h3>{plain(A.headline)}</h3>
      <blockquote>
        <p>{plain(A.quote)}</p>
        <footer>{A.quoteBy}</footer>
      </blockquote>
      <h3>{plain(A.plan)}</h3>
      {[A.opened, A.revamp, A.vibe, A.hats, A.team, A.today, A.hiatus, A.dream].map((lines) => (
        <p key={lines[0]}>{plain(lines)}</p>
      ))}
    </article>
  );
}
