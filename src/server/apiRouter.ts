import type { IncomingMessage, ServerResponse } from 'node:http'
import { sessionService, SessionError } from './sessionService'
import type { QuestionId } from '../types/followUpQuestion'

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer | string) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new SessionError('Invalid JSON body.', 400))
      }
    })
    req.on('error', (err: unknown) => reject(err))
  })
}

/**
 * Connect/Vite middleware for Follow-up API endpoints
 */
export async function followUpApiMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) {
  const url = req.url || ''
  if (!url.startsWith('/api/follow-up')) {
    return next()
  }

  const method = req.method?.toUpperCase()
  const cleanUrl = url.split('?')[0]
  const pathParts = cleanUrl.replace(/^\/api\/follow-up\/?/, '').split('/').filter(Boolean)

  try {
    // POST /api/follow-up/start
    if (method === 'POST' && pathParts.length === 1 && pathParts[0] === 'start') {
      const body = await parseBody(req)
      const result = sessionService.startSession(body)
      return sendJson(res, 201, result)
    }

    // Endpoints requiring :sessionId
    if (pathParts.length >= 2) {
      const sessionId = pathParts[0]
      const action = pathParts[1]

      // GET /api/follow-up/:sessionId/next
      if (method === 'GET' && action === 'next') {
        const result = sessionService.getNextQuestion(sessionId)
        return sendJson(res, 200, result)
      }

      // POST /api/follow-up/:sessionId/answer
      if (method === 'POST' && action === 'answer') {
        const body = await parseBody(req)
        const result = sessionService.submitAnswer(sessionId, body)
        return sendJson(res, 200, result)
      }

      // GET /api/follow-up/:sessionId/summary
      if (method === 'GET' && action === 'summary') {
        const result = sessionService.getProfileSummary(sessionId)
        return sendJson(res, 200, result)
      }

      // POST /api/follow-up/:sessionId/complete
      if (method === 'POST' && action === 'complete') {
        const result = sessionService.completeSession(sessionId)
        return sendJson(res, 200, result)
      }

      // POST /api/follow-up/:sessionId/navigate (convenience for editing a question)
      if (method === 'POST' && action === 'navigate') {
        const body = await parseBody(req)
        const result = sessionService.navigateToQuestion(sessionId, body.questionId as QuestionId)
        return sendJson(res, 200, result)
      }
    }

    return sendJson(res, 404, { error: `Endpoint not found: ${method} ${cleanUrl}` })
  } catch (err: any) {
    const statusCode = err instanceof SessionError ? err.statusCode : 500
    const message = err.message || 'Internal server error.'
    return sendJson(res, statusCode, { error: message })
  }
}
