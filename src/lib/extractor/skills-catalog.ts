/**
 * Comprehensive Skills Taxonomy & Pattern Matching Engine
 * Covers Technical Skills, AI/ML Skills, Tools & Technologies, and Soft Skills.
 * Supports flexible aliases, acronyms, and robust boundary matching (e.g. C++, C#, .NET).
 */

export interface SkillDefinition {
  canonical: string;
  category: 'technical' | 'ai' | 'tool' | 'soft';
  matchRegex?: RegExp;
}

// ── 1. TECHNICAL SKILLS (Languages, Frameworks, Databases, Web, Architecture) ──
const TECHNICAL_SKILLS_RAW = [
  // Programming & Scripting Languages
  'Python', 'JavaScript', 'TypeScript', 'Java', 'Rust', 'Ruby', 'PHP',
  'Swift', 'Kotlin', 'Dart', 'Scala', 'Perl', 'Haskell', 'Julia', 'Lua',
  'Bash', 'Shell', 'PowerShell', 'MATLAB', 'Groovy', 'Objective-C',
  'Solidity', 'Elixir', 'Erlang', 'VBA', 'Assembly', 'HTML5', 'HTML',
  'CSS3', 'CSS', 'Sass', 'SCSS', 'Less', 'SQL', 'PL/SQL', 'T-SQL',
  'NoSQL', 'GraphQL', 'REST API', 'RESTful APIs', 'gRPC', 'WebSocket',
  'WebSockets', 'JSON', 'XML', 'YAML',

  // Frontend Frameworks & UI
  'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Nuxt.js', 'Angular',
  'AngularJS', 'Svelte', 'SvelteKit', 'Solid.js', 'Redux', 'Redux Toolkit',
  'Zustand', 'MobX', 'Tailwind CSS', 'Tailwind', 'Bootstrap', 'Material-UI',
  'MUI', 'Chakra UI', 'Ant Design', 'Shadcn UI', 'Styled Components',
  'Emotion', 'jQuery', 'Vite', 'Webpack', 'Babel', 'Rollup', 'Astro',
  'Three.js', 'D3.js', 'React Native', 'Flutter', 'Ionic',

  // Backend Frameworks & Runtimes
  'Node.js', 'Express', 'Express.js', 'NestJS', 'Fastify', 'Django',
  'Flask', 'FastAPI', 'Celery', 'Ruby on Rails', 'Rails', 'Spring',
  'Spring Boot', 'Laravel', 'Symfony', 'CodeIgniter', 'Gin', 'Echo',
  'Fiber', 'Actix Web', 'Axum', 'Koa',

  // Databases, ORM & Caching
  'PostgreSQL', 'Postgres', 'MySQL', 'MariaDB', 'SQLite', 'Microsoft SQL Server',
  'MSSQL', 'Oracle', 'MongoDB', 'Redis', 'Cassandra', 'CouchDB', 'DynamoDB',
  'Firebase', 'Firestore', 'Supabase', 'Neo4j', 'Elasticsearch', 'OpenSearch',
  'Prisma', 'TypeORM', 'Hibernate', 'SQLAlchemy', 'Drizzle ORM', 'Mongoose',

  // Architecture & Distributed Systems
  'Microservices', 'Serverless', 'Event-Driven Architecture', 'Apache Kafka',
  'Kafka', 'RabbitMQ', 'Apache Spark', 'Hadoop', 'Snowflake', 'Databricks',
  'BigQuery', 'System Design', 'Design Patterns', 'OOP', 'Functional Programming',
];

