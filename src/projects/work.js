// Every word on /projects: the shelf of books (Shelf.jsx) and each project's book (Book.jsx). Layouts live in those
// files; change only the text and colours here.
// The projects are the ones on /temp (src/temp/content/dossier.js), rewritten for a magazine instead of a dossier.

export const ISSUE = {
  title: 'Selected Work',
  masthead: 'Zaky Ashari · Issue 01',
  hint: 'Scroll to turn the page',
  // The shelf: its accessible name, and the way back to it from an open book.
  shelfLabel: 'Projects',
  back: 'All projects',
  // Phones and tablets held upright: the book is turned sideways; these offer the pages upright and back.
  turnHint: 'Turn your phone sideways to read',
  uprightView: 'Read upright',
  bookView: 'Back to the book',
};

// One book per project, in shelf order. color is the book's cloth (its spine, covers and the accent inside it); slug is
// its address on the page (/projects/?p=slug). layout is the spread that tells the project (Book.jsx).
export const PROJECTS = {
  alzheimer: {
    slug: 'alzheimer-detection',
    color: '#541900',
    layout: 'feature',
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
  viewer: {
    slug: 'data-viewer',
    color: '#0e3a40',
    layout: 'story',
    category: 'Software Engineering',
    title: 'Interactive Data Viewer',
    date: 'Jul 2025',
    stack: 'React · TypeScript · Three.js',
    body: 'A web-based 3D viewer for Alzheimer’s MRI datasets. It renders thousands of image slices on a sphere with filtering, and stays fast through level-of-detail rendering, progressive loading and delivery over AWS CloudFront. Because of ADNI data privacy rules it is for personal use only, and no data was uploaded to GitHub.',
  },
  pipeline: {
    slug: 'processing-pipeline',
    color: '#3b3d0f',
    layout: 'story',
    category: 'MLOps Engineering',
    title: 'Alzheimer’s Processing Pipeline',
    date: 'Feb — Jul 2025',
    stack: 'Python · HD-BET · ANTs',
    body: 'A production-grade Python pipeline that preprocesses ADNI T1-weighted MRI scans, turning raw 3D NIfTI files into training-ready 2D sequences for temporal deep learning. Four modular stages, GPU acceleration and cross-platform support. My final-year thesis project, it takes the data wrangling out of Alzheimer’s research.',
  },
  fraud: {
    slug: 'fraud-detection',
    color: '#16233f',
    layout: 'dossier',
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
  uplink: {
    slug: 'photos-cloud-uplink',
    color: '#4a1a3c',
    layout: 'closing',
    category: 'Software Engineering',
    title: 'Personal Photos Cloud Uplink',
    date: '2023',
    stamp: '[ASSET-LOST]',
    stack: 'Python · boto3 · AWS S3',
    body: 'A Python automation that synced the photos on my phone to an AWS S3 bucket. An incremental sync engine on boto3 ran every hour, and only on Wi-Fi, to save bandwidth. The source code has since been lost, so this one lives on as a ghost protocol.',
  },
};

export const CLOSING = {
  kicker: 'End of issue',
  headline: 'Your project could be next.',
  label: 'Contact me',
  href: 'mailto:izzat.zaky@gmail.com',
};

// A project's book, spread by spread in reading order: its cover, the spread that tells it, and the end of the issue
// (the closing spread carries its own end). The live-region announcement uses the label.
export function spreadsOf(key) {
  const p = PROJECTS[key];
  const spreads = [
    { key: 'cover', layout: 'cover', label: 'Cover' },
    { key, layout: p.layout, label: p.layout === 'closing' ? `${p.title}, and contact` : p.title },
  ];
  if (p.layout !== 'closing') spreads.push({ key: 'end', layout: 'end', label: 'Contact' });
  return spreads;
}
