// Every word on the /temp dossier sheets. Edit text here; layout and styling live in src/temp/sheets.
//
// Inline markup understood by <Rich>:
//   **bold**          typewriter bold
//   ==red==           red ink (#891414)
//   [[redact:8]]      a black redaction bar about 8 characters wide. Never type the hidden words themselves:
//                     only the bar reaches the page, so nothing secret ends up in the HTML.
//   \n                line break

// The department name under the letterhead bars is never written anywhere; the bars are drawn by the layout.
export const LETTERHEAD = {
  department: 'DEPARTMENT OF',
  place: 'West Java, 202512-1802',
};

export const STATUS = { label: 'Status:', stamp: '| APPROVED |' };
export const FILED = { label: 'Date:', date: 'December 20th, 2025' };
export const GITHUB_URL = 'https://github.com/zashari';

export const PERSONAL = {
  stamp: 'FILE COPY',
  subject: {
    title: 'SUBJECT INFO',
    name: { label: 'Name:', value: 'Zaky Ashari' },
    bloodType: { label: 'Blood Type:', value: '[[redact:14]]' },
    aliases: { label: 'Aliases:', value: '“Jat”, “Zashari”, “Jatbzos”' },
    gender: { label: 'Gender:', value: 'Male' },
    address: { label: 'Address:', value: 'P[[redact:31]]1' },
    phone: { label: 'Phone Num:', value: '+62 81248777317', href: 'https://wa.me/6281248777317' },
    email: { label: 'Email:', value: 'izzat.zaky@gmail.com', href: 'mailto:izzat.zaky@gmail.com' },
  },
  education: {
    title: 'EDUCATION',
    entries: [
      { years: '[2021-2025]', school: 'Computer Science, BINUS University' },
      { years: '[2019-2021]', school: 'Computer Network & Engineering, Telkom Vocational Sch.' },
    ],
  },
  summary: {
    title: 'SUBJECT SUMMARY',
    columns: ['CATEGORY', 'STATUS', 'OBSERVATION / DETAILS', 'PROTOCOL'],
    rows: [
      {
        category: 'PSYCH',
        status: 'STABLE',
        details: 'Subject displays "Developer Persona." Social Firewall enabled.',
        protocol: 'AVOID SMALL TALK',
      },
      {
        category: 'ATTIRE',
        status: 'CASUAL',
        details: 'Prefers loose trousers/jeans and leather shoes; rejects sneakers and skinny jeans. Wears wired headset with sweaters, henleys, or cropped shirts.',
        protocol: 'NO FORMAL WEAR',
        warning: 'PERFORMATIVE\nWANNABE DETECTED !!',
      },
      {
        category: 'OPS /\nHABIT',
        status: 'REMOTE',
        details: 'Works 7 days/week from\n[[redact:10]](Cafe) with no weekend downtime. Rejects office environments for high-velocity remote work. This subject seems highly productive',
        protocol: 'DO NOT DISTURB',
      },
      {
        category: 'GAMING',
        status: 'LOCKED',
        details: 'Restricted to Fortnite & Mobile Legends. Auto-declines all other games.',
        protocol: 'LOYAL CODE',
      },
      {
        category: 'LAST\nSEEN',
        status: 'ACTIVE',
        details: 'Spotted at [[redact:8]], building some code [No further details available]. Deep work mode engaged via wired headphones.',
        protocol: 'APPROACH W/\nCAUTION',
      },
    ],
  },
};

