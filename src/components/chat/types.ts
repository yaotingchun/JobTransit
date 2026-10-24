export interface HardnessMetric {
  label: string
  value: string
  trend?: 'up' | 'down' | 'neutral'
  badge?: string
}

export interface TransparencyAudit {
  dataSource: string
  sampleSize: string
  verifiedAt: string
  confidenceScore: number // e.g. 94 for 94%
  confidenceLevel: 'High' | 'Moderate' | 'Developing'
  methodology: string
  knownLimitations: string
  linkedinVerificationUrl?: string
}

export interface TaskBreakdownItem {
  task: string
  tier: 'automated' | 'assisted' | 'human_core'
  efficiencyGain: string
  detail: string
}

export interface QuickQuestionItem {
  id: string
  question: string
  category: 'Macro Trends' | 'Entry-Level' | 'Automation' | 'Surging Roles' | 'Skill Demand' | 'Methodology'
  iconName: 'TrendingUp' | 'GraduationCap' | 'Bot' | 'Zap' | 'Sparkles' | 'ShieldCheck'
  shortTitle: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  timestamp: string
  text: string
  structuredResponse?: {
    headline: string
    keyTakeaway: string
    hardnessMetrics?: HardnessMetric[]
    taskBreakdown?: TaskBreakdownItem[]
    skillHighlights?: {
      surging: string[]
      deprecating: string[]
    }
    transparencyAudit: TransparencyAudit
    suggestedFollowUps?: string[]
    actionLink?: {
      tab: 'trend' | 'transit' | 'catchup'
      label: string
    }
  }
}
