// ─────────────────────────────────────────────────────────────
//  JobTransit · Career Metro data model
//  Strict octilinear grid (0°, 45°, 90°) with generous vertical channels
// ─────────────────────────────────────────────────────────────

export type LineId = 'amber' | 'emerald' | 'violet' | 'sky' | 'rose'
export type EdgeLine = LineId | 'walk'
export type LabelPos = 'n' | 's' | 'e' | 'w'

export const MAP_W = 1160
export const MAP_H = 640

export interface MetroLine {
  id: LineId
  code: string
  name: string
  color: string
  tagline: string
}

export const LINES: Record<LineId, MetroLine> = {
  amber: { id: 'amber', code: 'A', name: 'Agent Line', color: '#F59E0B', tagline: 'Autonomous agents & tool-using LLMs' },
  emerald: { id: 'emerald', code: 'D', name: 'Data Line', color: '#10B981', tagline: 'Pipelines, platforms & streaming' },
  violet: { id: 'violet', code: 'I', name: 'Intelligence Line', color: '#8B5CF6', tagline: 'Models, training & applied ML' },
  sky: { id: 'sky', code: 'P', name: 'Product Line', color: '#0EA5E9', tagline: 'AI-native product building' },
  rose: { id: 'rose', code: 'C', name: 'Cloud Line', color: '#F43F5E', tagline: 'Infra, reliability & MLOps' },
}

export const LINE_ORDER: LineId[] = ['amber', 'emerald', 'violet', 'sky', 'rose']

export interface MarketSignal {
  skillFit: number
  preference: number
  market: number
  demandDelta: number // % change QoQ in postings
  trend: number[] // sparkline (8 weeks)
  notes: string[]
}

export interface StationCallout {
  x: number
  y: number
  side: 'top' | 'bottom' | 'left' | 'right'
}

export interface Station {
  id: string
  code: string
  name: string
  label: string[]
  x: number
  y: number
  lines: LineId[]
  labelPos: LabelPos
  kind: 'origin' | 'stop' | 'interchange' | 'terminus'
  fit: number
  months: number
  xp: number
  salary: string
  skillsHave: string[]
  skillsGap: string[]
  blurb: string
  locked?: boolean
  topRank?: 1 | 2 | 3
  signal?: MarketSignal
  callout?: StationCallout
}

export const ORIGIN_ID = 'fullstack'