export const PROFESSIONAL = {
  title: 'OFFICIAL RECORD: PROFESSIONAL OPERATIONS LOG',
  code: 'ER/9-S',
  intro:
    'It seems like the subject is currently active as a Full-stack Engineer for marketbetter.ai (Texas/Remote). Observations confirm a consistent 7-day work week, but under the strict condition of self-managed hours.\n==NOTE:== Do not dictate working hours or demand constant status updates, as this leads to immediate disengagement. Subject will initiate contact solely when deliverables are ready.',
  caption: 'Subject working at [[redact:8]] | Taken by Agent-G1',
  missions: {
    columns: ['TIMELINE', 'ENTITY / UNIT', 'OPERATIONAL DETAILS'],
    rows: [
      {
        timeline: 'JUL 2025 -\nPRESENT',
        entity: 'marketbetter.ai',
        place: '(Texas / remote)',
        details: '**Active Mission.** Orchestrated prompt routing for 4 concurrent LLMs (GPT, Claude, Gemini, Grok) to automate brand visibility reporting. Additionally engineered a custom web crawler with signature fingerprinting for tech-stack detection.',
      },
      {
        timeline: 'FEB 2024 -\nFEB 2025',
        entity: 'GDP Labs',
        place: '(Jakarta & Bandung)',
        details: '**Completed Mission.** Deployed as part of a 2-man unit to architect a fraud detection system for a major bank company in Indonesia. Successfully achieved 89% Recall (surpassing the 80% benchmark) and conducted Deepfake classification research using CNN+LSTM architectures.',
      },
      {
        timeline: 'ACTIVE\nR&D',
        entity: 'Personal Mission',
        details: '**Independent Ops.** Conducted R&D on Medical AI diagnostics. Focus includes Alzheimer’s detection via multi-modal deep learning on MRI data and Leukemia classification utilizing CNN and YOLO architectures.',
      },
    ],
  },
  loadout: {
    title: '----------TECHNICAL LOADOUT----------',
    groups: [
      {
        number: '[01]',
        heading: 'FULL-STACK INFRASTRUCTURE ------------',
        items: [
          { label: 'FRONTEND', text: 'Next.js, React, Tailwind. Visuals; Three.js (WebGL), Framer Motion.' },
          { label: 'BACKEND', text: 'Node.js, Express.js, PostgreSQL, Supabase. Comms; Azure Service Bus, Socket.io, Web PubSub. Ops: Docker, PM2, Datadog (Monitoring).' },
        ],
      },
      {
        number: '[02]',
        heading: 'AI ENGINEERING & INTELLIGENCE --------',
        items: [
          { label: 'Deep Learning', text: 'TensorFlow, PyTorch, Keras. Modules: CNN, LSTM, YOLO, Capsule Networks.' },
          { label: 'LLM Orchest.', text: 'OpenAI SDK, Anthropic, Gemini, Grok. Specialty: Multi-Model Routing & Prompt Architecture.' },
        ],
      },
    ],
  },
  protocol: {
    title: '---------- PROTOCOL & ARSENAL ----------',
    items: [
      { label: 'CATEGORY', text: 'Prompt Engineering.' },
      { label: 'AUTHORIZED', text: 'Claude Code (Anthropic)' },
      { label: 'BANNED', text: 'GPT, GEMINI, all Other AIs', alert: true },
      { label: 'NOTE', text: 'Efficiency Drops When Forced to\nUse Inferior Models' },
    ],
  },
  velocity: {
    title: '---------- VELOCITY BENCHMARK ----------',
    text: 'Subject consistently resolves tickets / work within a ~3 Hour Window. This speed is attributed to highly efficient Prompt Engineering. Subject possesses an advanced aptitude for AI orchestration, utilizing it to bypass manual coding friction and synthesize complex logic at a rate significantly higher than standard output.',
  },
};

