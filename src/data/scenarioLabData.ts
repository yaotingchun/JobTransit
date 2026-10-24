/**
 * Evidence Sources, Scenarios, and Baseline Mappings for Future Scenario Lab
 * Grounded in DOSM, MOHR, WEF, ILO, and JobTransit Empirical Indices
 */

import type {
  ScenarioDefinition,
  EvidenceSourceItem,
  SDGMappingItem,
  NormalizedSimulationReport,
} from '../types/scenarioLab.ts'

export const SCENARIO_DEFINITIONS: Record<string, ScenarioDefinition> = {
  baseline_adoption: {
    id: 'baseline_adoption',
    name: 'Scenario 1: Baseline AI Adoption',
    subtitle: 'Gradual enterprise integration & organic skills progression',
    description:
      'AI tools and code assistants continue along a defined moderate adoption trajectory. Employers integrate copilot models into existing delivery pipelines without dismantling organizational hierarchies. Skills demand evolves progressively over the 5-year forecast horizon.',
    assumptions: [
      'Enterprise AI adoption grows at historical enterprise SaaS CAGR (18-22% annually).',
      'Regulatory policies establish clear compliance guardrails, moderating full autonomous agent delegation.',
      'Roles are predominantly augmented rather than eliminated, with entry-level requisitions experiencing mild contractions.',
    ],
    adoptionSpeed: 'Moderate',
    primaryDriver: 'Incremental productivity enhancements within standard organizational units',
    riskProfile: 'Balanced',
  },
  accelerated_automation: {
    id: 'accelerated_automation',
    name: 'Scenario 2: Accelerated AI Automation',
    subtitle: 'Autonomous agent delegation & compressed talent hierarchies',
    description:
      'Multi-agent workflow orchestration (OASIS/MCP) achieves rapid enterprise reliability. Routine implementation, boilerplate synthesis, and standard code generation become heavily automated. Employer hiring contracts sharply toward architecture, security auditing, and human oversight.',
    assumptions: [
      'Agentic workflow deployment accelerates by 3.5x over baseline projections.',
      'Enterprise teams compress junior headcount requirements by 40-50% in favor of AI-augmented senior engineers.',
      'Speed-to-market demands push legacy tech stacks out significantly faster than historical turnover rates.',
    ],
    adoptionSpeed: 'Rapid',
    primaryDriver: 'High-leverage autonomous agent orchestration and automated task execution',
    riskProfile: 'High Displacement',
  },
  human_ai_collaboration: {
    id: 'human_ai_collaboration',
    name: 'Scenario 3: Human-AI Collaboration',
    subtitle: 'Symbiotic augmentation, institutional reskilling & domain mastery',
    description:
      'Employers, universities, and policymakers prioritize symbiotic workforce augmentation. State-backed retraining programs (e.g. HRD Corp Malaysia) co-fund AI literacy. Value shifts decisively toward domain reasoning, human empathy, system reliability, and ethical governance.',
    assumptions: [
      'Active tripartite cooperation (Employers, Government, Universities) funds structured vocational upskilling.',
      'Technological productivity gains are redistributed into new product lines, expanding overall talent demand.',
      'Human-in-the-loop governance is legally mandated for high-impact decision systems.',
    ],
    adoptionSpeed: 'Collaborative',
    primaryDriver: 'Institutional reskilling, human-centric design, and domain-governed augmentation',
    riskProfile: 'Skills Redistribution',
  },
}

