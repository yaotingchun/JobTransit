/**
 * Advanced Multi-Format CV / Resume Extraction Engine
 * Supports: PDF (native & OCR scanned), Word (.docx, .doc), PowerPoint (.pptx, .ppt), Images (.png, .jpg, .webp), Plaintext
 */
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import JSZip from 'jszip'
import { createWorker } from 'tesseract.js'
import type {
  PersonalInfo, Education, SkillsProfile, WorkExperienceEntry,
  Project, CareerPreferences, EducationLevel,
  SkillProficiency, Certification, Language,
} from '../types/profile'
import {
  defaultPersonal, defaultEducation, defaultSkills, defaultCareerPreferences,
} from '../types/profile'
import type { UserProfile } from '../components/Navbar'

// Ensure PDF.js worker is configured
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
}

// ─── 1. FILE TEXT EXTRACTION (PDF, DOCX, PPTX, IMAGES WITH OCR) ─────────────

export interface ExtractionProgress {
  stage: string
  percent?: number
}

/**
 * Extracts plain, structured text from any supported file format.
 * - PDF: uses pdf.js textContent; if text is empty/sparse (< 60 chars), runs Tesseract OCR on rendered pages.
 * - Word (.docx): uses Mammoth to extract raw text with formatting preserved.
 * - PowerPoint (.pptx): uses JSZip to extract text runs from all slide XMLs in sequence.
 * - Images (png, jpg, webp): runs Tesseract OCR directly.
 */
export async function extractTextFromAnyFile(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<string> {
  const fileName = file.name.toLowerCase()
  const mimeType = file.type.toLowerCase()

  onProgress?.({ stage: `Reading ${file.name}…`, percent: 10 })

  // ── A. PDF Files ──
  if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractTextFromPdf(file, onProgress)
  }

  // ── B. Word Documents (.docx, .doc) ──
  if (
    fileName.endsWith('.docx') ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractTextFromDocx(file, onProgress)
  }

  // ── C. PowerPoint Presentations (.pptx) ──
  if (
    fileName.endsWith('.pptx') ||
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) {
    return extractTextFromPptx(file, onProgress)
  }

  // ── D. Images (.png, .jpg, .jpeg, .webp, .bmp, .tiff) ──
  if (
    mimeType.startsWith('image/') ||
    /\.(png|jpe?g|webp|bmp|tiff)$/i.test(fileName)
  ) {
    return extractTextFromImage(file, onProgress)
  }

  // ── E. Plain Text / Markdown / Fallback ──
  return extractTextFromPlainText(file, onProgress)
}

/**
 * PDF extraction with automatic OCR fallback for scanned resumes
 */
async function extractTextFromPdf(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8 = new Uint8Array(arrayBuffer)
    const loadingTask = pdfjsLib.getDocument({
      data: uint8,
      useWorkerFetch: false,
      useSystemFonts: true,
    } as any)

    const pdf = await loadingTask.promise
    const numPages = pdf.numPages
    const pageTexts: string[] = []

    for (let p = 1; p <= numPages; p++) {
      onProgress?.({
        stage: `Parsing PDF page ${p} of ${numPages}…`,
        percent: Math.round(15 + (p / numPages) * 50),
      })
      const page = await pdf.getPage(p)
      const content = await page.getTextContent()
      const str = content.items.map((item: any) => item.str ?? '').join(' ')
      pageTexts.push(str.trim())
    }

    const combinedText = pageTexts.join('\n\n').replace(/\s{3,}/g, '\n').trim()

    // If PDF yielded sufficient text (> 60 chars), return it!
    if (combinedText.length >= 60) {
      onProgress?.({ stage: 'PDF text extracted successfully', percent: 85 })
      return combinedText
    }

    // Otherwise, this is likely a scanned PDF (image-based)! Run OCR on pages
    onProgress?.({ stage: 'Scanned PDF detected. Initialising OCR…', percent: 40 })
    return ocrPdfPages(pdf, onProgress)
  } catch (err) {
    console.warn('PDF.js text parse failed, attempting OCR fallback:', err)
    return ''
  }
}

