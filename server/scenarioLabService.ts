/**
 * Scenario Lab Service & Job Queue Manager
 * Manages asynchronous simulation jobs, local cache persistence, and cost/concurrency controls.
 */

import fs from 'node:fs'
import path from 'node:path'
import type {
  SimulationConfig,
  SimulationJob,
  SimulationStatus,
  NormalizedSimulationReport,
  SimulationHistorySummary,
} from '../src/types/scenarioLab.ts'
import {
  runMiroFishSimulation,
  checkMiroFishHealth,
  getDemoReport,
} from './mirofishAdapter.ts'
import { SCENARIO_DEFINITIONS } from '../src/data/scenarioLabData.ts'

const CACHE_FILE_PATH = path.resolve(process.cwd(), 'server/data/simulations_cache.json')

// In-memory active jobs registry
const activeJobs = new Map<string, SimulationJob>()

// Maximum concurrent simulations allowed on a laptop environment
const MAX_CONCURRENT_SIMULATIONS = 1

/**
 * Ensure persistent data directory and file exist
 */
function ensureCacheDir() {
  const dir = path.dirname(CACHE_FILE_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(CACHE_FILE_PATH)) {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify({ cachedReports: {}, history: [] }, null, 2), 'utf-8')
  }
}

/**
 * Generate a cache key based on configuration parameters
 */
function makeCacheKey(config: SimulationConfig): string {
  const occ = config.occupation.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')
  const scen = config.scenario
  const country = (config.country || 'malaysia').toLowerCase().trim()
  const horizon = config.forecastHorizon || 2030
  return `${occ}__${scen}__${country}__${horizon}`
}

/**
 * Read cached reports and history from disk
 */
function readCache(): {
  cachedReports: Record<string, NormalizedSimulationReport>
  history: SimulationHistorySummary[]
} {
  ensureCacheDir()
  try {
    const raw = fs.readFileSync(CACHE_FILE_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.warn('[ScenarioLab Service] Failed to read cache, initializing empty:', err)
    return { cachedReports: {}, history: [] }
  }
}

/**
 * Write cached reports and history to disk
 */
function writeCache(data: {
  cachedReports: Record<string, NormalizedSimulationReport>
  history: SimulationHistorySummary[]
}) {
  ensureCacheDir()
  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('[ScenarioLab Service] Failed to write cache to disk:', err)
  }
}

/**
 * Count how many simulations are currently actively running
 */
function getActiveRunningCount(): number {
  let count = 0
  for (const job of activeJobs.values()) {
    if (job.status === 'preparing' || job.status === 'running' || job.status === 'generating') {
      count++
    }
  }
  return count
}

/**
 * Find an ongoing simulation with identical configuration to prevent duplicate clicks
 */
function findOngoingJob(config: SimulationConfig): SimulationJob | null {
  for (const job of activeJobs.values()) {
    const isSame =
      job.config.occupation === config.occupation &&
      job.config.scenario === config.scenario &&
      job.config.country === config.country &&
      job.config.forecastHorizon === config.forecastHorizon

    if (isSame && (job.status === 'queued' || job.status === 'preparing' || job.status === 'running' || job.status === 'generating')) {
      return job
    }
  }
  return null
}

/**
 * Start or retrieve a simulation job
 */
