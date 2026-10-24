/**
 * Future Scenario Lab Types & Normalised Report Schema
 * JobTransit AI Career Forecasting & Reskilling Platform
 */

export type SimulationScenarioId = 'baseline_adoption' | 'accelerated_automation' | 'human_ai_collaboration'

export interface ScenarioDefinition {
  id: SimulationScenarioId
  name: string
  subtitle: string
  description: string
  assumptions: string[]
  adoptionSpeed: 'Moderate' | 'Rapid' | 'Collaborative'
  primaryDriver: string
  riskProfile: 'Balanced' | 'High Displacement' | 'Skills Redistribution'
}

export type SimulationStatus = 'queued' | 'preparing' | 'running' | 'generating' | 'completed' | 'failed' | 'cancelled'

export interface SimulationConfig {
  occupation: string
  country: string
  forecastHorizon: number // e.g. 2030
  scenario: SimulationScenarioId
  agentCount: number // Default 10 (conservative for laptop)
  rounds: number // Default 3 (conservative for laptop)
  evidenceSources: string[]
  isDemoMode?: boolean
}

export interface ChangingTaskItem {
  task: string
  category: 'automated' | 'assisted' | 'human_core'
  changeDescription: string
  expectedTimeShiftPct: number // -100 to +100
  humanOversightLevel: 'Critical' | 'Periodic' | 'Autonomous'
}

export interface EmergingSkillItem {
  skillName: string
  category: string
  trajectory: 'surging' | 'stable' | 'deprecating'
  importanceScore: number // 0-100
  rationale: string
  alignsWithExistingTaxonomy: boolean
  jobTransitSkillId?: string
}

export interface StakeholderBehaviorObservation {
  stakeholderGroup: 'Employers' | 'Workers & Graduates' | 'Universities & Bootcamps' | 'Policymakers'
  simulatedAction: string
  keySentiment: string
  tensionPoint: string
}

export interface ReskillingRecommendationItem {
  stage: number // 1, 2, 3
  milestoneTitle: string
  focusSkills: string[]
  recommendedAction: string
  estimatedTimeToAttain: string
  crossScenarioRobustness: 'High' | 'Moderate' // Whether skill stays useful across scenarios
  relevantSDG: string
}

export interface SDGMappingItem {
  sdgNumber: number // 4, 8, 9, 10
  sdgName: string
  targetCode: string // e.g. "Target 4.4"
  targetDescription: string
  connectionRationale: string
}

export interface EvidenceSourceItem {
  name: string
  publisher: string
  publicationDate: string
  geographicalCoverage: string
  keyRelevantDataPoint: string
  assumptions: string
}

export interface NormalizedSimulationReport {
  simulationId: string
  occupation: string
  country: string
  forecastHorizon: number
  scenario: SimulationScenarioId
  scenarioName: string
  status: SimulationStatus
  completedAt: string
  isDemoReplay: boolean
  summary: string
  quantitativeBaseline: {
    totalOpenings2026: number
    past24hVelocityRate: number
    aiTaskExposureScore: number
    entryLevelScore: number
  }
  findings: Array<{
    topic: 'skill_demand' | 'task_transformation' | 'hiring_standards' | 'reskilling_feasibility'
    title: string
    finding: string
    supportingEvidence: string[]
    interpretation: string
    limitations: string[]
  }>
  changingTasks: ChangingTaskItem[]
  emergingSkills: EmergingSkillItem[]
  stakeholderBehaviors: StakeholderBehaviorObservation[]
  reskillingRecommendations: ReskillingRecommendationItem[]
  sdgMappings: SDGMappingItem[]
  sources: EvidenceSourceItem[]
  assumptions: string[]
  limitations: string[]
  tokenUsage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  } | null
  estimatedCostUSD: number | null
  costNote: string
}

export interface SimulationJob {
  id: string
  config: SimulationConfig
  status: SimulationStatus
  progressPercentage: number
  currentStepMessage: string
  createdAt: string
  updatedAt: string
  error?: string
  report?: NormalizedSimulationReport
  fromCache?: boolean
  isDemoReplay?: boolean
}

export interface SimulationHistorySummary {
  id: string
  occupation: string
  scenario: SimulationScenarioId
  scenarioName: string
  country: string
  forecastHorizon: number
  status: SimulationStatus
  createdAt: string
  isDemoReplay: boolean
}
