// ─────────────────────────────────────────────────────────────
//  JobTransit · Personalised Reskilling Pathways & Learning Plans
//  Includes explainable match breakdowns, ordered checkpoints,
//  free/low-cost resources, and HRD Corp-claimable programmes.
// ─────────────────────────────────────────────────────────────

export interface LearningResource {
  title: string
  provider: string
  type: 'free' | 'low-cost' | 'hrd-corp'
  cost: string
  url?: string
  format: 'Self-Paced Course' | 'Hands-on Lab' | 'Documentation' | 'Executive Programme'
  duration: string
}

export interface LearningCheckpoint {
  id: string
  phaseNumber: number
  title: string
  timeEstimate: string
  objective: string
  skillsGained: string[]
  resources: LearningResource[]
  practicalProject: {
    title: string
    summary: string
    deliverables: string[]
  }
  certificate?: {
    name: string
    issuer: string
    badgeType: 'verified' | 'course' | 'industry'
  }
}

export interface ScoreFactor {
  label: string
  weight: number // e.g. +42 or -18
  status: 'positive' | 'gap' | 'market'
  detail: string
}

export interface ReskillingPathway {
  roleId: string
  roleTitle: string
  stationCode: string
  level: 'Intermediate → Senior' | 'Mid-Level' | 'Mid-Level → Senior' | 'Specialist' | 'Lead'
  targetTimeline: string
  averageSalary: string
  marketDemandBadge: string
  roleOverview: {
    summary: string
    responsibilities: string[]
    coreTechStack: string[]
    prerequisites: string[]
  }
  explainableMatch: {
    overallScore: number
    summaryRationale: string
    factors: ScoreFactor[]
    strengthsYouBring: string[]
    criticalGapsToClose: string[]
  }
  checkpoints: LearningCheckpoint[]
}

