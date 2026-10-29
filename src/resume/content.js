// Every word on /resume, from the owner's two-page CV (.tmp/resume/[2026-v2-1] and [2026-v2-2], a Figma SVG export).
// Positions and styles live in ResumeApp.jsx and resume.css; change only the text here. In any text, **bold** and
// _italic_ are marked as in the CV (company names in bold, repository names in italics).
// Dates are written as on the CV (MM/YYYY) and given again as ISO dates for <time>. The phone number is left out of
// the page on purpose: it goes only into the PDF (scripts/build-resume-pdf.mjs adds it there).

import { NAV as HOME_NAV } from '../home/content';

export const PAGE_TITLE = 'Resume of Zaky Ashari';

export const NAME = 'Zaky Ashari';
export const ROLES = ['AI Engineer', 'Software Engineer', 'Entrepreneur'];

export const CONTACT = [
  { key: 'email', label: 'izzat.zaky@gmail.com', href: 'mailto:izzat.zaky@gmail.com' },
  { key: 'website', label: 'zashari.website', href: 'https://zashari.website/' },
  { key: 'github', label: 'github.com/zashari', href: 'https://github.com/zashari' },
];

// Only in the PDF (see above).
export const PHONE = { label: '+6281248777317', href: 'https://wa.me/6281248777317' };

// The drawing's title block, top right of the sheet: what this document is, as an engineering drawing would say it.
export const TITLE_BLOCK = [
  { label: 'Document', value: 'Resume' },
  { label: 'Revision', value: '2026-v2' },
  { label: 'Updated', value: '10/2026' },
  { label: 'Sheets', value: '02 (A4)' },
];

// The PDF, built from this page by scripts/build-resume-pdf.mjs into public/resume/.
export const PDF = { label: 'Download the PDF', href: '/resume/zaky-ashari-resume.pdf', note: 'A4, 2 pages' };

export const SECTIONS = {
  summary: 'Summary',
  experience: 'Experience',
  projects: 'Latest projects',
  achievements: 'Key achievements',
  education: 'Education',
  certifications: 'Certifications',
  skills: 'Skills & strengths',
};

export const SUMMARY =
  'Computer Science graduate with 3+ years of experience across AI engineering and full-stack software development. ' +
  'Worked as a Full-Stack Software Engineer at **marketbetter.ai** with over 1,500 commits across 7 repositories in ' +
  '8 months. Also serving as a Software Architect at **Ashari Tech**, co-architecting an in-house LLM gateway and ' +
  'platform infrastructure alongside the founder. Previously delivered a production fraud-detection ML pipeline for a ' +
  'major Indonesian bank during a 1-year AI Engineer internship at **GDP Labs** (89% recall, surpassing the 80% ' +
  'benchmark). Skilled across AI/ML (TensorFlow, PyTorch, deep learning, model deployment), full-stack engineering ' +
  '(TypeScript, React, Next.js, Node.js, Go), and cloud platforms (AWS, GCP, Cloudflare), with hands-on AI deployment ' +
  'in fraud detection, biometrics, and medical imaging. Since May 2026, part of **Arumi Coffee**’s founding team in ' +
  'Palu, supporting its launch and day-to-day operations through beverage R&D, startup budgeting, infrastructure ' +
  'planning, recruitment and staff training, inventory management, and business improvement initiatives.';