// Projects fill pages of three cards; a page with fewer than three ends in the empty "submit" slot.
// stamp: blurs the QR code and stamps it ([TBD], [CLASSIFIED], [ASSET-LOST]); leave it out for a working QR.
export const PROJECTS = {
  title: 'OFFICIAL RECORD: HIGHLIGTED PROJECTS',
  emptySlot: '[submit project here]',
  pages: [
    {
      code: 'HP/3-A',
      projects: [
        {
          category: 'AI ENGINEERING',
          title: 'Alzheimer’s Disease Detection',
          date: 'July, 2025 - December, 2025',
          stamp: '[TBD]',
          description: 'This subject orchestrated a comprehensive Deep Learning evaluation to classify Alzheimer\'s atrophy, leveraging the pre-processed data streams from the Alzheimer\'s Disease Processing Pipeline. The operation deployed 16 architectural variants across 2D, 3D, and Trimodal Fusion modalities, utilizing ResNet, EfficientNet, and ViT backbones. **OUTCOME**: Rigorous statistical validation via 1,000-iteration Bootstrap and Friedman tests identified the 3D-ResNet protocol as the superior model (83.54% Accuracy), proving that volumetric spatial integrity outweighs the complexity of multimodal fusion mechanisms.',
        },
        {
          category: 'SOFTWARE ENGINEERING',
          title: 'Interactive Data Viewer for AD Project',
          date: 'July, 2025',
          description: 'Subject has engineered a high-performance Web-based 3D visualization tool engineered for analysis of Alzheimer’s MRI datasets. **TECH**: React, TypeScript, Three.js. **FEATURES**: Spherical rendering of thousands of image slices with advanced filtering protocols. **OPTIMIZATION**: High-velocity delivery via AWS CloudFront CDN, reinforced with Level of Detail (LOD) rendering and progressive loading protocols for seamless operational use.\n==DUE TO ADNI-IDA LONI DATA PRIVACY, THIS PROJECT IS PERSONAL-USE ONLY. No data was uploaded into Github==',
        },
        {
          category: 'MLOps ENGINEERING',
          title: 'Alzheimer’s Disease Processing Pipeline',
          date: 'February, 2025 - July, 2025',
          description: 'Subject has engineered a production-grade Python pipeline to automate ADNI T1-weighted MRI preprocessing. The system transmutes raw 3D NIfTI files into training-ready 2D sequences for temporal deep learning operations. Architecture features a modular 4-stage protocol with GPU acceleration and cross-platform support, integrating HD-BET and ANTs assets. Identified as a final-year thesis mission, this tool successfully eliminates data wrangling latency in Alzheimer\'s research workflows',
        },
      ],
    },
    {
      code: 'HP/3-B',
      projects: [
        {
          category: 'AI ENGINEERING',
          title: 'Fraud Detection',
          date: 'May, 2024 - December, 2024',
          stamp: '[CLASSIFIED]',
          description: 'This subject and his mentor engineered an automated tactical fraud detection system for a major financial institution in Indonesia. Utilizing XGBoost algorithms, the operative optimized the model to prioritize high recall (>80%) for minimizing financial leakage. The architecture features a self-regulating pipeline including Predictive Power Score (PPS) analysis, SMOTE data balancing, and integration with debtor’s credit data. Infrastructure leverages Flask and MinIO for secure object storage and automated model deployment. No further information can be provided',
        },
        {
          category: 'SOFTWARE ENGINEERING',
          title: 'Personal Photos Cloud Uplink',
          date: '2023',
          stamp: '[ASSET-LOST]',
          description: 'Subject engineered a Python-based automation protocol designed to establish a secure data uplink between a personal mobile phone unit into an AWS S3 bucket. The mechanism featured an incremental synchronization engine utilizing boto3, executing hourly cycles gated by network status (WiFi-only protocols) to ensure bandwidth efficiency. **STATUS ALERT:** The source code for this operation has been classified as **LOST/PURGED**. No digital evidence remains available for forensic audit, effectively rendering this a ==\'Ghost Protocol\'==.',
        },
      ],
    },
  ],
};

// Handwritten notes on the backs of the polaroids, shown when a photo is opened and flipped.
export const PHOTO_NOTES = {
  personal1: { location: 'Location:', locationDetail: '6.9169° S, 107.6086° E', note: 'The subject always seems to wear headphones or a headset while commuting from Node A to Node B', date: '11/01/2025' },
  personal2: { location: 'Location: Train station', note: 'subject was spotted at a train station.\nexact location unknown', date: '10/11/2025' },
  professional1: { note: 'The subject appears consistently relaxed when working in the casual attire described in the personal info. Photo taken by Undercover Agent PP, a 10-year veteran assigned to befriend the subject', date: '11/30/2025' },
  professional2: { note: 'Footage captured via spy glasses shows the subject debating Deep Learning architectures for an Alzheimer’s disease detection project with a friend.', date: '12/01/2025' },
};

// Folder tabs on the home page, back to front. overprint is the red word stamped on folder 002.
export const FOLDER_TABS = {
  3: { label: 'PROJECTS', number: '-003-', stamp: '20260123-011103' },
  2: { label: 'PROFESSIONAL', overprint: 'INFO', number: '-002-', stamp: '20260114-230252' },
  1: { label: 'PERSONAL INFO', number: '-001-', stamp: '20260101-132303' },
};
