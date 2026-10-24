import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import {
  scrapeLinkedInTrends,
  fetchLinkedInHtml,
  parseLinkedInJobCount,
  parseLinkedInJobCards,
} from './server/linkedinScraper.ts'

function linkedInScraperPlugin(): Plugin {
  return {
    name: 'linkedin-scraper-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const fullUrl = `http://${req.headers.host || 'localhost'}${req.url || ''}`
        let parsedUrl: URL
        try {
          parsedUrl = new URL(fullUrl)
        } catch {
          return next()
        }

        // Endpoint 1: Scrape all target role trends & skills from LinkedIn
        if (parsedUrl.pathname === '/api/scrape/linkedin-trends') {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          try {
            const data = await scrapeLinkedInTrends()
            res.end(JSON.stringify(data))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ success: false, error: String(err) }))
          }
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

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), linkedInScraperPlugin()],
})
