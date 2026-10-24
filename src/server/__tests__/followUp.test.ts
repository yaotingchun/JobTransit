import { describe, it, expect, beforeEach } from 'vitest'
import { sessionService, SessionError } from '../sessionService'
import { sessionStore } from '../sessionStore'
import { getMockProfile } from '../../data/mockProfiles'
import { evaluateSessionQuestions } from '../questionEngine'
import { buildCombinedProfile } from '../profileBuilder'
import { validateAnswerSubmission } from '../validation'

describe('Follow-up Question Machine - Backend Tests', () => {
  beforeEach(() => {
    sessionStore.clear()
  })

  describe('Adaptive Question Logic & Mock Profiles', () => {
    it('Profile A (CS Student): selects target_roles, experience_context, work_preference, learning_hours and skips known stage', () => {
      const profileA = getMockProfile('student_cs')!
      const initial = sessionService.startSession({ mockProfileId: 'student_cs' })

      expect(initial.sessionId).toBeDefined()
      expect(initial.status).toBe('in_progress')
      // Career stage is known from CV, so it must not ask career_stage
      expect(initial.currentQuestion?.id).toBe('target_roles')

      const evalResult = evaluateSessionQuestions(profileA, {})
      expect(evalResult.eligibleQuestionIds).toContain('target_roles')
      expect(evalResult.eligibleQuestionIds).toContain('experience_context')
      expect(evalResult.eligibleQuestionIds).toContain('work_preference')
      expect(evalResult.eligibleQuestionIds).toContain('learning_hours')
      expect(evalResult.eligibleQuestionIds).not.toContain('career_stage')
    })

    it('Profile B (Software Graduate): skips target_roles, work_preference, experience_context and asks learning_hours', () => {
      const profileB = getMockProfile('software_grad')!
      const initial = sessionService.startSession({ mockProfileId: 'software_grad' })

      expect(initial.status).toBe('in_progress')
      // Already has targetRoles, workInterests, projects with context, and careerStage
      const evalResult = evaluateSessionQuestions(profileB, {})
      expect(evalResult.eligibleQuestionIds).not.toContain('target_roles')
      expect(evalResult.eligibleQuestionIds).not.toContain('work_preference')
      expect(evalResult.eligibleQuestionIds).not.toContain('experience_context')
      expect(evalResult.eligibleQuestionIds).toContain('learning_hours')
      // Only 2 questions eligible (learning_hours and optional career_timeline)
      expect(evalResult.eligibleQuestionIds.length).toBeLessThanOrEqual(2)
    })

    it('Profile C (Experienced Developer): asks target_roles, learning_openness, and learning_hours', () => {
      const profileC = getMockProfile('experienced_dev_ai')!
      const initial = sessionService.startSession({ mockProfileId: 'experienced_dev_ai' })

      expect(initial.status).toBe('in_progress')
      const evalResult = evaluateSessionQuestions(profileC, {})
      // Known: careerStage (employed_tech), experienceContext (professional_work)
      expect(evalResult.eligibleQuestionIds).not.toContain('career_stage')
      expect(evalResult.eligibleQuestionIds).not.toContain('experience_context')
      // Must ask target_roles and learning_openness due to tech transition
      expect(evalResult.eligibleQuestionIds).toContain('target_roles')
      expect(evalResult.eligibleQuestionIds).toContain('learning_openness')
      expect(evalResult.eligibleQuestionIds).toContain('learning_hours')
    })

    it('Changing an earlier answer recalculates the remaining queue', () => {
      const session = sessionService.startSession({ mockProfileId: 'student_cs' })

      // Answer target_roles with standard software_backend
      const res1 = sessionService.submitAnswer(session.sessionId, {
        questionId: 'target_roles',
        selectedOptionIds: ['ai_ml', 'software_backend', 'frontend_fullstack'],
      })
      expect(res1.status).toBe('in_progress')
      expect(res1.currentQuestion?.id).toBe('experience_context')
      expect(res1.progress.currentStepIndex).toBe(2)

      // Go back and update target_roles to include undecided
      const res2 = sessionService.submitAnswer(session.sessionId, {
        questionId: 'target_roles',
        selectedOptionIds: ['undecided'],
      })
      expect(res2.updatedProfile.careerPreferences.targetRoles).toEqual(['undecided'])
      expect(res2.updatedProfile.fieldStatuses?.targetRoles).toBe('unknown')
    })

    it('Handles explicit unknown options like prefer_not_to_say and not_sure honestly', () => {
      const session = sessionService.startSession({ mockProfileId: 'student_cs' })

      sessionService.submitAnswer(session.sessionId, {
        questionId: 'target_roles',
        selectedOptionIds: ['undecided'],
      })

      sessionService.submitAnswer(session.sessionId, {
        questionId: 'experience_context',
        selectedOptionIds: ['coursework'],
      })

      sessionService.submitAnswer(session.sessionId, {
        questionId: 'work_preference',
        selectedOptionIds: ['not_sure'],
      })

      const answerRes = sessionService.submitAnswer(session.sessionId, {
        questionId: 'learning_hours',
        selectedOptionIds: ['not_sure'],
      })

      expect(answerRes.updatedProfile.fieldStatuses?.workInterests).toBe('unknown')
      expect(answerRes.updatedProfile.fieldStatuses?.hoursPerWeekRange).toBe('unknown')
    })
  })

  describe('Answer Validation', () => {
    it('accepts valid single-select and multi-select answers', () => {
      const vSingle = validateAnswerSubmission('learning_hours', ['hours_3_5'])
      expect(vSingle.isValid).toBe(true)

      const vMulti = validateAnswerSubmission('target_roles', ['ai_ml', 'software_backend'])
      expect(vMulti.isValid).toBe(true)
    })

    it('rejects multiple selections for a single-select question', () => {
      const result = validateAnswerSubmission('learning_hours', ['hours_1_2', 'hours_3_5'])
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('only accepts a single selection')
    })

    it('rejects invalid option IDs', () => {
      const result = validateAnswerSubmission('learning_hours', ['non_existent_option'])
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('Invalid option ID')
    })

    it('rejects missing answers for required questions', () => {
      const result = validateAnswerSubmission('target_roles', [])
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('Please select at least one option')
    })

    it('allows skipping for optional questions (career_timeline)', () => {
      const result = validateAnswerSubmission('career_timeline', [], true)
      expect(result.isValid).toBe(true)
    })

    it('rejects skipping for required questions', () => {
      const result = validateAnswerSubmission('target_roles', [], true)
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('cannot be skipped')
    })
  })

  describe('Session State & Isolation', () => {
    it('preserves answers during back navigation', () => {
      const s1 = sessionService.startSession({ mockProfileId: 'student_cs' })

      sessionService.submitAnswer(s1.sessionId, {
        questionId: 'target_roles',
        selectedOptionIds: ['software_backend'],
      })

      // Navigate back to target_roles
      const navBack = sessionService.navigateToQuestion(s1.sessionId, 'target_roles')
      expect(navBack.currentQuestion?.id).toBe('target_roles')

      // Check summary preserves the saved answer
      const summary = sessionService.getProfileSummary(s1.sessionId)
      expect(summary.answers.target_roles.selectedOptionIds).toEqual(['software_backend'])
    })

    it('maintains distinct isolated state across different sessions', () => {
      const s1 = sessionService.startSession({ mockProfileId: 'student_cs' })
      const s2 = sessionService.startSession({ mockProfileId: 'student_cs' })

      sessionService.submitAnswer(s1.sessionId, {
        questionId: 'target_roles',
        selectedOptionIds: ['ai_ml'],
      })

      const summary1 = sessionService.getProfileSummary(s1.sessionId)
      const summary2 = sessionService.getProfileSummary(s2.sessionId)

      expect(summary1.profile.careerPreferences.targetRoles).toEqual(['ai_ml'])
      expect(summary2.profile.careerPreferences.targetRoles).toEqual([])
    })

    it('throws SessionError for nonexistent session ID', () => {
      expect(() => sessionService.getNextQuestion('fake_session_123')).toThrowError(SessionError)
    })
  })

  describe('Profile Builder & Provenance', () => {
    it('preserves CV evidence and assigns user_confirmed to newly answered fields', () => {
      const initial = getMockProfile('student_cs')!
      const answers = {
        target_roles: {
          questionId: 'target_roles' as const,
          selectedOptionIds: ['software_backend', 'ai_ml'],
          answeredAt: new Date().toISOString(),
        },
      }

      const combined = buildCombinedProfile(initial, answers)

      // CV skills are untouched
      expect(combined.skills[0].name).toBe('Python')
      expect(combined.skills[0].source).toBe('cv')
      expect(combined.skills[0].evidence[0].source).toBe('cv')

      // Target roles updated
      expect(combined.careerPreferences.targetRoles).toEqual(['software_backend', 'ai_ml'])
      expect(combined.fieldStatuses?.targetRoles).toBe('confirmed')
    })

    it('does not allow completing a session when required questions remain unanswered', () => {
      const session = sessionService.startSession({ mockProfileId: 'student_cs' })

      // Attempt to complete without answering required questions
      expect(() => sessionService.completeSession(session.sessionId)).toThrowError(SessionError)
    })

    it('completes successfully once all required questions are answered', () => {
      const session = sessionService.startSession({ mockProfileId: 'software_grad' })

      // Software grad only requires learning_hours
      sessionService.submitAnswer(session.sessionId, {
        questionId: 'learning_hours',
        selectedOptionIds: ['hours_6_10'],
      })

      // Skip optional timeline
      sessionService.submitAnswer(session.sessionId, {
        questionId: 'career_timeline',
        selectedOptionIds: [],
        isSkipped: true,
      })

      const completion = sessionService.completeSession(session.sessionId)
      expect(completion.status).toBe('completed')
      expect(completion.finalProfile.learningPreferences.hoursPerWeekRange).toBe('hours_6_10')
      expect(completion.finalProfile.learningPreferences.timelinePreference).toBe('skipped')
    })

    it('seamlessly accepts arbitrary extracted CV data without hardcoding', () => {
      const extractedCVPayload = {
        candidateName: 'Taylor Morgan',
        careerStage: 'employed_tech',
        experienceContext: 'professional_work',
        skills: ['Rust', 'Go', 'Kubernetes'],
        education: [
          {
            qualification: 'B.S. in Computer Science',
            field: 'Software Engineering',
            institution: 'Stanford University',
            year: '2020',
          },
        ],
        experience: [
          {
            title: 'Systems Infrastructure Engineer',
            company: 'CloudScale Systems',
            duration: '2020 - 2024',
            responsibilities: [
              'Designed distributed consensus cluster in Rust',
              'Managed multi-region Kubernetes nodes',
            ],
          },
        ],
        projects: [
          {
            name: 'OpenSource Distributed KV Store',
            technologies: ['Rust', 'Raft', 'gRPC'],
            responsibilities: ['Authored Raft replication log compaction'],
            context: 'Open source systems project',
          },
        ],
        certifications: ['Certified Kubernetes Administrator (CKA)'],
        careerPreferences: {
          targetRoles: ['cloud_devops'],
          workInterests: ['infrastructure'],
        },
      }

      // Start session with real extracted CV data
      const session = sessionService.startSession({
        initialProfile: extractedCVPayload as any,
        source: 'cv_extractor',
      })

      expect(session.sessionId).toBeDefined()
      // Verifies all data came from extracted CV, not hardcoded mock
      expect(session.profileSummary.candidateName).toBe('Taylor Morgan')
      expect(session.profileSummary.skills.map((s) => s.name)).toEqual(['Rust', 'Go', 'Kubernetes'])
      expect(session.profileSummary.experience[0].title).toBe('Systems Infrastructure Engineer')
      expect(session.profileSummary.experience[0].company).toBe('CloudScale Systems')
      expect(session.profileSummary.education[0].institution).toBe('Stanford University')
      expect(session.profileSummary.projects[0].name).toBe('OpenSource Distributed KV Store')
      expect(session.profileSummary.certifications).toContain('Certified Kubernetes Administrator (CKA)')

      // Verify adaptive questions correctly analyze the extracted data:
      // Known: careerStage, targetRoles, workInterests, experienceContext
      // Missing: learning_hours
      expect(session.currentQuestion?.id).toBe('learning_hours')
    })
  })
})