export const EVIDENCE_SOURCES: EvidenceSourceItem[] = [
  {
    name: 'Department of Statistics Malaysia (DOSM) ICT Satellite Account',
    publisher: 'Department of Statistics Malaysia',
    publicationDate: 'October 2024 (Annual Release)',
    geographicalCoverage: 'Malaysia (National)',
    keyRelevantDataPoint: 'ICT sector contributed 23.5% to national GDP; digital employment expanded to 1.24M skilled personnel with 4.8% YoY growth in technical subsectors.',
    assumptions: 'Assumes sustained macroeconomic stability and national digital economy blueprint (MyDIGITAL) execution.',
  },
  {
    name: 'Critical Occupations List (COL) 2024/2025',
    publisher: 'TalentCorp & Ministry of Human Resources Malaysia (MOHR)',
    publicationDate: 'December 2024',
    geographicalCoverage: 'Malaysia (Peninsular & East Malaysia)',
    keyRelevantDataPoint: 'Identifies Software Developers, Data Engineers, and Cybersecurity Specialists as tier-1 acute shortage occupations nationwide.',
    assumptions: 'Based on surveyed industry employers and national labor demand indicators across GLCs and multinational corporations.',
  },
  {
    name: 'World Economic Forum (WEF) Future of Jobs Report 2025/2026',
    publisher: 'World Economic Forum',
    publicationDate: 'January 2025',
    geographicalCoverage: 'Global (803 companies across 45 economies)',
    keyRelevantDataPoint: 'Estimates 44% of workers core skills will be disrupted by 2027; analytical thinking and technological literacy rank as top priority competencies.',
    assumptions: 'Considers cross-industry survey of global HR leaders and quantitative macroeconomic econometric forecasting models.',
  },
  {
    name: 'International Labour Organization (ILO) Generative AI Policy Brief',
    publisher: 'International Labour Organization',
    publicationDate: 'August 2024',
    geographicalCoverage: 'Global / Emerging Markets',
    keyRelevantDataPoint: 'Concludes Generative AI has higher potential for task augmentation than direct occupational destruction, but warns of severe entry-level barrier escalation.',
    assumptions: 'Analyzes task-level decomposition across ISCO-08 occupational classifications.',
  },
  {
    name: 'JobTransit 210,000+ LinkedIn Live & 24h Replenishment Index',
    publisher: 'JobTransit Market Telemetry Engine',
    publicationDate: 'Live 2026 Ingestion (&f_TPR=r86400)',
    geographicalCoverage: 'Worldwide & ASEAN Regional Tech Hubs',
    keyRelevantDataPoint: '38.6% average 24h hiring velocity; 17,000+ daily postings requiring autonomous agent frameworks and Model Context Protocol (MCP).',
    assumptions: 'Ingests external publicly searchable LinkedIn postings; internal stealth hiring and non-indexed mobility excluded.',
  },
]

export const CORE_SDG_MAPPINGS: SDGMappingItem[] = [
  {
    sdgNumber: 4,
    sdgName: 'Quality Education',
    targetCode: 'Target 4.4',
    targetDescription:
      'Substantially increase the number of youth and adults who have relevant skills, including technical and vocational skills, for employment, decent jobs and entrepreneurship.',
    connectionRationale:
      'Future Scenario Lab provides actionable, structured reskilling pathways that translate simulated AI market disruptions into transparent learning milestones, preventing graduate obsolescence.',
  },
  {
    sdgNumber: 8,
    sdgName: 'Decent Work and Economic Growth',
    targetCode: 'Target 8.5 & 8.6',
    targetDescription:
      'Achieve full and productive employment and decent work for all; substantially reduce the proportion of youth not in employment, education or training.',
    connectionRationale:
      'By simulating employer behavior and skills demand shifts under varying AI trajectories, the platform empowers workers to navigate transitions proactively, safeguarding sustainable livelihoods.',
  },
  {
    sdgNumber: 9,
    sdgName: 'Industry, Innovation and Infrastructure',
    targetCode: 'Target 9.5',
    targetDescription:
      'Enhance scientific research, upgrade technological capabilities of industrial sectors, and foster domestic technology development.',
    connectionRationale:
      'Aligns technical workforce capabilities with high-value digital infrastructure (agentic workflows, cloud orchestration, model sandboxing) to advance regional tech innovation.',
  },
  {
    sdgNumber: 10,
    sdgName: 'Reduced Inequalities',
    targetCode: 'Target 10.2',
    targetDescription:
      'Empower and promote the social, economic and political inclusion of all, irrespective of age, sex, disability, race, ethnicity, origin, religion or economic or other status.',
    connectionRationale:
      'Democratizes career intelligence through free/low-cost learning pathway recommendations, leveling the playing field for non-traditional candidates against high entry-level barrier shifts.',
  },
]

/**
 * Pre-computed high-fidelity simulation reports for Demo / Replay Mode
 * Allows zero-cost, instant demonstrations without external API dependencies.
 */