/**
 * Runs Tesseract OCR on rendered canvas pages of a scanned PDF
 */
async function ocrPdfPages(
  pdf: any,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<string> {
  const maxPages = Math.min(pdf.numPages, 3) // OCR first 3 pages
  const ocrResults: string[] = []

  let worker: any = null
  try {
    worker = await createWorker('eng')

    for (let p = 1; p <= maxPages; p++) {
      onProgress?.({
        stage: `Performing OCR on scanned page ${p} of ${maxPages}…`,
        percent: Math.round(40 + (p / maxPages) * 45),
      })

      const page = await pdf.getPage(p)
      const viewport = page.getViewport({ scale: 2.0 }) // High DPI for OCR accuracy
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')

      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise
        const ret = await worker.recognize(canvas)
        if (ret?.data?.text) {
          ocrResults.push(ret.data.text)
        }
      }
    }
  } catch (err) {
    console.error('PDF OCR error:', err)
  } finally {
    if (worker) {
      await worker.terminate().catch(() => {})
    }
  }

  return ocrResults.join('\n\n').trim()
}

/**
 * Word Document (.docx) extraction using Mammoth with paragraph preservation
 */
async function extractTextFromDocx(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<string> {
  try {
    onProgress?.({ stage: 'Extracting Word (.docx) document…', percent: 40 })
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    const text = result.value.replace(/\r\n/g, '\n').trim()
    onProgress?.({ stage: 'Word document parsed', percent: 85 })
    return text
  } catch (err) {
    console.warn('Mammoth docx parse failed, trying JSZip fallback:', err)
    return extractDocxViaZip(file)
  }
}

/**
 * Fallback Word (.docx) parser using JSZip to read word/document.xml directly
 */
async function extractDocxViaZip(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)
    const docXmlFile = zip.file('word/document.xml')
    if (!docXmlFile) return ''
    const xmlText = await docXmlFile.async('text')
    // Extract text runs inside <w:t> tags
    const matches = xmlText.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || []
    const cleaned = matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ')
    return cleaned.replace(/\s{2,}/g, '\n').trim()
  } catch {
    return ''
  }
}

/**
 * PowerPoint (.pptx) extraction using JSZip to parse all slide XMLs in sequence
 */
async function extractTextFromPptx(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<string> {
  try {
    onProgress?.({ stage: 'Extracting PowerPoint (.pptx) slides…', percent: 30 })
    const arrayBuffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)

    // Locate slide XML files: ppt/slides/slide1.xml, slide2.xml, etc.
    const slideFileNames = Object.keys(zip.files)
      .filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10)
        const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10)
        return numA - numB
      })

    const slideTexts: string[] = []
    for (let i = 0; i < slideFileNames.length; i++) {
      const fileName = slideFileNames[i]
      const slideFile = zip.file(fileName)
      if (!slideFile) continue

      const xml = await slideFile.async('text')
      // Extract text in PowerPoint <a:t> elements
      const matches = xml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || []
      const textPieces = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean)
      if (textPieces.length > 0) {
        slideTexts.push(`--- Slide ${i + 1} ---\n` + textPieces.join('\n'))
      }
    }

    onProgress?.({ stage: 'PowerPoint extracted', percent: 85 })
    return slideTexts.join('\n\n').trim()
  } catch (err) {
    console.error('PPTX extraction failed:', err)
    return ''
  }
}

/**
 * Image OCR extraction using Tesseract.js (PNG, JPG, WebP)
 */
