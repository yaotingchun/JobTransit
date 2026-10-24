// ─────────────────────────────────────────────────────────────
//  JobTransit · New-rider onboarding data layer
//  - Radar signals are derived from the Trend tab datasets
//  - Role matches are derived from the Career Metro station model
// ─────────────────────────────────────────────────────────────
import { ROLE_TRENDS, SKILL_TRENDS } from '../trend/trendData'
import { LINES, TOP_PICKS, type LineId } from '../transit/transitData'

/** Which part of the profile wizard is currently on screen (reported by ProfileOnboarding). */
export type FlowStage = 'upload' | 'verify' | 'followup' | 'card'

/** Minimal view of the finished profile handed over to the radar / match steps. */
export interface FlowProfileSnapshot {
  name: string
  skills: string[]
  targetRoles: string[]
  currentTitle: string
}

// ── Skill matching ───────────────────────────────────────────

const normSkill = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => (t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t))
    .join(' ')

/** Conservative, whole-token fuzzy match between a user's skill list and a single skill name. */
export function userHasSkill(userSkills: string[], skill: string): boolean {
  const target = normSkill(skill)
  if (target.length < 2) return false
  const paddedTarget = ` ${target} `
  return userSkills.some((u) => {
    const n = normSkill(u)
    if (!n) return false
    return n === target || ` ${n} `.includes(paddedTarget) || paddedTarget.includes(` ${n} `)
  })
}

// ── Future Skills Radar ──────────────────────────────────────

export type RadarDirection = 'rising' | 'declining'

export interface RadarSignal {
  id: string
  kind: 'role' | 'skill'
  direction: RadarDirection
  label: string
  /** Headline number, e.g. "+184% openings YoY". */
  metric: string
  /** Supporting evidence line. */
  detail: string
  /** Market-signal tag, e.g. "Crucial in 2026". */
  tag: string
  /** 0–100: how strong the movement is (drives blip distance on the radar). */
  magnitude: number
  /** The user's own profile lists this skill. */
  owned: boolean
  /** Suggested pivot for declining signals. */
  pivot?: string
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

const firstSentence = (text: string): string => {
  const idx = text.search(/\.\s|\.$/)
  return idx > 0 ? text.slice(0, idx + 1) : text
}

const signedPct = (n: number, digits = 0): string => `${n > 0 ? '+' : ''}${n.toFixed(digits)}%`

export function buildRadarSignals(userSkills: string[]): RadarSignal[] {
  const roles: RadarSignal[] = ROLE_TRENDS.map((r) => {
    const direction: RadarDirection = r.status === 'declining' ? 'declining' : 'rising'
    return {
      id: `role-${r.id}`,
      kind: 'role',
      direction,
      label: r.title,
      metric: `${signedPct(r.growthYoY, 1)} openings YoY`,
      detail: `${r.openings2025.toLocaleString()} → ${r.openings2026.toLocaleString()} live openings · ${r.past24hCountStr} new in 24h`,
      tag: r.status === 'surging' ? 'Surging' : r.status === 'growing' ? 'Growing' : r.status === 'declining' ? 'Declining' : 'Transforming',
      magnitude: clamp((Math.abs(r.growthYoY) / 184) * 100, 18, 100),
      owned: false,
    }
  })

  const skills: RadarSignal[] = SKILL_TRENDS.map((s) => {
    const direction: RadarDirection = s.trend === 'surging' ? 'rising' : 'declining'
    const base = s.openingsMentionCount2025 || 1
    const pct = ((s.openingsMentionCount2026 - s.openingsMentionCount2025) / base) * 100
    return {
      id: `skill-${s.id}`,
      kind: 'skill',
      direction,
      label: s.name,
      metric: `${signedPct(pct)} job mentions YoY`,
      detail:
        direction === 'declining' && s.alternativeOrReplacement
          ? s.alternativeOrReplacement
          : firstSentence(s.context),
      tag: s.statusTag,
      magnitude: clamp(Math.abs(pct) / 2, 14, 100),
      owned: userHasSkill(userSkills, s.searchKeyword || s.name),
      pivot: direction === 'declining' ? s.alternativeOrReplacement : undefined,
    }
  })

  return [...roles, ...skills]
}

// ── Best-fit role matching ───────────────────────────────────

export interface MatchSkill {
  name: string
  /** Confirmed by the user's own CV / follow-up answers. */
  verified: boolean
}

export interface RoleMatch {
  id: string
  rank: number
  code: string
  title: string
  lineName: string
  lineCode: string
  lineColor: string
  /** Composite match score – identical to the score shown on the Career Metro map. */
  score: number
  skillFit: number
  preference: number
  market: number
  demandDelta: number
  months: number
  salary: string
  blurb: string
  have: MatchSkill[]
  gap: string[]
  /** Share of this role's required skills already covered. */
  coverage: number
  reasons: string[]
}

export function buildRoleMatches(snapshot: FlowProfileSnapshot): RoleMatch[] {
  const owned = snapshot.skills

  return TOP_PICKS.map((s, i) => {
    const lineId: LineId = s.lines[0]
    const line = LINES[lineId]

    const have: MatchSkill[] = s.skillsHave.map((name) => ({ name, verified: userHasSkill(owned, name) }))
    const gap: string[] = []
    s.skillsGap.forEach((name) => {
      if (userHasSkill(owned, name)) have.push({ name, verified: true })
      else gap.push(name)
    })

    const total = have.length + gap.length
    const coverage = total === 0 ? 100 : Math.round((have.length / total) * 100)

    return {
      id: s.id,
      rank: s.topRank ?? i + 1,
      code: s.code,
      title: s.name,
      lineName: line.name,
      lineCode: line.code,
      lineColor: line.color,
      score: s.fit,
      skillFit: s.signal?.skillFit ?? s.fit,
      preference: s.signal?.preference ?? 75,
      market: s.signal?.market ?? 80,
      demandDelta: s.signal?.demandDelta ?? 0,
      months: s.months,
      salary: s.salary,
      blurb: s.blurb,
      have,
      gap,
      coverage,
      reasons: s.signal?.notes ?? [],
    }
  })
}
