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
    color: '#f7ebd2',
    // Its own book, drawn in Figma (FraudBook.jsx); the words are in FRAUD_BOOK below.
    spreads: [
      { key: 'fraud-cover', layout: 'fraudCover', label: 'Decoding fraud' },
      { key: 'fraud-research', layout: 'fraudResearch', label: 'The research' },
      { key: 'fraud-machine', layout: 'fraudMachine', label: 'Building the machine' },
      { key: 'fraud-agreement', layout: 'fraudAgreement', label: 'The agreement' },
    ],
    role: 'AI/ML Engineer',
    category: 'AI Engineering',
    title: 'Fraud Detection',
  },
  alzheimer: {
    slug: 'alzheimer-detection',
    color: '#c5fb04',
    // Its own book, drawn as Figma's SVG (AlzheimerBook.jsx); its words are in the spreads, its headings in
    // ALZHEIMER_BOOK below.
    spreads: [
      { key: 'alzheimer-cover', layout: 'alzheimer1', label: 'Alzheimer’s disease classification' },
      { key: 'alzheimer-stakes', layout: 'alzheimer2', label: 'The stakes and the raw material' },
      { key: 'alzheimer-pipelines', layout: 'alzheimer3', label: 'The pipelines and the neural net' },
      { key: 'alzheimer-results', layout: 'alzheimer4', label: 'Simplicity wins' },
    ],
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
  },
  deepfake: {
    slug: 'deepfake-classification',
    color: '#090608',
    // Its own book, drawn as Figma's SVG (DeepfakeBook.jsx); its words are in the spreads, its headings in
    // DEEPFAKE_BOOK below.
    spreads: [
      { key: 'deepfake-cover', layout: 'deepfake1', label: 'The biometric illusion' },
      { key: 'deepfake-anatomy', layout: 'deepfake2', label: 'The anatomy of a fake' },
      { key: 'deepfake-networks', layout: 'deepfake3', label: 'Traditional vs deep neural networks' },
      { key: 'deepfake-capsule', layout: 'deepfake4', label: 'Capsule network' },
    ],
    role: 'AI/ML Engineer',
    category: 'AI Engineering',
    title: 'Deepfake Classification Research',
  },
  gamified: {
    slug: 'gamified-personal-website',
    color: '#f7ebd2',
    // Its own book, drawn in Figma (GamifiedBook.jsx); the words are in GAMIFIED_BOOK below.
    spreads: [
      { key: 'gamified-cover', layout: 'gamifiedCover', label: 'A gamified personal website' },
      { key: 'gamified-site', layout: 'gamifiedSite', label: 'Fully interactive website' },
    ],
    role: 'Software Engineer',
    category: 'Software Engineering',
    title: 'Gamified Personal Website',
  },
};

export const CLOSING = {
  kicker: 'End of issue',
  headline: 'Your project could be next.',
  label: 'Contact me',
  href: 'mailto:izzat.zaky@gmail.com',
};

// Arumi Coffee's book, from the Figma spreads design/figma/data/arumi-page-1-2.svg to 7-8. Every paragraph is given
// line by line as Figma breaks it, so the justified columns come out as designed (FigmaBook.jsx: **bold**,
// {{kept together}}).
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
    'Honey {{Tea Blanc.}}',
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

// Fraud Detection's book, from the Figma spreads design/figma/data/fraud-page-1-2.svg to 7-8, given as ARUMI_BOOK is.
export const FRAUD_BOOK = {
  title: 'FRAUD DETECTION',
  years: '2024 - 2025',
  hint: 'Scroll to turn this page',
  headline: ['DECODING', 'FRAUD.'],
  summary: [
    'An internship program at GDP',
    'Labs: Architecting an AI for fraud',
    'detection system for a Banking',
    'Company.',
  ],
  stakes: [
    'Before a single line of production code was',
    'written, the stakes were set. The client',
    'needed a bulletproof way to flag fraudulent',
    'loan applicants before the money moved.',
    "The mission wasn't just to build a filter; it",
    'was to engineer a proactive defense',
    'mechanism that could identify high-risk',
    { text: 'anomalies in massive, complex financial', align: 'left' },
    { text: 'datasets.', align: 'center' },
  ],
  guesswork: ["You don't beat advanced,", 'evolving fraud with basic', 'scripts and guesswork.'],
  research: [
    'Zashari, with the help from',
    'his Mentor took a hyper-',
    'analytical approach right out',
    'of the gate, diving deep into',
    'academic research and',
    'stress-testing heavy-hitting',
    'machine learning techniques',
    'before committing to an',
    'architecture.',
    '',
    'The research phase was',
    'intense. It meant analyzing',
    'the performance metrics of',
    'Support Vector Machines',
    '(SVM), Probabilistic Neural',
    'Networks (PNN), and',
    'complex hybrid data mining',
    'methods to see how they',
    'handled real-world financial',
    'anomalies.',
  ],
  goal: [
    'The ultimate goal was to find',
    'the absolute perfect',
    'algorithmic foundation. By',
    'understanding the',
    'mathematical limits of',
    'existing fraud detection',
    'models, the team could',
    'engineer a solution designed',
    'specifically to push past',
    'them and set a new',
    'standard.',
  ],
  machine: ['BUILDING THE', 'MACHINE'],
  stack: [
    'The final solution was an',
    'absolute powerhouse. Built',
    'on a hardcore, unyielding',
    'stack of Python 3.10, Scikit-',
    'learn, and XGBoost, the',
    'machine learning pipeline',
    'was designed to chew',
    'through raw, complex data',
    'with zero friction.',
    '',
    'But a model is only as good',
    'as its deployment. The',
    'backend was powered by',
    'Flask, ensuring the API',
    'endpoint could seamlessly',
    'and securely handle real-',
    'time fraud-checking',
    'requests directly from',
    "Client's mobile and web",
    'applications.',
    '',
    'Every piece of the',
    'architecture was optimized',
    'for speed and reliability,',
    'creating a true end-to-end',
    'ML pipeline that covered',
    'everything from raw data',
    'preprocessing to final model',
    'evaluation.',
  ],
  data: [
    'Data is messy, and fraud data is notoriously',
    'imbalanced. To fix this, Zashari implemented',
    'advanced oversampling and data balancing',
    'techniques. But the real flex was the feature',
    'selection. Using a Predictive Power Score',
    '(PPS) system, the architecture ruthlessly',
    'filtered out useless noise, extracting and',
    'selecting only the highest-impact data',
    'points—ensuring the model was learning',
    'from the right signals, not just the loud',
    'ones.',
  ],
  manual: [
    'Manual deployment',
    'is a thing of the',
    'past. To make this',
    'system truly',
    'scalable, Zashari and',
    'his Mentor',
    'engineered a',
    'custom auto-run',
    'system that handled',
    'the entire pipeline',
    'end-to-end without',
    'human intervention.',
  ],
  automated: [
    'From executing the',
    'initial data',
    'processing to',
    'running the heavy',
    'model training and',
    'finalizing the',
    'predictions,',
    'everything was',
    'heavily automated.',
  ],
  minio: [
    'Once a model was',
    'trained and validated',
    'against the test data,',
    'the system securely',
    'pushed the final',
    'weights and artifacts',
    'straight to MinIO',
    'storage. This',
    'workflow made the',
    'latest, smartest',
    'version of the model',
    'instantly ready for',
    'production inference.',
  ],
  agreement: [
    'The Service Level Agreement (SLA) demanded a minimum 80% recall',
    'to consider the project a success. The final model didn’t just pass the',
    'test; it completely shattered the benchmark, hitting a massive 89%',
    'recall.',
    '',
    'But in the high-stakes finance world, an AI "black box" that just spits',
    "out a yes or no doesn't fly. Real humans need to trust the tech.",
    '',
    'To bridge that gap, Zashari and his Mentor integrated advanced',
    'explainability modules, including feature attribution and full',
    'interpretability reports directly into the system. This gave the human',
    'Risk Management Division exactly what they needed: the transparent',
    'logic behind the AI to confidently make those final approval decisions.',
  ],
};