export const STATIONS: Station[] = [
  // ── Origin Hub ──
  {
    id: 'fullstack',
    code: 'HUB-01',
    name: 'Full-Stack Developer',
    label: ['FULL-STACK', 'DEVELOPER'],
    x: 130,
    y: 340,
    lines: ['amber', 'emerald', 'sky', 'rose'],
    labelPos: 'w',
    kind: 'origin',
    fit: 100,
    months: 0,
    xp: 0,
    salary: 'RM 7.5k – 10k',
    skillsHave: ['TypeScript', 'React', 'Node.js', 'REST APIs', 'PostgreSQL'],
    skillsGap: [],
    blurb: 'Your current platform. All major network lines originate here.',
  },

  // ── Amber: Agent Line (Runs along y = 190) ──
  {
    id: 'llm-app',
    code: 'A-02',
    name: 'LLM App Developer',
    label: ['LLM APP', 'DEVELOPER'],
    x: 310,
    y: 190,
    lines: ['amber'],
    labelPos: 'n',
    kind: 'stop',
    fit: 84,
    months: 3,
    xp: 180,
    salary: 'RM 9k – 12k',
    skillsHave: ['TypeScript', 'REST APIs', 'React'],
    skillsGap: ['Prompt Design', 'RAG'],
    blurb: 'Ship chat, semantic search and copilots on top of foundation models.',
  },
  {
    id: 'agentic',
    code: 'A-03',
    name: 'Agentic AI Engineer',
    label: ['AGENTIC AI', 'ENGINEER'],
    x: 590,
    y: 190,
    lines: ['amber'],
    labelPos: 's',
    kind: 'stop',
    fit: 78,
    months: 4,
    xp: 450,
    salary: 'RM 12k – 18k',
    skillsHave: ['TypeScript', 'Node.js', 'REST APIs', 'Prompt Design'],
    skillsGap: ['LangGraph', 'Tool Calling', 'Agent Evals'],
    blurb: 'Architect autonomous multi-step agents that plan, call tools and self-correct.',
    topRank: 1,
    callout: { x: 590, y: 110, side: 'top' },
    signal: {
      skillFit: 78,
      preference: 86,
      market: 93,
      demandDelta: 34,
      trend: [38, 41, 44, 52, 58, 63, 71, 80],
      notes: [
        'Agent-framework job posts up 34% QoQ across APAC',
        'Hermes 3 release makes open function-calling models production-ready',
        'Matches your preference: "build products end-to-end"',
      ],
    },
  },
  {
    id: 'multi-agent',
    code: 'A-04',
    name: 'Multi-Agent Systems Lead',
    label: ['MULTI-AGENT', 'SYSTEMS LEAD'],
    x: 820,
    y: 190,
    lines: ['amber'],
    labelPos: 'n',
    kind: 'stop',
    fit: 61,
    months: 8,
    xp: 620,
    salary: 'RM 18k – 25k',
    skillsHave: ['Node.js'],
    skillsGap: ['Orchestration', 'Agent Evals', 'Team Leadership', 'Distributed Systems'],
    blurb: 'Lead engineering teams deploying swarms of cooperating specialized agents.',
    locked: true,
  },
  {
    id: 'ai-platform',
    code: 'A-05',
    name: 'AI Platform Architect',
    label: ['AI PLATFORM', 'ARCHITECT'],
    x: 1040,
    y: 110,
    lines: ['amber'],
    labelPos: 'e',
    kind: 'terminus',
    fit: 52,
    months: 12,
    xp: 900,
    salary: 'RM 25k+',
    skillsHave: ['PostgreSQL'],
    skillsGap: ['System Design', 'GPU Infra', 'Governance', 'Cost Modelling'],
    blurb: 'Own the enterprise AI platform: model gateways, routing and security guardrails.',
    locked: true,
  },

  // ── Emerald: Data Line (Runs along y = 340 then branches to y = 430) ──
  {
    id: 'backend',
    code: 'D-02',
    name: 'Backend Engineer',
    label: ['BACKEND', 'ENGINEER'],
    x: 360,
    y: 340,
    lines: ['emerald', 'violet'],
    labelPos: 's',
    kind: 'interchange',
    fit: 88,
    months: 2,
    xp: 120,
    salary: 'RM 8k – 11k',
    skillsHave: ['Node.js', 'PostgreSQL', 'REST APIs'],
    skillsGap: ['Queues & Streams'],
    blurb: 'Major central interchange — transfer to the Violet Intelligence Line here.',
  },
  {
    id: 'data-eng',
    code: 'D-03',
    name: 'Data Engineer',
    label: ['DATA', 'ENGINEER'],
    x: 570,
    y: 340,
    lines: ['emerald'],
    labelPos: 's',
    kind: 'stop',
    fit: 74,
    months: 4,
    xp: 260,
    salary: 'RM 10k – 14k',
    skillsHave: ['PostgreSQL', 'Node.js'],
    skillsGap: ['Python', 'dbt', 'Spark'],
    blurb: 'Model, move and govern high-throughput data that feeds enterprise AI systems.',
  },
  {
    id: 'pipeline',
    code: 'D-04',
    name: 'Data Pipeline Engineer',
    label: ['DATA PIPELINE', 'ENGINEER'],
    x: 780,
    y: 430,
    lines: ['emerald'],
    labelPos: 'n',
    kind: 'stop',
    fit: 72,
    months: 4,
    xp: 400,
    salary: 'RM 11k – 16k',
    skillsHave: ['PostgreSQL', 'Node.js', 'REST APIs'],
    skillsGap: ['Airflow', 'Kafka', 'Python', 'Vector DBs'],
    blurb: 'Build the low-latency streaming and vector pipelines behind RAG and analytics.',
    topRank: 2,
    callout: { x: 780, y: 510, side: 'bottom' },
    signal: {
      skillFit: 72,
      preference: 70,
      market: 82,
      demandDelta: 18,
      trend: [50, 52, 51, 55, 58, 60, 62, 66],
      notes: [
        'RAG adoption driving demand for vector-ready pipelines (+18%)',
        'High skill synergy with your PostgreSQL & Node.js backend history',
        'High organizational stability with continuous hiring volume',
      ],
    },
  },
  {
    id: 'mlops',
    code: 'D-05',
    name: 'MLOps Engineer',
    label: ['MLOPS', 'ENGINEER'],
    x: 940,
    y: 430,
    lines: ['emerald', 'rose'],
    labelPos: 'n',
    kind: 'interchange',
    fit: 63,
    months: 5,
    xp: 480,
    salary: 'RM 13k – 18k',
    skillsHave: ['Node.js'],
    skillsGap: ['Kubernetes', 'MLflow', 'Model Serving'],
    blurb: 'Eastern interchange linking Data & Cloud networks. Keep models robust in production.',
  },
  {
    id: 'data-platform',
    code: 'D-06',
    name: 'Data Platform Lead',
    label: ['DATA PLATFORM', 'LEAD'],
    x: 1070,
    y: 430,
    lines: ['emerald'],
    labelPos: 'e',
    kind: 'terminus',
    fit: 55,
    months: 9,
    xp: 760,
    salary: 'RM 20k+',
    skillsHave: ['PostgreSQL'],
    skillsGap: ['Lakehouse', 'Data Mesh', 'Leadership'],
    blurb: 'Shape overall data architecture and governance for high-scale organizations.',
    locked: true,
  },

  // ── Violet: Intelligence Line (Runs along y = 260) ──
  {
    id: 'ml-eng',
    code: 'I-02',
    name: 'ML Engineer',
    label: ['ML', 'ENGINEER'],
    x: 480,
    y: 260,
    lines: ['violet'],
    labelPos: 'n',
    kind: 'stop',
    fit: 66,
    months: 4,
    xp: 300,
    salary: 'RM 11k – 15k',
    skillsHave: ['REST APIs'],
    skillsGap: ['Python', 'PyTorch', 'Feature Stores'],
    blurb: 'Train, evaluate and deploy machine learning models with rigorous engineering standards.',
  },
  {
    id: 'ai-eng',
    code: 'I-03',
    name: 'AI Engineer',
    label: ['AI', 'ENGINEER'],
    x: 740,
    y: 260,
    lines: ['violet'],
    labelPos: 's',
    kind: 'stop',
    fit: 68,
    months: 4,
    xp: 420,
    salary: 'RM 12k – 17k',
    skillsHave: ['TypeScript', 'REST APIs', 'Prompt Design'],
    skillsGap: ['Python', 'Fine-tuning', 'Evals', 'Embeddings', 'PyTorch'],
    blurb: 'Blend frontier models, contextual retrieval and UX into high-impact user experiences.',
    topRank: 3,
    callout: { x: 740, y: 140, side: 'top' },
    signal: {
      skillFit: 68,
      preference: 80,
      market: 88,
      demandDelta: 27,
      trend: [44, 46, 50, 49, 57, 61, 64, 72],
      notes: [
        'AI Engineer positions grew 27% QoQ across global tech companies',
        'Python is your primary bridgeskill — closing it opens full ML stack',
        'Strong match for your desire to work with leading-edge generative tech',
      ],
    },
  },
  {
    id: 'ai-research',
    code: 'I-04',
    name: 'AI Research Engineer',
    label: ['AI RESEARCH', 'ENGINEER'],
    x: 1040,
    y: 260,
    lines: ['violet'],
    labelPos: 'e',
    kind: 'terminus',
    fit: 41,
    months: 14,
    xp: 950,
    salary: 'RM 20k+',
    skillsHave: [],
    skillsGap: ['Linear Algebra', 'Papers → Code', 'Distributed Training', 'CUDA'],
    blurb: 'Advance model architectures and fundamental reasoning at research labs.',
    locked: true,
  },

  // ── Sky: Product Line (Runs along y = 490) ──
  {
    id: 'frontend-lead',
    code: 'P-02',
    name: 'Frontend Lead',
    label: ['FRONTEND', 'LEAD'],
    x: 310,
    y: 490,
    lines: ['sky'],
    labelPos: 's',
    kind: 'stop',
    fit: 90,
    months: 3,
    xp: 140,
    salary: 'RM 10k – 13k',
    skillsHave: ['React', 'TypeScript'],
    skillsGap: ['Mentoring', 'Design Systems'],
    blurb: 'Lead UI architecture and mentor frontend developers building complex client apps.',
  },
  {
    id: 'ai-product-eng',
    code: 'P-03',
    name: 'AI Product Engineer',
    label: ['AI PRODUCT', 'ENGINEER'],
    x: 500,
    y: 490,
    lines: ['sky'],
    labelPos: 's',
    kind: 'stop',
    fit: 76,
    months: 3,
    xp: 280,
    salary: 'RM 11k – 15k',
    skillsHave: ['React', 'TypeScript', 'Node.js'],
    skillsGap: ['Streaming UX', 'Prompt Design'],
    blurb: 'Craft next-gen AI interfaces: real-time streaming, human-in-the-loop, and dynamic canvas UI.',
  },
  {
    id: 'ai-pm',
    code: 'P-04',
    name: 'AI Product Manager',
    label: ['AI PRODUCT', 'MANAGER'],
    x: 660,
    y: 490,
    lines: ['sky'],
    labelPos: 's',
    kind: 'terminus',
    fit: 58,
    months: 6,
    xp: 380,
    salary: 'RM 13k – 19k',
    skillsHave: ['REST APIs'],
    skillsGap: ['Discovery', 'AI Metrics', 'Roadmapping'],
    blurb: 'Define what AI products should solve and measure business efficacy and safety.',
  },

  // ── Rose: Cloud Line (Runs down to y = 570 then climbs to mlops) ──
  {
    id: 'devops',
    code: 'C-02',
    name: 'DevOps Engineer',
    label: ['DEVOPS', 'ENGINEER'],
    x: 130,
    y: 480,
    lines: ['rose'],
    labelPos: 'w',
    kind: 'stop',
    fit: 70,
    months: 3,
    xp: 160,
    salary: 'RM 9k – 12k',
    skillsHave: ['Node.js'],
    skillsGap: ['Docker', 'CI/CD pipelines'],
    blurb: 'Automate build pipelines, containerized deployments and reliable developer velocity.',
  },
  {
    id: 'cloud',
    code: 'C-03',
    name: 'Cloud Engineer',
    label: ['CLOUD', 'ENGINEER'],
    x: 420,
    y: 570,
    lines: ['rose'],
    labelPos: 's',
    kind: 'stop',
    fit: 64,
    months: 4,
    xp: 240,
    salary: 'RM 10k – 14k',
    skillsHave: ['PostgreSQL'],
    skillsGap: ['AWS/GCP', 'Terraform', 'VPC Networking'],
    blurb: 'Design resilient multi-region cloud infrastructure and automated IaC blueprints.',
  },
  {
    id: 'sre',
    code: 'C-04',
    name: 'Platform SRE',
    label: ['PLATFORM', 'SRE'],
    x: 680,
    y: 570,
    lines: ['rose'],
    labelPos: 's',
    kind: 'stop',
    fit: 57,
    months: 5,
    xp: 340,
    salary: 'RM 12k – 16k',
    skillsHave: [],
    skillsGap: ['Observability', 'Kubernetes', 'SLO Management'],
    blurb: 'Uphold 99.99% availability at scale through automated failure remediation and telemetry.',
    locked: true,
  },
]

