import { QUESTION_BANK } from './questionBank'
import type { QuestionId } from '../types/followUpQuestion'
import type { CareerProfile } from '../types/careerProfile'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateAnswerSubmission(
  questionId: QuestionId,
  selectedOptionIds: string[],
  isSkipped: boolean = false
): ValidationResult {
  const errors: string[] = []

  const question = QUESTION_BANK[questionId]
  if (!question) {
    return {
      isValid: false,
      errors: [`Unknown question ID: "${questionId}".`],
    }
  }

  // Handle skipped questions
  if (isSkipped) {
    if (question.required && !question.allowSkip) {
      errors.push(`Question "${questionId}" is required and cannot be skipped.`)
    }
    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Check required
  if (question.required && (!selectedOptionIds || selectedOptionIds.length === 0)) {
    errors.push(`Please select at least one option for "${question.prompt}".`)
    return { isValid: false, errors }
  }

  // Check single-select
  if (question.selectionType === 'single' && selectedOptionIds.length > 1) {
    errors.push(`Question "${questionId}" only accepts a single selection. Received ${selectedOptionIds.length}.`)
  }

  // Check option IDs exist
  const validOptionIds = new Set(question.options.map((opt) => opt.id))
  for (const optId of selectedOptionIds) {
    if (!validOptionIds.has(optId)) {
      errors.push(`Invalid option ID "${optId}" for question "${questionId}".`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateStructuredProfile(profile: Partial<CareerProfile>): ValidationResult {
  const errors: string[] = []

  if (!profile || typeof profile !== 'object') {
    errors.push('Initial profile payload must be a non-null object.')
    return { isValid: false, errors }
  }

  if (profile.skills && !Array.isArray(profile.skills)) {
    errors.push('Profile "skills" must be an array.')
  }

  if (profile.education && !Array.isArray(profile.education)) {
    errors.push('Profile "education" must be an array.')
  }

  if (profile.projects && !Array.isArray(profile.projects)) {
    errors.push('Profile "projects" must be an array.')
  }

  if (profile.experience && !Array.isArray(profile.experience)) {
    errors.push('Profile "experience" must be an array.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateCompletion(
  profile: CareerProfile,
  unansweredRequired: QuestionId[]
): ValidationResult {
  const errors: string[] = []

  if (unansweredRequired.length > 0) {
    errors.push(
      `Cannot complete session: unanswered required questions: ${unansweredRequired.join(', ')}`
    )
  }

  if (!profile.skills || profile.skills.length === 0) {
    // Note: A user profile should at least have a valid skills container
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