// Most recent first, as on the CV. `star` marks the roles whose four lines follow situation, task, action, result;
// the page labels those lines S, T, A and R.
export const EXPERIENCE = [
  {
    key: 'arumi',
    role: 'Business Development & Operations | Founding Team',
    org: 'Arumi Coffee',
    from: { label: '05/2026', iso: '2026-05' },
    to: { label: 'Present' },
    place: 'Palu, Central Sulawesi',
    points: [
      'Helped establish and launch a family-owned coffee shop, which opened in mid-June 2026; contributed to both pre-opening preparation and ongoing operations.',
      'Conducted coffee and non-coffee menu research and development, including product testing, refinement, and menu planning.',
      'Prepared shop-wide startup cost estimates and budget drafts; contributed to infrastructure concepts, equipment needs, and materials planning.',
      'Supported staff interviews, hiring coordination, training, and day-to-day people management; oversaw raw-material stocks, procurement, infrastructure supplies, and operational needs.',
      'Contributed to business improvement initiatives and supported social media content planning.',
    ],
  },
  {
    key: 'marketbetter',
    role: 'Full-time, Full-Stack Software Engineer',
    org: 'marketbetter.ai',
    from: { label: '09/2025', iso: '2025-09' },
    to: { label: '06/2026', iso: '2026-06' },
    place: 'Remote (Texas, USA)',
    star: true,
    points: [
      'B2B GTM/sales-tech startup in a saturated outbound-sales market needed a senior engineer to convert architectural specs into shipped product across the full stack at startup velocity while keeping production enterprise-ready.',
      'Owned end-to-end delivery of every assigned initiative over 8 months across frontend, backend, async workers, Chrome extension, embed widget, database, and infrastructure.',
      'Shipped 8+ flagship modules from specs; Power Dialer, Audience Builder, HeyGen LiveAvatar video chatbot, Pounce inbound scheduler, Audience Research Columns, and the product split. Delivered the Azure Blob to Cloudflare R2 migration, the SSO (SAML 2.0) / MFA / OAuth-encryption rollout, and HubSpot + Salesforce native CRM Deal Intelligence. Coordinated atomic multi-repo releases (frontend / backend / audience-processor), wrote production-safe migrations, and ran incident response on Gmail retry storms and race-condition refunds.',
      'Consistently delivered high-quality code with over 1,500 commits and approximately 480 merged pull requests across multiple repositories within eight months while working 7 days a week with minimal days off, shipped multiple tasks in average 3-6 hours.',
    ],
  },
  {
    key: 'ashari-architect',
    role: 'Full-time, Software Architect',
    org: 'Ashari Tech',
    from: { label: '03/2025', iso: '2025-03' },
    to: { label: 'Present' },
    place: 'Remote (Bandung, Indonesia)',
    star: true,
    points: [
      'Ashari Tech operates an in-house infrastructure stack (LLM gateway, multi-tenant webhook platform, CI/CD, IaC) that powers internal products and client deployments, requiring senior architectural ownership as new products launch on top.',
      'Co-architect and implement core platform systems alongside the founder, sharing ownership of cross-project patterns and deployment standards reused by downstream products.',
      'Co-architected backbone systems: _asharicloud-genapi_, an OpenAI-compatible LLM gateway in Go with multi-vendor routing across OpenAI + Gemini, Supabase-backed credential management, and multi-arch (ARM64 + AMD64) Docker Swarm deployment with Cloudflare Tunnel HTTPS; and _infrastructures_, the Terraform IaC repository covering shared cloud resources and deployment configs. Stack: Go, Terraform/HCL, Docker Swarm, AWS EC2, Cloudflare Tunnel, Supabase, Woodpecker CI, GitHub Actions.',
      'Built the platform foundation reused by downstream products (BrainyBuddy AI companion, client web apps, developer tools), enabling new product launches without re-solving infrastructure each time.',
    ],
  },
  {
    key: 'ashari-engineer',
    role: 'Full-time, Software Engineer',
    org: 'Ashari Tech',
    from: { label: '07/2023', iso: '2023-07' },
    to: { label: 'Present' },
    place: 'Remote (Bandung, Indonesia)',
    star: true,
    points: [
      'Ashari Tech ships products spanning conversational AI and small-business retail, requiring full-stack engineering across API design, frontend, and production rollout.',
      'Collaborate end-to-end on in-house and client products, working alongside the founder on shared codebases.',
      'Co-developed three production applications: _brainybuddy-api_, a multi-platform (Telegram + LINE) Indonesian AI companion in Bun + Elysia.js + MongoDB with personality-engineered prompts and cultural pronoun mirroring; _brainybuddy-web_, its Next.js 15 + React 19 + Supabase admin dashboard for managing conversations, users, and analytics; and _arumi-web_, a Next.js point-of-sale system for a coffee-shop client. Implemented features end-to-end (platform integrations, UI flows, deployment scripts) and supported production rollouts. Stack: TypeScript, React, Next.js 15, Bun, Elysia.js, Node.js, MongoDB, Supabase, Telegram/LINE APIs.',
      'Shipped three production apps used by real users across messaging and retail, building full-stack breadth (backend, frontend, AI integration) that supported the move into a platform-architecture role.',
    ],
  },
  {
    key: 'gdp',
    role: 'Intern, Machine Learning Engineer | Artificial Intelligence Engineer',
    org: 'GDP Labs',
    from: { label: '02/2024', iso: '2024-02' },
    to: { label: '02/2025', iso: '2025-02' },
    place: 'Hybrid (Jakarta, Indonesia)',
    star: true,
    points: [
      'A major Indonesian banking company required a machine learning system to detect potential fraud in loan applications and reduce financial risk.',
      'Collaborate, design and deliver a reliable fraud detection model and ML pipeline that surpasses existing accuracy benchmarks.',
      'During 9-month in 12-month period internship, collaborated with a senior engineer, developed a complete end-to-end ML pipeline, including data preprocessing, feature optimization, and model evaluation.',
      'Achieved 89% recall, exceeding the 80% benchmark, and integrated explainability modules (e.g., feature attribution and interpretability reports) to help the Risk Management Division understand detection outcomes and make final approval decisions.',
    ],
  },
  {
    key: 'unhas',
    role: 'Intern, Network Engineer',
    org: 'Hasanuddin University',
    from: { label: '01/2020', iso: '2020-01' },
    to: { label: '03/2020', iso: '2020-03' },
    place: 'On-site (Makassar, Indonesia)',
    star: true,
    points: [
      'The university needed a stable network infrastructure to support large-scale online examinations across multiple faculties.',
      'Within a 3-month internship, ensure seamless connectivity for over 1,000 concurrent users during online exams.',
      'Configured network switches and routers, enhanced UDP cable setups, and implemented redundancy for critical links. Monitored network performance, documented configurations, and supported faculty during exam sessions.',
      'Reduced downtime by 30%, ensuring uninterrupted operations and enabling smoother exam delivery for 1,000+ students.',
    ],
  },
];

