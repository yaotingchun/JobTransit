import dotenv from 'dotenv'
dotenv.config()
import { compileWeeklySummary } from '../weekly/compileWeekly'

async function main() {
  console.log('====================================================')
  console.log('⚡ Compiling Weekly Summary 快讯 (Top 5 Express)')
  console.log('====================================================\n')

  const summary = await compileWeeklySummary('manual_redo')

  console.log(`\n📅 Issue: ${summary.issueId} (#${summary.issueNumber})`)
  console.log(`⏱️ Estimated Read Time: ~${summary.totalReadTimeMinutes} minutes`)
  console.log(`🔒 Status: ${summary.status.toUpperCase()} (Next Lock: ${summary.nextLockAt})`)
  console.log(`\n🏆 TOP 5 WEEKLY EXPRESS STORIES:`)

  summary.topArticles.forEach((art) => {
    console.log(`\n[#${art.number}] [${art.categoryLabel}] ${art.title}`)
    console.log(`     Source: ${art.sourceName} | Score: ${art.weeklyScore}`)
    console.log(`     🎯 Core Verdict: ${art.coreVerdict}`)
    console.log(`     💡 Why It Matters: ${art.whyItMatters}`)
    console.log(`     🛠️ Skills: ${art.actionableSkills.join(', ')}`)
  })

  if (summary.trendPulse) {
    console.log(`\n📡 WEEKLY TREND PULSE:`)
    console.log(`   Signal Topic:   ${summary.trendPulse.signalTopic}`)
    console.log(`   Maturity:       ${summary.trendPulse.maturity.toUpperCase()}`)
    console.log(`   Momentum:       ${summary.trendPulse.momentum.toUpperCase()}`)
    if (summary.trendPulse.paradigmShift) {
      console.log(`   Paradigm Shift: ${summary.trendPulse.paradigmShift.from} → ${summary.trendPulse.paradigmShift.to}`)
    }
    console.log(`   Evidence:       ${summary.trendPulse.evidence.uniqueEvents} events (${summary.trendPulse.evidence.historicalComparison})`)
    console.log(`   Summary:        ${summary.trendPulse.summary}`)
    console.log(`   CS Impact:      ${summary.trendPulse.csImpact}`)
    console.log(`   Tracked Skills: ${summary.trendPulse.trackedSkills.join(', ')}`)
  }

  console.log(`\n📦 Candidate Pool for Custom Swapping: ${summary.candidateArticles.length} articles available.`)
  console.log('\n✨ Weekly compilation complete!\n')
}

main().catch((err) => {
  console.error('Weekly compilation failed:', err)
  process.exit(1)
})
