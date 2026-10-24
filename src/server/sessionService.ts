import { getMockProfile } from '../data/mockProfiles'
import type { CareerProfile } from '../types/careerProfile'
import type {
  AnswerSubmissionRequest,
  AnswerSubmissionResponse,
  CompleteSessionResponse,
  NextQuestionResponse,
  ProfileSummaryResponse,
  QuestionId,
  SessionState,
  StartSessionRequest,
  StartSessionResponse,
  UserAnswer,
} from '../types/followUpQuestion'
import { buildCombinedProfile } from './profileBuilder'
import { evaluateSessionQuestions } from './questionEngine'
import { evaluateFieldStatuses } from './rules'
import { sessionStore } from './sessionStore'
import {
  validateAnswerSubmission,
  validateCompletion,
  validateStructuredProfile,
} from './validation'

export class SessionError extends Error {
  override message: string
  statusCode: number

  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.name = 'SessionError'
    this.message = message
    this.statusCode = statusCode
  }
}

/**
 * Service orchestrating the complete follow-up question lifecycle.
 */
function normalizeStructuredProfile(raw: Partial<CareerProfile>): CareerProfile {
  const candidateName =
    raw.candidateName || (raw as any).name || (raw as any).fullName || 'Explorer'

  const skills: CareerProfile['skills'] = Array.isArray(raw.skills)
    ? raw.skills.map((s: any) => {
        if (typeof s === 'string') {
          return {
            name: s,
            proficiency: 'intermediate',
            source: 'cv',
            evidence: [],
          }
        }
        return {
          name: s.name || s.skill || s.title || 'Skill',
          proficiency: s.proficiency || 'intermediate',
          source: s.source || 'cv',
          evidence: Array.isArray(s.evidence)
            ? s.evidence
            : s.description
            ? [{ description: s.description, source: 'cv' }]
            : [],
        }
      })
    : []

  const education = Array.isArray(raw.education)
    ? raw.education.map((e: any) => ({
        qualification: e.qualification || e.degree || e.title,
        field: e.field || e.major || e.fieldOfStudy,
        institution: e.institution || e.school || e.university,
        year: e.year || e.graduationYear || e.dates,
      }))
    : []

  const experience = Array.isArray(raw.experience)
    ? raw.experience.map((exp: any) => ({
        title: exp.title || exp.role || exp.position,
        company: exp.company || exp.organization || exp.employer,
        duration: exp.duration || exp.dates || exp.period,
        responsibilities: Array.isArray(exp.responsibilities)
          ? exp.responsibilities
          : Array.isArray(exp.highlights)
          ? exp.highlights
          : typeof exp.description === 'string'
          ? exp.description
              .split('\n')
              .map((str: string) => str.replace(/^[•\-*]\s*/, '').trim())
              .filter(Boolean)
          : [],
      }))
    : []

  const projects = Array.isArray(raw.projects)
    ? raw.projects.map((p: any) => ({
        name: p.name || p.title || 'Project',
        context: p.context || p.type,
        technologies: Array.isArray(p.technologies)
          ? p.technologies
          : typeof p.technologies === 'string'
          ? p.technologies.split(',').map((t: string) => t.trim())
          : Array.isArray(p.techStack)
          ? p.techStack
          : [],
        responsibilities: Array.isArray(p.responsibilities)
          ? p.responsibilities
          : Array.isArray(p.highlights)
          ? p.highlights
          : typeof p.description === 'string'
          ? p.description
              .split('\n')
              .map((str: string) => str.replace(/^[•\-*]\s*/, '').trim())
              .filter(Boolean)
          : [],
      }))
    : []

  const certifications: string[] = Array.isArray(raw.certifications)
    ? raw.certifications.map((c: any) => (typeof c === 'string' ? c : c.name || c.title || String(c)))
    : []

  return {
    candidateName,
    skills,
    education,
    projects,
    experience,
    certifications,
    careerStage: raw.careerStage || null,
    experienceContext: raw.experienceContext || null,
    careerPreferences: {
      targetRoles: Array.isArray(raw.careerPreferences?.targetRoles)
        ? raw.careerPreferences.targetRoles
        : [],
      workInterests: Array.isArray(raw.careerPreferences?.workInterests)
        ? raw.careerPreferences.workInterests
        : [],
    },
    learningPreferences: {
      hoursPerWeekRange: raw.learningPreferences?.hoursPerWeekRange || null,
      timelineMonths: raw.learningPreferences?.timelineMonths || null,
      timelinePreference: raw.learningPreferences?.timelinePreference || null,
      willingnessToLearn: raw.learningPreferences?.willingnessToLearn || null,
    },
  }
}

