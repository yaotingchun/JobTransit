import { GoogleGenerativeAI } from '@google/generative-ai'
import { WeeklyFlashArticle, WeeklyTrendPulse, WeeklyTrendPulseMetadata, TrendBaseline } from './types'
import { computeHistoricalMetrics } from './historicalMetrics'

let genAIInstance: GoogleGenerativeAI | null = null

function getGenAI(): GoogleGenerativeAI | null {
  if (genAIInstance) return genAIInstance
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  genAIInstance = new GoogleGenerativeAI(apiKey)
  return genAIInstance
}

const MODEL_VERSION = 'gemini-2.0-flash'
const SCHEMA_VERSION = 3

const SYSTEM_INSTRUCTION = `You are a Principal Technology Forecaster and Computer Science Curriculum Advisor.
You will be provided with:
1. QUANTITATIVE HISTORICAL BASELINES (metrics computed over 7-day, 28-day, and 8-12 week windows).
2. CURRENT WEEK ARTICLES DIGEST (verified tech news events from the past 7 days).

Your job is to produce a grounded, nuanced, evidence-first "Weekly Trend Pulse".

CRITICAL PRINCIPLES:
1. EVIDENCE-FIRST REASONING:
   - You MUST select the specific article IDs from the digest that directly evidence the trend.
   - Do NOT invent event numbers; the backend will deterministically calculate unique independent events from your selected IDs.
   - Ground historical comparison strictly in the provided 4-week moving average and 8-week trajectory.

2. MULTIDIMENSIONAL DECOUPLED CLASSIFICATION:
   - "maturity":
     * "emerging": Relatively novel technology/framework or nascent ecosystem.
     * "established": Mainstream industry technology (e.g. LLMs, Cloud Infrastructure, Databases).
   - "momentum":
     * "rising": Measurable increase vs 4-week average with multiple corroborating independent events.
     * "stable": Steady coverage consistent with baseline.
     * "cooling": Declining coverage relative to previous weeks.
     * "insufficient_data": Only 1 isolated event or sparse evidence (NEVER declare "rising" with only 1 event!).
   - "paradigmShift" (OPTIONAL):
     * Include ONLY if there is a genuine technical shift (e.g. from code completion to autonomous agent orchestration).
     * If no paradigm shift occurred this week, set to null.

3. CS HORIZON & CAREER VALUE:
   - "csImpact" must explain why a Computer Science student or engineer should care (e.g. architecture changes, verification harnesses, runtime shifts).
   - "trackedSkills" must be 3-5 concrete skills or technologies directly relevant to the supporting articles.

Return ONLY valid JSON matching this schema:
{
  "signalTopic": string,
  "maturity": "emerging" | "established",
  "momentum": "rising" | "stable" | "cooling" | "insufficient_data",
  "paradigmShift": { "from": string, "to": string } | null,
  "evidence": {
    "articleIds": string[],
    "historicalComparison": string,
    "confidence": "high" | "medium" | "low"
  },
  "summary": string,
  "csImpact": string,
  "trackedSkills": string[],
  "primaryArticleId": string
}`

/**
 * Dynamically generate Weekly Trend Pulse using Evidence-First Multi-Window Synthesis
 * with Backend-Verified Deduplicated Event Counts & Semantic Grounding Gates.
 */