export const RESKILLING_PATHWAYS: Record<string, ReskillingPathway> = {
  // ─────────────────────────────────────────────────────────
  //  #1 TOP PICK: Agentic AI Engineer
  // ─────────────────────────────────────────────────────────
  agentic: {
    roleId: 'agentic',
    roleTitle: 'Agentic AI Engineer',
    stationCode: 'A-03',
    level: 'Intermediate → Senior',
    targetTimeline: '3 – 4 Months (Part-Time: 8-10 hrs/week)',
    averageSalary: 'RM 12,000 – RM 18,000 / month',
    marketDemandBadge: 'Surging ▲34% QoQ (APAC)',
    roleOverview: {
      summary:
        'Architects, builds, and deploys autonomous AI agents capable of planning multi-step tasks, executing external tool calls, managing persistent memory, and self-correcting upon API failure.',
      responsibilities: [
        'Design graph-based multi-agent coordination architectures using LangGraph and state machines.',
        'Implement resilient tool-calling interfaces connecting LLMs to enterprise databases, web APIs, and sandbox execution environments.',
        'Establish automated evaluation suites (TruLens, Ragas) to measure hallucination rates and trajectory completion.',
        'Optimize inference latency and token overhead using local open-weight models (Hermes 3, Llama 3.1) and semantic caching.',
      ],
      coreTechStack: ['LangGraph', 'TypeScript/Python', 'Tool Calling APIs', 'PostgreSQL / pgvector', 'Hermes 3 / Llama 3', 'Docker'],
      prerequisites: ['Solid JavaScript/TypeScript or Python', 'REST API integrations', 'Relational database fundamentals'],
    },
    explainableMatch: {
      overallScore: 78,
      summaryRationale:
        'You already possess 4 of the 6 foundational prerequisites through your Full-Stack experience. Your strongest asset is backend API integration and PostgreSQL schema knowledge; the primary bridge required is stateful agent orchestration and automated eval harnesses.',
      factors: [
        {
          label: 'Backend & API Foundation',
          weight: 42,
          status: 'positive',
          detail: 'Your TypeScript, Node.js, and REST API experience directly transfers to building agent tool endpoints and execution handlers.',
        },
        {
          label: 'Data Persistence & Storage',
          weight: 24,
          status: 'positive',
          detail: 'PostgreSQL familiarity provides immediate readiness for agent state checkpointers and pgvector embeddings storage.',
        },
        {
          label: 'Agent Orchestration Frameworks',
          weight: -16,
          status: 'gap',
          detail: 'Missing hands-on experience with LangGraph cycles, human-in-the-loop approvals, and multi-turn state machines.',
        },
        {
          label: 'Agent Evals & Safety Guardrails',
          weight: -10,
          status: 'gap',
          detail: 'Need training in synthetic benchmark datasets, trajectory scoring, and prompt injection defense.',
        },
        {
          label: 'AI Market Signal Boost',
          weight: 10,
          status: 'market',
          detail: 'Hermes 3 release and enterprise adoption of agentic automation across Southeast Asia provide strong hiring tailwinds.',
        },
      ],
      strengthsYouBring: ['TypeScript & Async Node.js', 'REST API Architecture', 'PostgreSQL Database Design', 'React Frontend Integration'],
      criticalGapsToClose: ['LangGraph State Machine Design', 'Tool Calling Protocols & Error Recovery', 'Automated Evals & Guardrails'],
    },
    checkpoints: [
      {
        id: 'cp-agentic-1',
        phaseNumber: 1,
        title: 'Phase 1: Tool Calling & Structured Function Calling',
        timeEstimate: 'Weeks 1–2 · 12 Hours',
        objective: 'Master structured outputs, JSON schema tool definitions, and reliable tool-calling execution loops.',
        skillsGained: ['Function Calling', 'JSON Schema Validation', 'Prompt Engineering', 'Pydantic / Zod'],
        resources: [
          {
            title: 'Functions, Tools and Agents with LangChain',
            provider: 'DeepLearning.AI',
            type: 'free',
            cost: 'Free',
            format: 'Self-Paced Course',
            duration: '3 hours',
          },
          {
            title: 'Hermes 3 Function Calling Cookbook & Guide',
            provider: 'Nous Research / Hugging Face',
            type: 'free',
            cost: 'Free Open-Source',
            format: 'Hands-on Lab',
            duration: '4 hours',
          },
          {
            title: 'HRD Corp Claimable: Generative AI & Enterprise Tool Integration',
            provider: 'MDeC / HRD Corp Approved Scheme (SBL-Khas)',
            type: 'hrd-corp',
            cost: '100% HRD Corp Levy Claimable',
            format: 'Executive Programme',
            duration: '2 Days (16 hrs)',
          },
        ],
        practicalProject: {
          title: 'Database Querying Agent with Safe Schema Inspection',
          summary: 'Build a standalone agent that receives natural language requests, validates SQL syntax via sandbox tools, queries PostgreSQL, and formats clean answers.',
          deliverables: ['GitHub repo with Zod tool definitions', 'Dockerized PostgreSQL container', 'End-to-end execution unit test suite'],
        },
        certificate: {
          name: 'DeepLearning.AI Function Calling Specialist',
          issuer: 'DeepLearning.AI',
          badgeType: 'course',
        },
      },
      {
        id: 'cp-agentic-2',
        phaseNumber: 2,
        title: 'Phase 2: Cyclic Graph Orchestration with LangGraph',
        timeEstimate: 'Weeks 3–4 · 16 Hours',
        objective: 'Build cyclic, stateful multi-step agent workflows with memory checkpointers and human-in-the-loop breakpoints.',
        skillsGained: ['LangGraph', 'StateGraph', 'Checkpointing', 'Human-in-the-loop Approvals'],
        resources: [
          {
            title: 'LangGraph Academy: Developing Robust Multi-Agent Applications',
            provider: 'LangChain Academy',
            type: 'free',
            cost: 'Free Access',
            format: 'Self-Paced Course',
            duration: '6 hours',
          },
          {
            title: 'Building Stateful Agent Systems (Official Docs & Notebooks)',
            provider: 'LangGraph Open Source',
            type: 'free',
            cost: 'Free',
            format: 'Documentation',
            duration: '4 hours',
          },
          {
            title: 'HRD Corp Claimable: Advanced Agentic Workflow Architecture',
            provider: 'HRD Corp Accredited Training Provider',
            type: 'hrd-corp',
            cost: '100% HRD Corp Levy Claimable',
            format: 'Executive Programme',
            duration: '3 Days (24 hrs)',
          },
        ],
        practicalProject: {
          title: 'Autonomous Research & Fact-Checking Co-Pilot',
          summary: 'A multi-step graph workflow that formulates research queries, scrapes sources via Tavily, drafts reports, and pauses for human approval before dispatch.',
          deliverables: ['LangGraph state chart diagram', 'Persistent SQLite/Postgres checkpointer', 'Interactive CLI or Streamlit preview'],
        },
        certificate: {
          name: 'LangGraph Certified Practitioner',
          issuer: 'LangChain Academy',
          badgeType: 'verified',
        },
      },
      {
        id: 'cp-agentic-3',
        phaseNumber: 3,
        title: 'Phase 3: Multi-Tool Swarms & Memory Architecture',
        timeEstimate: 'Weeks 5–6 · 14 Hours',
        objective: 'Coordinate swarms of specialized agents (router, researcher, executor) with semantic vector recall.',
        skillsGained: ['Agent Swarms', 'Semantic Router', 'Vector Memory', 'Short/Long-term Storage'],
        resources: [
          {
            title: 'Anthropic Agentic Workflows & Multi-Agent Design Patterns',
            provider: 'Anthropic Research',
            type: 'free',
            cost: 'Free',
            format: 'Documentation',
            duration: '3 hours',
          },
          {
            title: 'Vector Databases for Long-Term Agent Memory',
            provider: 'Qdrant / Pinecone Academy',
            type: 'free',
            cost: 'Free',
            format: 'Hands-on Lab',
            duration: '4 hours',
          },
          {
            title: 'HRD Corp Claimable: Enterprise Multi-Agent Architecture Masterclass',
            provider: 'Digital Economy Academy (HRD Corp Scheme)',
            type: 'hrd-corp',
            cost: '100% HRD Corp Levy Claimable',
            format: 'Executive Programme',
            duration: '2 Days (16 hrs)',
          },
        ],
        practicalProject: {
          title: 'Customer Operations Swarm with Automatic Tool Fallback',
          summary: 'Build a 3-agent swarm (Triage, Billing Specialist, Tech Support) with shared memory and automatic retry on tool timeout.',
          deliverables: ['Multi-agent routing graph', 'Error recovery & fallback logic', 'Tracing logs with LangSmith'],
        },
        certificate: {
          name: 'Applied Multi-Agent Systems Engineer',
          issuer: 'JobTransit Industry Partner',
          badgeType: 'industry',
        },
      },
      {
        id: 'cp-agentic-4',
        phaseNumber: 4,
        title: 'Phase 4: Production Evals, Safety Guardrails & Capstone',
        timeEstimate: 'Weeks 7–8 · 16 Hours',
        objective: 'Benchmark agent reliability, protect against prompt injection, and deploy a production-grade service.',
        skillsGained: ['Agent Evals', 'Ragas / TruLens', 'Guardrails AI', 'Production Deployment'],
        resources: [
          {
            title: 'Automated Testing & Evaluation for LLM Applications',
            provider: 'DeepLearning.AI & TruEra',
            type: 'free',
            cost: 'Free',
            format: 'Self-Paced Course',
            duration: '4 hours',
          },
          {
            title: 'NeMo Guardrails & Prompt Injection Defense Guide',
            provider: 'NVIDIA Developer',
            type: 'free',
            cost: 'Free',
            format: 'Documentation',
            duration: '3 hours',
          },
          {
            title: 'HRD Corp Claimable: Professional AI Governance & Reliability Engineer',
            provider: 'Global AI Institute (HRD Corp Approved)',
            type: 'hrd-corp',
            cost: '100% HRD Corp Levy Claimable',
            format: 'Executive Programme',
            duration: '2 Days (16 hrs)',
          },
        ],
        practicalProject: {
          title: 'Capstone: End-to-End Production Agent with Live Evals Dashboard',
          summary: 'Full-stack deployed agent service with Docker, FastAPI, PostgreSQL, LangSmith observability, and 90%+ pass rate on synthetic benchmark scenarios.',
          deliverables: ['Deployed web service / demo video', 'Automated CI/CD eval suite report', 'Portfolio case study for resume'],
        },
        certificate: {
          name: 'Certified Enterprise AI Agent Engineer',
          issuer: 'Linux Foundation / MDeC Partner',
          badgeType: 'verified',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  //  #2 TOP PICK: Data Pipeline Engineer
  // ─────────────────────────────────────────────────────────
  pipeline: {
    roleId: 'pipeline',
    roleTitle: 'Data Pipeline Engineer',
    stationCode: 'D-04',
    level: 'Mid-Level → Senior',
    targetTimeline: '3 – 4 Months (Part-Time: 8 hrs/week)',
    averageSalary: 'RM 11,000 – RM 16,000 / month',
    marketDemandBadge: 'High Demand ▲18% QoQ (RAG & Streaming)',
    roleOverview: {
      summary:
        'Designs, builds, and maintains high-throughput streaming and batch data pipelines that ingest, transform, and index unstructured data for RAG vector stores and real-time business analytics.',
      responsibilities: [
        'Develop real-time event streaming pipelines using Apache Kafka and Apache Flink/Spark.',
        'Implement automated batch ETL/ELT pipelines using Airflow, dbt, and cloud data warehouses.',
        'Build automated document parsing and vector chunking pipelines for enterprise semantic search.',
        'Monitor data quality, schema evolution, and pipeline latency with automated alerting.',
      ],
      coreTechStack: ['Apache Kafka', 'Airflow', 'dbt', 'PostgreSQL / Snowflake', 'Python', 'Qdrant/Milvus'],
      prerequisites: ['PostgreSQL and SQL proficiency', 'Basic Python or Node.js scripting', 'Git & Docker'],
    },
    explainableMatch: {
      overallScore: 72,
      summaryRationale:
        'Your PostgreSQL and backend experience gives you an immediate head start in data modeling and relational transformations. Bridging distributed streaming (Kafka) and orchestration (Airflow) will make you production-ready for top pipeline roles.',
      factors: [
        {
          label: 'Relational Database & SQL',
          weight: 38,
          status: 'positive',
          detail: 'Deep PostgreSQL knowledge translates seamlessly into pipeline modeling, indexing, and analytics querying.',
        },
        {
          label: 'Backend Data Handling',
          weight: 22,
          status: 'positive',
          detail: 'Experience building REST APIs and handling async payload processing in Node.js creates a natural bridge to Python pipelines.',
        },
        {
          label: 'Distributed Streaming (Kafka/Flink)',
          weight: -16,
          status: 'gap',
          detail: 'Requires learning pub/sub partitioning, consumer group rebalancing, and event stream processing.',
        },
        {
          label: 'Workflow Orchestration (Airflow/dbt)',
          weight: -12,
          status: 'gap',
          detail: 'Need familiarity with DAG scheduling, idempotent task retries, and data warehouse modeling with dbt.',
        },
        {
          label: 'RAG Pipeline Demand',
          weight: 8,
          status: 'market',
          detail: 'Enterprise AI rollouts require clean, continuously updated vector pipelines (+18% YoY growth).',
        },
      ],
      strengthsYouBring: ['PostgreSQL Database Querying', 'Backend Architecture', 'JSON / REST Ingestion', 'Docker Containerization'],
      criticalGapsToClose: ['Apache Kafka Event Streaming', 'Apache Airflow DAG Scheduling', 'dbt Data Modeling', 'Vector Index Pipelines'],
    },
    checkpoints: [
      {
        id: 'cp-pipeline-1',
        phaseNumber: 1,
        title: 'Phase 1: Modern Data Modeling with SQL & dbt',
        timeEstimate: 'Weeks 1–2 · 12 Hours',
        objective: 'Master dimensional modeling, star schemas, and automated testing with dbt on PostgreSQL.',
        skillsGained: ['Advanced SQL', 'dbt Core', 'Dimensional Modeling', 'Data Testing'],
        resources: [
          {
            title: 'dbt Fundamentals (Official Certification Track)',
            provider: 'dbt Labs',
            type: 'free',
            cost: 'Free',
            format: 'Self-Paced Course',
            duration: '5 hours',
          },
          {
            title: 'SQL for Data Engineering & Analytics',
            provider: 'Mode Analytics Academy',
            type: 'free',
            cost: 'Free',
            format: 'Hands-on Lab',
            duration: '4 hours',
          },
          {
            title: 'HRD Corp Claimable: Modern Analytics Engineering with dbt & Cloud Warehouses',
            provider: 'HRD Corp Approved Big Data Institute',
            type: 'hrd-corp',
            cost: '100% HRD Corp Levy Claimable',
            format: 'Executive Programme',
            duration: '2 Days (16 hrs)',
          },
        ],
        practicalProject: {
          title: 'Production dbt Transformation Pipeline on PostgreSQL',
          summary: 'Build a layered analytics warehouse model (staging, intermediate, marts) with automated schema tests and documentation generation.',
          deliverables: ['dbt project repo with lineage graph', 'Automated data tests', 'Markdown data dictionary'],
        },
        certificate: {
          name: 'dbt Fundamentals Certified',
          issuer: 'dbt Labs',
          badgeType: 'verified',
        },
      },
      {
        id: 'cp-pipeline-2',
        phaseNumber: 2,
        title: 'Phase 2: Workflow Orchestration with Apache Airflow',
        timeEstimate: 'Weeks 3–4 · 14 Hours',
        objective: 'Author idempotent DAGs, configure task dependencies, and manage failure alerts in Airflow.',
        skillsGained: ['Apache Airflow', 'DAG Authoring', 'Task Operators', 'Failure Handling'],
        resources: [
          {
            title: 'Airflow 101: Building Scalable Data Pipelines',
            provider: 'Astronomer Academy',
            type: 'free',
            cost: 'Free',
            format: 'Self-Paced Course',
            duration: '4 hours',
          },
          {
            title: 'HRD Corp Claimable: Data Pipeline Orchestration with Apache Airflow',
            provider: 'HRD Corp Approved Technology Academy',
            type: 'hrd-corp',
            cost: '100% HRD Corp Levy Claimable',
            format: 'Executive Programme',
            duration: '2 Days (16 hrs)',
          },
        ],
        practicalProject: {
          title: 'Daily Automated Multi-Source Ingestion DAG',
          summary: 'Configure an Airflow DAG that fetches financial API data, validates formats, updates PostgreSQL tables, and triggers dbt runs.',
          deliverables: ['Airflow DAG code with retries', 'Docker Compose deployment', 'Slack failure alert webhook integration'],
        },
        certificate: {
          name: 'Astronomer Airflow Core Certification',
          issuer: 'Astronomer',
          badgeType: 'verified',
        },
      },
      {
        id: 'cp-pipeline-3',
        phaseNumber: 3,
        title: 'Phase 3: Real-Time Event Streaming with Apache Kafka',
        timeEstimate: 'Weeks 5–6 · 16 Hours',
        objective: 'Set up Kafka topics, produce/consume structured events, and handle partition rebalancing.',
        skillsGained: ['Apache Kafka', 'Event Streaming', 'Producer/Consumer API', 'Schema Registry'],
        resources: [
          {
            title: 'Kafka Fundamentals & Architecture Track',
            provider: 'Confluent Developer',
            type: 'free',
            cost: 'Free Access',
            format: 'Self-Paced Course',
            duration: '5 hours',
          },
          {
            title: 'HRD Corp Claimable: Enterprise Event Streaming with Apache Kafka',
            provider: 'Confluent Authorized Partner (HRD Corp Scheme)',
            type: 'hrd-corp',
            cost: '100% HRD Corp Levy Claimable',
            format: 'Executive Programme',
            duration: '3 Days (24 hrs)',
          },
        ],
        practicalProject: {
          title: 'High-Throughput Clickstream Pipeline to PostgreSQL',
          summary: 'Simulate high-volume user activity events, stream through Kafka topics, and ingest into indexed tables with dead-letter queue recovery.',
          deliverables: ['Kafka cluster configuration', 'Node/Python producer & consumer scripts', 'Latency benchmark dashboard'],
        },
      },
      {
        id: 'cp-pipeline-4',
        phaseNumber: 4,
        title: 'Phase 4: Real-Time Vector RAG Ingestion & Capstone',
        timeEstimate: 'Weeks 7–8 · 16 Hours',
        objective: 'Construct an end-to-end vector indexing pipeline that chunks, embeds, and updates vector databases in real-time.',
        skillsGained: ['Vector Ingestion', 'Semantic Chunking', 'pgvector / Qdrant', 'Pipeline Monitoring'],
        resources: [
          {
            title: 'Vector Databases for Production RAG Pipelines',
            provider: 'DeepLearning.AI',
            type: 'free',
            cost: 'Free',
            format: 'Self-Paced Course',
            duration: '3 hours',
          },
          {
            title: 'HRD Corp Claimable: AI Data Engineering & Vector Pipeline Specialist',
            provider: 'Malaysian Institute of Data Science (HRD Corp Scheme)',
            type: 'hrd-corp',
            cost: '100% HRD Corp Levy Claimable',
            format: 'Executive Programme',
            duration: '2 Days (16 hrs)',
          },
        ],
        practicalProject: {
          title: 'Capstone: Live Document Sync Pipeline to Vector DB',
          summary: 'Full pipeline that detects updated PDF/markdown docs, generates embeddings, deduplicates, and synchronizes with vector search indexes in sub-second latency.',
          deliverables: ['Production Dockerized architecture', 'CI/CD pipeline and monitoring metrics', 'Resume-ready technical walkthrough'],
        },
        certificate: {
          name: 'Certified AI Data Pipeline Specialist',
          issuer: 'JobTransit Industry Partner',
          badgeType: 'industry',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  //  #3 TOP PICK: AI Engineer
  // ─────────────────────────────────────────────────────────
  ai_eng: {
    roleId: 'ai-eng',
    roleTitle: 'AI Engineer',
    stationCode: 'I-03',
    level: 'Mid-Level → Senior',
    targetTimeline: '3 – 4 Months (Part-Time: 8 hrs/week)',
    averageSalary: 'RM 12,000 – RM 17,000 / month',
    marketDemandBadge: 'Rapid Growth ▲27% QoQ',
    roleOverview: {
      summary:
        'Bridges the gap between raw foundation models and shipped enterprise products, specializing in retrieval-augmented generation (RAG), model fine-tuning, latency optimization, and semantic search.',
      responsibilities: [
        'Build production RAG pipelines with hybrid keyword-vector search, re-ranking, and query decomposition.',
        'Fine-tune open-weight models (LoRA/QLoRA) on proprietary company data for specialized domain performance.',
        'Implement prompt engineering, dynamic system prompts, and semantic caching to lower inference costs.',
        'Deploy local model serving endpoints using vLLM, Ollama, and Hugging Face Text Generation Inference.',
      ],
      coreTechStack: ['Python', 'PyTorch / Hugging Face', 'LangChain / LlamaIndex', 'vLLM', 'Qdrant / pgvector', 'FastAPI'],
      prerequisites: ['Proficiency in software engineering', 'REST APIs & backend architectures', 'Basic linear algebra / statistics concepts'],
    },
    explainableMatch: {
      overallScore: 68,
      summaryRationale:
        'Your web architecture and REST API expertise makes the application layer straightforward. Your biggest growth area is adopting Python for ML tooling and mastering model fine-tuning techniques (LoRA/QLoRA).',
      factors: [
        {
          label: 'Application Integration & APIs',
          weight: 40,
          status: 'positive',
          detail: 'You already understand API lifecycles, authentication, and integrating remote services into customer-facing applications.',
        },
        {
          label: 'TypeScript & Prompting',
          weight: 18,
          status: 'positive',
          detail: 'Strong grasp of modern asynchronous frontend/backend code makes implementing streaming LLM UI intuitive.',
        },
        {
          label: 'Python Data Science Stack',
          weight: -18,
          status: 'gap',
          detail: 'Python is the de facto language for ML engineering (NumPy, PyTorch, Hugging Face transformers).',
        },
        {
          label: 'Fine-Tuning & Model Weights',
          weight: -14,
          status: 'gap',
          detail: 'Need conceptual and practical training in LoRA, QLoRA, tokenizers, and model quantization (GGUF/AWQ).',
        },
        {
          label: 'Global Hiring Surge',
          weight: 12,
          status: 'market',
          detail: 'AI Engineer has become the fastest-growing software engineering job category in APAC.',
        },
      ],
      strengthsYouBring: ['Full-Stack Product Architecture', 'REST & Streaming APIs', 'Database Storage', 'User-Centric Engineering'],
      criticalGapsToClose: ['Python for Machine Learning', 'Advanced RAG & Re-ranking', 'LoRA / QLoRA Fine-Tuning', 'vLLM Model Serving'],
    },
    checkpoints: [
      {
        id: 'cp-aieng-1',
        phaseNumber: 1,
        title: 'Phase 1: Python Bridge & Machine Learning Foundations',
        timeEstimate: 'Weeks 1–2 · 12 Hours',
        objective: 'Fast-track transition from JavaScript/TypeScript to idiomatic Python, NumPy, and PyTorch tensors.',
        skillsGained: ['Python 3.12', 'NumPy Vectors', 'PyTorch Tensors', 'Hugging Face Datasets'],
        resources: [
          {
            title: 'Python for JavaScript Developers & ML Primer',
            provider: 'Hugging Face Open Courseware',
            type: 'free',
            cost: 'Free',
            format: 'Self-Paced Course',
            duration: '4 hours',
          },
          {
            title: 'Practical Deep Learning for Coders (Part 1)',
            provider: 'Fast.ai',
            type: 'free',
            cost: 'Free Access',
            format: 'Self-Paced Course',
            duration: '8 hours',
          },
          {
            title: 'HRD Corp Claimable: Applied Python & Machine Learning for Engineers',
            provider: 'HRD Corp Accredited Tech Partner',
            type: 'hrd-corp',
            cost: '100% HRD Corp Levy Claimable',
            format: 'Executive Programme',
            duration: '2 Days (16 hrs)',
          },
        ],
        practicalProject: {
          title: 'Semantic Text Embeddings Explorer in FastAPI',
          summary: 'Build a lightweight Python service that takes documents, generates embeddings with Hugging Face transformers, and measures cosine similarity.',
          deliverables: ['FastAPI microservice code', 'Jupyter notebook analyzing vector distances', 'PyTest suite'],
        },
        certificate: {
          name: 'Hugging Face NLP Specialist',
          issuer: 'Hugging Face',
          badgeType: 'verified',
        },
      },
      {
        id: 'cp-aieng-2',
        phaseNumber: 2,
        title: 'Phase 2: Production RAG Architectures with Hybrid Search',
        timeEstimate: 'Weeks 3–4 · 16 Hours',
        objective: 'Construct advanced RAG pipelines combining BM25 keyword matching, vector dense retrieval, and cross-encoder re-rankers.',
        skillsGained: ['Advanced RAG', 'Hybrid Search', 'Cohere Re-ranking', 'Contextual Retrieval'],
        resources: [
          {
            title: 'Building Advanced RAG Systems with LlamaIndex',
            provider: 'DeepLearning.AI',
            type: 'free',
            cost: 'Free',
            format: 'Self-Paced Course',
            duration: '3 hours',
          },
          {
            title: 'HRD Corp Claimable: Enterprise Retrieval-Augmented Generation (RAG) Systems',
            provider: 'HRD Corp Approved Technology Institute',
            type: 'hrd-corp',
            cost: '100% HRD Corp Levy Claimable',
            format: 'Executive Programme',
            duration: '2 Days (16 hrs)',
          },
        ],
        practicalProject: {
          title: 'Enterprise Technical Documentation RAG Search Engine',
          summary: 'Index 5,000+ technical documentation pages with hybrid retrieval, cross-encoder re-ranking, and dynamic citation generation.',
          deliverables: ['Indexing pipeline script', 'Streaming UI with citation links', 'Ragas evaluation report with >85% answer relevance'],
        },
      },
      {
        id: 'cp-aieng-3',
        phaseNumber: 3,
        title: 'Phase 3: Parameter-Efficient Fine-Tuning (LoRA / QLoRA)',
        timeEstimate: 'Weeks 5–6 · 14 Hours',
        objective: 'Fine-tune open-weight LLMs (Llama 3 / Mistral) using Unsloth and Hugging Face SFTTrainer for specialized tasks.',
        skillsGained: ['LoRA / QLoRA', 'Dataset Preparation', 'Unsloth', 'Model Quantization'],
        resources: [
          {
            title: 'Fine-Tuning Large Language Models',
            provider: 'DeepLearning.AI & Lamini',
            type: 'free',
            cost: 'Free',
            format: 'Self-Paced Course',
            duration: '3 hours',
          },
          {
            title: 'Unsloth 5x Faster Fine-Tuning Notebooks',
            provider: 'Unsloth Open Source',
            type: 'free',
            cost: 'Free',
            format: 'Hands-on Lab',
            duration: '4 hours',
          },
          {
            title: 'HRD Corp Claimable: Applied LLM Fine-Tuning & Model Adaptation',
            provider: 'MDeC Approved AI Academy (HRD Corp Scheme)',
            type: 'hrd-corp',
            cost: '100% HRD Corp Levy Claimable',
            format: 'Executive Programme',
            duration: '2 Days (16 hrs)',
          },
        ],
        practicalProject: {
          title: 'Domain-Adapted Model for Support Ticket Categorization',
          summary: 'Fine-tune a 3B/8B model using QLoRA on 2,000 support ticket pairs, export GGUF quantized weights, and test locally in Ollama.',
          deliverables: ['Training dataset and loss curves', 'Hugging Face model repository with adapter weights', 'Ollama Modelfile configuration'],
        },
        certificate: {
          name: 'Certified LLM Fine-Tuning Engineer',
          issuer: 'JobTransit AI Guild',
          badgeType: 'industry',
        },
      },
      {
        id: 'cp-aieng-4',
        phaseNumber: 4,
        title: 'Phase 4: High-Throughput Model Serving & Capstone',
        timeEstimate: 'Weeks 7–8 · 16 Hours',
        objective: 'Deploy low-latency inference servers using vLLM with continuous batching and semantic response caching.',
        skillsGained: ['vLLM Inference', 'Continuous Batching', 'Semantic Caching', 'Production SRE for AI'],
        resources: [
          {
            title: 'vLLM: High-Throughput and Memory-Efficient Inference',
            provider: 'UC Berkeley vLLM Team',
            type: 'free',
            cost: 'Free',
            format: 'Documentation',
            duration: '3 hours',
          },
          {
            title: 'HRD Corp Claimable: Production AI Deployment, Inference & Security',
            provider: 'Global AI Institute (HRD Corp Approved)',
            type: 'hrd-corp',
            cost: '100% HRD Corp Levy Claimable',
            format: 'Executive Programme',
            duration: '2 Days (16 hrs)',
          },
        ],
        practicalProject: {
          title: 'Capstone: Production AI Microservice with vLLM & Streaming Frontend',
          summary: 'End-to-end AI product: vLLM backend container, Redis semantic cache, and real-time streaming Next.js/React interface deployed on cloud.',
          deliverables: ['Production deployment repository', 'Benchmarking metrics (tokens/sec and p99 latency)', 'Video walkthrough for technical interviews'],
        },
        certificate: {
          name: 'Professional AI Systems Engineer',
          issuer: 'Cloud & AI Architecture Council',
          badgeType: 'verified',
        },
      },
    ],
  },
}

/** Fallback generator for other network stations so every role is actionable. */
export function getReskillingPathway(roleId: string, roleTitle: string, stationCode: string): ReskillingPathway {
  // Check exact key or dash-converted key
  const match = RESKILLING_PATHWAYS[roleId] || RESKILLING_PATHWAYS[roleId.replace('-', '_')]
  if (match) return match

  return {
    roleId,
    roleTitle,
    stationCode,
    level: 'Specialist',
    targetTimeline: '3 – 4 Months (Part-Time: 8 hrs/week)',
    averageSalary: 'RM 10,000 – RM 16,000 / month',
    marketDemandBadge: 'Active Industry Postings',
    roleOverview: {
      summary: `Specialized career trajectory targeting ${roleTitle}. Connects software engineering principles with modern domain tooling and production reliability.`,
      responsibilities: [
        `Architect and maintain systems aligned with modern ${roleTitle} best practices.`,
        'Collaborate with cross-functional product and infrastructure teams.',
        'Implement automated testing, monitoring, and observability metrics.',
        'Contribute to organizational standards and developer documentation.',
      ],
      coreTechStack: ['TypeScript / Python', 'Cloud Infrastructure', 'CI/CD Pipelines', 'Automated Testing'],
      prerequisites: ['Full-stack software engineering', 'Relational databases', 'System design fundamentals'],
    },
    explainableMatch: {
      overallScore: 70,
      summaryRationale: `Your background in Full-Stack development covers core application and API engineering. Closing the missing domain tools gives you a clear path to ${roleTitle}.`,
      factors: [
        {
          label: 'Core Software Engineering',
          weight: 40,
          status: 'positive',
          detail: 'Solid foundation in modern TypeScript, APIs, and database transactions.',
        },
        {
          label: 'Architecture Experience',
          weight: 20,
          status: 'positive',
          detail: 'Familiarity with distributed client-server systems and state lifecycle.',
        },
        {
          label: 'Specialized Domain Tooling',
          weight: -15,
          status: 'gap',
          detail: `Requires specialized frameworks and tooling specific to ${roleTitle}.`,
        },
        {
          label: 'Market Momentum',
          weight: 5,
          status: 'market',
          detail: 'Steady market hiring across tech and enterprise sectors.',
        },
      ],
      strengthsYouBring: ['Full-Stack Foundation', 'Database Literacy', 'Modern Framework Experience'],
      criticalGapsToClose: ['Specialized Frameworks', 'Domain Architecture', 'Automated Testing'],
    },
    checkpoints: [
      {
        id: `cp-${roleId}-1`,
        phaseNumber: 1,
        title: 'Phase 1: Domain Foundations & Core Tools',
        timeEstimate: 'Weeks 1–2 · 12 Hours',
        objective: `Master the foundational syntax and concepts required for ${roleTitle}.`,
        skillsGained: ['Domain Foundations', 'Core Tooling', 'Environment Setup'],
        resources: [
          {
            title: `${roleTitle} Fundamentals & Getting Started Guide`,
            provider: 'Open Source Community',
            type: 'free',
            cost: 'Free',
            format: 'Documentation',
            duration: '4 hours',
          },
          {
            title: `HRD Corp Claimable: Modern ${roleTitle} Foundation Course`,
            provider: 'HRD Corp Accredited Training Provider',
            type: 'hrd-corp',
            cost: '100% HRD Corp Levy Claimable',
            format: 'Executive Programme',
            duration: '2 Days (16 hrs)',
          },
        ],
        practicalProject: {
          title: 'Starter Project: Working Prototype',
          summary: `Build an end-to-end prototype validating core workflows for ${roleTitle}.`,
          deliverables: ['GitHub repository', 'README setup guide', 'Basic test suite'],
        },
      },
      {
        id: `cp-${roleId}-2`,
        phaseNumber: 2,
        title: 'Phase 2: Production Best Practices & Architecture',
        timeEstimate: 'Weeks 3–4 · 14 Hours',
        objective: 'Implement resilient patterns, error handling, and performance optimization.',
        skillsGained: ['System Design', 'Error Handling', 'Performance Optimization'],
        resources: [
          {
            title: 'High-Scale Production Patterns Guide',
            provider: 'Tech Industry Standards',
            type: 'free',
            cost: 'Free',
            format: 'Hands-on Lab',
            duration: '5 hours',
          },
          {
            title: `HRD Corp Claimable: Advanced ${roleTitle} Architecture Masterclass`,
            provider: 'HRD Corp Approved Scheme',
            type: 'hrd-corp',
            cost: '100% HRD Corp Levy Claimable',
            format: 'Executive Programme',
            duration: '2 Days (16 hrs)',
          },
        ],
        practicalProject: {
          title: 'Advanced Architecture Showcase',
          summary: 'Build a production-grade service incorporating caching, security best practices, and automated tests.',
          deliverables: ['Production code repository', 'Benchmarking results', 'Architecture diagram'],
        },
      },
    ],
  }
}
