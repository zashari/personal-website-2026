import { textAt } from '../about/frame';
import { MaybeLink } from './Brand';
import { SOCIALS } from './content';

// The row of socials along the bottom of the 1920 x 1080 stage, shared by /home and the contact section (the Figma
// frames put it in the same place on both): 20 px Times New Normal on the 1037 baseline. dy moves it down, for an
// arrangement that needs the room. Styles in home.css.
const SOCIAL_X = { tiktok: 742, github: 920, instagram: 1096 };

export default function Socials({ dy = 0 }) {
  return (
    <ul className="home-socials">
      {SOCIALS.map((s) => (
        <li key={s.key} style={textAt({ x: SOCIAL_X[s.key], baseline: 1037 + dy, size: 20, lineHeight: 22, font: 'times' })}>
          <MaybeLink href={s.href} className="home-link">
            {s.label}
          </MaybeLink>
        </li>
      ))}
    </ul>
  );
}
