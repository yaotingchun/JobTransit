import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import {
  fetchLinkedInHtml,
  parseLinkedInJobCount,
  parseLinkedInJobCards,
  getOrUpdateDailyScrape,
  readDailyScrapeCache,
  DAILY_SCRAPE_INTERVAL_MS,
} from './server/linkedinScraper.ts'
import { generateAIChatReply } from './server/aiChatService.ts'
import { handleSimulationRoutes } from './server/scenarioLabRouter.ts'

function createApiMiddleware() {
  return async (req: any, res: any, next: any) => {
    const fullUrl = `http://${req.headers.host || 'localhost'}${req.url || ''}`
    let parsedUrl: URL
    try {
      parsedUrl = new URL(fullUrl)
    } catch {
      return next()
    }

    // Endpoint 0: Future Scenario Lab & MiroFish Integration
    if (parsedUrl.pathname.startsWith('/api/simulations')) {
      const handled = await handleSimulationRoutes(req, res, parsedUrl)
      if (handled) return
    }

    // Endpoint 1: Scrape all target role trends & skills from LinkedIn (Daily cached by default, or forced)
    if (parsedUrl.pathname === '/api/scrape/linkedin-trends') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      const force = parsedUrl.searchParams.get('force') === 'true'
      try {
        const result = await getOrUpdateDailyScrape({ force })
        res.end(JSON.stringify({
          ...result.data,
          fromCache: result.fromCache,
          lastScrapedAt: result.lastScrapedAt,
          nextScrapeDueAt: result.nextScrapeDueAt,
          schedule: 'daily_24h',
        }))
      } catch (err) {
        res.statusCode = 500
        res.end(JSON.stringify({ success: false, error: String(err) }))
      }
      return
    }

    // Endpoint 1b: Daily Schedule Status
    if (parsedUrl.pathname === '/api/scrape/status') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      const cached = readDailyScrapeCache()
      const now = Date.now()
      const isExpired = !cached || (now - new Date(cached.lastScrapedAt).getTime() >= DAILY_SCRAPE_INTERVAL_MS)
      res.end(JSON.stringify({
        schedule: '1 time per day (24 hours)',
        hasCache: Boolean(cached),
        lastScrapedAt: cached?.lastScrapedAt || null,
        nextScrapeDueAt: cached?.nextScrapeDueAt || null,
        isExpired,
      }))
      return
    }

    // Endpoint 2: Scrape single job query on-demand
    if (parsedUrl.pathname === '/api/scrape/linkedin-job') {
      const kw = parsedUrl.searchParams.get('keyword') || 'Data Engineer'
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      try {
        const { status, body } = await fetchLinkedInHtml(
          `/jobs/search?keywords=${encodeURIComponent(kw)}&location=Worldwide`
        )
        const parsedCount = parseLinkedInJobCount(body)
        const cards = parseLinkedInJobCards(body)
        res.end(
          JSON.stringify({
            keyword: kw,
            statusCode: status,
            countString: parsedCount.countStr,
            parsedCount: parsedCount.num,
            cards,
            scrapedAt: new Date().toISOString(),
          })
        )
      } catch (err) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: String(err) }))
      }
      return
    }

    // Endpoint 3: Dynamic AI Chat grounded in Google Cloud credentials
    if (parsedUrl.pathname === '/api/ai/chat') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

      if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.end()
        return
      }

      if (req.method !== 'POST') {
        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }

      let body = ''
      req.on('data', (chunk: any) => {
        body += chunk
      })
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}')
          if (!payload.message || typeof payload.message !== 'string') {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Missing message parameter' }))
            return
          }
          const aiReply = await generateAIChatReply(payload)
          res.end(JSON.stringify(aiReply))
        } catch (err) {
          console.error('[API /api/ai/chat] Error:', err)
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(err) }))
        }
      })
      return
    }

    next()
  }
}

function linkedInScraperPlugin(): Plugin {
  const apiMiddleware = createApiMiddleware()

  return {
    name: 'linkedin-scraper-plugin',
    configureServer(server) {
      // 1. Initial daily autoscrape check on server start (if cache is missing or older than 24h)
      setTimeout(async () => {
        try {
          const cached = readDailyScrapeCache()
          const isExpired = !cached || (Date.now() - new Date(cached.lastScrapedAt).getTime() >= DAILY_SCRAPE_INTERVAL_MS)
          if (isExpired) {
            console.log('[LinkedIn Scraper] Cache expired or not found. Running initial 24h daily autoscrape in background...')
            await getOrUpdateDailyScrape()
            console.log('[LinkedIn Scraper] Initial daily autoscrape finished and cached.')
          } else {
            console.log(`[LinkedIn Scraper] Daily cache active (scraped: ${new Date(cached.lastScrapedAt).toLocaleTimeString()}, next run: ${new Date(cached.nextScrapeDueAt).toLocaleTimeString()}).`)
          }
        } catch (err) {
          console.warn('[LinkedIn Scraper] Initial daily autoscrape warning:', err)
        }
      }, 2500)

      // 2. Daily recurring scheduler: checks periodically and triggers once per 24 hours
      const dailyTimer = setInterval(async () => {
        try {
          const cached = readDailyScrapeCache()
          const isExpired = !cached || (Date.now() - new Date(cached.lastScrapedAt).getTime() >= DAILY_SCRAPE_INTERVAL_MS)
          if (isExpired) {
            console.log('[LinkedIn Scraper] 24 hours elapsed since last run. Executing scheduled daily autoscrape...')
            await getOrUpdateDailyScrape()
            console.log('[LinkedIn Scraper] Scheduled daily autoscrape complete.')
          }
        } catch (err) {
          console.error('[LinkedIn Scraper] Scheduled daily autoscrape error:', err)
        }
      }, 60 * 60 * 1000)

      server.httpServer?.on('close', () => {
        clearInterval(dailyTimer)
      })

      // Register API middleware in dev mode (vite)
      server.middlewares.use(apiMiddleware)
    },

    // Register API middleware in preview / production mode (vite preview / Replit deployment)
    configurePreviewServer(server) {
      server.middlewares.use(apiMiddleware)
    },
  }
}


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), linkedInScraperPlugin()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    allowedHosts: true,
  },
  optimizeDeps: {
    // Exclude pdfjs-dist from pre-bundling so the worker URL resolves correctly
    exclude: ['pdfjs-dist'],
  },
  worker: {
    format: 'es',
  },
})
