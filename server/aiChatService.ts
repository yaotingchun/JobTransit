import fs from 'node:fs'
import path from 'node:path'
import { GoogleAuth } from 'google-auth-library'

interface ChatHistoryItem {
  sender: 'user' | 'ai'
  text: string
}

interface ChatRequestPayload {
  message: string
  history?: ChatHistoryItem[]
}

let cachedAuth: GoogleAuth | null = null
let cachedProjectId: string | null = null

function getGoogleCredentials(): { credentials?: any; credPath?: string; projectId: string } {
  // 1. Check Replit Secrets / Environment variable first (Never commit files to public Git)
  const envCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.GOOGLE_CREDENTIALS_JSON
  if (envCreds) {
    try {
      const parsed = JSON.parse(envCreds)
      if (parsed.project_id && (parsed.private_key || parsed.client_email)) {
        return { credentials: parsed, projectId: parsed.project_id }
      }
    } catch (e) {
      console.warn('[AI Chat Service] Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable:', e)
    }
  }

  // 2. Fall back to local file paths
  const possiblePaths = [
    path.resolve(process.cwd(), 'credentials/google.json'),
    path.resolve('c:/Users/xinye/JobTransit/credentials/google.json'),
    path.resolve('c:/Users/xinye/tourisma/credentials/google.json'),
  ]

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, 'utf8')
        const parsed = JSON.parse(content)
        if (parsed.project_id && (parsed.private_key || parsed.client_email)) {
          return { credPath: p, projectId: parsed.project_id, credentials: parsed }
        }
      } catch {
        // try next
      }
    }
  }
  throw new Error('Google service account credentials not found in environment variables (GOOGLE_APPLICATION_CREDENTIALS_JSON) or credentials/google.json file.')
}

function getAuth() {
  if (cachedAuth && cachedProjectId) {
    return { auth: cachedAuth, projectId: cachedProjectId }
  }
  const { credentials, credPath, projectId } = getGoogleCredentials()
  cachedAuth = credentials
    ? new GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/cloud-platform'] })
    : new GoogleAuth({ keyFile: credPath, scopes: ['https://www.googleapis.com/auth/cloud-platform'] })
  cachedProjectId = projectId
  return { auth: cachedAuth, projectId: cachedProjectId }
}

const SYSTEM_INSTRUCTION = `You are the JobTransit AI Navigator, an intelligent conversational system grounded in empirical tech hiring data from JobTransit.
The platform analyzes 210,000+ active requisitions from LinkedIn Live (&f_TPR=r86400 24h replenishment indices), GitHub, and industry tracking.

CORE AI GUIDELINES & PRINCIPLES:
1. EMPIRICAL HARDNESS:
   - Provide concrete, data-backed reasoning with numbers, percentages, and market dynamics whenever discussing tech jobs, skills, compensation, and automation.
   - Avoid generic or unsubstantiated AI hype; ground all advice in verified industry realities.
2. TRANSPARENCY:
   - Ground insights in the JobTransit empirical pipeline (210,000+ postings, 24h replenishment velocity, decoupled human-core vs automated task breakdowns).
3. NATURAL CONVERSATION & INTELLIGENT ROUTING:
   - FOR CASUAL GREETINGS & CHIT-CHAT (e.g. "hi", "hello", "hey", "who are you", "what can you do"):
     Respond warmly, concisely, and naturally as JobTransit AI Navigator. Introduce what you can do (e.g., analyze hiring velocity, skill shifts, entry-level realities, and AI automation impact). Set "isEmpiricalInquiry" to false. Do NOT include artificial metric boxes for a simple greeting!
   - FOR DOMAIN & CAREER INQUIRIES (e.g. questions about software engineering trends, data engineering, entry-level job market, in-demand skills, AI automation, resume advice):
     Set "isEmpiricalInquiry" to true and populate "structuredResponse" with an insightful headline, key takeaway, 2 to 4 hardness metrics, an audit card, and 2-3 relevant suggested follow-up questions.

ALWAYS output your response strictly as a JSON object matching this schema:
{
  "text": "Your conversational or detailed response (Markdown supported). For casual greetings, keep it 1-2 friendly sentences.",
  "isEmpiricalInquiry": boolean,
  "structuredResponse": {
    "headline": "Concise, punchy verdict title",
    "keyTakeaway": "Single high-impact takeaway sentence",
    "hardnessMetrics": [
      {
        "label": "Metric title (e.g. 24h Inflow Velocity, Entry-Level Volume YoY)",
        "value": "e.g. +38.6%, Down 8%, 210,000+",
        "trend": "up" | "down" | "neutral",
        "badge": "Short badge tag (e.g. Verified Data, Volume Shift)"
      }
    ],
    "transparencyAudit": {
      "dataSource": "LinkedIn Worldwide Live & 24h Index",
      "sampleSize": "210,000+ verified requisitions",
      "verifiedAt": "Live Pipeline Ingestion",
      "confidenceScore": 95,
      "confidenceLevel": "High" | "Moderate" | "Developing",
      "methodology": "Empirical token frequency and replenishment velocity analysis.",
      "knownLimitations": "Captures external open postings; stealth internal mobility not indexed.",
      "linkedinVerificationUrl": "https://www.linkedin.com/jobs/search?keywords=Software%20Engineer&location=Worldwide"
    },
    "suggestedFollowUps": [
      "Follow-up question 1",
      "Follow-up question 2"
    ],
    "actionLink": {
      "tab": "trend" | "transit" | "catchup",
      "label": "Explore live trend chart or transition matrix"
    }
  }
}`

export async function generateAIChatReply(payload: ChatRequestPayload) {
  const { auth, projectId } = getAuth()
  const client = await auth.getClient()
  const tokenResponse = await client.getAccessToken()
  const token = tokenResponse.token
  if (!token) {
    throw new Error('Failed to acquire Google Cloud access token.')
  }

  const location = 'us-central1'
  const model = 'gemini-2.5-flash'
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`

  // Format contents array with history
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []

  if (payload.history && payload.history.length > 0) {
    // Take up to last 6 messages
    const recent = payload.history.slice(-6)
    for (const h of recent) {
      contents.push({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })
    }
  }

  // Add current user message
  contents.push({
    role: 'user',
    parts: [{ text: payload.message }],
  })

  const requestBody = {
    contents,
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[AI Chat Service] Vertex AI error:', response.status, errorText)
    throw new Error(`Vertex AI error [${response.status}]: ${errorText}`)
  }

  const result = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) {
    throw new Error('No content returned from Vertex AI.')
  }

  try {
    const parsed = JSON.parse(rawText)
    return {
      id: 'ai-' + Date.now(),
      sender: 'ai' as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: parsed.text || 'Analysis complete.',
      structuredResponse: parsed.isEmpiricalInquiry && parsed.structuredResponse ? parsed.structuredResponse : undefined,
    }
  } catch (parseErr) {
    console.warn('[AI Chat Service] Failed to parse JSON from AI, using raw text:', parseErr)
    return {
      id: 'ai-' + Date.now(),
      sender: 'ai' as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: rawText,
    }
  }
}