export const STATION_MAP: Record<string, Station> = Object.fromEntries(STATIONS.map((s) => [s.id, s]))

export interface Edge {
  id: string
  from: string
  to: string
  line: EdgeLine
  bends: [number, number][]
}

const e = (line: EdgeLine, from: string, to: string, bends: [number, number][] = []): Edge => ({
  id: `${from}__${to}`,
  from,
  to,
  line,
  bends,
})

export const EDGES: Edge[] = [
  // ── Amber: Agent Line ──
  e('amber', 'fullstack', 'llm-app', [
    [190, 340],
    [250, 190],
  ]),
  e('amber', 'llm-app', 'agentic'),
  e('amber', 'agentic', 'multi-agent'),
  e('amber', 'multi-agent', 'ai-platform', [
    [910, 190],
    [990, 110],
  ]),

  // ── Emerald: Data Line ──
  e('emerald', 'fullstack', 'backend'),
  e('emerald', 'backend', 'data-eng'),
  e('emerald', 'data-eng', 'pipeline', [
    [650, 340],
    [740, 430],
  ]),
  e('emerald', 'pipeline', 'mlops'),
  e('emerald', 'mlops', 'data-platform'),

  // ── Violet: Intelligence Line ──
  e('violet', 'backend', 'ml-eng', [
    [400, 340],
    [440, 260],
  ]),
  e('violet', 'ml-eng', 'ai-eng'),
  e('violet', 'ai-eng', 'ai-research'),

  // ── Sky: Product Line ──
  e('sky', 'fullstack', 'frontend-lead', [
    [170, 340],
    [230, 490],
  ]),
  e('sky', 'frontend-lead', 'ai-product-eng'),
  e('sky', 'ai-product-eng', 'ai-pm'),

  // ── Rose: Cloud Line ──
  e('rose', 'fullstack', 'devops'),
  e('rose', 'devops', 'cloud', [
    [130, 510],
    [190, 570],
  ]),
  e('rose', 'cloud', 'sre'),
  e('rose', 'sre', 'mlops', [
    [800, 570],
    [870, 500],
    [900, 430],
  ]),

  // ── Walking Transfers (Skill Bridges between Lines) ──
  e('walk', 'agentic', 'ai-eng', [
    [660, 190],
    [700, 260],
  ]),
  e('walk', 'data-eng', 'ml-eng', [
    [540, 340],
    [510, 280],
  ]),
  e('walk', 'data-eng', 'ai-pm', [
    [600, 340],
    [640, 440],
  ]),
]