// Special punctuation/short technical skills requiring customized regexes
const SPECIAL_TECHNICAL_SKILLS: SkillDefinition[] = [
  {
    canonical: 'C++',
    category: 'technical',
    matchRegex: /(?:^|[^a-zA-Z0-9#+])C\+\+(?:[^a-zA-Z0-9#+]|$)/i,
  },
  {
    canonical: 'C#',
    category: 'technical',
    matchRegex: /(?:^|[^a-zA-Z0-9#+])C#(?:[^a-zA-Z0-9#+]|$)/i,
  },
  {
    canonical: '.NET',
    category: 'technical',
    matchRegex: /(?:^|[^a-zA-Z0-9])(?:\.NET(?:\s+Core)?|ASP\.NET(?:\s+Core)?)(?:[^a-zA-Z0-9]|$)/i,
  },
  {
    canonical: 'C',
    category: 'technical',
    matchRegex: /(?:^|[^a-zA-Z0-9])(?:C\s*[/,]\s*C\+\+|C\s+(?:programming|language)|(?:Python|Java|C\+\+)\s*[,/]\s*C(?:\s*[,/]|\s*$))(?:[^a-zA-Z0-9]|$)/i,
  },
  {
    canonical: 'R',
    category: 'technical',
    matchRegex: /(?:^|[^a-zA-Z0-9])(?:R\s*(?:programming|language)|(?:Python|SQL|MATLAB|SAS)\s*[,/]\s*R\b|\bR\s*[,/]\s*(?:Python|SQL|MATLAB|SAS))(?:[^a-zA-Z0-9]|$)/i,
  },
  {
    canonical: 'Go',
    category: 'technical',
    matchRegex: /(?:^|[^a-zA-Z0-9])(?:Golang|Go\s+language|Go\s+developer|Go\s+backend|(?:Python|Rust|Docker|Kubernetes|Java)\s*[,/]\s*Go\b|\bGo\s*[,/]\s*(?:Python|Rust|Docker|Kubernetes|Java))(?:[^a-zA-Z0-9]|$)/i,
  },
];

// ── 2. AI & MACHINE LEARNING SKILLS ──
const AI_SKILLS_RAW = [
  // Core AI/ML Concepts
  'Machine Learning', 'Deep Learning', 'Generative AI', 'Large Language Models',
  'LLM', 'LLMs', 'Natural Language Processing', 'NLP', 'Computer Vision',
  'Reinforcement Learning', 'Supervised Learning', 'Unsupervised Learning',
  'Neural Networks', 'Convolutional Neural Networks', 'CNN', 'RNN', 'LSTM',
  'Transformers', 'Retrieval-Augmented Generation', 'RAG', 'Prompt Engineering',
  'Fine-tuning', 'LoRA', 'QLoRA', 'Agentic AI', 'Multi-Agent Systems',
  'MLOps', 'Model Optimization', 'Quantization', 'Feature Engineering',
  'Predictive Modeling', 'Sentiment Analysis', 'Object Detection',
  'Image Segmentation', 'Speech Recognition', 'Recommendation Systems',
  'Vector Embeddings', 'Semantic Search', 'Data Mining', 'Big Data',

  // Frameworks, Libraries & Models
  'PyTorch', 'TensorFlow', 'Keras', 'scikit-learn', 'XGBoost', 'LightGBM',
  'CatBoost', 'OpenCV', 'Hugging Face', 'LangChain', 'LlamaIndex',
  'Ollama', 'vLLM', 'spaCy', 'NLTK', 'MediaPipe', 'NumPy', 'Pandas',
  'SciPy', 'Matplotlib', 'Seaborn', 'Polars', 'JAX', 'DeepSpeed',
  'ONNX', 'Triton', 'TensorRT', 'Stable Diffusion', 'Whisper', 'BERT',
  'YOLO', 'ChromaDB', 'Pinecone', 'Weaviate', 'Milvus', 'Qdrant',
  'OpenAI', 'ChatGPT', 'Gemini', 'Claude', 'Llama', 'Mistral',
];

const SPECIAL_AI_SKILLS: SkillDefinition[] = [
  {
    canonical: 'Artificial Intelligence (AI)',
    category: 'ai',
    matchRegex: /(?:^|[^a-zA-Z0-9])(?:Artificial Intelligence|GenAI|AI\s+(?:engineer|developer|model|researcher|solutions?|applications?)|(?:ML|NLP|LLM|Data Science)\s*[/,]\s*AI|\bAI\s*[/,]\s*(?:ML|NLP|LLM|Data Science))(?:[^a-zA-Z0-9]|$)/i,
  },
];

// ── 3. TOOLS & TECHNOLOGIES (DevOps, IDEs, PM, Design, Testing) ──
const TOOLS_RAW = [
  // Development Tools & IDEs
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'VS Code', 'Visual Studio Code',
  'Visual Studio', 'IntelliJ IDEA', 'PyCharm', 'WebStorm', 'Android Studio',
  'Xcode', 'Eclipse', 'Vim', 'Neovim', 'Jupyter Notebook', 'Jupyter',
  'Google Colab',

  // DevOps, Containers & Infra Tools
  'Docker', 'Kubernetes', 'Helm', 'Terraform', 'Ansible', 'Jenkins',
  'GitHub Actions', 'GitLab CI/CD', 'GitLab CI', 'CircleCI', 'ArgoCD',
  'Prometheus', 'Grafana', 'Datadog', 'ELK Stack', 'Nginx', 'Apache',
  'Linux', 'Ubuntu', 'Debian', 'CentOS', 'Red Hat', 'macOS', 'Windows Server',

  // Testing & API Utilities
  'Postman', 'Insomnia', 'Swagger', 'OpenAPI', 'cURL', 'Jest', 'Vitest',
  'Mocha', 'Chai', 'Cypress', 'Playwright', 'Selenium', 'Puppeteer',
  'JUnit', 'Pytest', 'SonarQube',

  // Cloud Platforms & Hosting Tools
  'AWS', 'Amazon Web Services', 'Azure', 'Microsoft Azure', 'GCP',
  'Google Cloud Platform', 'Google Cloud', 'Cloudflare', 'Vercel',
  'Netlify', 'DigitalOcean', 'Heroku',

  // Project Management, Design & Analytics
  'Jira', 'Confluence', 'Trello', 'Asana', 'Notion', 'Linear', 'Slack',
  'Microsoft Teams', 'Miro', 'Monday.com', 'Figma', 'Adobe XD', 'Sketch',
  'Photoshop', 'Illustrator', 'Canva', 'InVision', 'Tableau', 'Power BI',
  'Looker', 'Google Analytics', 'Excel', 'Google Sheets',
];

const SPECIAL_TOOLS: SkillDefinition[] = [
  {
    canonical: 'CI/CD',
    category: 'tool',
    matchRegex: /(?:^|[^a-zA-Z0-9])CI\/CD(?:[^a-zA-Z0-9]|$)/i,
  },
];

// ── 4. SOFT SKILLS (Interpersonal, Leadership, Problem Solving) ──
const SOFT_SKILLS_RAW = [
  // Communication
  'Communication', 'Written Communication', 'Verbal Communication',
  'Presentation Skills', 'Public Speaking', 'Storytelling', 'Active Listening',
  'Interpersonal Skills', 'Empathy', 'Negotiation', 'Relationship Building',
  'Customer Service',

  // Leadership & Team Dynamics
  'Leadership', 'Team Leadership', 'Teamwork', 'Collaboration',
  'Cross-Functional Collaboration', 'Mentoring', 'Coaching', 'People Management',
  'Delegation', 'Conflict Resolution', 'Pair Programming',
  'Stakeholder Management', 'Team Player',

  // Problem Solving & Thinking
  'Problem Solving', 'Critical Thinking', 'Analytical Thinking',
  'Analytical Skills', 'Decision Making', 'Troubleshooting',
  'Root Cause Analysis', 'Creative Thinking', 'Creativity', 'Innovation',
  'Strategic Thinking', 'Research Skills', 'Logical Reasoning',

  // Work Ethic & Self-Management
  'Adaptability', 'Flexibility', 'Fast Learner', 'Quick Learner',
  'Continuous Learning', 'Growth Mindset', 'Resilience',
  'Work Under Pressure', 'Self-Motivated', 'Initiative',
  'Time Management', 'Organization', 'Prioritization', 'Multi-Tasking',
  'Attention to Detail', 'Accountability', 'Ownership', 'Work Ethic',
  'Agile Mindset', 'Resourcefulness',
];

function escapeRegExp(val: string): string {
  return val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildRegexForTerm(term: string): RegExp {
  const escaped = escapeRegExp(term);
  return new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:[^a-zA-Z0-9]|$)`, 'i');
}

// Assemble Master Catalog
export const MASTER_SKILLS_CATALOG: SkillDefinition[] = [
  ...SPECIAL_TECHNICAL_SKILLS,
  ...TECHNICAL_SKILLS_RAW.map((canonical) => ({
    canonical,
    category: 'technical' as const,
    matchRegex: buildRegexForTerm(canonical),
  })),
  ...SPECIAL_AI_SKILLS,
  ...AI_SKILLS_RAW.map((canonical) => ({
    canonical,
    category: 'ai' as const,
    matchRegex: buildRegexForTerm(canonical),
  })),
  ...SPECIAL_TOOLS,
  ...TOOLS_RAW.map((canonical) => ({
    canonical,
    category: 'tool' as const,
    matchRegex: buildRegexForTerm(canonical),
  })),
  ...SOFT_SKILLS_RAW.map((canonical) => ({
    canonical,
    category: 'soft' as const,
    matchRegex: buildRegexForTerm(canonical),
  })),
];

// Helper to classify skill titles / categories
export function classifySkillTitle(rawTitle: string): 'technical' | 'ai' | 'tool' | 'soft' | 'other' {
  const t = rawTitle.toLowerCase().trim();

  // 1. Technical Skills (shown in website)
  if (
    /^(?:technical\s*skills?|core\s*technical|programming\s*languages?|languages?|coding|web\s*tech(?:nologies)?|frontend|front[\s-]?end|backend|back[\s-]?end|databases?|rdbms|nosql|frameworks(?:\s*(?:and|&)\s*libraries)?|libraries|architecture|system\s*design)$/i.test(t)
    || /\b(?:programming\s+languages?|databases?)\b/i.test(t)
  ) {
    return 'technical';
  }

  // 2. AI / ML Skills (shown in website)
  if (
    /\b(?:ai|ml|artificial\s*intelligence|machine\s*learning|deep\s*learning|data\s*science|nlp|computer\s*vision|generative\s*ai|llms?|neural\s*networks?)\b/i.test(t)
  ) {
    return 'ai';
  }

  // 3. Tools & Technologies (shown in website)
  if (
    /\b(?:tools\s*(?:and|&)\s*tech(?:nologies)?|frameworks\s*(?:and|&)\s*tools|tools\s*(?:and|&)\s*frameworks|developer\s*tools|development\s*tools|devops|cloud(?:\s*(?:and|&)\s*devops)?|platforms?|ci[\s/-]?cd|infrastructure)\b/i.test(t)
    || /^(?:tools|technologies|software\s*tools|tech\s*stack|developer\s*tools)$/i.test(t)
  ) {
    return 'tool';
  }

  // 4. Soft Skills (shown in website)
  if (
    /\b(?:soft\s*skills?|interpersonal(?:\s*skills?)?|personal\s*skills?|core\s*competencies|key\s*competencies|strengths|personal\s*attributes|leadership|management\s*skills?|communication)\b/i.test(t)
  ) {
    return 'soft';
  }

  // 5. Title is not one of the categories shown on the website (e.g. "Methodologies", "Operating Systems", "Concepts", "Others")
  return 'other';
}

// Helper to clean extracted tag names
export function cleanSkillName(raw: string): string {
  return raw
    .replace(/^[\s-*•▪◦\d.)]+/, '')
    .replace(/^[^:—–]+[:—–]\s*/, '')
    .replace(/^(?:technical skills?|soft skills?|ai skills?|tools and technologies|programming languages|languages|tools|technologies|frameworks|developer tools)\s*[:—-]\s*/i, '')
    .replace(/^(beginner|intermediate|advanced|expert|proficient)\s+/i, '')
    .replace(/\s*[:(–—-]?\s*\b(beginner|intermediate|advanced|expert|proficient)\)?$/i, '')
    .replace(/[()[\]{}]/g, '')
    .trim();
}

/**
 * Searches the entire document (and dedicated skills sections) for all skills.
 * Guarantees that any mention of a skill (e.g. Python, Docker, PyTorch, Leadership)
 * in ANY section or sentence is discovered and populated into the correct category.
 */
export function detectAllSkillsInDocument(
  fullDocumentText: string,
  skillsSectionText: string = ''
): {
  technical_skills: string[];
  ai_skills: string[];
  tools_and_technologies: string[];
  soft_skills: string[];
  other_skills: string[];
  skill_proficiency: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'expert'>;
  skill_evidence: Record<string, string>;
} {
  const technicalSet = new Set<string>();
  const aiSet = new Set<string>();
  const toolSet = new Set<string>();
  const softSet = new Set<string>();
  const otherSet = new Set<string>();
  const proficiencyMap: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'expert'> = {};
  const evidenceMap: Record<string, string> = {};

  const lines = fullDocumentText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const combinedText = `${skillsSectionText}\n${fullDocumentText}`;

  // 1. First Pass: Taxonomy Scanning across entire document
  for (const item of MASTER_SKILLS_CATALOG) {
    const rx = item.matchRegex ?? buildRegexForTerm(item.canonical);
    if (rx.test(combinedText)) {
      if (item.category === 'technical') technicalSet.add(item.canonical);
      else if (item.category === 'ai') aiSet.add(item.canonical);
      else if (item.category === 'tool') toolSet.add(item.canonical);
      else if (item.category === 'soft') softSet.add(item.canonical);

      const lineMatch = lines.find((l) => rx.test(l));
      if (lineMatch) {
        evidenceMap[item.canonical] = lineMatch;
        const profMatch = lineMatch.match(/\b(beginner|intermediate|advanced|expert)\b/i);
        if (profMatch) {
          proficiencyMap[item.canonical] = profMatch[1].toLowerCase() as any;
        }
      }
    }
  }

  // 2. Second Pass: In dedicated skills section, parse custom bulleted/comma items
  if (skillsSectionText.trim()) {
    const sectionLines = skillsSectionText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (const sLine of sectionLines) {
      const strippedLine = sLine.replace(/^[\s-*•▪◦\d.)]+/, '').trim();
      if (!strippedLine) continue;

      const colonMatch = strippedLine.match(/^([^:—–]+)[:—–]\s*(.+)$/);
      let hintCategory: 'technical' | 'ai' | 'tool' | 'soft' | 'other' = 'technical';
      let contentToParse = strippedLine;

      if (colonMatch) {
        const rawTitle = colonMatch[1].trim();
        const afterColon = colonMatch[2].trim();

        // If rawTitle is itself a canonical skill (e.g. "React: advanced", "Python: 3 yrs"), treat it as the skill
        const isIndividualSkill = MASTER_SKILLS_CATALOG.some(
          (m) => m.canonical.toLowerCase() === rawTitle.toLowerCase()
        );

        if (isIndividualSkill) {
          const matched = MASTER_SKILLS_CATALOG.find(
            (m) => m.canonical.toLowerCase() === rawTitle.toLowerCase()
          )!;
          if (matched.category === 'technical') technicalSet.add(matched.canonical);
          else if (matched.category === 'ai') aiSet.add(matched.canonical);
          else if (matched.category === 'tool') toolSet.add(matched.canonical);
          else if (matched.category === 'soft') softSet.add(matched.canonical);
          continue;
        } else {
          hintCategory = classifySkillTitle(rawTitle);
          contentToParse = afterColon;
        }
      } else {
        if (/^(?:programming\s+)?languages$/i.test(strippedLine)) continue;
        if (/^(?:frameworks|libraries|web\s+tech|databases)$/i.test(strippedLine)) continue;
        if (/^(?:ai|artificial\s+intelligence|machine\s+learning|ml)$/i.test(strippedLine)) continue;
        if (/^(?:tools|developer\s+tools|devops|cloud)$/i.test(strippedLine)) continue;
        if (/^(?:soft\s+skills|interpersonal|personal\s+skills)$/i.test(strippedLine)) continue;
      }

      const rawTokens = contentToParse.split(/[,;|•\n]+/).map(cleanSkillName).filter(Boolean);

      for (const token of rawTokens) {
        if (token.length < 2 || token.length > 45) continue;
        if (/^(skills|technologies|proficient|experienced|knowledge|various|etc)$/i.test(token)) continue;

        const matched = MASTER_SKILLS_CATALOG.find(
          (m) => m.canonical.toLowerCase() === token.toLowerCase()
        );

        if (hintCategory === 'other') {
          // If the title is not shown on the website (e.g. "Methodologies: Agile/Scrum"),
          // user explicitly requested: "If the title are not shown in website, it will store to others."
          otherSet.add(matched ? matched.canonical : token);
        } else if (matched) {
          if (matched.category === 'technical') technicalSet.add(matched.canonical);
          else if (matched.category === 'ai') aiSet.add(matched.canonical);
          else if (matched.category === 'tool') toolSet.add(matched.canonical);
          else if (matched.category === 'soft') softSet.add(matched.canonical);
        } else {
          if (hintCategory === 'technical') technicalSet.add(token);
          else if (hintCategory === 'ai') aiSet.add(token);
          else if (hintCategory === 'tool') toolSet.add(token);
          else if (hintCategory === 'soft') softSet.add(token);
          else otherSet.add(token);
        }

        if (!evidenceMap[token]) {
          evidenceMap[token] = sLine;
        }
      }
    }
  }

  return {
    technical_skills: Array.from(technicalSet),
    ai_skills: Array.from(aiSet),
    tools_and_technologies: Array.from(toolSet),
    soft_skills: Array.from(softSet),
    other_skills: Array.from(otherSet),
    skill_proficiency: proficiencyMap,
    skill_evidence: evidenceMap,
  };
}