export const STAR = [
  { short: 'S', long: 'Situation' },
  { short: 'T', long: 'Task' },
  { short: 'A', long: 'Action' },
  { short: 'R', long: 'Result' },
];

export const PROJECTS = [
  {
    key: 'alzheimer',
    title: 'Alzheimer’s Disease Detection System',
    org: 'Personal',
    from: { label: '02/2025', iso: '2025-02' },
    to: { label: '01/2026', iso: '2026-01' },
    place: 'Bandung, Indonesia',
    text: 'Developing an Alzheimer’s Disease Detection System (Feb 2025 – Jan 2026) that applies multi-modal deep learning on MRI data, combining 2D, 3D, and radiomic features for early diagnosis; the project is still in progress, so performance results are not yet available.',
    note: 'Private research',
  },
  {
    key: 'deepfake',
    title: 'Deepfake Classification Research',
    org: 'GDP Labs',
    from: { label: '02/2024', iso: '2024-02' },
    to: { label: '04/2024', iso: '2024-04' },
    place: 'Jakarta, Indonesia',
    text: 'Conducted a research project at GDP Labs (Feb–Apr 2024) developing a deepfake detection system using CNN+LSTM and Capsule Networks with face-alignment preprocessing, achieving 90% accuracy to enhance biometric verification security.',
    note: 'Private research',
  },
  {
    key: 'leukemia',
    title: 'Leukemia Classification',
    org: 'Personal',
    from: { label: '03/2025', iso: '2025-03' },
    to: { label: '06/2025', iso: '2025-06' },
    place: 'Bandung, Indonesia',
    text: 'Developed a Leukemia Classification system (Mar–Jun 2025) using CNN and YOLO architectures with advanced preprocessing and dual-channel feature fusion to accurately detect acute lymphoblastic leukemia from blood cell images.',
    links: [
      { label: 'Roboflow', href: 'https://universe.roboflow.com/zaky-ashari-qeoml/leukemia-classification-qffot' },
      { label: 'Github', href: 'https://github.com/zashari/leukemia-classification?tab=readme-ov-file' },
    ],
  },
  {
    key: 'jokibear',
    title: 'Jokibear / Neural Arc.',
    org: 'Personal',
    from: { label: '11/2023', iso: '2023-11' },
    to: { label: 'Present' },
    place: 'Jakarta, Indonesia',
    text: 'Founded JokiBear (now NeuralArc) to deliver tailored ML solutions and successfully change the focus from services to product development with strong quality and management standards.',
    note: 'No project links',
  },
];

