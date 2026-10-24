import { extractStructuredResume } from '../src/lib/extractor/extract-structured-resume.ts'
import { parseStructuredResume } from '../src/lib/cvParser.ts'
import { profileToCardData } from '../src/lib/cardFirebase.ts'

const testResume = `
Alex Morgan
Full Stack Developer & AI Engineer
Kuala Lumpur, Malaysia | +60 12-345 6789 | alex.morgan@gmail.com
GitHub: https://github.com/alexmorgan-ai
LinkedIn: https://my.linkedin.com/in/alex-morgan-lead
Portfolio: https://alexmorgan.dev

Summary:
Passionate software engineer with 3 years of experience building modern web apps.

Education:
Universiti Teknologi Malaysia (UTM)
Bachelor of Computer Science (Software Engineering)
2020 - 2024
Dean's List Award

Skills:
Technical: React, TypeScript, Node.js, Python, PostgreSQL
AI & ML: OpenAI API, Gemini, PyTorch, LangChain
Tools & Technologies: Git, Docker, VS Code, Figma, Postman

Experience:
Software Engineer | FinTech Solutions
2023 - Present
- Built real-time payment transit system
- Scaled backend architecture
`

console.log('--- TESTING FULL EXTRACTION ---')
const structured = extractStructuredResume(testResume)
console.log('Structured personal_information:')
console.log('  fullName:', structured.personal_information.full_name)
console.log('  email:', structured.personal_information.email)
console.log('  github_url:', structured.personal_information.github_url)
console.log('  linkedin_url:', structured.personal_information.linkedin_url)
console.log('  portfolio_url:', structured.personal_information.portfolio_url)

if (structured.personal_information.github_url !== 'https://github.com/alexmorgan-ai') {
  throw new Error(`Unexpected github_url: ${structured.personal_information.github_url}`)
}
if (structured.personal_information.linkedin_url !== 'https://www.linkedin.com/in/alex-morgan-lead') {
  throw new Error(`Unexpected linkedin_url: ${structured.personal_information.linkedin_url}`)
}
if (structured.personal_information.portfolio_url !== 'https://alexmorgan.dev') {
  throw new Error(`Unexpected portfolio_url: ${structured.personal_information.portfolio_url}`)
}

console.log('\n--- TESTING PARSE STRUCTURED RESUME ---')
const parsed = parseStructuredResume(testResume, {
  name: 'Fallback User',
  email: 'fallback@example.com',
  title: 'Engineer',
  role: 'Developer',
  station: 'Station 1',
  avatar: '',
})
console.log('Parsed personal info:')
console.log('  github_url:', parsed.personal.github_url)
console.log('  linkedin_url:', parsed.personal.linkedin_url)
console.log('  portfolio_url:', parsed.personal.portfolio_url)

if (parsed.personal.github_url !== 'https://github.com/alexmorgan-ai') {
  throw new Error(`Parsed github_url mismatch: ${parsed.personal.github_url}`)
}
if (parsed.personal.linkedin_url !== 'https://www.linkedin.com/in/alex-morgan-lead') {
  throw new Error(`Parsed linkedin_url mismatch: ${parsed.personal.linkedin_url}`)
}

console.log('\n--- TESTING CARD DATA MAPPING ---')
const cardData = profileToCardData({ personal: parsed.personal }, 'test-uid-123')
console.log('CardPassData:')
console.log('  holderName:', cardData.holderName)
console.log('  github:', cardData.github)
console.log('  linkedin:', cardData.linkedin)

if (cardData.github !== 'https://github.com/alexmorgan-ai') {
  throw new Error(`Card github mismatch: ${cardData.github}`)
}
if (cardData.linkedin !== 'https://www.linkedin.com/in/alex-morgan-lead') {
  throw new Error(`Card linkedin mismatch: ${cardData.linkedin}`)
}

console.log('\nALL TESTS PASSED SUCCESSFULLY! ✅')