export const DEMO_SIMULATION_REPORTS: Record<string, NormalizedSimulationReport> = {
  'software-developer_accelerated_automation': {
    simulationId: 'sim-demo-sw-dev-accelerated-01',
    occupation: 'Software Developer',
    country: 'Malaysia',
    forecastHorizon: 2030,
    scenario: 'accelerated_automation',
    scenarioName: 'Accelerated AI Automation',
    status: 'completed',
    completedAt: '2026-10-25T03:00:00.000Z',
    isDemoReplay: true,
    summary:
      'In an accelerated AI automation scenario, standard boilerplate frontend and CRUD service generation are predominantly handled by autonomous agents. Employer agents across the simulation demonstrated an aggressive shift toward "Reviewer & Architect" profiles: junior positions required proof of AI tool orchestration, while demand surged for multi-agent reliability, system boundaries, and security sandboxing.',
    quantitativeBaseline: {
      totalOpenings2026: 35000,
      past24hVelocityRate: 48.6,
      aiTaskExposureScore: 68,
      entryLevelScore: 32,
    },
    findings: [
      {
        topic: 'task_transformation',
        title: 'Bifurcation of Engineering Hours: Boilerplate Down 75%, System Auditing Up 60%',
        finding:
          'Simulated employer and lead engineer agents delegated routine syntax generation, unit test skeletons, and schema migration scripting to agent swarms, reallocating 60% of senior capacity to contract validation and failure mode analysis.',
        supportingEvidence: [
          'JobTransit LinkedIn Telemetry: 17,000+ daily requisitions demanding Model Context Protocol (MCP) and agent loop governance.',
          'ILO Policy Brief 2024: Cognitive task augmentation disproportionately accelerates repetitive code authoring.',
        ],
        interpretation:
          'Engineers do not write fewer lines of product code; they orchestrate and evaluate 5x to 10x larger codebases produced by autonomous systems.',
        limitations: [
          'Assumes compiler and sandbox tool integrations remain stable in high-throughput enterprise monorepos.',
        ],
      },
      {
        topic: 'hiring_standards',
        title: 'Entry-Level Gatekeeping Escalation: The "Junior Squeeze"',
        finding:
          '65% of employer agents paused standalone entry-level junior listings that lacked autonomous agent tooling proof, raising the minimum prerequisite from basic syntax familiarity to deployed portfolio agent applications.',
        supportingEvidence: [
          'DOSM ICT Satellite Account: Technical recruitment shifted towards mid-level candidates with demonstrated deployment capabilities.',
          'JobTransit Entry-Level Score: 24/100 (Senior-weighted barrier).',
        ],
        interpretation:
          'Graduates who only understand manual syntax without AI workflow leverage face significant initial clearance friction.',
        limitations: [
          'Government subsidies or university-industry capstone partnerships could soften barrier severity in GLC environments.',
        ],
      },
      {
        topic: 'skill_demand',
        title: 'Model Context Protocol (MCP) & Sandboxing Emerge as Tier-1 Core Requirements',
        finding:
          'Agentic tool integration protocols (MCP) overtook legacy framework-specific memorization in hiring priority across simulated enterprise agents.',
        supportingEvidence: [
          'LinkedIn Live Index: MCP mentions surged by +48.6% in past 24h job postings.',
        ],
        interpretation:
          'Standardizing how models talk to enterprise databases, tools, and operating systems is the new architectural foundation.',
        limitations: [
          'Protocol standardization is actively evolving; proprietary tooling may temporarily introduce ecosystem fragmentation.',
        ],
      },
    ],
    changingTasks: [
      {
        task: 'Boilerplate REST / CRUD Endpoint Generation',
        category: 'automated',
        changeDescription: 'Synthesized near-instantaneously via LLM copilot models from OpenAPI schemas.',
        expectedTimeShiftPct: -80,
        humanOversightLevel: 'Periodic',
      },
      {
        task: 'Unit & Regression Test Suite Drafting',
        category: 'automated',
        changeDescription: 'Agentic test generators create boundary condition coverage automatically in sandboxes.',
        expectedTimeShiftPct: -70,
        humanOversightLevel: 'Periodic',
      },
      {
        task: 'Model Context Protocol (MCP) Server Implementation',
        category: 'assisted',
        changeDescription: 'Connecting proprietary enterprise databases and tools to LLM agent interfaces.',
        expectedTimeShiftPct: 45,
        humanOversightLevel: 'Critical',
      },
      {
        task: 'Multi-Agent Consensus, Deadlock & Safety Governance',
        category: 'human_core',
        changeDescription: 'Architecting resilient fallbacks, rate-limiting loops, and non-deterministic error handling.',
        expectedTimeShiftPct: 65,
        humanOversightLevel: 'Critical',
      },
      {
        task: 'Production EvalOps & Regulatory Compliance Verification',
        category: 'human_core',
        changeDescription: 'Auditing outputs for privacy, hallucination drift, and Malaysian PDPA / AI governance standards.',
        expectedTimeShiftPct: 80,
        humanOversightLevel: 'Critical',
      },
    ],
    emergingSkills: [
      {
        skillName: 'Model Context Protocol (MCP)',
        category: 'AI & Frameworks',
        trajectory: 'surging',
        importanceScore: 96,
        rationale: 'Universal standard for connecting external tools and data sources to autonomous AI agents.',
        alignsWithExistingTaxonomy: true,
        jobTransitSkillId: 'mcp-protocol',
      },
      {
        skillName: 'Agent Orchestration (LangGraph / Statecharts)',
        category: 'AI & Frameworks',
        trajectory: 'surging',
        importanceScore: 92,
        rationale: 'Managing cyclical stateful agent executions, memory persistence, and tool dispatch.',
        alignsWithExistingTaxonomy: true,
        jobTransitSkillId: 'langgraph-agents',
      },
      {
        skillName: 'Security Sandboxing & Isolation (Docker / eBPF)',
        category: 'Cloud & Infra',
        trajectory: 'surging',
        importanceScore: 88,
        rationale: 'Executing untrusted model-generated code safely without host system compromise.',
        alignsWithExistingTaxonomy: true,
        jobTransitSkillId: 'sandbox-security',
      },
      {
        skillName: 'Manual CSS Boilerplate Authoring',
        category: 'Language / Styling',
        trajectory: 'deprecating',
        importanceScore: 28,
        rationale: 'Nearly 100% automated by modern multimodal vision and code generation copilots.',
        alignsWithExistingTaxonomy: true,
        jobTransitSkillId: 'css-manual',
      },
    ],
    stakeholderBehaviors: [
      {
        stakeholderGroup: 'Employers',
        simulatedAction: 'Restructured development squads from 8 generalists to 3 high-leverage AI orchestrators paired with agent tooling.',
        keySentiment: 'Demand for extreme architectural rigor; zero tolerance for unverified code hallucination.',
        tensionPoint: 'Balancing rapid delivery velocity against security vulnerability accumulation in AI-generated pull requests.',
      },
      {
        stakeholderGroup: 'Workers & Graduates',
        simulatedAction: 'Mid-career engineers adapted by taking on system boundary ownership; junior graduates struggled without public portfolio agent builds.',
        keySentiment: 'Anxiety over entry-level clearance; high appetite for guided reskilling pathways.',
        tensionPoint: 'Lack of opportunities to learn fundamental debugging when copilot handles first-draft generation.',
      },
      {
        stakeholderGroup: 'Universities & Bootcamps',
        simulatedAction: 'Revised computer science curricula to integrate prompt engineering, eval frameworks, and agent design in Year 2.',
        keySentiment: 'Urgent recognition that teaching purely manual syntax is insufficient for 2026+ employment.',
        tensionPoint: 'Slow academic syllabus accreditation cycles relative to 6-month AI tooling advancements.',
      },
      {
        stakeholderGroup: 'Policymakers',
        simulatedAction: 'Expanded HRD Corp claimable courses for AI Agent Architecture and established National AI Ethics benchmarks.',
        keySentiment: 'Commitment to safeguarding national tech employment while accelerating digital GDP contribution.',
        tensionPoint: 'Navigating ethical liability when autonomous agent workflows trigger production errors.',
      },
    ],
    reskillingRecommendations: [
      {
        stage: 1,
        milestoneTitle: 'AI-Augmented Development Mastery',
        focusSkills: ['Copilot/Cursor Workflow Optimization', 'Test-Driven Prompting', 'API Contract Design'],
        recommendedAction: 'Transition from manual code writing to declarative architecture and rapid verification loops.',
        estimatedTimeToAttain: '3 to 6 weeks',
        crossScenarioRobustness: 'High',
        relevantSDG: 'SDG 4 (Target 4.4)',
      },
      {
        stage: 2,
        milestoneTitle: 'Model Context Protocol (MCP) & Agent Architecture',
        focusSkills: ['Model Context Protocol (MCP)', 'LangGraph / Statecharts', 'Vector DB Retrieval'],
        recommendedAction: 'Build and deploy full-stack agent tools that query live databases and execute actions deterministically.',
        estimatedTimeToAttain: '6 to 10 weeks',
        crossScenarioRobustness: 'High',
        relevantSDG: 'SDG 8 (Target 8.5)',
      },
      {
        stage: 3,
        milestoneTitle: 'Production EvalOps & Systems Sandboxing',
        focusSkills: ['EvalOps Benchmarking', 'Docker Sandboxing', 'Malaysian PDPA & AI Governance'],
        recommendedAction: 'Implement automated red-teaming and compliance pipelines to audit AI outputs in production.',
        estimatedTimeToAttain: '8 to 12 weeks',
        crossScenarioRobustness: 'High',
        relevantSDG: 'SDG 9 (Target 9.5)',
      },
    ],
    sdgMappings: CORE_SDG_MAPPINGS,
    sources: EVIDENCE_SOURCES,
    assumptions: [
      'Multi-agent systems achieve 99.5% execution reliability in sandboxed container environments.',
      'Enterprises maintain strict data governance, rejecting cloud models that fail privacy compliance.',
      'Historical survey datasets (WEF, DOSM) serve as quantitative baseline bounds.',
    ],
    limitations: [
      'Multi-agent simulations model emergent stakeholder sentiment and strategic tendencies, not deterministic future facts.',
      'Agent interaction outcomes reflect configured persona constraints and seed evidence parameters.',
      'Cost and token usage metrics represent benchmarked estimates under Gemini 2.5 Flash pricing.',
    ],
    tokenUsage: {
      promptTokens: 4820,
      completionTokens: 1450,
      totalTokens: 6270,
    },
    estimatedCostUSD: 0.0019,
    costNote: 'Calculated using Google Gemini 2.5 Flash standard API rates ($0.075 / 1M input tokens, $0.30 / 1M output tokens).',
  },
}
