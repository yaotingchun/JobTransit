import type { CareerProfile, ProfileFieldStatus } from '../types/careerProfile'
import type { QuestionId, UserAnswer } from '../types/followUpQuestion'

export interface FieldEvaluationResult {
  status: ProfileFieldStatus
  reason: string
}

export function evaluateFieldStatuses(
  profile: CareerProfile,
  answers: Record<string, UserAnswer> = {}
): Record<string, ProfileFieldStatus> {
  const statuses: Record<string, ProfileFieldStatus> = {}

  // 1. careerStage
  if (answers.career_stage) {
    const selected = answers.career_stage.selectedOptionIds[0]
    statuses.careerStage = selected === 'prefer_not_to_say' ? 'unknown' : 'confirmed'
  } else if (profile.careerStage) {
    statuses.careerStage = 'known'
  } else {
    statuses.careerStage = 'missing'
  }

  // 2. targetRoles
  if (answers.target_roles) {
    const isUndecided = answers.target_roles.selectedOptionIds.includes('undecided')
    statuses.targetRoles = isUndecided ? 'unknown' : 'confirmed'
  } else if (profile.careerPreferences?.targetRoles && profile.careerPreferences.targetRoles.length > 0) {
    statuses.targetRoles = 'known'
  } else {
    statuses.targetRoles = 'missing'
  }

  // 3. experienceContext
  if (answers.experience_context) {
    statuses.experienceContext = 'confirmed'
  } else if (profile.experienceContext) {
    statuses.experienceContext = 'known'
  } else if (profile.experience && profile.experience.length > 0) {
    statuses.experienceContext = 'known'
  } else if (profile.projects && profile.projects.length >= 2 && profile.projects.every((p) => p.context)) {
    statuses.experienceContext = 'known'
  } else if (profile.projects && profile.projects.length > 0) {
    // Has project but context is ambiguous (coursework vs self vs team)
    statuses.experienceContext = 'ambiguous'
  } else {
    statuses.experienceContext = 'missing'
  }

  // 4. workInterests
  if (answers.work_preference) {
    const isNotSure = answers.work_preference.selectedOptionIds.includes('not_sure')
    statuses.workInterests = isNotSure ? 'unknown' : 'confirmed'
  } else if (
    profile.careerPreferences?.workInterests &&
    profile.careerPreferences.workInterests.length > 0
  ) {
    statuses.workInterests = 'known'
  } else {
    statuses.workInterests = 'missing'
  }

  // 5. learningHours (hoursPerWeekRange)
  if (answers.learning_hours) {
    const selected = answers.learning_hours.selectedOptionIds[0]
    statuses.hoursPerWeekRange = selected === 'not_sure' ? 'unknown' : 'confirmed'
  } else if (profile.learningPreferences?.hoursPerWeekRange) {
    statuses.hoursPerWeekRange = 'known'
  } else {
    statuses.hoursPerWeekRange = 'missing'
  }

  // 6. careerTimeline (timelinePreference)
  if (answers.career_timeline) {
    if (answers.career_timeline.isSkipped) {
      statuses.timelinePreference = 'unknown'
    } else {
      const selected = answers.career_timeline.selectedOptionIds[0]
      statuses.timelinePreference =
        selected === 'not_sure' || selected === 'exploring' ? 'unknown' : 'confirmed'
    }
  } else if (profile.learningPreferences?.timelinePreference) {
    statuses.timelinePreference = 'known'
  } else {
    statuses.timelinePreference = 'missing'
  }

  // 7. learningOpenness (willingnessToLearn)
  if (answers.learning_openness) {
    const selected = answers.learning_openness.selectedOptionIds[0]
    statuses.willingnessToLearn = selected === 'not_sure' ? 'unknown' : 'confirmed'
  } else if (profile.learningPreferences?.willingnessToLearn) {
    statuses.willingnessToLearn = 'known'
  } else {
    statuses.willingnessToLearn = 'missing'
  }

  return statuses
}

/**
 * Checks whether a career transition into a new tech domain is happening
 * (e.g. software engineer pivoting to AI/ML or cybersecurity).
 */
export function isCareerTransition(
  profile: CareerProfile,
  answers: Record<string, UserAnswer> = {}
): boolean {
  const currentSkills = (profile.skills || []).map((s) => s.name.toLowerCase())
  const hasAiSkills = currentSkills.some((s) =>
    ['machine learning', 'deep learning', 'pytorch', 'tensorflow', 'llm', 'nlp'].includes(s)
  )

  const targetRolesAnswer = answers.target_roles?.selectedOptionIds || profile.careerPreferences?.targetRoles || []

  // If targeting AI but doesn't have confirmed AI skills
  if (targetRolesAnswer.includes('ai_ml') && !hasAiSkills) {
    return true
  }

  // If career stage indicates career change
  const stage = answers.career_stage?.selectedOptionIds[0] || profile.careerStage
  if (stage === 'career_change' || stage === 'employed_non_tech') {
    return true
  }

  // If profile is experienced dev exploring AI
  if (profile.id === 'profile_experienced_dev_ai') {
    return true
  }

  return false
}

/**
 * Deterministically evaluates eligible question IDs given current profile and answers.
 */
export function getEligibleQuestions(
  profile: CareerProfile,
  answers: Record<string, UserAnswer> = {}
): QuestionId[] {
  const statuses = evaluateFieldStatuses(profile, answers)
  const eligible: QuestionId[] = []

  // 1. career_stage
  if (statuses.careerStage === 'missing' || statuses.careerStage === 'ambiguous') {
    eligible.push('career_stage')
  }

  // 2. target_roles
  if (statuses.targetRoles === 'missing' || statuses.targetRoles === 'ambiguous') {
    eligible.push('target_roles')
  }

  // 3. experience_context
  if (statuses.experienceContext === 'missing' || statuses.experienceContext === 'ambiguous') {
    eligible.push('experience_context')
  }

  // 4. work_preference
  if (statuses.workInterests === 'missing' || statuses.workInterests === 'ambiguous') {
    eligible.push('work_preference')
  }

  // 5. learning_openness
  // Ask only when there is an active transition or ambiguous skill-target gap
  if (
    (statuses.willingnessToLearn === 'missing' || statuses.willingnessToLearn === 'ambiguous') &&
    isCareerTransition(profile, answers)
  ) {
    eligible.push('learning_openness')
  }

  // 6. learning_hours
  if (statuses.hoursPerWeekRange === 'missing' || statuses.hoursPerWeekRange === 'ambiguous') {
    eligible.push('learning_hours')
  }

  // 7. career_timeline (optional)
  if (statuses.timelinePreference === 'missing') {
    eligible.push('career_timeline')
  }

  return eligible
}