export const MORE_PROJECTS = { before: 'More projects on ', label: 'Github', href: 'https://github.com/zashari' };

export const ACHIEVEMENTS = [
  {
    title: 'Fraud Detection System Development',
    text: 'Achieved a 89% recall rate in a fraud detection system, surpassing industry benchmarks.',
  },
  {
    title: 'AWS Academy Graduate 2023',
    text: 'Completed foundational and advanced cloud computing training under AWS Academy curriculum.',
  },
  {
    title: 'Business Model Pitching Competition 2022 - 2nd Place',
    text: 'Recognized for innovation and presentation of a tech-based business solution in a national-level competition.',
  },
  {
    title: 'ITS Robotics Competition 2014 & 2013 - 1st Place',
    text: 'Back-to-back champion in a prestigious robotics competition, showcasing early technical and problem-solving capabilities.',
  },
];

export const EDUCATION = [
  {
    key: 'binus',
    title: 'B.Sc. in Computer Science',
    org: 'BINUS University',
    from: { label: '09/2021', iso: '2021-09' },
    to: { label: '07/2025', iso: '2025-07' },
    place: 'Bandung, Indonesia',
  },
  {
    key: 'telkom',
    title: 'Highschool Diploma',
    org: 'Telkom University',
    from: { label: '09/2017', iso: '2017-09' },
    to: { label: '06/2021', iso: '2021-06' },
    place: 'Makassar, Indonesia',
  },
];

export const CERTIFICATIONS = [
  {
    key: 'aws',
    title: 'AWS Certified Cloud Practitioner',
    href: 'https://www.credly.com/badges/61c58b0d-03d6-405f-9285-710717c4c133/public_url',
    issuer: { label: 'AWS Training and Certification', href: 'https://www.credly.com/org/amazon-web-services' },
    date: { label: '05/2023', iso: '2023-05' },
  },
  {
    key: 'cisco',
    title: 'CISCO Networking Essentials',
    href: 'https://www.credly.com/badges/c4ae6f3b-d5f6-4a73-9cdc-66a822ab395f/public_url',
    issuer: { label: 'Cisco', href: 'https://www.credly.com/organizations/cisco/badges' },
    date: { label: '12/2020', iso: '2020-12' },
  },
];

export const SKILLS = [
  'TypeScript',
  'JavaScript',
  'Python',
  'Go',
  'SQL',
  'NoSQL',
  'R',
  'React',
  'Next.js',
  'Tailwind CSS',
  'HTML / CSS',
  'Node.js',
  'Bun',
  'Elysia.js',
  'REST APIs',
  'Socket.IO / WebSockets',
  'Deep Learning',
  'TensorFlow',
  'PyTorch',
  'OpenAI',
  'Google Gemini',
  'MCP (Model Context Protocol)',
  'PostgreSQL',
  'MongoDB',
  'Supabase',
  'Redis',
  'AWS (Lambda, S3, EC2)',
  'GCP',
  'Cloudflare (R2, Tunnel, CDN)',
  'Docker / Docker Swarm',
  'GitHub Actions',
  'CI/CD',
  'Cisco',
  'TCP/UDP',
  'Robotics',
];

export const STRENGTHS = [
  {
    key: 'technical',
    title: 'Technical skills',
    items: [
      'AI/ML & Deep Learning',
      'Full-Stack Development (Frontend, Backend, Mobile)',
      'LLM Integration & Conversational AI',
      'System Architecture & API Design',
      'Cloud Infrastructure (AWS, GCP, Cloudflare)',
      'Container Orchestration & Docker Swarm',
      'CI/CD & DevOps Automation',
      'Database Design (SQL & NoSQL)',
      'Real-time Systems (WebSockets, SSE, Streaming)',
      'Production Deployment & Incident Response',
    ],
  },
  {
    key: 'soft',
    title: 'Soft skills',
    items: [
      'Teamwork & Cross-functional Collaboration',
      'Communication',
      'Adaptability',
      'Fast Learning',
      'High-velocity Execution',
      'End-to-end Ownership',
    ],
  },
];

export const FOOTER = 'Zaky Ashari · 2026 Resume';

// The header's logotype leads back home, and the other items are /home's, as on /about.
export const HOME = { label: 'HOME', href: '/home/' };
export const NAV = HOME_NAV;