export async function generateWeeklyTrendPulse(
  topArticles: WeeklyFlashArticle[],
  candidateArticles: WeeklyFlashArticle[],
  weekNumber: number,
  year: number,
  db: any = null
): Promise<WeeklyTrendPulse> {
  const weekLabel = `WEEK ${weekNumber} · ${year}`
  const allArticles = [...topArticles, ...candidateArticles]
  const validArticleIdSet = new Set(allArticles.map((a) => a.id))

  // Build articleId -> canonical eventId mapping
  const articleToEventId = new Map<string, string>()
  for (const art of allArticles) {
    articleToEventId.set(art.id, art.eventId || art.id)
  }

  // 1. Calculate multi-window quantitative baselines across 7d, 28d, and 8-12 weeks
  const historical = await computeHistoricalMetrics(db, allArticles, weekNumber, year)
  const topBaseline = historical.baselines[0] || {
    topic: 'AI Coding Agents & Autonomous Tooling',
    currentWeekCount: 1,
    previousWeekCount: 0,
    fourWeekAverage: 0,
    eightWeekDirection: 'insufficient_data' as const,
    weeksObserved: 0,
    sourceDiversityScore: 0.5,
    calculatedMomentumScore: 0.2,
    dataCompleteness: 'unobserved' as const,
  }

  // 2. Build concise articles digest
  const digest = allArticles.map((art, idx) => ({
    id: art.id,
    eventId: art.eventId || art.id,
    rank: idx < topArticles.length ? `Top Story #${idx + 1}` : `Candidate Pool #${idx + 1}`,
    title: art.title,
    category: art.categoryLabel,
    domain: art.sourceDomain,
    coreVerdict: art.coreVerdict,
    whyItMatters: art.whyItMatters,
    skills: art.actionableSkills,
  }))

  const metadata: WeeklyTrendPulseMetadata = {
    generatedAt: new Date().toISOString(),
    issueId: `issue_${year}_w${weekNumber}`,
    sourceWindowStart: historical.sourceWindowStart,
    sourceWindowEnd: historical.sourceWindowEnd,
    modelVersion: MODEL_VERSION,
    schemaVersion: SCHEMA_VERSION,
    baselineMetadata: historical.baselineMetadata,
  }

  const genAI = getGenAI()

  if (genAI && allArticles.length > 0) {
    try {
      const model = genAI.getGenerativeModel({
        model: MODEL_VERSION,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.15,
        },
      })

      const prompt = `${SYSTEM_INSTRUCTION}

=== QUANTITATIVE HISTORICAL BASELINES (Calculated by Backend) ===
Weeks Analyzed: ${historical.weeksAnalyzed}
Top Topic Baselines:
${JSON.stringify(historical.baselines.slice(0, 3), null, 2)}

=== CURRENT WEEK ARTICLES DIGEST (Week ${weekNumber}, ${year}) ===
${JSON.stringify(digest, null, 2)}
`

      console.log(`[TrendPulse] Synthesizing evidence-first trend pulse for Week ${weekNumber} via Gemini...`)
      const result = await model.generateContent(prompt)
      const rawText = result.response.text()
      const parsed = JSON.parse(rawText)

      // =========================================================================
      // SEMANTIC VALIDATION LAYER 1: STRICT ARTICLE ID VALIDATION
      // =========================================================================
      const verifiedArticleIds: string[] = Array.isArray(parsed.evidence?.articleIds)
        ? Array.from(
            new Set<string>(
              parsed.evidence.articleIds.filter(
                (id: unknown): id is string => typeof id === 'string' && validArticleIdSet.has(id)
              )
            )
          )
        : []

      // If LLM returned no valid IDs, fall back to matching articles from the top cluster
      if (verifiedArticleIds.length === 0 && topArticles.length > 0) {
        verifiedArticleIds.push(topArticles[0].id)
      }

      // =========================================================================
      // SEMANTIC VALIDATION LAYER 2: DETERMINISTIC UNIQUE EVENTS (Backend Calculation)
      // =========================================================================
      // Multiple articles can cover the SAME event. Deduplicate article IDs to unique event IDs:
      const verifiedEventIds = new Set(
        verifiedArticleIds
          .map((articleId) => articleToEventId.get(articleId))
          .filter((eventId): eventId is string => Boolean(eventId))
      )
      const uniqueEvents = verifiedEventIds.size

      const eventBreakdown = Array.from(verifiedEventIds).map((evId) => {
        const matchingArts = allArticles.filter((a) => (a.eventId || a.id) === evId)
        return {
          eventId: evId,
          title: matchingArts[0]?.title || evId,
          articleCount: matchingArts.length,
        }
      })

      // =========================================================================
      // SEMANTIC VALIDATION LAYER 3: COMPREHENSIVE MOMENTUM GATING (All Directions)
      // =========================================================================
      let momentum: WeeklyTrendPulse['momentum'] = 'insufficient_data'
      if (uniqueEvents < 2 || topBaseline.dataCompleteness === 'unobserved') {
        // Less than 2 independent events or zero historical baseline: default to insufficient_data
        momentum = 'insufficient_data'
      } else if (parsed.momentum === 'rising' && topBaseline.currentWeekCount > topBaseline.fourWeekAverage) {
        momentum = 'rising'
      } else if (
        parsed.momentum === 'cooling' &&
        topBaseline.weeksObserved >= 4 &&
        topBaseline.currentWeekCount < topBaseline.fourWeekAverage * 0.7
      ) {
        momentum = 'cooling'
      } else if (topBaseline.weeksObserved >= 4) {
        momentum = 'stable'
      } else {
        momentum = 'insufficient_data'
      }

      // =========================================================================
      // SEMANTIC VALIDATION LAYER 4: PARADIGM SHIFT GROUNDING GATE
      // =========================================================================
      let paradigmShift: WeeklyTrendPulse['paradigmShift'] = undefined
      if (uniqueEvents >= 2 && parsed.paradigmShift?.from && parsed.paradigmShift?.to) {
        // Require supporting articles text to corroborate the shift
        const supportingText = verifiedArticleIds
          .map((id) => {
            const art = allArticles.find((a) => a.id === id)
            return `${art?.title || ''} ${art?.coreVerdict || ''} ${art?.whyItMatters || ''}`
          })
          .join(' ')
          .toLowerCase()

        const toWords = parsed.paradigmShift.to
          .toLowerCase()
          .split(/\s+/)
          .filter((w: string) => w.length > 3)
        const isGrounded = toWords.some((w: string) => supportingText.includes(w))

        if (isGrounded) {
          paradigmShift = {
            from: parsed.paradigmShift.from.trim(),
            to: parsed.paradigmShift.to.trim(),
          }
        }
      }

      // =========================================================================
      // SEMANTIC VALIDATION LAYER 5: CS IMPACT QUALIFYING GATE
      // =========================================================================
      let csImpact =
        parsed.csImpact ||
        'Pivots software engineering education and workflows towards automated verification and system boundaries.'
      if (
        uniqueEvents < 3 &&
        !csImpact.toLowerCase().startsWith('potential') &&
        !csImpact.toLowerCase().startsWith('early')
      ) {
        csImpact = `Potential emerging signal: ${csImpact}`
      }

      // Locate primary source anchor
      const primaryArt =
        allArticles.find((a) => a.id === parsed.primaryArticleId) ||
        allArticles.find((a) => a.id === verifiedArticleIds[0]) ||
        topArticles[0]

      const keySources = Array.from(
        new Set(
          verifiedArticleIds
            .map((id: string) => allArticles.find((a) => a.id === id)?.sourceDomain)
            .filter(Boolean) as string[]
        )
      )

      // Formulation of historical comparison text
      let historicalComparisonText = `Tracked ${uniqueEvents} unique independent event${uniqueEvents > 1 ? 's' : ''} this week.`
      if (topBaseline.dataCompleteness === 'unobserved') {
        historicalComparisonText += ' Historical baseline unobserved (new tracking topic).'
      } else if (topBaseline.dataCompleteness === 'partial') {
        historicalComparisonText += ` vs ${topBaseline.weeksObserved}-week baseline average of ${topBaseline.fourWeekAverage} (${topBaseline.eightWeekDirection} trajectory).`
      } else {
        historicalComparisonText += ` vs 4-week average of ${topBaseline.fourWeekAverage} (${topBaseline.eightWeekDirection} 8-week trajectory).`
      }

      const trendPulse: WeeklyTrendPulse = {
        weekLabel,
        signalTopic: parsed.signalTopic || topBaseline.topic,
        maturity: parsed.maturity === 'emerging' ? 'emerging' : 'established',
        momentum,
        paradigmShift,
        evidence: {
          articleIds: verifiedArticleIds,
          uniqueEvents,
          historicalComparison: historicalComparisonText,
          confidence: uniqueEvents >= 2 && topBaseline.dataCompleteness !== 'unobserved' ? 'high' : 'medium',
          keySources,
          eventBreakdown,
        },
        summary:
          parsed.summary ||
          `This week's coverage reflects active technical development in ${parsed.signalTopic || topBaseline.topic}.`,
        csImpact,
        trackedSkills:
          Array.isArray(parsed.trackedSkills) && parsed.trackedSkills.length
            ? parsed.trackedSkills
                .filter((s: unknown): s is string => typeof s === 'string')
                .slice(0, 4)
            : ['Agentic Workflows', 'Context Engineering', 'Architecture Verification'],
        disclaimer:
          "Trend interpretation is based on this week's news and historical multi-window baseline. Sustained macro-trends require ongoing multi-week observation.",
        metadata,
        primarySource: primaryArt
          ? {
              title: primaryArt.title,
              domain: primaryArt.sourceDomain,
              url: primaryArt.link,
            }
          : undefined,
      }

      console.log(
        `[TrendPulse] Successfully generated validated pulse: "${trendPulse.signalTopic}" (Maturity: ${trendPulse.maturity}, Momentum: ${trendPulse.momentum}, Unique Events: ${uniqueEvents}, ParadigmShift: ${trendPulse.paradigmShift ? 'YES' : 'NONE'})`
      )
      return trendPulse
    } catch (err: any) {
      console.warn('[TrendPulse] Gemini synthesis error, using fallback evidence model:', err.message)
    }
  }

  // 3. Resilient Fallback based on computed historical metrics
  return fallbackGroundedPulse(allArticles, topBaseline, weekLabel, metadata)
}