export const TOP_PICKS = STATIONS.filter((s) => s.topRank).sort((a, b) => (a.topRank ?? 0) - (b.topRank ?? 0))

export const RANK_COLORS: Record<1 | 2 | 3, { ring: string; soft: string; text: string; bg: string; border: string }> = {
  1: { ring: '#F59E0B', soft: 'rgba(245, 158, 11, 0.25)', text: '#78350F', bg: '#FEF3C7', border: '#F59E0B' },
  2: { ring: '#10B981', soft: 'rgba(16, 185, 129, 0.25)', text: '#064E3B', bg: '#D1FAE5', border: '#10B981' },
  3: { ring: '#8B5CF6', soft: 'rgba(139, 92, 246, 0.25)', text: '#4C1D95', bg: '#EDE9FE', border: '#8B5CF6' },
}

// ── Fare zones (concentric rings from origin) ──
export const ZONE_RADII = [270, 530, 790]

export function zoneOf(s: Station): number {
  const o = STATION_MAP[ORIGIN_ID]
  const d = Math.hypot(s.x - o.x, s.y - o.y)
  if (d === 0) return 0
  const idx = ZONE_RADII.findIndex((r) => d <= r)
  return idx === -1 ? 4 : idx + 1
}

// ── Routing ──
export interface RouteStep {
  edge: Edge
  from: string
  to: string
}

