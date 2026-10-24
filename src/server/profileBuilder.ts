import type { CareerProfile } from '../types/careerProfile'
import type { UserAnswer } from '../types/followUpQuestion'
import { evaluateFieldStatuses } from './rules'

/**
 * Maps timeline option ID to approximate months, preserving null for open-ended
 */
function mapTimelineMonths(optionId: string | null): number | null {
  switch (optionId) {
    case 'months_3':
      return 3
    case 'months_6':
      return 6
    case 'months_12':
      return 12
    default:
      return null
  }
}

/**
 * Builds a combined Career Profile by merging original CV facts with user-confirmed answers.
 * Preserves evidence provenance without corrupting extracted records.
 */
export function buildCombinedProfile(
  initialProfile: CareerProfile,
  answers: Record<string, UserAnswer>
): CareerProfile {
  // Deep clone initial profile to prevent accidental mutation of source records
  const profile: CareerProfile = JSON.parse(JSON.stringify(initialProfile))

  // Ensure default structures
  profile.careerPreferences = profile.careerPreferences || { targetRoles: [], workInterests: [] }
  profile.learningPreferences = profile.learningPreferences || {
    hoursPerWeekRange: null,
    timelineMonths: null,
    timelinePreference: null,
    willingnessToLearn: null,
  }

  // 1. career_stage
  if (answers.career_stage) {
    const selected = answers.career_stage.selectedOptionIds[0]
    if (selected) {
      profile.careerStage = selected
    }
  }

  // 2. target_roles
  if (answers.target_roles) {
    profile.careerPreferences.targetRoles = [...answers.target_roles.selectedOptionIds]
  }

  // 3. experience_context
  if (answers.experience_context) {
    const selected = answers.experience_context.selectedOptionIds[0]
    if (selected) {
      profile.experienceContext = selected
    }
  }

  // 4. work_preference
  if (answers.work_preference) {
    profile.careerPreferences.workInterests = [...answers.work_preference.selectedOptionIds]
  }

  // 5. learning_hours
  if (answers.learning_hours) {
    const selected = answers.learning_hours.selectedOptionIds[0]
    if (selected) {
      profile.learningPreferences.hoursPerWeekRange = selected
    }
  }

  // 6. career_timeline
  if (answers.career_timeline) {
    if (answers.career_timeline.isSkipped) {
      profile.learningPreferences.timelinePreference = 'skipped'
      profile.learningPreferences.timelineMonths = null
    } else {
      const selected = answers.career_timeline.selectedOptionIds[0]
      if (selected) {
        profile.learningPreferences.timelinePreference = selected
        profile.learningPreferences.timelineMonths = mapTimelineMonths(selected)
      }
    }
  }

  // 7. learning_openness
  if (answers.learning_openness) {
    const selected = answers.learning_openness.selectedOptionIds[0]
    if (selected) {
      profile.learningPreferences.willingnessToLearn = selected
    }
  }

  // Attach updated field statuses
  profile.fieldStatuses = evaluateFieldStatuses(profile, answers)
  profile.updatedAt = new Date().toISOString()

  return profile
}
