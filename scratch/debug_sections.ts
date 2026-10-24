import { classifyResumeSections } from '../src/lib/extractor/classify-sections.ts'
import { extractStructuredResume } from '../src/lib/extractor/extract-structured-resume.ts'

const sampleText = `
Alex Morgan
Software Engineer

SKILLS

Frameworks & Tools: React

Methodologies: Agile/Scrum
`

const sections = classifyResumeSections(sampleText)
console.log('Sections:', sections)

const res = extractStructuredResume(sampleText)
console.log('Result technical:', res.skills.technical_skills)
console.log('Result tools:', res.skills.tools_and_technologies)