export interface Route {
  id: string
  steps: RouteStep[]
  stations: string[]
  transfers: number
  months: number
  xp: number
  points: [number, number][]
  lines: EdgeLine[]
}

function edgePoints(edge: Edge, forward: boolean): [number, number][] {
  const a = STATION_MAP[edge.from]
  const b = STATION_MAP[edge.to]
  const pts: [number, number][] = [[a.x, a.y], ...edge.bends, [b.x, b.y]]
  return forward ? pts : pts.reverse()
}

export function pointsToPath(pts: [number, number][]): string {
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
}

export function edgePath(edge: Edge): string {
  return pointsToPath(edgePoints(edge, true))
}

function buildRoute(steps: RouteStep[]): Route {
  const stepsCopy = [...steps]
  const stations = [stepsCopy[0].from, ...stepsCopy.map((s) => s.to)]
  let transfers = 0
  let months = 0
  let xp = 0
  const points: [number, number][] = []
  stepsCopy.forEach((st, i) => {
    if (i > 0 && stepsCopy[i - 1].edge.line !== st.edge.line) transfers++
    const target = STATION_MAP[st.to]
    months += target.months + (st.edge.line === 'walk' ? 1 : 0)
    xp += target.xp
    const pts = edgePoints(st.edge, st.edge.from === st.from)
    points.push(...(i === 0 ? pts : pts.slice(1)))
  })
  return {
    id: stepsCopy.map((s) => s.edge.id).join('|'),
    steps: stepsCopy,
    stations,
    transfers,
    months,
    xp,
    points,
    lines: [...new Set(stepsCopy.map((s) => s.edge.line))],
  }
}

