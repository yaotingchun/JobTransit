import type { CareerProfile } from '../types/careerProfile'
import type {
  FollowUpQuestion,
  QuestionId,
  SessionProgress,
  UserAnswer,
} from '../types/followUpQuestion'
import { QUESTION_BANK } from './questionBank'
import { getEligibleQuestions } from './rules'

export interface QuestionEngineEvaluation {
  currentQuestion: FollowUpQuestion | null
  eligibleQuestionIds: QuestionId[]
  unansweredRequiredIds: QuestionId[]
  progress: SessionProgress
  isReviewReady: boolean
}

/**
 * Evaluates current session state to determine active question and progress metrics.
 */
export function evaluateSessionQuestions(
  profile: CareerProfile,
  answers: Record<string, UserAnswer>,
  currentQuestionId?: QuestionId | null,
  justAnsweredQuestionId?: QuestionId | null
): QuestionEngineEvaluation {
  const eligibleIds = getEligibleQuestions(profile, answers)

  // Unanswered required questions
  const unansweredRequiredIds = eligibleIds.filter((qId) => {
    const q = QUESTION_BANK[qId]
    const isAnswered = !!answers[qId]
    return q.required && !isAnswered
  })

  // Stable candidate order
  const candidateOrder: QuestionId[] = [
    'career_stage',
    'target_roles',
    'experience_context',
    'work_preference',
    'learning_openness',
    'learning_hours',
    'career_timeline',
  ]

  // Complete journey set: answered questions + remaining eligible questions
  const journeySet = new Set<QuestionId>([
    ...(Object.keys(answers) as QuestionId[]),
    ...eligibleIds,
  ])
  const journeyQuestionIds = candidateOrder.filter((id) => journeySet.has(id))

  // Determine which question to show
  let targetQuestionId: QuestionId | null = null

  if (currentQuestionId && QUESTION_BANK[currentQuestionId]) {
    // Explicit navigation target takes precedence (for back nav or editing)
    targetQuestionId = currentQuestionId
  } else if (justAnsweredQuestionId) {
    // Advance sequentially from the question that was just answered
    const justAnsweredIndex = journeyQuestionIds.indexOf(justAnsweredQuestionId)
    if (justAnsweredIndex >= 0 && justAnsweredIndex < journeyQuestionIds.length - 1) {
      targetQuestionId = journeyQuestionIds[justAnsweredIndex + 1]
    } else {
      // Reached the end of the journey; check if any required question is still missing
      targetQuestionId = journeyQuestionIds.find((id) => !answers[id] && QUESTION_BANK[id].required) || null
    }
  } else {
    // Pick the first unanswered eligible question (for initial load)
    targetQuestionId = journeyQuestionIds.find((id) => !answers[id]) || journeyQuestionIds[0] || null
  }

  // Ready for review when all required questions are answered and no more questions to show
  const isReviewReady = unansweredRequiredIds.length === 0 && !targetQuestionId

  const currentQuestion = targetQuestionId ? QUESTION_BANK[targetQuestionId] : null

  // Progress metrics
  const answeredCount = Object.keys(answers).length
  const totalJourneyCount = journeyQuestionIds.length
  const remaining = Math.max(0, totalJourneyCount - answeredCount)

  // Step index
  const currentStepIndex = targetQuestionId
    ? Math.max(1, journeyQuestionIds.indexOf(targetQuestionId) + 1)
    : totalJourneyCount

  const progress: SessionProgress = {
    answered: answeredCount,
    totalAnswered: answeredCount,
    estimatedRemaining: remaining,
    currentStepIndex,
    totalKnownQuestions: totalJourneyCount,
    isReviewReady,
    isComplete: false,
  }

  return {
    currentQuestion,
    eligibleQuestionIds: eligibleIds,
    unansweredRequiredIds,
    progress,
    isReviewReady,
  }
}
