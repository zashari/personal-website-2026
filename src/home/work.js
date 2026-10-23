// Every word in the /home work book (page 2, under the landing). Layouts live in Book.jsx; change only the text here.
// The projects are the ones on /temp (src/temp/content/dossier.js), rewritten for a magazine instead of a dossier.

export const ISSUE = {
  title: 'Selected Work',
  years: '2023 — 2025',
  masthead: 'Zaky Ashari · Issue 01',
  disciplines: ['AI', 'Software', 'MLOps'],
  hint: 'Scroll to turn the page',
  sectionLabel: 'Selected work, a book of projects',
};

export const PROJECTS = {
  alzheimer: {
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
    category: 'Software Engineering',
    title: 'Interactive Data Viewer',
    date: 'Jul 2025',
    stack: 'React · TypeScript · Three.js',
    body: 'A web-based 3D viewer for Alzheimer’s MRI datasets. It renders thousands of image slices on a sphere with filtering, and stays fast through level-of-detail rendering, progressive loading and delivery over AWS CloudFront. Because of ADNI data privacy rules it is for personal use only, and no data was uploaded to GitHub.',
  },
  pipeline: {
    category: 'MLOps Engineering',
    title: 'Alzheimer’s Processing Pipeline',
    date: 'Feb — Jul 2025',
    stack: 'Python · HD-BET · ANTs',
    body: 'A production-grade Python pipeline that preprocesses ADNI T1-weighted MRI scans, turning raw 3D NIfTI files into training-ready 2D sequences for temporal deep learning. Four modular stages, GPU acceleration and cross-platform support. My final-year thesis project, it takes the data wrangling out of Alzheimer’s research.',
  },
  fraud: {
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

// One spread per entry, in reading order. The live-region announcement uses the label.
export const SPREADS = [
  { key: 'cover', layout: 'cover', label: 'Cover' },
  { key: 'alzheimer', layout: 'feature', label: PROJECTS.alzheimer.title },
  { key: 'pair', layout: 'pair', label: `${PROJECTS.viewer.title} and ${PROJECTS.pipeline.title}` },
  { key: 'fraud', layout: 'dossier', label: PROJECTS.fraud.title },
  { key: 'closing', layout: 'closing', label: `${PROJECTS.uplink.title}, and contact` },
];
