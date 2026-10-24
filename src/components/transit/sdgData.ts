// ─────────────────────────────────────────────────────────────
//  JobTransit · United Nations Sustainable Development Goals (SDG) Model
//  Maps Career Metro stations, skills, and pathways to UN SDGs
// ─────────────────────────────────────────────────────────────

export type SDGId = 'sdg-4' | 'sdg-8' | 'sdg-9' | 'sdg-10' | 'sdg-12'

export interface SDGGoal {
  id: SDGId
  number: number
  badge: string
  name: string
  shortTitle: string
  color: string
  textColor: string
  bgColor: string
  borderColor: string
  primaryTarget: string
  targetDescription: string
  careerImpactTheme: string
  iconName: string
}

export const SDG_GOALS: Record<SDGId, SDGGoal> = {
  'sdg-4': {
    id: 'sdg-4',
    number: 4,
    badge: 'SDG 4',
    name: 'Quality Education',
    shortTitle: 'Quality Education',
    color: '#C5192D',
    textColor: '#FFFFFF',
    bgColor: 'rgba(197, 25, 45, 0.12)',
    borderColor: 'rgba(197, 25, 45, 0.35)',
    primaryTarget: 'Target 4.4',
    targetDescription: 'Substantially increase the number of youth and adults with relevant technical and vocational skills for employment, decent jobs and entrepreneurship.',
    careerImpactTheme: 'Continuous learning, democratized AI training, and practical skill development.',
    iconName: 'GraduationCap',
  },
  'sdg-8': {
    id: 'sdg-8',
    number: 8,
    badge: 'SDG 8',
    name: 'Decent Work & Economic Growth',
    shortTitle: 'Decent Work',
    color: '#A21942',
    textColor: '#FFFFFF',
    bgColor: 'rgba(162, 25, 66, 0.12)',
    borderColor: 'rgba(162, 25, 66, 0.35)',
    primaryTarget: 'Target 8.2 & 8.5',
    targetDescription: 'Achieve higher economic productivity through diversification, technological upgrading, and full and productive employment with equal pay for work of equal value.',
    careerImpactTheme: 'Transitioning workers into high-wage, resilient tech careers resistant to automation disruption.',
    iconName: 'Briefcase',
  },
  'sdg-9': {
    id: 'sdg-9',
    number: 9,
    badge: 'SDG 9',
    name: 'Industry, Innovation & Infrastructure',
    shortTitle: 'Innovation & Infra',
    color: '#FD6925',
    textColor: '#FFFFFF',
    bgColor: 'rgba(253, 105, 37, 0.12)',
    borderColor: 'rgba(253, 105, 37, 0.35)',
    primaryTarget: 'Target 9.4 & 9.5',
    targetDescription: 'Upgrade digital infrastructure, foster innovation, and increase scientific research and technological capabilities in industrial sectors.',
    careerImpactTheme: 'Building resilient digital systems, agentic automation frameworks, and advanced AI platforms.',
    iconName: 'Cpu',
  },
  'sdg-10': {
    id: 'sdg-10',
    number: 10,
    badge: 'SDG 10',
    name: 'Reduced Inequalities',
    shortTitle: 'Reduced Inequalities',
    color: '#DD1367',
    textColor: '#FFFFFF',
    bgColor: 'rgba(221, 19, 103, 0.12)',
    borderColor: 'rgba(221, 19, 103, 0.35)',
    primaryTarget: 'Target 10.2',
    targetDescription: 'Empower and promote social, economic, and political inclusion of all, irrespective of age, sex, disability, race, origin, or economic status.',
    careerImpactTheme: 'Bridging non-traditional talent, ensuring ethical and bias-free AI models, and accessible design.',
    iconName: 'Scale',
  },
  'sdg-12': {
    id: 'sdg-12',
    number: 12,
    badge: 'SDG 12',
    name: 'Responsible Consumption & Production',
    shortTitle: 'Sustainable Compute',
    color: '#BF8B2E',
    textColor: '#FFFFFF',
    bgColor: 'rgba(191, 139, 46, 0.12)',
    borderColor: 'rgba(191, 139, 46, 0.35)',
    primaryTarget: 'Target 12.6',
    targetDescription: 'Encourage companies to adopt sustainable practices, green computing, and optimize resource/energy utilization in operations.',
    careerImpactTheme: 'Optimizing GPU clusters, parameter-efficient fine-tuning (PEFT), and sustainable cloud compute.',
    iconName: 'Leaf',
  },
}