async function extractTextFromImage(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<string> {
  let worker: any = null
  try {
    onProgress?.({ stage: 'Initialising OCR engine for image…', percent: 25 })
    worker = await createWorker('eng')

    onProgress?.({ stage: 'Recognising text via OCR…', percent: 60 })
    const ret = await worker.recognize(file)
    onProgress?.({ stage: 'OCR complete', percent: 90 })
    return ret?.data?.text?.trim() ?? ''
  } catch (err) {
    console.error('Image OCR failed:', err)
    return ''
  } finally {
    if (worker) {
      await worker.terminate().catch(() => {})
    }
  }
}

/**
 * Plain text / RTF / Markdown fallback
 */
async function extractTextFromPlainText(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<string> {
  return new Promise((resolve) => {
    onProgress?.({ stage: 'Reading text document…', percent: 50 })
    const reader = new FileReader()
    reader.onload = e => {
      let raw = (e.target?.result as string) ?? ''
      // If RTF, strip basic RTF tags
      if (raw.startsWith('{\\rtf')) {
        raw = raw.replace(/\\[a-z0-9]+ ?/gi, ' ').replace(/[{}]/g, '')
      }
      resolve(raw.replace(/\s{3,}/g, '\n').trim())
    }
    reader.onerror = () => resolve('')
    reader.readAsText(file, 'utf-8')
  })
}


// ─── 2. PRECISE & ACCURATE STRUCTURED PROFILE PARSER ─────────────────────────

export interface ParsedProfileResult {
  personal: PersonalInfo
  education: Education
  skills: SkillsProfile
  work_experience: WorkExperienceEntry[]
  projects: Project[]
  career: CareerPreferences
}

/**
 * Normalises text and segments it into semantic CV sections based on standard resume headings.
 */
interface SectionSegments {
  header: string[]
  summary: string[]
  experience: string[]
  education: string[]
  skills: string[]
  projects: string[]
  certifications: string[]
  languages: string[]
  other: string[]
}

function segmentCvSections(text: string): SectionSegments {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const segments: SectionSegments = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    other: [],
  }

  let currentSection: keyof SectionSegments = 'header'
  let headerLinesCount = 0

  const isHeading = (l: string): keyof SectionSegments | null => {
    const clean = l.replace(/[^a-zA-Z\s]/g, '').trim().toLowerCase()
    if (!clean || clean.length > 45) return null

    if (/^(work\s+)?experience|employment(\s+history)?|work\s+history|career\s+history|professional\s+experience|internships?$/i.test(clean)) {
      return 'experience'
    }
    if (/^education|academic(\s+background|\s+history)?|qualifications|academic\s+qualifications$/i.test(clean)) {
      return 'education'
    }
    if (/^(technical\s+)?skills(\s+and\s+competencies)?|core\s+competencies|technologies|proficiencies|expertise$/i.test(clean)) {
      return 'skills'
    }
    if (/^(academic\s+|personal\s+|key\s+)?projects|portfolio$/i.test(clean)) {
      return 'projects'
    }
    if (/^certifications?|certificates?|licenses?(\s+and\s+certifications)?|accreditations?$/i.test(clean)) {
      return 'certifications'
    }
    if (/^languages?(\s+proficiency)?$/i.test(clean)) {
      return 'languages'
    }
    if (/^(professional\s+)?summary|career\s+objective|objective|about\s+me|profile$/i.test(clean)) {
      return 'summary'
    }
    return null
  }

  for (const line of lines) {
    const heading = isHeading(line)
    if (heading) {
      currentSection = heading
      continue
    }

    if (currentSection === 'header') {
      headerLinesCount++
      // After ~10 lines without heading, treat subsequent general lines as summary or other
      if (headerLinesCount > 10) {
        currentSection = 'summary'
      }
    }

    segments[currentSection].push(line)
  }

  return segments
}

/**
 * Comprehensive Technical, AI/ML, and Software Skills Taxonomy
 */
const TECH_SKILLS_DICTIONARY = [
  // Languages
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP',
  'Swift', 'Kotlin', 'Dart', 'SQL', 'HTML', 'HTML5', 'CSS', 'CSS3', 'R', 'MATLAB', 'Scala', 'Perl', 'Bash', 'Shell',
  // Frontend
  'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte', 'Redux', 'Zustand',
  'Tailwind CSS', 'Bootstrap', 'Sass', 'Webpack', 'Vite', 'GraphQL', 'REST API', 'Electron',
  // Backend & Frameworks
  'Node.js', 'Express', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Spring',
  'ASP.NET', '.NET Core', 'Laravel', 'Ruby on Rails', 'Gin', 'Echo',
  // Databases & Storage
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase', 'Supabase', 'DynamoDB', 'Cassandra',
  'Elasticsearch', 'Oracle', 'Prisma', 'TypeORM', 'Mongoose',
  // Cloud & DevOps
  'AWS', 'Amazon Web Services', 'Azure', 'Microsoft Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes',
  'Terraform', 'CI/CD', 'GitLab CI', 'GitHub Actions', 'Jenkins', 'Linux', 'Nginx', 'Apache', 'Serverless',
  // Architecture & Practices
  'Microservices', 'Agile', 'Scrum', 'OOP', 'Design Patterns', 'Test-Driven Development (TDD)', 'System Design',
]

const AI_SKILLS_DICTIONARY = [
  'Machine Learning', 'Deep Learning', 'Artificial Intelligence', 'Natural Language Processing (NLP)',
  'Computer Vision', 'Generative AI', 'Large Language Models (LLM)', 'Prompt Engineering', 'RAG',
  'PyTorch', 'TensorFlow', 'Keras', 'scikit-learn', 'Hugging Face', 'LangChain', 'LlamaIndex',
  'OpenAI', 'OpenAI API', 'Gemini API', 'Claude', 'Vector Databases', 'Pinecone', 'ChromaDB',
  'Model Fine-Tuning', 'BERT', 'Transformers', 'Reinforcement Learning', 'Data Science', 'Data Analysis',
]

const TOOLS_DICTIONARY = [
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'VS Code', 'Visual Studio', 'IntelliJ', 'Postman', 'Swagger',
  'Figma', 'Adobe XD', 'Photoshop', 'Canva', 'Jira', 'Confluence', 'Trello', 'Notion', 'Slack',
  'Power BI', 'Tableau', 'Excel', 'Google Analytics', 'Datadog', 'Sentry', 'Mixpanel',
]

const SOFT_SKILLS_DICTIONARY = [
  'Leadership', 'Communication', 'Teamwork', 'Problem-solving', 'Critical Thinking', 'Adaptability',
  'Time Management', 'Collaboration', 'Project Management', 'Conflict Resolution', 'Mentorship',
  'Analytical Thinking', 'Creativity', 'Attention to Detail', 'Presentation Skills',
]

/**
 * Helper to match skill words precisely with boundary checking
 */
function containsSkill(text: string, skill: string): boolean {
  const s = skill.toLowerCase()
  const t = text.toLowerCase()
  if (s === 'c++' || s === 'c#' || s === '.net' || s.includes('.')) {
    return t.includes(s)
  }
  try {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text)
  } catch {
    return t.includes(s)
  }
}

