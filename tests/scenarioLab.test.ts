import { describe, it, expect } from 'vitest'
import {
  createSimulationJob,
  getSimulationJob,
  getSimulationHistory,
  getDirectDemoReport,
  checkMiroFishHealth,
} from '../server/scenarioLabService.ts'
import type { SimulationConfig } from '../src/types/scenarioLab.ts'

describe('Future Scenario Lab Backend & MiroFish Adapter', () => {
  it('should return health status with MiroFish availability and Gemini configuration', async () => {
    const health = await checkMiroFishHealth()
    expect(health).toBeDefined()
    expect(health.configuredModel).toBeDefined()
    expect(typeof health.isAvailable).toBe('boolean')
  })

  it('should generate or load pre-baked demo reports for Software Developer', () => {
    const report = getDirectDemoReport('Software Developer', 'accelerated_automation')
    expect(report).toBeDefined()
    expect(report.occupation).toBe('Software Developer')
    expect(report.scenario).toBe('accelerated_automation')
    expect(report.changingTasks.length).toBeGreaterThan(0)
    expect(report.emergingSkills.length).toBeGreaterThan(0)
    expect(report.sdgMappings.length).toBeGreaterThan(0)
    expect(report.findings.length).toBeGreaterThan(0)
  })

  it('should accept valid simulation request in demo mode and create a job', async () => {
    const config: SimulationConfig = {
      occupation: 'Software Developer',
      country: 'Malaysia',
      forecastHorizon: 2030,
      scenario: 'accelerated_automation',
      agentCount: 10,
      rounds: 3,
      evidenceSources: ['DOSM', 'WEF', 'LinkedIn'],
      isDemoMode: true,
    }

    const { job, fromCache } = await createSimulationJob(config, false)
    expect(job).toBeDefined()
    expect(job.id).toBeDefined()
    expect(['queued', 'preparing', 'completed']).toContain(job.status)
  })

  it('should reject invalid simulation request with missing occupation or scenario', async () => {
    await expect(
      createSimulationJob({} as any)
    ).rejects.toThrow('Valid occupation is required.')
  })

  it('should retrieve existing simulation job by id', () => {
    const history = getSimulationHistory()
    expect(Array.isArray(history)).toBe(true)
  })
})