export interface RoleSDGMapping {
  roleId: string
  roleName: string
  primarySDGs: SDGId[]
  leadTarget: string
  impactHeadline: string
  contributionNarrative: string
  skillContributions: Array<{
    skill: string
    sdgId: SDGId
    howItHelps: string
  }>
}

export const ROLE_SDG_CATALOG: Record<string, RoleSDGMapping> = {
  fullstack: {
    roleId: 'fullstack',
    roleName: 'Full-Stack Developer',
    primarySDGs: ['sdg-8', 'sdg-9'],
    leadTarget: 'Target 8.2 & 9.4',
    impactHeadline: 'Foundational Digital Architecture & High-Productivity Engineering',
    contributionNarrative:
      'Full-Stack Developers serve as the core engine of digital transformation, creating reliable web services and APIs that modernize business workflows, sustain economic productivity (SDG 8), and maintain resilient national digital infrastructure (SDG 9).',
    skillContributions: [
      { skill: 'TypeScript', sdgId: 'sdg-9', howItHelps: 'Enforces type-safe, maintainable enterprise software architecture.' },
      { skill: 'React', sdgId: 'sdg-8', howItHelps: 'Delivers accessible, high-performance interfaces for productive digital services.' },
      { skill: 'Node.js', sdgId: 'sdg-9', howItHelps: 'Powers scalable backend microservices and API gateways.' },
      { skill: 'PostgreSQL', sdgId: 'sdg-9', howItHelps: 'Ensures durable, ACID-compliant data management for enterprise operations.' },
      { skill: 'REST APIs', sdgId: 'sdg-8', howItHelps: 'Facilitates seamless interoperability across digital economic platforms.' },
    ],
  },
  'llm-app': {
    roleId: 'llm-app',
    roleName: 'LLM App Developer',
    primarySDGs: ['sdg-9', 'sdg-4'],
    leadTarget: 'Target 9.5 & 4.4',
    impactHeadline: 'Democratizing AI Applications & Modern Technical Literacy',
    contributionNarrative:
      'LLM App Developers bridge raw foundation models into accessible workplace copilots, knowledge assistants, and semantic search tools, empowering workforce education and lifelong upskilling (SDG 4) while fostering domestic AI innovation (SDG 9).',
    skillContributions: [
      { skill: 'Prompt Design', sdgId: 'sdg-4', howItHelps: 'Standardizes repeatable AI-assisted problem solving and cognitive augmentation.' },
      { skill: 'RAG', sdgId: 'sdg-4', howItHelps: 'Grounds AI responses in verified educational curricula and trusted company knowledge.' },
      { skill: 'TypeScript', sdgId: 'sdg-9', howItHelps: 'Builds robust client applications around non-deterministic AI endpoints.' },
      { skill: 'Vector Databases', sdgId: 'sdg-9', howItHelps: 'Enables high-speed semantic retrieval across large corpora of enterprise knowledge.' },
    ],
  },
  agentic: {
    roleId: 'agentic',
    roleName: 'Agentic AI Engineer',
    primarySDGs: ['sdg-9', 'sdg-8'],
    leadTarget: 'Target 9.5 & 8.2',
    impactHeadline: 'Autonomous Agentic Innovation & Enterprise Productivity Growth',
    contributionNarrative:
      'Agentic AI Engineers design autonomous, tool-using AI architectures that execute multi-step business logic, dramatically elevating industrial productivity (SDG 8) and propelling regional tech ecosystems to the frontier of generative AI research (SDG 9).',
    skillContributions: [
      { skill: 'LangGraph', sdgId: 'sdg-9', howItHelps: 'Constructs cyclical state machines for self-correcting autonomous agents.' },
      { skill: 'Tool Calling', sdgId: 'sdg-8', howItHelps: 'Automates complex manual enterprise procedures, freeing workers for higher-value tasks.' },
      { skill: 'Agent Evals', sdgId: 'sdg-10', howItHelps: 'Safeguards algorithmic reliability, minimizing hallucinations and unintended biases.' },
      { skill: 'Prompt Design', sdgId: 'sdg-4', howItHelps: 'Structures deterministic system instructions for tool orchestration.' },
    ],
  },
  'multi-agent': {
    roleId: 'multi-agent',
    roleName: 'Multi-Agent Systems Lead',
    primarySDGs: ['sdg-9', 'sdg-8'],
    leadTarget: 'Target 9.5 & 8.2',
    impactHeadline: 'Distributed Collaborative AI & Advanced Automation Ecosystems',
    contributionNarrative:
      'Orchestrating multi-agent ecosystems enables complex collaborative problem-solving across supply chains, medical research, and logistics, advancing scientific industrial capabilities (SDG 9) and creating new high-skilled employment pathways (SDG 8).',
    skillContributions: [
      { skill: 'LangGraph Multi-Agent', sdgId: 'sdg-9', howItHelps: 'Coordinates specialized sub-agents working collaboratively toward complex goals.' },
      { skill: 'Consensus Protocols', sdgId: 'sdg-9', howItHelps: 'Ensures distributed agent reliability and fault-tolerant automated decisioning.' },
      { skill: 'Agent Evals', sdgId: 'sdg-10', howItHelps: 'Ensures equitable, ethical multi-agent behaviors across critical domains.' },
    ],
  },
  embodied: {
    roleId: 'embodied',
    roleName: 'Physical AI & Robotics',
    primarySDGs: ['sdg-9', 'sdg-8'],
    leadTarget: 'Target 9.4 & 8.2',
    impactHeadline: 'Next-Generation Industrial Robotics & Safe Cyber-Physical Automation',
    contributionNarrative:
      'Physical AI engineers fuse generative vision-language-action models with robotics, upgrading national manufacturing facilities (SDG 9) while creating safer, more ergonomic work environments for industrial labor (SDG 8).',
    skillContributions: [
      { skill: 'ROS2', sdgId: 'sdg-9', howItHelps: 'Provides open, resilient robotics middleware for industrial automation.' },
      { skill: 'VLA Models', sdgId: 'sdg-9', howItHelps: 'Applies multimodal foundation models directly to physical sensor-actuator loops.' },
      { skill: 'Safety Guardrails', sdgId: 'sdg-8', howItHelps: 'Protects human workers in collaborative robot (cobot) shared spaces.' },
    ],
  },
  'data-eng': {
    roleId: 'data-eng',
    roleName: 'Data Engineer',
    primarySDGs: ['sdg-9', 'sdg-8'],
    leadTarget: 'Target 9.1 & 8.2',
    impactHeadline: 'Foundational Data Infrastructure & Evidence-Driven Growth',
    contributionNarrative:
      'Data Engineers build the high-availability data backbones that allow public and private institutions to monitor economic indicators, optimize infrastructure utilization, and make evidence-based policy decisions (SDG 9 & SDG 8).',
    skillContributions: [
      { skill: 'Apache Spark', sdgId: 'sdg-9', howItHelps: 'Processes distributed datasets with high fault-tolerance and compute efficiency.' },
      { skill: 'dbt', sdgId: 'sdg-8', howItHelps: 'Transforms business analytics into reliable, documented financial and operational metrics.' },
      { skill: 'Airflow', sdgId: 'sdg-9', howItHelps: 'Automates mission-critical data pipelines with reproducible scheduling.' },
    ],
  },
  'analytics-eng': {
    roleId: 'analytics-eng',
    roleName: 'Analytics Engineer',
    primarySDGs: ['sdg-8', 'sdg-4'],
    leadTarget: 'Target 8.2 & 4.4',
    impactHeadline: 'Transparent Business Intelligence & Workplace Data Literacy',
    contributionNarrative:
      'Analytics Engineers translate complex data warehouses into actionable semantic layers, democratizing institutional knowledge (SDG 4) and enabling businesses to operate with data-driven productivity (SDG 8).',
    skillContributions: [
      { skill: 'SQL & Semantic Models', sdgId: 'sdg-4', howItHelps: 'Creates unified data definitions that democratize reporting access across teams.' },
      { skill: 'dbt Cloud', sdgId: 'sdg-8', howItHelps: 'Improves business analytics delivery velocity and operational clarity.' },
    ],
  },
  'realtime-data': {
    roleId: 'realtime-data',
    roleName: 'Streaming & Realtime Data Lead',
    primarySDGs: ['sdg-9', 'sdg-12'],
    leadTarget: 'Target 9.1 & 12.6',
    impactHeadline: 'Low-Latency Event Streaming & Resource-Optimized Telemetry',
    contributionNarrative:
      'Realtime data architects manage event streams for smart cities, renewable grid monitoring, and transportation networks, reinforcing sustainable infrastructure (SDG 9) and optimizing continuous resource consumption (SDG 12).',
    skillContributions: [
      { skill: 'Apache Kafka', sdgId: 'sdg-9', howItHelps: 'Powers resilient, distributed pub-sub messaging for smart cities and enterprise IoT.' },
      { skill: 'Flink Streaming', sdgId: 'sdg-12', howItHelps: 'Enables event-driven energy and resource monitoring in real time.' },
    ],
  },
  'vector-data': {
    roleId: 'vector-data',
    roleName: 'Vector DB & RAG Architect',
    primarySDGs: ['sdg-9', 'sdg-4'],
    leadTarget: 'Target 9.5 & 4.4',
    impactHeadline: 'Semantic Knowledge Graphs & Scalable Information Retrieval',
    contributionNarrative:
      'Vector database architects power accurate, hallucination-resistant retrieval for educational and enterprise AI, expanding universal access to high-quality information (SDG 4) and upgrading national computational research (SDG 9).',
    skillContributions: [
      { skill: 'Qdrant / Pinecone', sdgId: 'sdg-9', howItHelps: 'Enables millisecond vector search across millions of high-dimensional embeddings.' },
      { skill: 'Hybrid Retrieval', sdgId: 'sdg-4', howItHelps: 'Combines lexical keyword and dense semantic search to surface accurate learning resources.' },
    ],
  },
  'applied-ml': {
    roleId: 'applied-ml',
    roleName: 'Applied ML Engineer',
    primarySDGs: ['sdg-9', 'sdg-8'],
    leadTarget: 'Target 9.5 & 8.2',
    impactHeadline: 'Industrial Machine Learning Deployment & Process Modernization',
    contributionNarrative:
      'Applied ML Engineers turn theoretical AI models into functioning predictive services for healthcare, finance, and manufacturing, elevating technological capability (SDG 9) and driving high-value job creation (SDG 8).',
    skillContributions: [
      { skill: 'PyTorch', sdgId: 'sdg-9', howItHelps: 'Serves as the foundational scientific framework for modern neural network training.' },
      { skill: 'Scikit-Learn', sdgId: 'sdg-8', howItHelps: 'Deploys interpretable predictive algorithms to optimize enterprise resource allocation.' },
    ],
  },
  'eval-engineer': {
    roleId: 'eval-engineer',
    roleName: 'AI Safety & Alignment Engineer',
    primarySDGs: ['sdg-10', 'sdg-9'],
    leadTarget: 'Target 10.2 & 9.5',
    impactHeadline: 'Ethical AI Governance, Algorithmic Fairness & Bias Mitigation',
    contributionNarrative:
      'AI Safety & Alignment Engineers ensure foundation models treat diverse demographics fairly, prevent discriminatory outputs (SDG 10), and protect critical public infrastructure from malicious prompt injections or dangerous hallucinations (SDG 9).',
    skillContributions: [
      { skill: 'Ragas / TruLens', sdgId: 'sdg-10', howItHelps: 'Quantifies faithfulness and detects systematic demographic bias in AI outputs.' },
      { skill: 'NeMo Guardrails', sdgId: 'sdg-9', howItHelps: 'Enforces topical and conversational safety boundaries on enterprise AI endpoints.' },
      { skill: 'Red Teaming', sdgId: 'sdg-10', howItHelps: 'Uncovers adversarial vulnerabilities to protect marginalized communities from harmful automated decisions.' },
    ],
  },
  'fine-tuner': {
    roleId: 'fine-tuner',
    roleName: 'LLM Fine-Tuner & Post-Trainer',
    primarySDGs: ['sdg-12', 'sdg-9'],
    leadTarget: 'Target 12.6 & 9.5',
    impactHeadline: 'Green AI Adaptation via Parameter-Efficient Fine-Tuning (PEFT)',
    contributionNarrative:
      'Fine-tuners leverage LoRA and quantization to adapt models using a fraction of the electricity required for full retraining, pioneering environmentally sustainable green AI practices (SDG 12) while creating custom domain innovations (SDG 9).',
    skillContributions: [
      { skill: 'LoRA / QLoRA', sdgId: 'sdg-12', howItHelps: 'Reduces GPU memory and energy consumption by over 70% during model adaptation.' },
      { skill: 'DPO / RLHF', sdgId: 'sdg-9', howItHelps: 'Aligns model preference distributions with human helpfulness and safety guidelines.' },
    ],
  },
  'research-eng': {
    roleId: 'research-eng',
    roleName: 'Applied AI Research Engineer',
    primarySDGs: ['sdg-9', 'sdg-4'],
    leadTarget: 'Target 9.5 & 4.4',
    impactHeadline: 'Frontier Scientific Discovery & Open-Source Knowledge Advancement',
    contributionNarrative:
      'AI Researchers push the algorithmic boundaries of reasoning, vision, and multilingual comprehension, publishing open weights and scientific literature that accelerate global knowledge sharing (SDG 4) and technological innovation (SDG 9).',
    skillContributions: [
      { skill: 'Transformer Architecture', sdgId: 'sdg-9', howItHelps: 'Advances attention mechanism efficiency for next-generation intelligence.' },
      { skill: 'Synthetic Data Curation', sdgId: 'sdg-4', howItHelps: 'Generates structured mathematical and reasoning benchmarks for open evaluation.' },
    ],
  },
  'ai-pm': {
    roleId: 'ai-pm',
    roleName: 'AI Product Manager',
    primarySDGs: ['sdg-8', 'sdg-10'],
    leadTarget: 'Target 8.2 & 10.2',
    impactHeadline: 'Human-Centric AI Product Strategy & Inclusive Value Creation',
    contributionNarrative:
      'AI Product Managers ensure that advanced AI capabilities solve authentic human problems, promoting ethical deployment, user empowerment, and productive business viability (SDG 8 & SDG 10).',
    skillContributions: [
      { skill: 'AI Product Roadmapping', sdgId: 'sdg-8', howItHelps: 'Directs engineering investment toward measurable, sustainable economic ROI.' },
      { skill: 'Ethical AI Impact Assessments', sdgId: 'sdg-10', howItHelps: 'Assesses societal risks before deploying AI systems to mass consumers.' },
    ],
  },
  'ai-ux': {
    roleId: 'ai-ux',
    roleName: 'AI Interaction Designer',
    primarySDGs: ['sdg-10', 'sdg-4'],
    leadTarget: 'Target 10.2 & 4.4',
    impactHeadline: 'Intuitive AI Interaction & Universal Interface Accessibility',
    contributionNarrative:
      'AI UX Designers invent intuitive interaction paradigms (such as Career Metros, steerable sliders, and explainable citations) that make complex AI systems accessible to non-technical users and learners of all backgrounds (SDG 10 & SDG 4).',
    skillContributions: [
      { skill: 'Explainable AI Interfaces', sdgId: 'sdg-4', howItHelps: 'Translates black-box model decisions into transparent, understandable insights.' },
      { skill: 'Conversational UI Design', sdgId: 'sdg-10', howItHelps: 'Lowers cognitive barriers so users of any digital literacy level can benefit from AI.' },
    ],
  },
  'growth-eng': {
    roleId: 'growth-eng',
    roleName: 'AI Growth Engineer',
    primarySDGs: ['sdg-8', 'sdg-9'],
    leadTarget: 'Target 8.3 & 9.5',
    impactHeadline: 'Product-Led Growth & Digital Economic Scaling',
    contributionNarrative:
      'AI Growth Engineers optimize adoption funnels and user activation for digital services, accelerating the economic footprint of innovative tech startups and small-and-medium enterprises (SDG 8 & SDG 9).',
    skillContributions: [
      { skill: 'A/B Experimentation', sdgId: 'sdg-8', howItHelps: 'Validates product improvements with statistically sound behavioral metrics.' },
      { skill: 'Funnel Optimization', sdgId: 'sdg-8', howItHelps: 'Reduces user onboarding drop-off for critical digital public services.' },
    ],
  },
  'sol-arch': {
    roleId: 'sol-arch',
    roleName: 'Principal AI Solutions Architect',
    primarySDGs: ['sdg-9', 'sdg-8'],
    leadTarget: 'Target 9.4 & 8.2',
    impactHeadline: 'Resilient Cloud Enterprise Architecture & Systemic Modernization',
    contributionNarrative:
      'Solutions Architects design the overarching cloud architectures that integrate AI into legacy enterprise workflows, ensuring business continuity, high security, and sustainable operational growth (SDG 9 & SDG 8).',
    skillContributions: [
      { skill: 'Enterprise Architecture', sdgId: 'sdg-9', howItHelps: 'Architects fault-tolerant, hybrid-cloud solutions for critical national industries.' },
      { skill: 'Security Governance', sdgId: 'sdg-8', howItHelps: 'Safeguards confidential workforce and enterprise records against cyber threats.' },
    ],
  },
  devops: {
    roleId: 'devops',
    roleName: 'Cloud & Platform Engineer',
    primarySDGs: ['sdg-9', 'sdg-8'],
    leadTarget: 'Target 9.1 & 8.2',
    impactHeadline: 'Resilient Infrastructure Platforms & Continuous Delivery',
    contributionNarrative:
      'DevOps and Cloud Engineers maintain the foundational uptime, automated testing, and secure container infrastructure required for a 24/7 digital economy (SDG 9 & SDG 8).',
    skillContributions: [
      { skill: 'Kubernetes', sdgId: 'sdg-9', howItHelps: 'Orchestrates containerized services with automated self-healing and zero-downtime rollouts.' },
      { skill: 'CI/CD Pipelines', sdgId: 'sdg-8', howItHelps: 'Automates software quality gates, accelerating developer velocity and product reliability.' },
      { skill: 'Terraform', sdgId: 'sdg-9', howItHelps: 'Declares reproducible cloud infrastructure as auditable code.' },
    ],
  },
  mlops: {
    roleId: 'mlops',
    roleName: 'MLOps & Infra Engineer',
    primarySDGs: ['sdg-9', 'sdg-12'],
    leadTarget: 'Target 9.4 & 12.6',
    impactHeadline: 'Automated ML Lifecycle & Sustainable Cloud Operations',
    contributionNarrative:
      'MLOps Engineers automate continuous training, drift detection, and inference serving, preventing model degradation while managing cloud resource elasticity to prevent compute waste (SDG 9 & SDG 12).',
    skillContributions: [
      { skill: 'Model Registry', sdgId: 'sdg-9', howItHelps: 'Enables versioned, reproducible model rollbacks for mission-critical deployments.' },
      { skill: 'Drift Monitoring', sdgId: 'sdg-10', howItHelps: 'Catches performance decay and demographic shifts before they harm end-users.' },
      { skill: 'Autoscaling Inference', sdgId: 'sdg-12', howItHelps: 'Scales cloud instances down to zero when idle, saving computational electricity.' },
    ],
  },
  llmops: {
    roleId: 'llmops',
    roleName: 'LLMOps & GPU Cluster Lead',
    primarySDGs: ['sdg-12', 'sdg-9'],
    leadTarget: 'Target 12.6 & 9.4',
    impactHeadline: 'Energy-Efficient GPU Scheduling & Green High-Performance Compute',
    contributionNarrative:
      'GPU Cluster Leads optimize tensor parallelism, memory caching, and batching kernels, drastically cutting the carbon footprint and electricity required to serve large language models at enterprise scale (SDG 12 & SDG 9).',
    skillContributions: [
      { skill: 'vLLM / TensorRT-LLM', sdgId: 'sdg-12', howItHelps: 'Triples inference throughput per GPU Watt through continuous batching and PagedAttention.' },
      { skill: 'Triton Server', sdgId: 'sdg-9', howItHelps: 'Serves multi-model GPU clusters with dynamic scheduling and hardware acceleration.' },
    ],
  },
  secops: {
    roleId: 'secops',
    roleName: 'AI Security & Governance Architect',
    primarySDGs: ['sdg-10', 'sdg-9'],
    leadTarget: 'Target 10.2 & 9.1',
    impactHeadline: 'Data Privacy Protection, AI Firewalls & Digital Sovereignty',
    contributionNarrative:
      'Security Architects protect AI systems against data exfiltration, model inversion attacks, and supply-chain vulnerabilities, safeguarding civic trust and privacy across national AI initiatives (SDG 10 & SDG 9).',
    skillContributions: [
      { skill: 'OWASP Top 10 for LLMs', sdgId: 'sdg-9', howItHelps: 'Hardens applications against prompt injection, insecure output handling, and SSRF.' },
      { skill: 'Differential Privacy', sdgId: 'sdg-10', howItHelps: 'Guarantees that individual candidate and citizen records cannot be extracted from trained models.' },
    ],
  },
}

