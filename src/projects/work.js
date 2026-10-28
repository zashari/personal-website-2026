// Every word on /projects: the hero and showcase (Showcase.jsx) and each project's book (Book.jsx). Layouts live in
// those files; change only the text and colours here.
// The projects are the ones on /temp (src/temp/content/dossier.js), rewritten for a magazine instead of a dossier.

export const ISSUE = {
  title: 'Selected Work',
  masthead: 'Zaky Ashari · Issue 01',
  hint: 'Scroll to turn the page',
  // The way back to the showcase from an open book.
  back: 'All projects',
  // Phones and tablets held upright: the book is turned sideways; these offer the pages upright and back.
  turnHint: 'Turn your phone sideways to read',
  uprightView: 'Read upright',
  bookView: 'Back to the book',
};

// One book per project, in showcase order (001 to 005). role is the bracketed line under its title in the showcase;
// color is the book's cloth (its covers and the accent inside it); slug is its address on the page (/projects/?p=slug);
// layout is the spread that tells the project (Book.jsx). A project without a known date leaves date out.
export const PROJECTS = {
  fraud: {
    slug: 'fraud-detection',
    color: '#16233f',
    layout: 'dossier',
    role: 'AI/ML Engineer',
    category: 'AI Engineering',
    title: 'Fraud Detection',
    headline: ['Fraud', 'Detection'],
    date: 'May — Dec 2024',
    stamp: '[CLASSIFIED]',
    quote: 'A pipeline that looks after itself, from feature analysis to deployment.',
    stat: '>80%',
    statNote: 'Recall the model was tuned for, so less fraud slips through.',
    stack: ['XGBoost', 'SMOTE', 'Predictive Power Score', 'Flask', 'MinIO'],
    body: 'Built with my mentor for a major financial institution in Indonesia: an automated fraud detection system on XGBoost, tuned for high recall to keep financial losses down. The pipeline looks after itself, from Predictive Power Score analysis and SMOTE balancing to the debtor’s credit data, and ships through Flask with MinIO for secure object storage. No further details can be shared.',
  },
  alzheimer: {
    slug: 'alzheimer-detection',
    color: '#541900',
    layout: 'feature',
    role: 'AI/ML Engineer',
    category: 'AI Engineering',
    title: 'Alzheimer’s Disease Detection',
    headline: ['Alzheimer’s', 'Disease', 'Detection'],
    date: 'Jul — Dec 2025',
    stat: '83.54%',
    statNote: 'Accuracy of the 3D-ResNet, the strongest of sixteen model variants.',
    plateNote: '16 variants · 2D, 3D and trimodal fusion · ResNet, EfficientNet and ViT backbones',
    winner: '3D-ResNet · 83.54%',
    body: 'A full deep learning evaluation for classifying Alzheimer’s atrophy, trained on data from my own preprocessing pipeline. Sixteen architecture variants across 2D, 3D and trimodal fusion, built on ResNet, EfficientNet and ViT backbones, went through a 1,000-iteration bootstrap and Friedman tests. The 3D-ResNet came out on top at 83.54% accuracy: keeping the brain volume intact mattered more than fusing modalities.',
  },
  arumi: {
    slug: 'arumi-coffee',
    color: '#421615',
    // Its own book, drawn in Figma (ArumiBook.jsx); the words are in ARUMI_BOOK below.
    spreads: [
      { key: 'arumi-cover', layout: 'arumiCover', label: 'Cover' },
      { key: 'arumi-sunset', layout: 'arumiSunset', label: 'A place to catch the sunset' },
      { key: 'arumi-plan', layout: 'arumiPlan', label: 'It was never the plan' },
      { key: 'arumi-team', layout: 'arumiTeam', label: 'The team' },
    ],
    role: 'Business',
    category: 'Business',
    title: 'Arumi Coffee',
    stack: 'Product · Operations',
    body: 'Part of the founding team of Arumi Coffee, a coffee stand: hands-on with product development, business operations and everything in between. Different field, same curiosity.',
  },
  deepfake: {
    slug: 'deepfake-classification',
    color: '#3a1530',
    layout: 'story',
    role: 'AI/ML Engineer',
    category: 'AI Engineering',
    title: 'Deepfake Classification Research',
    stack: 'CNN · LSTM',
    body: 'Research into telling deepfake video from real footage, with CNN and LSTM architectures: the convolutional network reads each frame, and the recurrent one follows what changes between them.',
  },
  gamified: {
    slug: 'gamified-personal-website',
    color: '#1d3a3a',
    layout: 'story',
    role: 'Software Engineer',
    category: 'Software Engineering',
    title: 'Gamified Personal Website',
    stack: 'React · Vite',
    body: 'A personal website played as a classified dossier: personal info, professional record and projects filed as folders to open, every sheet built as live code.',
  },
};