// Gamified Personal Website's book, from the Figma spreads design/figma/data/gamified-page-1-2.svg and 3-4, given as
// ARUMI_BOOK is (FigmaBook.jsx also reads _italics_ and [links](url)).
export const GAMIFIED_BOOK = {
  headline: ['A', 'GAMIFIED', 'PERSONAL', 'WEBSITE'],
  kicker: 'PERSONAL PROJECT',
  date: 'DECEMBER 2025',
  hint: 'Scroll to turn this page',
  end: 'End of File',
  feature: 'FULLY INTERACTIVE WEBSITE',
  // The gamified site lives at the root of zashari.website; /gamified-version leads there (public/gamified-version).
  site: 'https://zashari.website/gamified-version',
  idea: [
    'Back in December 2025, a heavy',
    'obsession with a crime-investigation',
    'game sparked an idea: a fully',
    'interactive personal project built',
    'entirely from scratch.',
  ],
  vibe: [
    "Vibe Coding is Zashari's ultimate",
    'creative outlet, he loves dreaming up',
    'concepts and bringing them to life.',
    'To nail the gritty aesthetic, he even',
    'used AI to generate paparazzi-style',
    'photos of himself.',
  ],
  week: [
    'Combining creativity with sharp AI prompting, he pulled the entire site',
    'together in just a week. (You can explore it live at [https://](https://zashari.website/gamified-version)',
    '[zashari.website/gamified-version](https://zashari.website/gamified-version)). Zashari is obsessed with',
    'productivity, he built this as a side hustle while grinding full-time as a',
    'Software Engineer at marketbetter.ai and doing his final thesis in Deep',
    'Learning field.',
  ],
  designFile: '( The design file )',
  stack: [
    'The stack? React 19 (with React Compiler), Vite 8, and Three.js with',
    '@react-three/fiber 9. The rest? He let _Claude Code_ handle the heavy',
    'lifting in the code. Zashari believes the game has changed: today,',
    'creators should focus their energy on prototyping, design, and creative',
    // The line breaks round the logotype: Figma sets its end apart, at the column's right.
    { text: 'direction, and let AI', align: 'left' },
  ],
  stackEnd: 'execute the technical grind.',
};

// Deepfake Classification Research's book is Figma's own SVG (scripts/build-book-svg.mjs), its text included; these are
// its headings for screen readers, spread by spread, as the drawn lettering splits them up.
export const DEEPFAKE_BOOK = {
  headings: [
    ['Deepfake Research, Feb 2024', 'The Biometric Illusion'],
    ['The Anatomy of a Fake', 'Human vs Machine'],
    ['Traditional Neural Network vs Deep Neural Network', 'The Innovative Bottleneck'],
    ['The CNN vs LSTM Pipeline', 'Capsule Network'],
  ],
};

// Alzheimer's Disease Classification's book is Figma's own SVG (scripts/build-book-svg.mjs), its text included; these
// are its title and its headings for screen readers, spread by spread, as the drawn lettering splits them up.
export const ALZHEIMER_BOOK = {
  title: 'Alzheimer’s Disease Classification',
  headings: [
    ['Alzheimer’s Disease Classification'],
    ['The Stakes', 'The Raw Material'],
    ['The Pipelines', 'The Neural Net.'],
    ['Simplicity Wins.'],
  ],
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
