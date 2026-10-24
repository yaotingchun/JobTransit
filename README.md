# JobTransit

> An AI-powered transit-styled career navigation and reskilling platform that charts explainable pathways, skill gap bridges, and real-time market signals for the next generation of tech talent.

---

## Team Information

| Field                  | Details                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| **Team Name**          | JobTransit                                                              |
| **Team Domain**        | Domain 1 — AI, Smart Society & Future of Work                           |
| **SDG Track (1–17)**   | **SDG 4 — Quality education** *(Target 4.4)*                            |
|    | **SDG 8 — Decent Work and Economic Growth** *(Target 8.5 & 8.6)*                            |
| **Team Leader**        | Evelyn Ang                                                              |
| **University**         | Universiti Teknologi Malaysia (UTM)                                     |
| **Number of Members**  | 5                                                                       |

## Links

| Resource          | Link                                                                      |
| ----------------- | ------------------------------------------------------------------------- |
| GitHub Repository | [https://github.com/yaotingchun/JobTransit](https://github.com/yaotingchun/JobTransit) |
| Live Demo         | [https://jobtransit.replit.app](https://jobtransit.replit.app)             |
| Slide Deck        | [https://example.com/jobtransit-slides](https://example.com/jobtransit-slides) *(Replace with pitch deck link)* |
| Demo Video        | [https://example.com/jobtransit-video](https://example.com/jobtransit-video) *(Replace with video link)* |
---

## Overview

### Problem

Rapid advancements in Generative AI and automated agent workflows are transforming the global tech labor market, leaving developers, university graduates, and career changers uncertain about which skills remain resilient and how to transition into emerging AI roles. Traditional job portals present static, text-heavy postings without actionable reskilling directions, forcing jobseekers to navigate fragmented courses and high-cost bootcamps without knowing their actual competency fit or career trajectory.

### Solution

**JobTransit** reimagines tech career progression through the intuitive metaphor of an urban rapid transit network—the **"Career Metro"**. Powered by client-side multimodal OCR/parsing and a dedicated **RunPod GPU Serverless** inference endpoint, JobTransit vectorizes candidate resumes, maps existing competencies onto five distinct metro lines (*Agent Line*, *Data Line*, *Intelligence Line*, *Product Line*, *Cloud Line*), and generates personalized, explainable reskilling pathways complete with ordered milestones, practical project capstones, and HRD Corp-claimable programs—directly advancing **UN SDG 4 (Quality Education)** by fostering lifelong learning and building technical/vocational competencies for the future economy (Target 4.4).

### Key Features

- **Interactive Career Metro Map (Transit Map)** — An octilinear subway-style visual graph (0°, 45°, 90°) showing interconnected technical stations, interchange hubs, real-time role demand deltas, and salary benchmarks.
- **Multimodal Resume & Skill Extraction** — Multi-format resume parsing supporting PDF, DOCX, TXT, and scanned image documents via in-browser Tesseract OCR and PDF.js, paired with RunPod GPU LLM extraction to accurately populate structured skill profiles.
- **Explainable Reskilling Pathways & Learning Plans** — Tailored learning checkpoints featuring transparent match scores (+/- factor weights), curated low-cost/free tutorials, hands-on project deliverables, and verified HRD Corp-claimable courses.
- **Photorealistic 3D Digital Transit Pass** — A physics-enabled 3D career boarding card with gyroscopic mouse tilt, holographic specular reflections, dynamic QR codes, and real-time Cloud Firestore synchronization.
- **Real-Time Market Trend Radar & LinkedIn Scraper** — Automated market intelligence crawler aggregating live LinkedIn job postings, hiring volumes, emerging skill momentum, and AI exposure indices across target tech roles.
- **Catchup Hub & Daily AI News Digest** — Serverless ingestion pipeline running on Firebase Functions v2 that pulls top tech news, deduplicates articles, and uses Google Gemini to generate role-relevant "Why It Matters" digests.
- **Interactive Career Onboarding & Skills Terminal** — An intuitive retro-futuristic transit machine questionnaire that dynamically verifies ambiguous candidate skills before boarding.

### Tech Stack

| Layer         | Technology                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| Frontend      | React 19, TypeScript, Vite 8, TailwindCSS v4, Lucide Icons, Tesseract.js OCR, PDF.js, 3D CSS transforms     |
| Backend       | Node.js 20+, Express & Vite Dev Server Middleware (`server/linkedinScraper.ts`), Firebase Cloud Functions v2  |
| Database      | Cloud Firestore (User Profiles, Passes, Feed Metadata)                                                        |
| AI / Compute  | RunPod (GPU Serverless for LLM Resume Extraction & Skill Matching), Google Gemini 2.5 API (News Enrichment)  |
| Hosting / Dev | Replit (Multiplayer Workspace, Replit Deployments, Secrets Management)                                         |

---

## Project Structure

```
JobTransit/
├── docs/                                    # Media, architectural diagrams, and documentation
│   └── README.md
├── runpod/                                  # RunPod GPU serverless endpoint code
│   ├── handler.py                           # RunPod serverless handler (GPU model workload)
│   └── requirements.txt                     # GPU inference dependencies (torch, runpod, etc.)
├── server/                                  # Backend scraping and market analysis services
│   └── linkedinScraper.ts                   # Real-time LinkedIn job postings crawler & cache
├── src/                                     # Frontend React application
│   ├── assets/                              # Images, logos, and video backgrounds
│   ├── components/                          # UI components
│   │   ├── auth/                            # Firebase authentication modals and forms
│   │   ├── catchup/                         # Weekly trend digest & news feed cards
│   │   ├── followUp/                        # Machine terminal skills verification questionnaire
│   │   ├── transit/                         # Career Metro Map, 3D Realistic Card, Pathways
│   │   ├── trend/                           # Market intelligence radar & skill demand charts
│   │   ├── Header.tsx                       # Frosted glass top navigation bar
│   │   ├── Homepage.tsx                     # Main dashboard with transit departure board
│   │   ├── Navbar.tsx                       # Floating macOS-style glass navigation dock
│   │   └── ProfileOnboarding.tsx            # Resume upload & OCR processing hub
│   ├── lib/                                 # Shared libraries and utilities
│   │   ├── extractor/                       # Rule-based and LLM resume skill extractors
│   │   ├── cardFirebase.ts                  # Firestore synchronization for 3D transit passes
│   │   ├── cvParser.ts                      # Client-side file extractors (PDF, DOCX, images)
│   │   └── firebase.ts                      # Firebase SDK client initialization
│   ├── App.tsx                              # Core routing and state manager
│   ├── index.css                            # Glassmorphism tokens & TailwindCSS styling
│   └── main.tsx                             # React entrypoint
├── functions/                               # Firebase Cloud Functions (v2)
│   ├── src/                                 # Scheduled news ingestion pipeline & Gemini summarizer
│   └── package.json
├── submission/                              # SDC 2026 required submission documentation
│   ├── SDC2026_JobTransit_Preliminary.pdf     # Preliminary project document
│   ├── SDC2026_JobTransit_TechDeclaration.pdf # Technology declaration document
│   ├── SDC2026_JobTransit_Replit_POU.pdf      # Replit proof of use document
│   └── SDC2026_JobTransit_Runpod_POU.pdf      # RunPod proof of use document
├── tests/                                   # Unit and integration test suites
│   └── extractor.test.ts                    # Extractor & transit line verification tests
├── .env.example                             # Template environment variables
├── .gitignore                               # Git ignore rules
├── .replit                                  # Replit runtime and deployment configuration
├── LICENSE                                  # Apache License 2.0
├── package.json                             # Node.js project manifest & scripts
├── replit.md                                # Replit deployment instructions
├── tsconfig.json                            # TypeScript root compiler configuration
└── vite.config.ts                           # Vite configuration with embedded LinkedIn scraper
```

### Architecture

```
                                  ┌──────────────────────────────────────────────┐
                                  │                  User Browser                │
                                  │    React 19 + TypeScript + 3D Glassmorphism  │
                                  └───────┬───────────────────────────────▲──────┘
                                          │                               │
                      1. Upload Resume /  │                               │ 6. Render Metro Lines,
                         Query Market     │                               │    Pass & Reskilling Plans
                                          ▼                               │
┌─────────────────────────────────────────────────────────────────────────┴───────────────────────┐
│                                  Replit Application Server                                      │
│                                                                                                 │
│   ┌─────────────────────────────────────────┐     ┌─────────────────────────────────────────┐   │
│   │         Client-Side Parsers             │     │      Vite Dev & API Middleware          │   │
│   │   - Tesseract.js (WASM OCR)             │     │   - LinkedIn Crawler (24h Cache)        │   │
│   │   - PDF.js / Mammoth (DOCX)             │     │   - Market Demand & Skill Scoring       │   │
│   └───────────────────┬─────────────────────┘     └────────────────────▲────────────────────┘   │
└───────────────────────┼────────────────────────────────────────────────┼────────────────────────┘
                        │ 2. Deep Vectorization                          │ 5. Aggregated Signals
                        │    & LLM Skill Matching                        │
                        ▼                                                │
       ┌─────────────────────────────────┐              ┌────────────────┴────────────────┐
       │   RunPod Serverless Endpoint    │              │       Firebase Cloud Services    │
       │       (NVIDIA GPU Worker)       │              │   - Firebase Auth (User Identity)│
       │  - `runpod/handler.py`          │              │   - Cloud Firestore (NoSQL Store)│
       │  - LLM Resume Extraction        │              │   - Cloud Functions v2 (Cron)    │
       │  - Embedding & Line Alignment   │              │   - Google Gemini 2.5 API        │
       └─────────────────────────────────┘              └─────────────────────────────────┘
```

---

## How to Run

### Option 1 — Run on Replit (Recommended)

1. Open the Replit Project via your dashboard, or import this repository via **Create Repl → Import from GitHub** (`https://github.com/yaotingchun/JobTransit`).
2. Open the **Secrets** tab (🔒) in Replit and provide the following environment variables (refer to [`.env.example`](.env.example)):
   - `RUNPOD_API_KEY`
   - `RUNPOD_ENDPOINT_ID`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
3. Click the green **Run** button. Replit executes the workflow specified in [`.replit`](.replit) (`npm run dev -- --host 0.0.0.0 --port 5000`).
4. The Webview panel opens automatically showing the interactive JobTransit application.

### Option 2 — Run Locally

#### Prerequisites
- Node.js `20.x` or higher
- npm `10.x` or higher
- Python `3.10+` *(optional, for local RunPod handler testing)*

```bash
# 1. Clone the repository
git clone https://github.com/yaotingchun/JobTransit.git
cd JobTransit

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and supply your Firebase and RunPod credentials

# 4. Start the development server
npm run dev

# 5. Open the app
# Navigate to http://localhost:5173 in your browser
```

### Run Tests

Execute the automated test suite powered by Vitest:

```bash
npm test
```

To test the RunPod serverless handler locally:

```bash
cd runpod
python -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python handler.py
```

---

## How We Use Replit *(Required)*

Our team utilized Replit as our central collaborative development, staging, and hosting platform throughout the hackathon:

- **Multiplayer Collaborative Development**: Team members worked simultaneously across frontend components, state management, and API endpoints using Replit Multiplayer, drastically accelerating iteration and eliminating merge conflicts.
- **Cloud Hosting & Deployments**: The production preview is deployed directly via **Replit Deployments** as a high-availability static web application configured in [`.replit`](.replit).
- **Secure Secrets Management**: Sensitive credentials (such as `RUNPOD_API_KEY`, `RUNPOD_ENDPOINT_ID`, and Firebase configuration tokens) are securely stored in **Replit Secrets** (`process.env`) and injected at build/runtime without committing secrets to version control.
- **Instant Cloud Workflows**: Built-in shell commands and port mapping (`port 5000` to external HTTP port 80) enabled friction-free live testing on desktop and mobile browsers.

📄 Proof of use: [`submission/SDC2026_JobTransit_Replit_POU.pdf`](submission/SDC2026_JobTransit_Replit_POU.pdf)

---

## Challenges & Learnings

### Challenges

1. **Client-Side Document Parsing & OCR**: Processing complex multi-column resumes and scanned images directly in the browser without freezing the UI required configuring asynchronous Web Workers with `Tesseract.js` WASM, combined with fallback regex parsers for PDF.js and Mammoth.
2. **Real-Time Market Crawling & Anti-Scraping Defenses**: Fetching live hiring statistics from LinkedIn without incurring aggressive rate limiting required building an intelligent server-side caching layer in [`server/linkedinScraper.ts`](server/linkedinScraper.ts) that caches results for 24 hours with scheduled background heartbeats.
3. **High-Performance 3D Glassmorphism**: Achieving a photorealistic 3D transit pass with gyroscopic specular glare, dynamic holograms, and smooth 60 FPS transitions across mobile and desktop required careful GPU layer composition using CSS 3D transforms (`preserve-3d`) and PointerEvent physics dampening.
4. **Idempotent News Pipeline**: Building an automated tech news aggregator required implementing distributed lease locks in Firebase Cloud Functions v2 (`functions/src/lib/lease.ts`) to prevent concurrent cron invocations from creating duplicate feed articles.

### Learnings

- **Serverless GPU Orchestration**: Gained hands-on experience structuring lightweight, production-grade RunPod serverless handlers that deserialize multimodal input and serve low-latency inferences.
- **Explainable AI in Career Guidance**: Discovered that jobseekers trust AI recommendations significantly more when accompanied by explainable weight factors (e.g. `+42% core framework fit`, `-18% missing tool calling evaluation`), rather than black-box percentage scores.
- **Metaphorical UI/UX Architecture**: Validated that anchoring complex data schemas (reskilling roadmaps, role dependencies, salary benchmarks) within a cohesive real-world metaphor ("Transit Subway Map") vastly improves user engagement and reduces career anxiety.

---

## Future Improvements

- [ ] **Apple Wallet & Google Wallet Integration** — Export the 3D JobTransit pass directly as a `.pkpass` / Google Wallet card with dynamic NFC updates when milestones are achieved.
- [ ] **Direct Employer Transit Stations** — Enable verified partner companies to sponsor transit stations with direct interview fast-track boarding passes for candidates who complete specific pathway checkpoints.
- [ ] **Interactive Voice & AI Coding Simulator** — Deploy fine-tuned interview simulation agents on RunPod to conduct live technical mock interviews for target stations.
- [ ] **Regional Localization** — Expand localized reskilling curriculums and multi-language support (Bahasa Melayu, Mandarin, English) across Southeast Asian tech hubs.

---

## Team

| Name               | Role                                                 | GitHub                                                   |
| ------------------ | ---------------------------------------------------- | -------------------------------------------------------- |
| **Evelyn Ang**     | Team Leader / UI/UX Design & Reskilling Architecture | [@evelyn](https://github.com/evelyn)                     |
| **Yao Ting Chun**  | Full-Stack & AI Pipeline                             | [@yaotingchun](https://github.com/yaotingchun)           |
| **Toh Shee Thong** | Frontend Lead / 3D Card Engine & Auth                | [@tsthong4](https://github.com/tsthong4)                 |
| **Angela**         | Frontend / Trend Radar & Market Intelligence         | [@angela](https://github.com/angela)                     |
| **Teoh Xin Yee**        | Frontend / Weekly Summary & UI Experience            | [@xinyee](https://github.com/xinyee)                     |

---

## License

This project is licensed under the [Apache License 2.0](LICENSE).