export const CLOSING = {
  kicker: 'End of issue',
  headline: 'Your project could be next.',
  label: 'Contact me',
  href: 'mailto:izzat.zaky@gmail.com',
};

// Arumi Coffee's book, from the Figma spreads design/figma/data/arumi-page-1-2.svg to 7-8. Every paragraph is given
// line by line as Figma breaks it, so the justified columns come out as designed; **words** are set in bold.
export const ARUMI_BOOK = {
  title: 'ARUMI COFFEE',
  date: 'May 2026',
  hint: 'Scroll to turn this page',
  end: 'End of File',
  headline: ['“A PLACE TO CATCH THE', 'SUNSET.”'],
  quote: [
    '“At least, that’s what our customers tell us.',
    'Arumi Coffee is a passion project I’m',
    'building from the ground up with my',
    'family”',
  ],
  quoteBy: 'Zaky Ashari',
  plan: ['IT WAS', 'NEVER THE', 'PLAN.'],
  opened: [
    'Arumi Coffee opened its doors on June 19, 2026. Zashari actually',
    'never intended to go all-in on this project. It wasn’t until a trip back to',
    'his hometown of Palu in March 2026, and a pivotal late-night',
    'conversation with his family that everything shifted. After three',
    'months of grinding, Arumi Coffee launched with a raw, minimalist',
    'open-bar concept.',
  ],
  revamp: [
    'By month three, Zaky and his',
    'siblings knew they had to level',
    'up. They revamped the bar',
    'layout—a move that instantly',
    'paid off and drew in a massive',
    'new crowd.',
  ],
  vibe: [
    'The vibe shifted organically.',
    'People weren’t just showing up',
    'for the sunset anymore; they',
    'were staying for the city lights',
    'and making the redesigned bar',
    'their go-to aesthetic photo',
    'drop.',
  ],
  hats: [
    'Zashari wears a lot of hats',
    'here. He spearheaded the',
    'R&D behind some of',
    'Arumi’s most hyped',
    'signature drinks, including',
    'the Mont Blanc, Berry',
    'Manuka Americano, and',
    'Honey Tea Blanc.',
  ],
  team: [
    'But he’s the first to admit it’s a total',
    'team effort. His brother **Andi Ashari**',
    'built the custom POS system and',
    'helped fund the vision alongside their',
    'parents. **Kintha Ashari** and **Nadine**',
    '**Ashari** brought serious F&B industry',
    'experience to lock down the SOPs,',
    'while his younger brother **Izzat Ashari**',
    'is the creative force behind the visual',
    'identity and the iconic Arumi logo.',
  ],
  today: [
    'Today, Zaky manages the day-to-day',
    'chaos, from daily operations and HR',
    'to social media and infrastructure',
    'design. The vision? Constant',
    'evolution. Arumi Coffee is always',
    'upgrading its space and tweaking its',
    'menu to keep the community coming',
    'back for more.',
  ],
  hiatus: [
    'To make Arumi a reality, Zaky actually',
    'took a hiatus from his career in tech.',
    'But it’s only temporary—he plans to',
    'dive right back into the development',
    'world once the coffee shop is fully',
    'self-sustaining.',
  ],
  dream: ['It’s his dream', 'since in middle', 'school to run a', 'business he said.'],
};

// A project's book, spread by spread in reading order: its cover, the spread that tells it, and the end of the issue,
// unless the project has a book of its own (spreads). The live-region announcement uses the label.
export function spreadsOf(key) {
  if (PROJECTS[key].spreads) return PROJECTS[key].spreads;
  return [
    { key: 'cover', layout: 'cover', label: 'Cover' },
    { key, layout: PROJECTS[key].layout, label: PROJECTS[key].title },
    { key: 'end', layout: 'end', label: 'Contact' },
  ];
}