/** Enumerates simple paths from origin → target and returns the best `limit` by journey cost. */
export function findRoutes(targetId: string, limit = 3, maxDepth = 7): Route[] {
  if (targetId === ORIGIN_ID) return []
  const results: Route[] = []
  const visited = new Set<string>([ORIGIN_ID])

  const dfs = (current: string, steps: RouteStep[]) => {
    if (steps.length > maxDepth) return
    if (current === targetId) {
      results.push(buildRoute(steps))
      return
    }
    for (const edge of EDGES) {
      let next: string | null = null
      if (edge.from === current) next = edge.to
      else if (edge.to === current) next = edge.from
      if (!next || visited.has(next)) continue
      visited.add(next)
      steps.push({ edge, from: current, to: next })
      dfs(next, steps)
      steps.pop()
      visited.delete(next)
    }
  }
  dfs(ORIGIN_ID, [])

  return results
    .sort((a, b) => a.months + a.transfers * 1.5 - (b.months + b.transfers * 1.5))
    .slice(0, limit)
}

export const ROUTE_LABELS = [
  { name: 'Express', hint: 'Fastest journey, fewest transfers' },
  { name: 'Alternative', hint: 'Different line, broader skill set' },
  { name: 'Scenic', hint: 'Longest ride — most XP & stations' },
]

export const MARKET_TICKER = [
  'AGENT-FRAMEWORK JOB POSTS ▲34% QoQ',
  'HERMES 3 · OPEN FUNCTION-CALLING LLM RELEASED',
  'VECTOR DB SKILLS ▲22% IN DATA ROLES',
  'PYTHON REMAINS #1 GAP FOR JS DEVELOPERS',
  'MLOPS HIRING STEADY · LOW VOLATILITY',
  'AI PRODUCT ENGINEER TITLES ▲19% IN SEA',
  'LANGGRAPH MENTIONS ▲3× IN JOB ADS',
]

export interface Mission {
  id: string
  title: string
  xp: number
  auto?: boolean
}

export const MISSIONS: Mission[] = [
  { id: 'scout', title: 'Scout a planned extension station', xp: 60, auto: true },
  { id: 'compare', title: 'Compare 2 alternative routes', xp: 40, auto: true },
  { id: 'board', title: 'Board a train to a top-3 destination', xp: 80, auto: true },
  { id: 'lesson', title: 'Finish "Tool Calling 101" micro-lesson', xp: 120 },
]

export interface Stamp {
  id: string
  name: string
  glyph: string
  color: string
}

export const STAMPS: Stamp[] = [
  { id: 'first-ride', name: 'First Departure', glyph: '◆', color: '#F59E0B' },
  { id: 'interchange', name: 'Interchange Pro', glyph: '⇄', color: '#10B981' },
  { id: 'fog', name: 'Frontier Pioneer', glyph: '⌖', color: '#8B5CF6' },
  { id: 'trend', name: 'Trend Rider', glyph: '▲', color: '#F43F5E' },
  { id: 'express', name: 'Express Commuter', glyph: '»', color: '#0EA5E9' },
  { id: 'cartographer', name: 'Cartographer', glyph: '✦', color: '#334155' },
]

export const XP_PER_LEVEL = 1000
export const LEVEL_TITLES = ['Rookie Rider', 'Commuter', 'Navigator', 'Line Captain', 'Network Master']
export function levelTitle(level: number) {
  return LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 3))]
}