/**
 * Intelligent parser converting raw CV text into structured Profile Data
 */
export function parseStructuredResume(
  rawText: string,
  userFallback: UserProfile
): ParsedProfileResult {
  const segments = segmentCvSections(rawText)
  const fullText = rawText

  // ── 1. PERSONAL INFO ──
  // Name extraction: first clean line of header not containing email, phone, or generic labels
  let extractedName = ''
  for (const line of segments.header.slice(0, 5)) {
    const isMeta = /@|phone|tel|email|linkedin|github|curriculum|resume|page|\.com|\.my|\+?\d{8}/i.test(line)
    const words = line.split(/\s+/).filter(Boolean)
    if (!isMeta && words.length >= 2 && words.length <= 5 && line.length < 50) {
      extractedName = line.replace(/[^a-zA-Z\s'.]/g, '').trim()
      break
    }
  }

  // Email
  const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)

  // Phone: international or local format
  const phoneMatch = fullText.match(/(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/)

  // Location: detect common cities/countries or pattern "City, State/Country"
  let extractedLocation = ''
  const locationLine = segments.header.find(l =>
    /(kuala lumpur|selangor|penang|johor|malaysia|singapore|jakarta|bangkok|london|new york|tokyo|sydney|remote)/i.test(l) ||
    /^[a-zA-Z\s]+,\s*[a-zA-Z\s]+$/.test(l)
  )
  if (locationLine) {
    const locMatch = locationLine.match(/([a-zA-Z\s]+(?:,\s*[a-zA-Z\s]+)?)/)
    extractedLocation = locMatch ? locMatch[0].trim() : locationLine
  }

  // Job Title: look in header lines near the name
  let extractedJobTitle = ''
  const titleKeywords = /(engineer|developer|architect|designer|analyst|manager|consultant|specialist|lead|intern|scientist|officer|administrator)/i
  const titleLine = segments.header.find(l => titleKeywords.test(l) && l.length < 65 && !/@/.test(l))
  if (titleLine) {
    extractedJobTitle = titleLine.trim()
  }

  // Years of Experience: search text or calculate from experience
  let yearsExp = 0
  const yoeMatch = fullText.match(/(\d+)\+?\s*years?(?:\s+of)?\s+(?:experience|exp)/i)
  if (yoeMatch) {
    yearsExp = parseInt(yoeMatch[1], 10)
  }

  // Industry detection
  let detectedIndustry = 'Technology'
  if (/finance|fintech|banking|accounting/i.test(fullText)) detectedIndustry = 'Finance & FinTech'
  else if (/healthcare|medical|biotech/i.test(fullText)) detectedIndustry = 'Healthcare & Biotech'
  else if (/consulting|advisory/i.test(fullText)) detectedIndustry = 'Management Consulting'
  else if (/education|edtech|university/i.test(fullText)) detectedIndustry = 'Education'

  const personal: PersonalInfo = {
    ...defaultPersonal(),
    full_name: extractedName || userFallback.name,
    email: emailMatch ? emailMatch[0] : userFallback.email,
    phone_number: phoneMatch ? phoneMatch[0].trim() : '',
    current_job_title: extractedJobTitle || 'Software Engineer',
    current_employment_status: /student/i.test(fullText) ? 'student' : 'employed',
    years_of_experience: yearsExp,
    industry: detectedIndustry,
    location: extractedLocation || 'Kuala Lumpur, Malaysia',
  }

  // ── 2. EDUCATION ──
  const eduLines = segments.education.length > 0 ? segments.education : segments.other
  let eduLevel: EducationLevel = 'bachelor'
  if (/ph\.?d|doctorate/i.test(eduLines.join(' '))) eduLevel = 'phd'
  else if (/master|m\.?sc|mba/i.test(eduLines.join(' '))) eduLevel = 'master'
  else if (/diploma/i.test(eduLines.join(' '))) eduLevel = 'diploma'
  else if (/certificate/i.test(eduLines.join(' '))) eduLevel = 'certificate'

  // Institution
  let institution = ''
  const instLine = eduLines.find(l => /(universit|college|institute|polytechnic|academy|school\s+of)/i.test(l))
  if (instLine) institution = instLine.trim()

  // Field of Study / Major
  let fieldOfStudy = ''
  const majorLine = eduLines.find(l =>
    /(computer\s+science|software\s+engineering|information\s+technology|data\s+science|business|artificial\s+intelligence|engineering|mathematics|finance)/i.test(l)
  )
  if (majorLine) {
    const cleanMajor = majorLine.match(/(?:bachelor|master|degree|in|of)?\s*([a-zA-Z\s]{4,40})/i)
    fieldOfStudy = cleanMajor ? cleanMajor[1].trim() : majorLine
  }

  // Graduation Year
  let gradYear = new Date().getFullYear()
  const yearMatch = eduLines.join(' ').match(/\b(20\d{2})\b/)
  if (yearMatch) {
    gradYear = parseInt(yearMatch[1], 10)
  }

  // Academic Achievements & Coursework
  const academicAchievements: string[] = []
  const coursework: string[] = []
  for (const line of eduLines) {
    if (/dean'?s\s+list|first\s+class|cum\s+laude|cgpa|gpa|scholarship|honor/i.test(line)) {
      academicAchievements.push(line)
    }
    if (/coursework|relevant\s+courses|modules/i.test(line)) {
      const items = line.replace(/^(coursework|relevant courses|modules):?/i, '').split(/[,;•]/)
      items.forEach(c => { if (c.trim()) coursework.push(c.trim()) })
    }
  }

  const education: Education = {
    ...defaultEducation(),
    education_level: eduLevel,
    institution_name: institution || 'Universiti Malaya / UTM',
    field_of_study: fieldOfStudy || 'Computer Science',
    graduation_year: gradYear,
    academic_achievements: academicAchievements,
    relevant_coursework: coursework,
  }

  // ── 3. SKILLS ──
  const skillSearchText = segments.skills.length > 0 ? segments.skills.join('\n') : fullText
  const foundTech = TECH_SKILLS_DICTIONARY.filter(s => containsSkill(skillSearchText, s))
  const foundAI = AI_SKILLS_DICTIONARY.filter(s => containsSkill(skillSearchText, s))
  const foundTools = TOOLS_DICTIONARY.filter(s => containsSkill(skillSearchText, s))
  const foundSoft = SOFT_SKILLS_DICTIONARY.filter(s => containsSkill(skillSearchText, s))

  // Certifications
  const certLines = segments.certifications.length > 0 ? segments.certifications : []
  const certifications: Certification[] = []
  for (const line of certLines) {
    if (line.length > 4 && line.length < 90) {
      const dateM = line.match(/\b(20\d{2}(?:-\d{2})?)\b/)
      certifications.push({
        name: line.replace(/\b20\d{2}.*$/, '').trim(),
        issuing_organisation: /aws/i.test(line) ? 'Amazon Web Services' : /google/i.test(line) ? 'Google Cloud' : 'Certified Issuer',
        date: dateM ? dateM[1] : '',
      })
    }
  }

  // Languages
  const commonLangs = ['English', 'Malay', 'Bahasa Melayu', 'Mandarin', 'Chinese', 'Cantonese', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Tamil', 'Arabic']
  const langLines = segments.languages.join(' ')
  const languages: Language[] = []
  commonLangs.forEach(l => {
    if (containsSkill(langLines || fullText, l)) {
      languages.push({
        language: l,
        proficiency: /native|bilingual/i.test(langLines) ? 'Native' : 'Professional',
      })
    }
  })

  const proficiency: Record<string, SkillProficiency> = {}
  ;[...foundTech, ...foundAI, ...foundTools].forEach(s => { proficiency[s] = 'intermediate' })

  const skills: SkillsProfile = {
    ...defaultSkills(),
    technical_skills: foundTech.length ? foundTech : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'],
    ai_skills: foundAI,
    tools_and_technologies: foundTools.length ? foundTools : ['Git', 'VS Code', 'Docker'],
    soft_skills: foundSoft.length ? foundSoft : ['Communication', 'Teamwork', 'Problem-solving'],
    skill_proficiency: proficiency,
    certifications,
    languages: languages.length ? languages : [{ language: 'English', proficiency: 'Professional' }],
  }

  // ── 4. WORK EXPERIENCE ──
  const expLines = segments.experience
  const workExperience: WorkExperienceEntry[] = []

  // Split experience lines into jobs by detecting date ranges
  const dateRegex = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|20\d{2})[\s\w]*[-–—]\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|20\d{2}|present|current)\b/i
  const jobHeaderIndices: number[] = []

  for (let i = 0; i < expLines.length; i++) {
    if (dateRegex.test(expLines[i])) {
      jobHeaderIndices.push(i)
    }
  }

  if (jobHeaderIndices.length > 0) {
    for (let k = 0; k < Math.min(jobHeaderIndices.length, 5); k++) {
      const idx = jobHeaderIndices[k]
      const nextIdx = jobHeaderIndices[k + 1] ?? expLines.length
      const headerLine = expLines[idx]
      const dateMatch = headerLine.match(dateRegex)
      const dateStr = dateMatch ? dateMatch[0] : ''

      // Role and company often in line above, line itself, or line below
      let role = 'Software Engineer'
      let company = 'Tech Company'
      const prevLine = expLines[idx - 1] ?? ''
      const nextLine = expLines[idx + 1] ?? ''

      if (prevLine && prevLine.length < 70) {
        if (titleKeywords.test(prevLine)) {
          role = prevLine
          company = headerLine.replace(dateRegex, '').replace(/[|•,-]/g, '').trim() || 'TechCorp'
        } else {
          company = prevLine
          role = headerLine.replace(dateRegex, '').replace(/[|•,-]/g, '').trim() || 'Specialist'
        }
      } else if (nextLine && nextLine.length < 70 && !dateRegex.test(nextLine)) {
        role = headerLine.replace(dateRegex, '').replace(/[|•,-]/g, '').trim() || 'Role'
        company = nextLine
      }

      // Parse start and end date
      const dateParts = dateStr.split(/[-–—]/)
      const start = dateParts[0]?.trim() || '2022'
      const end = /present|current/i.test(dateParts[1] ?? '') ? null : dateParts[1]?.trim() || null

      // Bullet points / responsibilities
      const responsibilities: string[] = []
      const achievements: string[] = []
      const usedSkills: string[] = []

      const contentLines = expLines.slice(idx + 1, nextIdx)
      for (const cl of contentLines) {
        if (/^[-•*▪]\s*/.test(cl) || cl.length > 30) {
          const cleanBullet = cl.replace(/^[-•*▪]\s*/, '').trim()
          responsibilities.push(cleanBullet)

          if (/[0-9]+%|\$|increased|reduced|improved|scaled|awarded|led/i.test(cleanBullet)) {
            achievements.push(cleanBullet)
          }

          // Check skills used in bullet
          TECH_SKILLS_DICTIONARY.forEach(s => {
            if (containsSkill(cleanBullet, s) && !usedSkills.includes(s)) {
              usedSkills.push(s)
            }
          })
        }
      }

      workExperience.push({
        job_title: role,
        company_name: company,
        employment_start_date: start,
        employment_end_date: end,
        job_responsibilities: responsibilities.slice(0, 5),
        achievements: achievements.slice(0, 3),
        skills_used: usedSkills.slice(0, 6),
      })
    }
  }

  // ── 5. PROJECTS ──
  const projLines = segments.projects
  const projects: Project[] = []
  for (let i = 0; i < projLines.length; i++) {
    const line = projLines[i]
    if (line.length > 3 && line.length < 60 && !/^[-•*]/.test(line)) {
      const descLine = projLines[i + 1] ?? ''
      const projTech: string[] = []
      TECH_SKILLS_DICTIONARY.forEach(s => {
        if (containsSkill(line + ' ' + descLine, s)) projTech.push(s)
      })

      const urlMatch = (line + ' ' + descLine).match(/https?:\/\/[^\s]+/i)

      projects.push({
        project_name: line.replace(/[|•-].*$/, '').trim(),
        project_role: 'Lead Developer',
        project_description: descLine.replace(/^[-•*]\s*/, '').trim(),
        project_technologies: projTech.slice(0, 5),
        project_outcomes: ['Built & deployed responsive application'],
        portfolio_url: urlMatch ? urlMatch[0] : null,
      })
      if (projects.length >= 3) break
    }
  }

  // ── 6. CAREER PREFERENCES & GOALS ──
  const summaryText = segments.summary.join(' ')
  const career: CareerPreferences = {
    ...defaultCareerPreferences(),
    career_goals: summaryText.slice(0, 300) || 'Aspiring to contribute as an impactful software professional, building scalable products and driving innovation.',
    target_job_roles: [personal.current_job_title || 'Software Engineer', 'Full Stack Developer'],
    preferred_industries: [detectedIndustry, 'Technology'],
    preferred_work_mode: /remote/i.test(fullText) ? 'remote' : /hybrid/i.test(fullText) ? 'hybrid' : 'on-site',
    preferred_work_location: [personal.location || 'Kuala Lumpur, Malaysia'],
    career_interests: ['Web Development', 'Cloud Computing', 'Artificial Intelligence'],
  }

  return {
    personal,
    education,
    skills,
    work_experience: workExperience,
    projects,
    career,
  }
}
