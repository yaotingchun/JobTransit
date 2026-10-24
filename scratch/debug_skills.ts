import { detectAllSkillsInDocument } from '../src/lib/extractor/skills-catalog.ts'
import { extractStructuredResume } from '../src/lib/extractor/extract-structured-resume.ts'

const text = `
John Doe
Software Engineer
john@example.com

SKILLS
Frameworks & Tools: React, Next.js, Docker
Methodologies: Agile/Scrum, Kanban
`

const result = extractStructuredResume(text)
console.log('Technical:', result.skills.technical_skills)
console.log('Tools:', result.skills.tools_and_technologies)
console.log('Soft:', result.skills.soft_skills)
console.log('AI:', result.skills.ai_skills)
