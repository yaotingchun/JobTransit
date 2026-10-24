import { extractStructuredResume } from '../src/lib/extractor/extract-structured-resume.ts'
import { parseStructuredResume } from '../src/lib/cvParser.ts'

const testResume = `
Alex Morgan
Full Stack Developer & AI Engineer
Kuala Lumpur, Malaysia | alex.morgan@gmail.com | +60 12-345 6789
github.com/alexmorgan-ai | linkedin.com/in/alexmorgan

PROFESSIONAL SUMMARY
Dynamic software engineer with experience building scalable web applications.

SKILLS
- Frameworks & Tools: React, Next.js, Node.js, Express
- Methodologies: Agile/Scrum, Kanban, Test-Driven Development (TDD)
- Programming Languages: TypeScript, Python, Go
- Cloud & DevOps: AWS, Docker, Kubernetes
- Operating Systems: Linux, macOS, Ubuntu

EXPERIENCE
Shopee | Senior Frontend Engineer
Jan 2023 - Present
- Spearheaded frontend web application rewrite
- Mentored junior engineers

TechCorp Solutions Bhd
Software Engineer
Jan 2021 - Dec 2022
- Maintained REST APIs and PostgreSQL database
`

console.log('--- TESTING EXTRACT STRUCTURED RESUME ---')
const structured = extractStructuredResume(testResume)

console.log('\n1. Job Title Extraction:')
console.log('  Candidate Current Job Title:', structured.personal_information.current_job_title)
console.log('  Job #1 Title:', structured.work_experience[0]?.job_title)
console.log('  Job #1 Company:', structured.work_experience[0]?.company_name)
console.log('  Job #2 Title:', structured.work_experience[1]?.job_title)
console.log('  Job #2 Company:', structured.work_experience[1]?.company_name)

if (structured.personal_information.current_job_title !== 'Full Stack Developer & AI Engineer') {
  throw new Error(`Unexpected current_job_title: "${structured.personal_information.current_job_title}"`)
}
if (structured.work_experience[0]?.job_title !== 'Senior Frontend Engineer') {
  throw new Error(`Unexpected job 1 title: "${structured.work_experience[0]?.job_title}"`)
}
if (structured.work_experience[0]?.company_name !== 'Shopee') {
  throw new Error(`Unexpected job 1 company: "${structured.work_experience[0]?.company_name}"`)
}
if (structured.work_experience[1]?.job_title !== 'Software Engineer') {
  throw new Error(`Unexpected job 2 title: "${structured.work_experience[1]?.job_title}"`)
}
if (structured.work_experience[1]?.company_name !== 'TechCorp Solutions Bhd') {
  throw new Error(`Unexpected job 2 company: "${structured.work_experience[1]?.company_name}"`)
}

console.log('\n2. Skills Extraction:')
console.log('  Technical Skills:', structured.skills.technical_skills)
console.log('  Tools & Technologies:', structured.skills.tools_and_technologies)
console.log('  Other Skills (not shown in website):', structured.skills.other_skills)

// Verify no skill tag contains colon or title prefix
const allSkills = [
  ...structured.skills.technical_skills,
  ...structured.skills.tools_and_technologies,
  ...structured.skills.soft_skills,
  ...structured.skills.other_skills,
]

for (const skill of allSkills) {
  if (skill.includes(':') || /^(frameworks|methodologies|operating systems)/i.test(skill)) {
    throw new Error(`Skill contains title prefix or colon: "${skill}"`)
  }
}

// Verify React is in tools or technical
if (!structured.skills.technical_skills.includes('React') && !structured.skills.tools_and_technologies.includes('React')) {
  throw new Error('React should be in technical or tools')
}

// Verify Agile/Scrum is in other_skills
if (!structured.skills.other_skills.includes('Agile/Scrum')) {
  throw new Error(`Agile/Scrum should be in other_skills, found: ${JSON.stringify(structured.skills.other_skills)}`)
}

// Verify Linux is in other_skills
if (!structured.skills.other_skills.includes('Linux')) {
  throw new Error(`Linux should be in other_skills, found: ${JSON.stringify(structured.skills.other_skills)}`)
}

console.log('\n3. Testing parseStructuredResume integration:')
const parsed = parseStructuredResume(testResume, {
  name: 'Fallback',
  email: 'fallback@example.com',
  title: 'Dev',
  role: 'Dev',
  station: '1',
  avatar: '',
})
console.log('  Parsed other_skills:', parsed.skills.other_skills)
if (!parsed.skills.other_skills || !parsed.skills.other_skills.includes('Agile/Scrum')) {
  throw new Error('parsed.skills.other_skills missing Agile/Scrum')
}

console.log('\nALL VERIFICATION TESTS PASSED! ✅')
