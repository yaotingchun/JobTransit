import { collectAllSources } from '../pipeline/collect'
import { NEWS_SOURCES } from '../config/sources'

async function main() {
  console.log('====================================================')
  console.log('🚀 Testing Resilient Collector across', NEWS_SOURCES.length, 'sources...')
  console.log('====================================================\n')

  const startTime = Date.now()
  const { articles, statusUpdates } = await collectAllSources(NEWS_SOURCES)
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log(`\nCompleted in ${duration}s. Total articles collected: ${articles.length}\n`)

  console.log('--- Source Health Status ---')
  for (const [sourceId, status] of statusUpdates.entries()) {
    const errorMsg = status.lastError ? `❌ Error: ${status.lastError}` : '✅ OK'
    console.log(`- ${sourceId}: ${errorMsg}`)
  }

  console.log('\n--- Sample Collected Articles (First 5) ---')
  articles.slice(0, 5).forEach((article, idx) => {
    console.log(`\n[#${idx + 1}] [${article.sourceName}] ${article.title}`)
    console.log(`     Link: ${article.link}`)
    console.log(`     Date: ${article.publishedAt}`)
    console.log(`     Desc: ${article.description.slice(0, 120)}...`)
    if (article.hnPoints) {
      console.log(`     HN Points: ${article.hnPoints}`)
    }
  })
}

main().catch((err) => {
  console.error('Collector test failed:', err)
  process.exit(1)
})