export async function createSimulationJob(
  config: SimulationConfig,
  forceRerun = false
): Promise<{ job: SimulationJob; fromCache: boolean }> {
  // Validate request
  if (!config.occupation || typeof config.occupation !== 'string') {
    throw new Error('Valid occupation is required.')
  }
  if (!config.scenario || typeof config.scenario !== 'string') {
    throw new Error('Valid scenario is required.')
  }

  // 1. Check for duplicate click on ongoing run
  const ongoing = findOngoingJob(config)
  if (ongoing && !forceRerun) {
    console.log(`[ScenarioLab Service] Found existing active job ${ongoing.id} for ${config.occupation}. Reusing.`)
    return { job: ongoing, fromCache: false }
  }

  // 2. Check persistent cache if rerun not forced
  const cacheKey = makeCacheKey(config)
  const diskCache = readCache()
  const cachedReport = diskCache.cachedReports[cacheKey]

  if (cachedReport && !forceRerun) {
    console.log(`[ScenarioLab Service] Cache HIT for key "${cacheKey}". Returning cached report.`)
    const cachedJobId = `job-cached-${Date.now()}`
    const cachedJob: SimulationJob = {
      id: cachedJobId,
      config,
      status: 'completed',
      progressPercentage: 100,
      currentStepMessage: 'Loaded instantly from local verified simulation cache.',
      createdAt: cachedReport.completedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      report: cachedReport,
      fromCache: true,
      isDemoReplay: cachedReport.isDemoReplay,
    }
    activeJobs.set(cachedJobId, cachedJob)
    return { job: cachedJob, fromCache: true }
  }

  // 3. Concurrency check
  if (getActiveRunningCount() >= MAX_CONCURRENT_SIMULATIONS) {
    throw new Error(`Maximum concurrent simulations (${MAX_CONCURRENT_SIMULATIONS}) in progress on this laptop. Please wait for the current job to finish.`)
  }

  // 4. Create new job
  const jobId = `sim-job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  const newJob: SimulationJob = {
    id: jobId,
    config,
    status: 'queued',
    progressPercentage: 5,
    currentStepMessage: 'Job queued in background...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fromCache: false,
    isDemoReplay: Boolean(config.isDemoMode),
  }

  activeJobs.set(jobId, newJob)

  // Launch asynchronous simulation execution without blocking HTTP response
  runSimulationAsync(jobId, config, cacheKey).catch((err) => {
    console.error(`[ScenarioLab Service] Simulation job ${jobId} failed:`, err)
  })

  return { job: newJob, fromCache: false }
}

/**
 * Asynchronous job runner
 */
async function runSimulationAsync(jobId: string, config: SimulationConfig, cacheKey: string) {
  const job = activeJobs.get(jobId)
  if (!job) return

  const updateProgress = (status: SimulationStatus, pct: number, message: string) => {
    job.status = status
    job.progressPercentage = pct
    job.currentStepMessage = message
    job.updatedAt = new Date().toISOString()
  }

  try {
    updateProgress('preparing', 10, 'Initializing simulation environment and parameters...')

    const report = await runMiroFishSimulation(jobId, config, updateProgress)

    job.status = 'completed'
    job.progressPercentage = 100
    job.currentStepMessage = 'Simulation and report synthesis completed.'
    job.report = report
    job.updatedAt = new Date().toISOString()

    // Save to disk cache
    const diskCache = readCache()
    diskCache.cachedReports[cacheKey] = report

    // Prepend to history (up to last 30 runs)
    const scenarioName = SCENARIO_DEFINITIONS[config.scenario]?.name || config.scenario
    const historyItem: SimulationHistorySummary = {
      id: jobId,
      occupation: config.occupation,
      scenario: config.scenario,
      scenarioName,
      country: config.country || 'Malaysia',
      forecastHorizon: config.forecastHorizon || 2030,
      status: 'completed',
      createdAt: job.createdAt,
      isDemoReplay: report.isDemoReplay,
    }

    diskCache.history = [historyItem, ...diskCache.history.filter((h) => h.id !== jobId)].slice(0, 30)
    writeCache(diskCache)

    console.log(`[ScenarioLab Service] Job ${jobId} completed and cached successfully.`)
  } catch (err) {
    job.status = 'failed'
    job.currentStepMessage = 'Simulation encountered an unexpected failure.'
    job.error = err instanceof Error ? err.message : String(err)
    job.updatedAt = new Date().toISOString()
    console.error(`[ScenarioLab Service] Job ${jobId} error:`, err)
  }
}

/**
 * Get job status by ID
 */
export function getSimulationJob(jobId: string): SimulationJob | null {
  const memJob = activeJobs.get(jobId)
  if (memJob) return memJob

  // Check if it exists in disk cache
  const diskCache = readCache()
  for (const report of Object.values(diskCache.cachedReports)) {
    if (report.simulationId === jobId) {
      const restoredJob: SimulationJob = {
        id: jobId,
        config: {
          occupation: report.occupation,
          country: report.country,
          forecastHorizon: report.forecastHorizon,
          scenario: report.scenario,
          agentCount: 10,
          rounds: 3,
          evidenceSources: [],
          isDemoMode: report.isDemoReplay,
        },
        status: 'completed',
        progressPercentage: 100,
        currentStepMessage: 'Restored from persistent simulation history.',
        createdAt: report.completedAt,
        updatedAt: report.completedAt,
        report,
        fromCache: true,
        isDemoReplay: report.isDemoReplay,
      }
      activeJobs.set(jobId, restoredJob)
      return restoredJob
    }
  }

  return null
}

/**
 * Cancel an active simulation job
 */
export function cancelSimulationJob(jobId: string): boolean {
  const job = activeJobs.get(jobId)
  if (!job) return false

  if (job.status === 'preparing' || job.status === 'running' || job.status === 'queued') {
    job.status = 'cancelled'
    job.progressPercentage = 0
    job.currentStepMessage = 'Simulation cancelled by user.'
    job.updatedAt = new Date().toISOString()
    return true
  }
  return false
}

/**
 * Get simulation history list
 */
export function getSimulationHistory(): SimulationHistorySummary[] {
  const diskCache = readCache()
  return diskCache.history || []
}

/**
 * Get direct pre-baked demo report
 */
export function getDirectDemoReport(occupation: string, scenarioId: string): NormalizedSimulationReport {
  return getDemoReport({
    occupation,
    scenario: scenarioId as any,
    country: 'Malaysia',
    forecastHorizon: 2030,
    agentCount: 10,
    rounds: 3,
    evidenceSources: [],
    isDemoMode: true,
  })
}

export { checkMiroFishHealth }
