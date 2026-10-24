import type { SessionState } from '../types/followUpQuestion'

class SessionStore {
  private sessions = new Map<string, SessionState>()

  public getSession(sessionId: string): SessionState | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null
    // Return a clone to prevent unintended external direct mutations
    return JSON.parse(JSON.stringify(session))
  }

  public saveSession(session: SessionState): void {
    session.updatedAt = new Date().toISOString()
    this.sessions.set(session.sessionId, JSON.parse(JSON.stringify(session)))
  }

  public deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId)
  }

  public clear(): void {
    this.sessions.clear()
  }

  public count(): number {
    return this.sessions.size
  }
}

export const sessionStore = new SessionStore()