// ─────────────────────────────────────────────────────────────
// Helper function to resolve SDG for any skill name
// ─────────────────────────────────────────────────────────────
export function getSkillSDG(skillName: string): SDGGoal {
  const s = skillName.toLowerCase()

  // SDG 12: Sustainable Compute & Green AI
  if (
    s.includes('lora') ||
    s.includes('quantization') ||
    s.includes('vllm') ||
    s.includes('gpu') ||
    s.includes('tensorrt') ||
    s.includes('finops') ||
    s.includes('green')
  ) {
    return SDG_GOALS['sdg-12']
  }

  // SDG 10: Safety, Alignment, Ethics, Privacy, UX Accessibility
  if (
    s.includes('eval') ||
    s.includes('safety') ||
    s.includes('guardrail') ||
    s.includes('bias') ||
    s.includes('alignment') ||
    s.includes('privacy') ||
    s.includes('security') ||
    s.includes('ux') ||
    s.includes('human')
  ) {
    return SDG_GOALS['sdg-10']
  }

  // SDG 9: High-Tech Innovation, AI Frameworks, Distributed Systems
  if (
    s.includes('agent') ||
    s.includes('langgraph') ||
    s.includes('pytorch') ||
    s.includes('model') ||
    s.includes('neural') ||
    s.includes('vector') ||
    s.includes('kubernetes') ||
    s.includes('kafka') ||
    s.includes('spark') ||
    s.includes('infra') ||
    s.includes('architecture') ||
    s.includes('ros')
  ) {
    return SDG_GOALS['sdg-9']
  }

  // SDG 4: Education, Prompt Design, RAG, Documentation, Coursework
  if (
    s.includes('prompt') ||
    s.includes('rag') ||
    s.includes('learn') ||
    s.includes('course') ||
    s.includes('tutorial') ||
    s.includes('academic') ||
    s.includes('literacy')
  ) {
    return SDG_GOALS['sdg-4']
  }

  // SDG 8: Default for Software Engineering, Product, Databases & Development
  return SDG_GOALS['sdg-8']
}

// ─────────────────────────────────────────────────────────────
// Helper function to resolve SDG mapping for any station/role
// ─────────────────────────────────────────────────────────────
export function getStationSDGMapping(stationId: string, stationName?: string): RoleSDGMapping {
  if (ROLE_SDG_CATALOG[stationId]) {
    return ROLE_SDG_CATALOG[stationId]
  }

  // Fallback for custom or unlisted station
  return {
    roleId: stationId,
    roleName: stationName || 'Technology Specialist',
    primarySDGs: ['sdg-8', 'sdg-9'],
    leadTarget: 'Target 8.5 & Target 9.4',
    impactHeadline: 'Advancing High-Value Tech Employment & Digital Transformation',
    contributionNarrative:
      'Pursuing this specialized technical career accelerates workforce resilience against automation while expanding local enterprise capabilities in digital systems and software innovation.',
    skillContributions: [
      { skill: 'Core Competency', sdgId: 'sdg-8', howItHelps: 'Contributes to resilient employment in high-demand technical sectors.' },
      { skill: 'Technical Execution', sdgId: 'sdg-9', howItHelps: 'Upgrades the operational maturity of modern digital products.' },
    ],
  }
}
