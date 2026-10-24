/**
 * Scenario Lab HTTP Router
 * Exposes REST API endpoints for simulations, telemetry, history, and MiroFish adapter.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  createSimulationJob,
  getSimulationJob,
  cancelSimulationJob,
  getSimulationHistory,
  getDirectDemoReport,
  checkMiroFishHealth,
} from './scenarioLabService.ts'
import type { SimulationConfig } from '../src/types/scenarioLab.ts'

/**
 * Handle incoming requests for /api/simulations*
 * Returns true if handled, false to continue middleware chain
 */
export async function handleSimulationRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  parsedUrl: URL
): Promise<boolean> {
  const pathname = parsedUrl.pathname

  if (!pathname.startsWith('/api/simulations')) {
    return false
  }

  // Set standard CORS & JSON headers
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return true
  }

  try {
    // 1. GET /api/simulations/health
    if (pathname === '/api/simulations/health' && req.method === 'GET') {
      const health = await checkMiroFishHealth()
      res.statusCode = 200
      res.end(JSON.stringify(health))
      return true
    }

    // 2. GET /api/simulations/history
    if (pathname === '/api/simulations/history' && req.method === 'GET') {
      const history = getSimulationHistory()
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, history }))
      return true
    }

    // 3. GET /api/simulations/demo-report
    if (pathname === '/api/simulations/demo-report' && req.method === 'GET') {
      const occ = parsedUrl.searchParams.get('occupation') || 'Software Developer'
      const scen = parsedUrl.searchParams.get('scenario') || 'accelerated_automation'
      const report = getDirectDemoReport(occ, scen)
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, report }))
      return true
    }

    // 4. POST /api/simulations - Create / queue simulation job
    if (pathname === '/api/simulations' && req.method === 'POST') {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}') as {
            config: SimulationConfig
            forceRerun?: boolean
          }
          if (!payload.config) {
            res.statusCode = 400
            res.end(JSON.stringify({ success: false, error: 'Missing simulation config' }))
            return
          }

          const { job, fromCache } = await createSimulationJob(payload.config, payload.forceRerun)
          res.statusCode = 201
          res.end(
            JSON.stringify({
              success: true,
              jobId: job.id,
              status: job.status,
              fromCache,
              isDemoReplay: job.isDemoReplay,
              message: job.currentStepMessage,
            })
          )
        } catch (err) {
          console.error('[API /api/simulations] Error:', err)
          res.statusCode = 500
          res.end(JSON.stringify({ success: false, error: String(err) }))
        }
      })
      return true
    }

    // 5. Parametric routes: /api/simulations/:id[/report|/cancel]
    const subPath = pathname.replace(/^\/api\/simulations\/?/, '')
    const parts = subPath.split('/')
    const jobId = parts[0]
    const action = parts[1] // undefined | 'report' | 'cancel'

    if (!jobId) {
      res.statusCode = 404
      res.end(JSON.stringify({ success: false, error: 'Simulation ID not provided' }))
      return true
    }

    // GET /api/simulations/:id/report
    if (action === 'report' && req.method === 'GET') {
      const job = getSimulationJob(jobId)
      if (!job) {
        res.statusCode = 404
        res.end(JSON.stringify({ success: false, error: `Simulation job "${jobId}" not found.` }))
        return true
      }
      if (job.status !== 'completed' || !job.report) {
        res.statusCode = 409
        res.end(
          JSON.stringify({
            success: false,
            status: job.status,
            progress: job.progressPercentage,
            error: `Report is not ready yet (Current status: ${job.status}).`,
          })
        )
        return true
      }
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, report: job.report }))
      return true
    }

    // POST /api/simulations/:id/cancel
    if (action === 'cancel' && req.method === 'POST') {
      const success = cancelSimulationJob(jobId)
      res.statusCode = 200
      res.end(JSON.stringify({ success, message: success ? 'Simulation cancelled.' : 'Could not cancel simulation.' }))
      return true
    }

    // GET /api/simulations/:id - Get status
    if (!action && req.method === 'GET') {
      const job = getSimulationJob(jobId)
      if (!job) {
        res.statusCode = 404
        res.end(JSON.stringify({ success: false, error: `Simulation job "${jobId}" not found.` }))
        return true
      }
      res.statusCode = 200
      res.end(
        JSON.stringify({
          success: true,
          jobId: job.id,
          status: job.status,
          progressPercentage: job.progressPercentage,
          currentStepMessage: job.currentStepMessage,
          isDemoReplay: job.isDemoReplay,
          fromCache: job.fromCache,
          hasReport: Boolean(job.report),
          error: job.error,
          updatedAt: job.updatedAt,
        })
      )
      return true
    }

    res.statusCode = 404
    res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }))
    return true
  } catch (err) {
    console.error('[ScenarioLab Router] Unhandled error:', err)
    res.statusCode = 500
    res.end(JSON.stringify({ success: false, error: String(err) }))
    return true
  }
}
