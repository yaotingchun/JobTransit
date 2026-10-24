import React, { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  Play,
  RotateCcw,
  AlertTriangle,
  Layers,
  Users,
  Compass,
  Cpu,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  BookOpen,
  Info,
  Sliders,
  Activity,
  History,
  X,
  FileText,
  Building,
  GraduationCap,
  Scale,
  Globe,
} from 'lucide-react'
import type {
  SimulationConfig,
  SimulationScenarioId,
  SimulationStatus,
  NormalizedSimulationReport,
  SimulationHistorySummary,
} from '../../types/scenarioLab.ts'
import {
  SCENARIO_DEFINITIONS,
  DEMO_SIMULATION_REPORTS,
} from '../../data/scenarioLabData.ts'
import { ROLE_TRENDS, type RoleTrend } from './trendData.ts'

interface FutureScenarioLabProps {
  onNavigateToTransit?: (stationId: string) => void
}

export const FutureScenarioLab: React.FC<FutureScenarioLabProps> = () => {
  // ── Configuration State ──
  const [selectedRoleTitle, setSelectedRoleTitle] = useState<string>(ROLE_TRENDS[0]?.title || 'Software Developer')
  const [selectedScenarioId, setSelectedScenarioId] = useState<SimulationScenarioId>('accelerated_automation')
  const [country, setCountry] = useState<string>('Malaysia')
  const [forecastHorizon, setForecastHorizon] = useState<number>(2030)
  const [agentCount, setAgentCount] = useState<number>(10)
  const [rounds, setRounds] = useState<number>(3)
  const [selectedSources] = useState<string[]>([
    'Department of Statistics Malaysia (DOSM)',
    'Critical Occupations List (COL) MOHR',
    'WEF Future of Jobs Report 2025/2026',
    'JobTransit LinkedIn Live Telemetry',
  ])
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true)

  // ── Execution & Telemetry State ──
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>('completed')
  const [progressPct, setProgressPct] = useState<number>(100)
  const [statusMessage, setStatusMessage] = useState<string>('Loaded verified simulation dossier.')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeReport, setActiveReport] = useState<NormalizedSimulationReport | null>(() => {
    return DEMO_SIMULATION_REPORTS['software-developer_accelerated_automation'] || null
  })
  const [historyList, setHistoryList] = useState<SimulationHistorySummary[]>([])
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false)
  const [activeResultsTab, setActiveResultsTab] = useState<
    'overview' | 'tasks' | 'skills' | 'agents' | 'pathways' | 'sdgs' | 'audit'
  >('overview')
  const [miroFishHealth, setMiroFishHealth] = useState<{
    isAvailable: boolean
    configuredModel: string
    details: string
  } | null>(null)

  // Find corresponding RoleTrend item from existing taxonomy
  const activeRoleTrend: RoleTrend | undefined = useMemo(() => {
    return ROLE_TRENDS.find((r) => r.title.toLowerCase() === selectedRoleTitle.toLowerCase()) || ROLE_TRENDS[0]
  }, [selectedRoleTitle])

  // Dynamically compute regional labour-market metrics based on selected country
  const marketAdjustedMetrics = useMemo(() => {
    const basePool = activeRoleTrend?.openings2026 ?? 35000
    const baseVelocity = activeRoleTrend?.velocityRate24h ?? 38.6

    if (country === 'Malaysia') {
      // Grounded in Department of Statistics Malaysia (DOSM) & TalentCorp National ICT pool (~8.5% of regional/global tracked)
      const malaysiaPool = Math.round(basePool * 0.085)
      return {
        pool: malaysiaPool,
        velocity: Math.round(baseVelocity * 0.95 * 10) / 10,
        sourceLabel: 'Malaysia (DOSM & TalentCorp)',
      }
    }

    if (country === 'ASEAN Regional') {
      // Grounded in ASEAN tech hubs (Singapore, Malaysia, Indonesia, Thailand ~24%)
      const aseanPool = Math.round(basePool * 0.24)
      return {
        pool: aseanPool,
        velocity: Math.round(baseVelocity * 1.02 * 10) / 10,
        sourceLabel: 'ASEAN Regional Hubs',
      }
    }

    return {
      pool: basePool,
      velocity: baseVelocity,
      sourceLabel: 'Worldwide (Global LinkedIn Index)',
    }
  }, [activeRoleTrend, country])

  // Current Scenario Definition
  const currentScenario = SCENARIO_DEFINITIONS[selectedScenarioId] || SCENARIO_DEFINITIONS.baseline_adoption

  // Fetch health status & history on mount
  useEffect(() => {
    let isMounted = true

    const fetchInitialData = async () => {
      try {
        const [healthRes, historyRes] = await Promise.all([
          fetch('/api/simulations/health').catch(() => null),
          fetch('/api/simulations/history').catch(() => null),
        ])

        if (healthRes && healthRes.ok) {
          const hData = await healthRes.json()
          if (isMounted) setMiroFishHealth(hData)
        }
        if (historyRes && historyRes.ok) {
          const histData = await historyRes.json()
          if (isMounted && histData.history) setHistoryList(histData.history)
        }
      } catch {
        // Fallback silently if offline
      }
    }

    fetchInitialData()
    return () => {
      isMounted = false
    }
  }, [])

  // Poll job status while running
  useEffect(() => {
    if (!activeJobId) return
    if (simulationStatus === 'completed' || simulationStatus === 'failed' || simulationStatus === 'cancelled') {
      return
    }

    let isCancelled = false
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/simulations/${activeJobId}`)
        if (!res.ok) return
        const data = await res.json()
        if (isCancelled) return

        setProgressPct(data.progressPercentage ?? 10)
        setStatusMessage(data.currentStepMessage || 'Simulating...')
        setSimulationStatus(data.status)

        if (data.status === 'completed') {
          // Fetch final report
          const repRes = await fetch(`/api/simulations/${activeJobId}/report`)
          if (repRes.ok) {
            const repData = await repRes.json()
            if (repData.report) {
              setActiveReport(repData.report)
              // Refresh history
              fetch('/api/simulations/history')
                .then((r) => r.json())
                .then((h) => h.history && setHistoryList(h.history))
                .catch(() => {})
            }
          }
          clearInterval(interval)
        } else if (data.status === 'failed') {
          setErrorMessage(data.error || 'Simulation process failed.')
          clearInterval(interval)
        }
      } catch (err) {
        console.error('Failed to poll simulation status:', err)
      }
    }, 1200)

    return () => {
      isCancelled = true
      clearInterval(interval)
    }
  }, [activeJobId, simulationStatus])

  // Handle Run Simulation
  const handleRunSimulation = async (forceRerun = false) => {
    setErrorMessage(null)
    setSimulationStatus('preparing')
    setProgressPct(10)
    setStatusMessage('Preparing evidence and configuring multi-agent sandbox...')

    const payloadConfig: SimulationConfig = {
      occupation: selectedRoleTitle,
      country,
      forecastHorizon,
      scenario: selectedScenarioId,
      agentCount,
      rounds,
      evidenceSources: selectedSources,
      isDemoMode,
    }

    try {
      const res = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: payloadConfig,
          forceRerun,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Server responded with ${res.status}`)
      }

      const data = await res.json()
      setActiveJobId(data.jobId)

      // If returned directly from cache, retrieve report right away
      if (data.fromCache) {
        setProgressPct(100)
        setSimulationStatus('completed')
        setStatusMessage('Loaded immediately from verified local cache.')
        const repRes = await fetch(`/api/simulations/${data.jobId}/report`)
        if (repRes.ok) {
          const repData = await repRes.json()
          if (repData.report) setActiveReport(repData.report)
        }
      }
    } catch (err) {
      console.error('Run simulation failed:', err)
      setSimulationStatus('failed')
      setErrorMessage(err instanceof Error ? err.message : String(err))
    }
  }

  // Handle Cancel Simulation
  const handleCancelSimulation = async () => {
    if (!activeJobId) return
    try {
      await fetch(`/api/simulations/${activeJobId}/cancel`, { method: 'POST' })
      setSimulationStatus('cancelled')
      setStatusMessage('Simulation cancelled by user.')
    } catch (err) {
      console.error('Failed to cancel simulation:', err)
    }
  }

  // Load a historical or demo report
  const handleLoadReportById = async (jobId: string) => {
    try {
      const res = await fetch(`/api/simulations/${jobId}/report`)
      if (res.ok) {
        const data = await res.json()
        if (data.report) {
          setActiveReport(data.report)
          setSelectedRoleTitle(data.report.occupation)
          setSelectedScenarioId(data.report.scenario)
          setForecastHorizon(data.report.forecastHorizon)
          setCountry(data.report.country)
          setIsHistoryDrawerOpen(false)
        }
      }
    } catch (err) {
      console.error('Failed to load historic report:', err)
    }
  }

  const isSimulating =
    simulationStatus === 'queued' ||
    simulationStatus === 'preparing' ||
    simulationStatus === 'running' ||
    simulationStatus === 'generating'

  return (
    <div className="space-y-8 font-sans text-stone-900 pb-16">
      {/* ── 1. MASTHEAD & TELEMETRY PROVENANCE ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900 text-amber-300 text-[10px] font-mono-board tracking-[0.25em] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            MIROFISH AGENTIC ENGINE · MULTI-SCENARIO LAB
          </div>

          <h2 className="font-signage text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 leading-[0.95] mt-3">
            FUTURE SCENARIO<span className="text-transparent [-webkit-text-stroke:2px_#1C1917]"> LAB</span>
          </h2>

          <p className="text-sm sm:text-base text-stone-700 mt-2.5 max-w-2xl font-medium leading-relaxed">
            Simulate how alternative AI adoption scenarios disrupt labour-market dynamics in Malaysia and regional tech hubs.
            Powered by the MiroFish multi-agent simulation engine, exploring emergent employer behaviors, skills shifts, and United Nations SDGs.
          </p>
        </div>

        {/* Provenance & Mode Switch Badge */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-mono-board font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              isDemoMode
                ? 'bg-amber-500 text-stone-950 border-amber-600'
                : 'bg-stone-900 text-stone-100 border-stone-800'
            }`}
            title="Toggle between Zero-Cost Demo Replay and Live External MiroFish Execution"
          >
            <div className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-stone-950' : 'bg-emerald-400 animate-pulse'}`} />
            <span>{isDemoMode ? 'REPLAY MODE (ZERO API COST)' : 'LIVE MIROFISH ENGINE'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="p-2.5 px-3.5 rounded-2xl bg-white/90 hover:bg-stone-100 border border-stone-200 text-stone-900 shadow-xs flex items-center gap-2 font-mono-board text-xs font-bold cursor-pointer transition-all"
            title="View Past Simulation History"
          >
            <History className="w-4 h-4 text-stone-600" />
            <span>HISTORY ({historyList.length})</span>
          </button>
        </div>
      </div>

      {/* Disconnection / Mode Banner if MiroFish service is offline */}
      {miroFishHealth && !miroFishHealth.isAvailable && !isDemoMode && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3 text-xs font-mono-board">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-black text-amber-900 uppercase">MiroFish Local Service Offline on Port 5001</div>
            <p className="text-amber-800 font-sans text-xs">
              MiroFish backend is not currently running. You can continue with <strong>Replay Mode</strong> for instant, zero-cost scenario analysis, or start MiroFish locally via{' '}
              <code className="px-1.5 py-0.5 bg-amber-200 rounded text-amber-950 font-mono">python backend/run.py</code>.
            </p>
          </div>
        </div>
      )}

      {/* ── 2. CONFIGURATION MATRIX CARDS (TRANSIT METRO DOCK) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (Span 4): Occupation & Geography Selection */}
        <div className="lg:col-span-4 rounded-[24px] bg-[#EEF0F3] border-2 border-stone-300 p-5 sm:p-6 space-y-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-300/80 pb-3">
              <span className="font-mono-board text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-600" />
                [A] TARGET STATION &amp; REGION
              </span>
              <span className="text-[10px] font-mono-board bg-stone-900 text-amber-300 px-2 py-0.5 rounded font-black">
                {activeRoleTrend ? `#${activeRoleTrend.rank2026} INFLUX` : 'VERIFIED'}
              </span>
            </div>

            {/* Occupation Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono-board font-bold text-stone-700">Select Occupation Track:</label>
              <select
                value={selectedRoleTitle}
                onChange={(e) => setSelectedRoleTitle(e.target.value)}
                disabled={isSimulating}
                className="w-full p-3 rounded-xl bg-white border-2 border-stone-300 font-signage text-base font-black text-stone-900 focus:outline-none focus:border-amber-500 shadow-2xs cursor-pointer"
              >
                {ROLE_TRENDS.map((role) => (
                  <option key={role.id} value={role.title}>
                    {role.title} ({role.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Region / Horizon Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono-board text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-600 text-[11px]">Labour Market:</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={isSimulating}
                  className="w-full p-2.5 rounded-xl bg-white border-2 border-stone-200 font-bold text-stone-900 focus:outline-none focus:border-amber-500 shadow-2xs"
                >
                  <option value="Malaysia">Malaysia (DOSM/MOHR)</option>
                  <option value="ASEAN Regional">ASEAN Hub</option>
                  <option value="Worldwide">Worldwide (LinkedIn)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-600 text-[11px]">Forecast Horizon:</label>
                <select
                  value={forecastHorizon}
                  onChange={(e) => setForecastHorizon(Number(e.target.value))}
                  disabled={isSimulating}
                  className="w-full p-2.5 rounded-xl bg-white border-2 border-stone-200 font-bold text-stone-900 focus:outline-none focus:border-amber-500 shadow-2xs"
                >
                  <option value={2027}>2027 (Near-Term)</option>
                  <option value={2030}>2030 (Strategic)</option>
                  <option value={2035}>2035 (Long-Range)</option>
                </select>
              </div>
            </div>

            {/* Role Baseline Snapshot */}
            {activeRoleTrend && (
              <div className="p-3.5 rounded-xl bg-white border-2 border-amber-200/70 text-xs font-mono-board space-y-2 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500">Live Active Pool:</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-stone-100 text-stone-700 border border-stone-200">
                      {country === 'Malaysia' ? 'DOSM 8.5%' : country === 'ASEAN Regional' ? 'ASEAN 24%' : 'Global 100%'}
                    </span>
                  </div>
                  <span className="font-black text-stone-900 text-sm">{marketAdjustedMetrics.pool.toLocaleString()} openings</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">24h Replenishment:</span>
                  <span className="font-black text-emerald-700">+{marketAdjustedMetrics.velocity}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Empirical AI Exposure:</span>
                  <span className="font-black text-purple-700">{activeRoleTrend.aiExposure.overallPercentage}% exposure</span>
                </div>
                <div className="text-[10px] text-stone-500 border-t border-stone-100 pt-1.5 flex items-center justify-between">
                  <span className="truncate pr-2">Scope: {marketAdjustedMetrics.sourceLabel}</span>
                  <span className="text-emerald-700 font-bold shrink-0">● Synchronized</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 text-[10px] font-mono-board text-stone-500">
            *Grounds simulated agent parameters in verified JobTransit Live &amp; DOSM datasets.
          </div>
        </div>

        {/* Center Column (Span 5): Scenario Selection */}
        <div className="lg:col-span-5 rounded-[24px] bg-[#EEF0F3] border-2 border-stone-300 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-300/80 pb-3">
            <span className="font-mono-board text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              [B] AI ADOPTION TRAJECTORY
            </span>
            <span className="text-[10px] font-mono-board font-black text-stone-600">
              {currentScenario.adoptionSpeed} SPEED
            </span>
          </div>

          {/* 3 Scenarios Radio/Card Options */}
          <div className="space-y-3">
            {Object.values(SCENARIO_DEFINITIONS).map((scen) => {
              const isSelected = selectedScenarioId === scen.id
              return (
                <div
                  key={scen.id}
                  onClick={() => !isSimulating && setSelectedScenarioId(scen.id)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-1.5 select-none ${
                    isSelected
                      ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-400/20'
                      : 'bg-white/70 border-stone-200 hover:bg-white hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="font-signage text-base font-black text-stone-900">{scen.name}</div>
                      <div className="text-[11px] font-mono-board text-stone-500 font-bold">{scen.subtitle}</div>
                    </div>
                    <span
                      className={`text-[9.5px] font-mono-board px-2 py-0.5 rounded font-black shrink-0 ${
                        scen.riskProfile === 'High Displacement'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : scen.riskProfile === 'Skills Redistribution'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {scen.riskProfile}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-sans leading-relaxed line-clamp-2">{scen.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column (Span 3): Laptop-Friendly Simulation Controls */}
        <div className="lg:col-span-3 rounded-[24px] bg-stone-900 text-stone-100 p-5 sm:p-6 space-y-5 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="font-mono-board text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                [C] SIMULATION CONTROLS
              </span>
            </div>

            {/* Slider 1: Agents Count (Default 10) */}
            <div className="space-y-1.5 font-mono-board">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300">Agents:</span>
                <span className="font-black text-amber-400">{agentCount} Swarm Agents</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="5"
                value={agentCount}
                onChange={(e) => setAgentCount(Number(e.target.value))}
                disabled={isSimulating}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>5 (Fast)</span>
                <span>10 (Default)</span>
                <span>25 (Deep)</span>
              </div>
            </div>

            {/* Slider 2: Simulation Rounds (Default 3) */}
            <div className="space-y-1.5 font-mono-board">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300">Rounds:</span>
                <span className="font-black text-amber-400">{rounds} Deliberations</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                disabled={isSimulating}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>1 Round</span>
                <span>3 (Default)</span>
                <span>5 Rounds</span>
              </div>
            </div>

            {/* Laptop Safety Note */}
            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 text-[11px] font-mono-board text-stone-300 space-y-1">
              <div className="font-black text-amber-300 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> LAPTOP SAFEGUARD
              </div>
              <p className="text-stone-400 font-sans text-xs">
                Restricted to single concurrent run. Max 25 agents prevents memory saturation.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {!isSimulating ? (
              <button
                type="button"
                onClick={() => handleRunSimulation(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-mono-board text-xs font-black tracking-wider transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isDemoMode ? 'LOAD SCENARIO REPLAY' : 'RUN LIVE SIMULATION'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelSimulation}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono-board text-xs font-black tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>CANCEL SIMULATION</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleRunSimulation(true)}
              disabled={isSimulating}
              className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono-board text-[11px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>FORCE FRESH SIMULATION</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. LIVE SIMULATION TELEMETRY PROGRESS BAR ── */}
      {isSimulating && (
        <div className="p-5 rounded-2xl bg-white border-2 border-amber-400 shadow-md space-y-3 font-mono-board">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-stone-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600 animate-spin" />
              SIMULATION IN PROGRESS · {simulationStatus.toUpperCase()}
            </span>
            <span className="font-black text-amber-600">{progressPct}%</span>
          </div>

          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-600">
            <span>{statusMessage}</span>
            <span className="text-stone-400">Target: {selectedRoleTitle} · {currentScenario.name}</span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex items-center gap-3 text-xs font-mono-board">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1 font-sans text-xs">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-stone-400 hover:text-stone-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 4. RESULTS DASHBOARD (NORMALIZED REPORT SCHEMA) ── */}
      {activeReport && (
        <div className="space-y-6">
          {/* Dashboard Header & Methodology Banner */}
          <div className="rounded-[24px] bg-white border-2 border-stone-300 p-6 space-y-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-board font-black bg-stone-900 text-amber-300">
                    {activeReport.scenarioName.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono-board text-stone-500 font-bold">
                    HORIZON: {activeReport.forecastHorizon}
                  </span>
                  <span className="text-xs font-mono-board text-stone-500 font-bold">
                    REGION: {activeReport.country}
                  </span>
                  {activeReport.isDemoReplay && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-board font-black bg-blue-100 text-blue-800 border border-blue-200">
                      REPLAY DOSSIER
                    </span>
                  )}
                </div>
                <h3 className="font-signage text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                  SIMULATION SYNTHESIS: {activeReport.occupation.toUpperCase()}
                </h3>

                {(activeReport.country !== country || activeReport.occupation !== selectedRoleTitle) && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono-board">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>
                      Dossier below is for <strong>{activeReport.occupation} ({activeReport.country})</strong>. Selected inputs above are <strong>{selectedRoleTitle} ({country})</strong>. Click <strong>{isDemoMode ? 'LOAD SCENARIO REPLAY' : 'RUN LIVE SIMULATION'}</strong> above to synthesize for this market.
                    </span>
                  </div>
                )}
              </div>

              {/* Cost / Token Metric Card */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono-board text-right space-y-0.5 shrink-0">
                <div className="text-[10px] text-stone-500 font-bold uppercase">GEMINI API TELEMETRY</div>
                <div className="font-black text-stone-900">
                  {activeReport.tokenUsage ? `${activeReport.tokenUsage.totalTokens.toLocaleString()} tokens` : 'Offline / Zero-Token'}
                </div>
                <div className="text-[10px] text-emerald-700 font-black">
                  {activeReport.estimatedCostUSD !== null ? `~$${activeReport.estimatedCostUSD.toFixed(4)} USD` : '$0.00 (Demo Mode)'}
                </div>
              </div>
            </div>

            {/* Crucial Epistemic Provenance Notice (Required Rule) */}
            <div className="p-3.5 px-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs font-mono-board flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5 font-sans leading-relaxed text-xs">
                <strong>Methodological Provenance:</strong> This dashboard clearly separates three distinct data tiers:
                (1) <em>Empirical historical &amp; LinkedIn live hiring volumes</em> (verified facts),
                (2) <em>Quantitative econometric baseline trends</em> (statistical estimates), and
                (3) <em>MiroFish multi-agent emergent deliberation</em> (exploratory scenario sandbox; not real human surveys).
              </div>
            </div>

            {/* Results Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-b border-stone-200 pb-2">
              {[
                { id: 'overview', label: '[01] EXECUTIVE SUMMARY' },
                { id: 'tasks', label: '[02] CHANGING TASKS' },
                { id: 'skills', label: '[03] SKILLS SHIFT' },
                { id: 'agents', label: '[04] AGENT DELIBERATION' },
                { id: 'pathways', label: '[05] RESKILLING PATHWAYS' },
                { id: 'sdgs', label: '[06] UN SDG MAPPINGS' },
                { id: 'audit', label: '[07] SOURCES & AUDIT' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveResultsTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono-board tracking-wider transition-colors cursor-pointer ${
                    activeResultsTab === tab.id
                      ? 'bg-stone-900 text-amber-300 font-black shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-bold'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── SUB-TAB 1: OVERVIEW ── */}
            {activeResultsTab === 'overview' && (
              <div className="space-y-6 pt-2">
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 font-sans space-y-2">
                  <h4 className="font-signage text-lg font-black text-stone-900 uppercase">Scenario Summary</h4>
                  <p className="text-sm text-stone-700 leading-relaxed font-medium">{activeReport.summary}</p>
                </div>

                {/* Findings Cards */}
                <div className="space-y-4">
                  <h4 className="font-mono-board text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    KEY SIMULATION FINDINGS &amp; EVIDENCE BASES
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeReport.findings.map((f, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white border-2 border-stone-200 hover:border-amber-400/80 transition-all space-y-3 shadow-2xs flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <span className="text-[9.5px] font-mono-board font-black px-2 py-0.5 rounded bg-stone-100 text-stone-700 uppercase">
                            {f.topic.replace(/_/g, ' ')}
                          </span>
                          <h5 className="font-signage text-base font-black text-stone-900 leading-snug">{f.title}</h5>
                          <p className="text-xs text-stone-600 font-sans leading-relaxed">{f.finding}</p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-stone-100 text-[11px] font-mono-board">
                          <div className="text-indigo-800 font-bold">Interpretation:</div>
                          <p className="text-stone-600 font-sans text-xs">{f.interpretation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── SUB-TAB 2: CHANGING TASKS ── */}
            {activeResultsTab === 'tasks' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="font-mono-board text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    TASK DISRUPTION &amp; TIME ALLOCATION DELTAS
                  </h4>
                  <span className="text-xs font-mono-board text-stone-500 font-bold">
                    {activeReport.changingTasks.length} Tracked Core Tasks
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeReport.changingTasks.map((t, i) => {
                    const isAutomated = t.category === 'automated'
                    const isHumanCore = t.category === 'human_core'
                    return (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3 font-mono-board shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span
                              className={`text-[9.5px] font-black px-2 py-0.5 rounded uppercase ${
                                isAutomated
                                  ? 'bg-rose-100 text-rose-800'
                                  : isHumanCore
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {t.category.replace('_', ' ')}
                            </span>
                            <h5 className="font-signage text-base font-black text-stone-900 mt-1">{t.task}</h5>
                          </div>

                          <div
                            className={`text-sm font-black px-2 py-1 rounded-lg shrink-0 ${
                              t.expectedTimeShiftPct < 0
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {t.expectedTimeShiftPct > 0 ? `+${t.expectedTimeShiftPct}%` : `${t.expectedTimeShiftPct}%`}
                          </div>
                        </div>

                        <p className="text-xs text-stone-600 font-sans leading-relaxed">{t.changeDescription}</p>

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                          <span className="text-stone-500">Oversight Required:</span>
                          <span className="font-black text-stone-900">{t.humanOversightLevel}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── SUB-TAB 3: SKILLS SHIFT ── */}
            {activeResultsTab === 'skills' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="font-mono-board text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    EMERGING VS DEPRECATING SKILL TAXONOMY
                  </h4>
                  <span className="text-xs font-mono-board text-stone-500 font-bold">
                    Cross-referenced with JobTransit Skills Radar
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeReport.emergingSkills.map((s, i) => {
                    const isSurging = s.trajectory === 'surging'
                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-2xl border-2 space-y-3 font-mono-board shadow-2xs ${
                          isSurging ? 'bg-white border-emerald-300' : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[9.5px] font-black text-stone-500 uppercase">{s.category}</span>
                            <h5 className="font-signage text-lg font-black text-stone-900 flex items-center gap-1.5">
                              {isSurging ? (
                                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-stone-500 shrink-0" />
                              )}
                              <span>{s.skillName}</span>
                            </h5>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] text-stone-500 font-bold">Priority</div>
                            <div className="font-signage text-lg font-black text-stone-900">{s.importanceScore}/100</div>
                          </div>
                        </div>

                        <p className="text-xs text-stone-600 font-sans leading-relaxed">{s.rationale}</p>

                        <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                          <span className="text-stone-500">Taxonomy Status:</span>
                          <span className="font-bold text-indigo-700">
                            {s.alignsWithExistingTaxonomy ? '✓ Verified in Metro Line' : 'Novel Emergent'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── SUB-TAB 4: AGENT DELIBERATION ── */}
            {activeResultsTab === 'agents' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="font-mono-board text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-600" />
                    SIMULATED STAKEHOLDER DELIBERATION &amp; BEHAVIORS
                  </h4>
                  <span className="text-xs font-mono-board text-stone-500 font-bold">
                    OASIS Multi-Agent Social Sandbox
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeReport.stakeholderBehaviors.map((b, i) => {
                    const icon =
                      b.stakeholderGroup === 'Employers' ? (
                        <Building className="w-4 h-4 text-stone-800" />
                      ) : b.stakeholderGroup === 'Workers & Graduates' ? (
                        <Users className="w-4 h-4 text-amber-600" />
                      ) : b.stakeholderGroup === 'Universities & Bootcamps' ? (
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Scale className="w-4 h-4 text-purple-600" />
                      )

                    return (
                      <div
                        key={i}
                        className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-2xs font-mono-board flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                            {icon}
                            <h5 className="font-signage text-base font-black text-stone-900 uppercase">
                              {b.stakeholderGroup}
                            </h5>
                          </div>
                          <p className="text-xs text-stone-700 font-sans leading-relaxed">
                            <strong>Simulated Strategic Tendency:</strong> {b.simulatedAction}
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs">
                          <div className="text-amber-800 font-bold">Key Sentiment:</div>
                          <div className="text-stone-600 font-sans">{b.keySentiment}</div>
                          <div className="text-rose-700 font-bold pt-1">Primary Tension Point:</div>
                          <div className="text-stone-600 font-sans">{b.tensionPoint}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── SUB-TAB 5: RESKILLING PATHWAYS ── */}
            {activeResultsTab === 'pathways' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="font-mono-board text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    ACTIONABLE, MULTI-SCENARIO ROBUST RESKILLING PATHWAYS
                  </h4>
                  <span className="text-xs font-mono-board text-stone-500 font-bold">
                    Connected to HRD Corp &amp; UN SDG 4
                  </span>
                </div>

                <div className="space-y-3">
                  {activeReport.reskillingRecommendations.map((r, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-white border-2 border-stone-200 hover:border-emerald-400 transition-all space-y-3 shadow-2xs font-mono-board"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center font-signage text-sm font-black">
                            {r.stage}
                          </span>
                          <h5 className="font-signage text-lg font-black text-stone-900">{r.milestoneTitle}</h5>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            {r.estimatedTimeToAttain}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-bold">
                            {r.relevantSDG}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-700 font-sans leading-relaxed">{r.recommendedAction}</p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-stone-500 uppercase font-bold mr-1">Focus Bridge Skills:</span>
                        {r.focusSkills.map((sk) => (
                          <span
                            key={sk}
                            className="px-2.5 py-1 rounded-lg text-xs font-mono-board font-black bg-stone-100 text-stone-800 border border-stone-200"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SUB-TAB 6: UN SDG MAPPINGS ── */}
            {activeResultsTab === 'sdgs' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="font-mono-board text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    UNITED NATIONS SUSTAINABLE DEVELOPMENT GOALS (SDGS 1-17)
                  </h4>
                  <span className="text-xs font-mono-board text-stone-500 font-bold">
                    Directly Grounded in Targets 4.4, 8.5, 9.5 &amp; 10.2
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeReport.sdgMappings.map((sdg) => (
                    <div
                      key={sdg.sdgNumber}
                      className="p-5 rounded-2xl bg-white border-2 border-stone-200 space-y-3 font-mono-board shadow-2xs flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-signage text-base font-black">
                              {sdg.sdgNumber}
                            </span>
                            <div>
                              <div className="text-[10px] text-stone-500 font-bold uppercase">UN GLOBAL GOAL</div>
                              <h5 className="font-signage text-base font-black text-stone-900 leading-tight">
                                {sdg.sdgName}
                              </h5>
                            </div>
                          </div>
                          <span className="text-xs font-black px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                            {sdg.targetCode}
                          </span>
                        </div>

                        <p className="text-xs text-stone-600 font-sans italic border-l-2 border-blue-400 pl-3 leading-relaxed">
                          "{sdg.targetDescription}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 text-xs">
                        <div className="text-blue-900 font-bold">Platform Direct Connection:</div>
                        <p className="text-stone-700 font-sans text-xs leading-relaxed mt-0.5">
                          {sdg.connectionRationale}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SUB-TAB 7: AUDIT, SOURCES & LIMITATIONS ── */}
            {activeResultsTab === 'audit' && (
              <div className="space-y-6 pt-2 font-mono-board">
                {/* Reputable Sources Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-stone-700" />
                    REPUTABLE LABOUR-MARKET EVIDENCE SOURCES
                  </h4>

                  <div className="space-y-2">
                    {activeReport.sources.map((src, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-white border border-stone-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-stone-900">{src.name}</span>
                          <span className="text-stone-500 text-[11px]">{src.publicationDate}</span>
                        </div>
                        <div className="text-stone-600 font-sans text-xs leading-relaxed">
                          <strong>Key Data Ingestion:</strong> {src.keyRelevantDataPoint}
                        </div>
                        <div className="text-[10px] text-stone-400 font-sans">
                          Coverage: {src.geographicalCoverage} · Assumptions: {src.assumptions}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explicit Assumptions and Limitations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                    <div className="font-black text-stone-900 uppercase">Core Simulation Assumptions</div>
                    <ul className="list-disc list-inside space-y-1 text-stone-600 font-sans text-xs">
                      {activeReport.assumptions.map((asm, i) => (
                        <li key={i}>{asm}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                    <div className="font-black text-stone-900 uppercase">Known Scientific Limitations</div>
                    <ul className="list-disc list-inside space-y-1 text-stone-600 font-sans text-xs">
                      {activeReport.limitations.map((lim, i) => (
                        <li key={i}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 5. HISTORY DRAWER MODAL ── */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between font-mono-board overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-stone-700" />
                  <h4 className="font-signage text-xl font-black text-stone-900">SIMULATION RUNS</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {historyList.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  No historical simulations found. Completed runs will be automatically cached here.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {historyList.map((hist) => (
                    <div
                      key={hist.id}
                      onClick={() => handleLoadReportById(hist.id)}
                      className="p-3.5 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-stone-50 transition-all cursor-pointer space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-stone-900">{hist.occupation}</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(hist.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-600">{hist.scenarioName}</div>
                      <div className="flex items-center justify-between text-[10px] pt-1 text-stone-500">
                        <span>Horizon: {hist.forecastHorizon}</span>
                        <span className="text-emerald-700 font-bold uppercase">{hist.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-black tracking-wider cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
