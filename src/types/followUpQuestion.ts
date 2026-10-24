import type { CareerProfile, ProfileFieldStatus } from './careerProfile'

export type QuestionId =
  | 'career_stage'
  | 'target_roles'
  | 'experience_context'
  | 'work_preference'
  | 'learning_hours'
  | 'career_timeline'
  | 'learning_openness'

export type SelectionType = 'single' | 'multiple'

export interface QuestionOption {
  id: string
  label: string
  description?: string
  badge?: string
}

export interface FollowUpQuestion {
  id: QuestionId
  fieldKey: string
  prompt: string
  subtitle?: string
  selectionType: SelectionType
  required: boolean
  options: QuestionOption[]
  maxSelections?: number
  allowSkip?: boolean
}

export interface UserAnswer {
  questionId: QuestionId
  selectedOptionIds: string[]
  answeredAt: string
  isSkipped?: boolean
}

export interface SessionProgress {
  answered: number
  totalAnswered: number
  estimatedRemaining: number | null
  currentStepIndex: number
  totalKnownQuestions: number
  isReviewReady: boolean
  isComplete: boolean
}

export type SessionStatus = 'in_progress' | 'review_ready' | 'completed' | 'abandoned'

export interface SessionState {
  sessionId: string
  status: SessionStatus
  source: 'mock' | 'cv_extractor'
  initialProfile: CareerProfile
  currentProfile: CareerProfile
  answers: Record<string, UserAnswer>
  questionHistory: QuestionId[]
  currentQuestionId: QuestionId | null
  createdAt: string
  updatedAt: string
  fieldStatuses: Record<string, ProfileFieldStatus>
}

export interface StartSessionRequest {
  mockProfileId?: string
  initialProfile?: Partial<CareerProfile>
  source?: 'mock' | 'cv_extractor'
}

export interface StartSessionResponse {
  sessionId: string
  status: SessionStatus
  currentQuestion: FollowUpQuestion | null
  progress: SessionProgress
  profileSummary: CareerProfile
}

export interface NextQuestionResponse {
  sessionId: string
  status: SessionStatus
  currentQuestion: FollowUpQuestion | null
  progress: SessionProgress
  isReviewReady: boolean
}

export interface AnswerSubmissionRequest {
  questionId: QuestionId
  selectedOptionIds: string[]
  isSkipped?: boolean
}

export interface AnswerSubmissionResponse {
  sessionId: string
  status: SessionStatus
  currentQuestion: FollowUpQuestion | null
  progress: SessionProgress
  updatedProfile: CareerProfile
  isReviewReady: boolean
}

export interface ProfileSummaryResponse {
  sessionId: string
  status: SessionStatus
  profile: CareerProfile
  fieldStatuses: Record<string, ProfileFieldStatus>
  unresolvedFields: string[]
  isEligibleForCompletion: boolean
  answers: Record<string, UserAnswer>
  validationMessages?: string[]
}

export interface CompleteSessionResponse {
  sessionId: string
  status: 'completed'
  completedAt: string
  finalProfile: CareerProfile
  message: string
}