/**
 * Deterministic fallback using computed baselines if LLM is unavailable
 */
function fallbackGroundedPulse(
  allArticles: WeeklyFlashArticle[],
  baseline: TrendBaseline,
  weekLabel: string,
  metadata: WeeklyTrendPulseMetadata
): WeeklyTrendPulse {
  const primary = allArticles[0]
  const uniqueEvents = Math.max(1, baseline.currentWeekCount)
  const momentum =
    uniqueEvents >= 2 && baseline.dataCompleteness !== 'unobserved'
      ? baseline.currentWeekCount > baseline.fourWeekAverage
        ? 'rising'
        : 'stable'
      : 'insufficient_data'

  return {
    weekLabel,
    signalTopic: baseline.topic,
    maturity: baseline.weeksObserved > 4 ? 'established' : 'emerging',
    momentum,
    paradigmShift:
      uniqueEvents >= 2 && baseline.topic.includes('AI')
        ? { from: 'Code Completion', to: 'Autonomous Software Engineering' }
        : undefined,
    evidence: {
      articleIds: allArticles.slice(0, 3).map((a) => a.id),
      uniqueEvents,
      historicalComparison: `Tracked ${uniqueEvents} unique events this week vs ${baseline.weeksObserved}-week baseline average of ${baseline.fourWeekAverage} (${baseline.eightWeekDirection} trajectory).`,
      confidence: uniqueEvents >= 2 ? 'high' : 'medium',
      keySources: Array.from(new Set(allArticles.map((a) => a.sourceDomain).filter(Boolean))),
    },
    summary:
      "This week's coverage suggests a growing focus on AI systems that can execute multi-step software engineering tasks, rather than simply generating isolated code snippets.",
    csImpact:
      uniqueEvents >= 2
        ? 'Pivots software engineering education and workflows: transitioning from manual syntax authoring to agent orchestration, test-harness evaluation, and deterministic architecture verification.'
        : 'Potential emerging signal: software engineering workflows may increasingly incorporate agentic evaluation harnesses.',
    trackedSkills: [
      'AI Coding Agents',
      'Multi-Step Workflows',
      'Eval Harnesses',
      'Context Engineering',
    ],
    disclaimer:
      "Trend interpretation is based on this week's news and historical multi-window baseline. Sustained macro-trends require ongoing multi-week observation.",
    metadata,
    primarySource: primary
      ? {
          title: primary.title,
          domain: primary.sourceDomain,
          url: primary.link,
        }
      : undefined,
  }
}
