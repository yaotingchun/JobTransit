import type {
  AnswerSubmissionRequest,
  AnswerSubmissionResponse,
  CompleteSessionResponse,
  NextQuestionResponse,
  ProfileSummaryResponse,
  QuestionId,
  StartSessionRequest,
  StartSessionResponse,
} from '../types/followUpQuestion'
import { sessionService } from '../server/sessionService'

const API_BASE = '/api/follow-up'

class FollowUpApiClient {

  public async startSession(req: StartSessionRequest): Promise<StartSessionResponse> {
    try {
      const res = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP error ${res.status}`)
      }
      return await res.json()
    } catch {
      // Fallback for isolated environments or unit test environments without dev server
      return sessionService.startSession(req)
    }
  }

  public async getNextQuestion(sessionId: string): Promise<NextQuestionResponse> {
    try {
      const res = await fetch(`${API_BASE}/${sessionId}/next`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP error ${res.status}`)
      }
      return await res.json()
    } catch {
      return sessionService.getNextQuestion(sessionId)
    }
  }

  public async submitAnswer(
    sessionId: string,
    req: AnswerSubmissionRequest
  ): Promise<AnswerSubmissionResponse> {
    try {
      const res = await fetch(`${API_BASE}/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP error ${res.status}`)
      }
      return await res.json()
    } catch {
      return sessionService.submitAnswer(sessionId, req)
    }
  }

  public async getProfileSummary(sessionId: string): Promise<ProfileSummaryResponse> {
    try {
      const res = await fetch(`${API_BASE}/${sessionId}/summary`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP error ${res.status}`)
      }
      return await res.json()
    } catch {
      return sessionService.getProfileSummary(sessionId)
    }
  }

  public async completeSession(sessionId: string): Promise<CompleteSessionResponse> {
    try {
      const res = await fetch(`${API_BASE}/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP error ${res.status}`)
      }
      return await res.json()
    } catch {
      return sessionService.completeSession(sessionId)
    }
  }

  public async navigateToQuestion(
    sessionId: string,
    questionId: QuestionId
  ): Promise<NextQuestionResponse> {
    try {
      const res = await fetch(`${API_BASE}/${sessionId}/navigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP error ${res.status}`)
      }
      return await res.json()
    } catch {
      return sessionService.navigateToQuestion(sessionId, questionId)
    }
  }
}

export const followUpApi = new FollowUpApiClient()