export class SessionService {
  /**
   * Starts a new follow-up session using a mock profile or structured CV extraction payload.
   */
  public startSession(req: StartSessionRequest): StartSessionResponse {
    let initialProfile: CareerProfile

    // 1. Prioritize real extracted CV payload if provided
    if (req.initialProfile) {
      const validation = validateStructuredProfile(req.initialProfile)
      if (!validation.isValid) {
        throw new SessionError(`Invalid initial profile: ${validation.errors.join(' ')}`, 400)
      }
      initialProfile = normalizeStructuredProfile(req.initialProfile)
    } else if (req.mockProfileId) {
      const mock = getMockProfile(req.mockProfileId)
      if (!mock) {
        throw new SessionError(`Mock profile "${req.mockProfileId}" not found.`, 404)
      }
      initialProfile = mock
    } else {
      // Default fallback to Profile A
      const mock = getMockProfile('student_cs')!
      initialProfile = mock
    }

    const sessionId = `jt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const initialFieldStatuses = evaluateFieldStatuses(initialProfile, {})

    const evaluation = evaluateSessionQuestions(initialProfile, {}, null)

    const session: SessionState = {
      sessionId,
      status: evaluation.isReviewReady ? 'review_ready' : 'in_progress',
      source: req.source || (req.mockProfileId ? 'mock' : 'cv_extractor'),
      initialProfile,
      currentProfile: initialProfile,
      answers: {},
      questionHistory: evaluation.currentQuestion ? [evaluation.currentQuestion.id] : [],
      currentQuestionId: evaluation.currentQuestion ? evaluation.currentQuestion.id : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fieldStatuses: initialFieldStatuses,
    }

    sessionStore.saveSession(session)

    return {
      sessionId,
      status: session.status,
      currentQuestion: evaluation.currentQuestion,
      progress: evaluation.progress,
      profileSummary: initialProfile,
    }
  }

  /**
   * Retrieves the next eligible question or signals review readiness.
   */
  public getNextQuestion(sessionId: string): NextQuestionResponse {
    const session = sessionStore.getSession(sessionId)
    if (!session) {
      throw new SessionError(`Session "${sessionId}" not found.`, 404)
    }

    const evaluation = evaluateSessionQuestions(
      session.currentProfile,
      session.answers,
      session.currentQuestionId
    )

    return {
      sessionId,
      status: evaluation.isReviewReady ? 'review_ready' : 'in_progress',
      currentQuestion: evaluation.currentQuestion,
      progress: evaluation.progress,
      isReviewReady: evaluation.isReviewReady,
    }
  }

  /**
   * Navigates directly to a previously answered question or specific question ID (for editing / back navigation).
   */
  public navigateToQuestion(sessionId: string, questionId: QuestionId): NextQuestionResponse {
    const session = sessionStore.getSession(sessionId)
    if (!session) {
      throw new SessionError(`Session "${sessionId}" not found.`, 404)
    }

    session.currentQuestionId = questionId
    sessionStore.saveSession(session)

    const evaluation = evaluateSessionQuestions(
      session.currentProfile,
      session.answers,
      questionId
    )

    return {
      sessionId,
      status: session.status,
      currentQuestion: evaluation.currentQuestion,
      progress: evaluation.progress,
      isReviewReady: evaluation.isReviewReady,
    }
  }

  /**
   * Submits and validates an answer for the active question.
   */
  public submitAnswer(
    sessionId: string,
    req: AnswerSubmissionRequest
  ): AnswerSubmissionResponse {
    const session = sessionStore.getSession(sessionId)
    if (!session) {
      throw new SessionError(`Session "${sessionId}" not found.`, 404)
    }

    if (session.status === 'completed') {
      throw new SessionError('Session is already completed and cannot accept new answers.', 400)
    }

    // Validation
    const validation = validateAnswerSubmission(
      req.questionId,
      req.selectedOptionIds,
      req.isSkipped
    )

    if (!validation.isValid) {
      throw new SessionError(`Validation failed: ${validation.errors.join(' ')}`, 422)
    }

    // Store answer
    const answer: UserAnswer = {
      questionId: req.questionId,
      selectedOptionIds: req.isSkipped ? [] : req.selectedOptionIds,
      answeredAt: new Date().toISOString(),
      isSkipped: req.isSkipped || false,
    }

    session.answers[req.questionId] = answer

    // Track in history if not already present
    if (!session.questionHistory.includes(req.questionId)) {
      session.questionHistory.push(req.questionId)
    }

    // Rebuild profile with new answer
    session.currentProfile = buildCombinedProfile(session.initialProfile, session.answers)
    session.fieldStatuses = session.currentProfile.fieldStatuses || {}

    // Evaluate next question sequentially
    const evaluation = evaluateSessionQuestions(
      session.currentProfile,
      session.answers,
      null,
      req.questionId
    )

    session.currentQuestionId = evaluation.currentQuestion ? evaluation.currentQuestion.id : null
    session.status = evaluation.isReviewReady ? 'review_ready' : 'in_progress'

    sessionStore.saveSession(session)

    return {
      sessionId,
      status: session.status,
      currentQuestion: evaluation.currentQuestion,
      progress: evaluation.progress,
      updatedProfile: session.currentProfile,
      isReviewReady: evaluation.isReviewReady,
    }
  }

  /**
   * Returns a complete consolidated profile summary for review.
   */
  public getProfileSummary(sessionId: string): ProfileSummaryResponse {
    const session = sessionStore.getSession(sessionId)
    if (!session) {
      throw new SessionError(`Session "${sessionId}" not found.`, 404)
    }

    const evaluation = evaluateSessionQuestions(
      session.currentProfile,
      session.answers,
      null
    )

    const unresolvedFields = Object.entries(session.fieldStatuses)
      .filter(([, status]) => status === 'missing' || status === 'ambiguous' || status === 'unknown')
      .map(([field]) => field)

    return {
      sessionId,
      status: session.status,
      profile: session.currentProfile,
      fieldStatuses: session.fieldStatuses,
      unresolvedFields,
      isEligibleForCompletion: evaluation.unansweredRequiredIds.length === 0,
      answers: session.answers,
    }
  }

  /**
   * Validates and completes the follow-up session, producing the final Career Transit Profile.
   */
  public completeSession(sessionId: string): CompleteSessionResponse {
    const session = sessionStore.getSession(sessionId)
    if (!session) {
      throw new SessionError(`Session "${sessionId}" not found.`, 404)
    }

    const evaluation = evaluateSessionQuestions(
      session.currentProfile,
      session.answers,
      null
    )

    const validation = validateCompletion(session.currentProfile, evaluation.unansweredRequiredIds)
    if (!validation.isValid) {
      throw new SessionError(
        `Cannot complete session: ${validation.errors.join(' ')}`,
        400
      )
    }

    session.status = 'completed'
    session.currentProfile.updatedAt = new Date().toISOString()
    sessionStore.saveSession(session)

    return {
      sessionId,
      status: 'completed',
      completedAt: new Date().toISOString(),
      finalProfile: session.currentProfile,
      message: 'Transit Card successfully validated and confirmed.',
    }
  }
}

export const sessionService = new SessionService()
