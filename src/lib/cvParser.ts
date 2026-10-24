/**
 * Advanced Multi-Format CV / Resume Extraction Engine
 * Powered by Resume-Text-Extractor logic:
 * - PDF (Native text with row/gap alignment & canvas Tesseract OCR for scanned documents)
 * - Word (.docx via Mammoth)
 * - PowerPoint (.pptx via JSZip slide XMLs)
 * - PNG Images (via Tesseract.js OCR)
 */
import type {
  PersonalInfo, Education, SkillsProfile, WorkExperienceEntry,
  Project, CareerPreferences, EducationLevel,
  SkillProficiency, WorkMode, EmploymentStatus,
} from '../types/profile'
import {
  defaultPersonal, defaultEducation, defaultSkills, defaultCareerPreferences,
} from '../types/profile'
import type { UserProfile } from '../components/Navbar'

import {
  extractFileText,
  isSupportedResumeFile,
  looksLikeResume,
} from './extractor/extract-resume.ts'
import {
  classifyResumeSections,
  formatClassifiedSections,
} from './extractor/classify-sections.ts'
import {
  extractProjectDetails,
  cleanProjectTitle,
  isHumanName,
  isDescription,
} from './extractor/parse-projects.ts'
import {
  extractStructuredResume,
  detectLocation,
  detectGitHubUrl,
  detectLinkedInUrl,
  detectPortfolioUrl,
  detectCurrentJobTitle,
  isLikelyJobTitle,
  type StructuredResume,
} from './extractor/extract-structured-resume.ts'
import { classifySkillTitle } from './extractor/skills-catalog.ts'

export interface ExtractionProgress {
  stage: string
  percent?: number
}

export interface ParsedProfileResult {
  personal: PersonalInfo
  education: Education
  skills: SkillsProfile
  work_experience: WorkExperienceEntry[]
  projects: Project[]
  career: CareerPreferences
}

/**
 * Normalizes any date string (e.g., '2022', 'Jan 2022', '01/2022', '2022-01')
 * into standard HTML5 YYYY-MM format so browser <input type="month"> controls
 * can display and edit them properly.
 */
export function normalizeToMonthYear(val?: string | null): string {
  if (!val) return ''
  const trimmed = val.trim()
  if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed

  const yMatch = trimmed.match(/\b(19\d{2}|20\d{2})\b/)
  if (!yMatch) return ''
  const year = yMatch[1]

  const monthNames: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  }
  const wordMatch = trimmed.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i)
  if (wordMatch) {
    const m = monthNames[wordMatch[1].toLowerCase().slice(0, 3)]
    return `${year}-${m}`
  }

  const mMatch = trimmed.match(/\b(0?[1-9]|1[0-2])\b/)
  if (mMatch && mMatch[1] !== year) {
    return `${year}-${mMatch[1].padStart(2, '0')}`
  }

  return `${year}-01`
}

/**
 * Extracts plain, structured text from any supported file format:
 * PDF, Word (.docx), PowerPoint (.pptx), PNG images.
 * Uses the client-side parsing pipeline from Resume-Text-Extractor.
 */
export async function extractTextFromAnyFile(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<string> {
  onProgress?.({ stage: `Reading ${file.name}…`, percent: 10 })
  const result = await extractFileText(file, (percent, message) => {
    onProgress?.({ stage: message, percent })
  })
  onProgress?.({ stage: 'Extraction complete', percent: 100 })
  return result.text
}

/**
 * Parses raw extracted CV text into structured profile models
 * using the section classification and career attribute extraction
 * logic from Resume-Text-Extractor.
 */
export function parseStructuredResume(
  rawText: string,
  userFallback: UserProfile
): ParsedProfileResult {
  const structured: StructuredResume = extractStructuredResume(rawText)
  const rawPersonal = structured.personal_information
  const rawEdu = structured.education
  const rawSkills = structured.skills
  const rawCareer = structured.career_preferences

  const personal: PersonalInfo = {
    ...defaultPersonal(),
    full_name: rawPersonal.full_name || userFallback.name || 'Candidate',
    email: rawPersonal.email || userFallback.email || '',
    phone_number: rawPersonal.phone_number || '',
    current_job_title: rawPersonal.current_job_title || 'Software Professional',
    current_employment_status: (rawPersonal.current_employment_status as EmploymentStatus) || 'employed',
    years_of_experience: typeof rawPersonal.years_of_experience === 'number' ? rawPersonal.years_of_experience : 0,
    industry: rawPersonal.industry || 'Technology',
    location: rawPersonal.location || (userFallback as any).location || '',
    github_url: rawPersonal.github_url || (userFallback as any).github_url || '',
    linkedin_url: rawPersonal.linkedin_url || (userFallback as any).linkedin_url || '',
    portfolio_url: rawPersonal.portfolio_url || (userFallback as any).portfolio_url || '',
  }

  const education: Education = {
    ...defaultEducation(),
    education_level: (rawEdu.education_level as EducationLevel) || 'bachelor',
    field_of_study: rawEdu.field_of_study || 'Computer Science',
    institution_name: rawEdu.institution_name || 'Universiti Malaya',
    graduation_year: typeof rawEdu.graduation_year === 'number' ? rawEdu.graduation_year : new Date().getFullYear(),
    academic_achievements: rawEdu.academic_achievements || [],
    relevant_coursework: rawEdu.relevant_coursework || [],
  }

  const skills: SkillsProfile = {
    ...defaultSkills(),
    technical_skills: rawSkills.technical_skills || [],
    soft_skills: rawSkills.soft_skills || [],
    ai_skills: rawSkills.ai_skills || [],
    tools_and_technologies: rawSkills.tools_and_technologies || [],
    other_skills: rawSkills.other_skills || [],
    skill_proficiency: (rawSkills.skill_proficiency as Record<string, SkillProficiency>) || {},
    skill_evidence: rawSkills.skill_evidence || {},
    certifications: (rawSkills.certifications || []).map((c) => ({
      name: c.name,
      issuing_organisation: c.issuing_organisation || 'Recognized Organization',
      date: c.date || '',
    })),
    languages: (rawSkills.languages || []).map((l) => ({
      language: l.language,
      proficiency: l.proficiency || 'Conversational',
    })),
  }

  const work_experience: WorkExperienceEntry[] = (structured.work_experience || []).map((w) => ({
    job_title: w.job_title || 'Software Engineer',
    company_name: w.company_name || 'Tech Company',
    employment_start_date: normalizeToMonthYear(w.employment_start_date) || '2022-01',
    employment_end_date: w.employment_end_date ? normalizeToMonthYear(w.employment_end_date) : null,
    job_responsibilities: w.job_responsibilities || [],
    achievements: w.achievements || [],
    skills_used: w.skills_used || [],
  }))

  const knownCandidateNames = [personal.full_name, userFallback.name].filter(Boolean) as string[];
  const projects: Project[] = (structured.projects || [])
    .map((p) => {
      let name = cleanProjectTitle(p.project_name, knownCandidateNames);
      if (!name || isHumanName(name, knownCandidateNames)) {
        const descLines = (p.project_description || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const alt = descLines.find((line) => !isHumanName(line, knownCandidateNames) && !isDescription(line));
        if (alt) {
          name = cleanProjectTitle(alt, knownCandidateNames);
        } else {
          const firstTech = p.project_technologies?.[0] || 'Software';
          name = `${firstTech} Application`;
        }
      }
      return {
        project_name: name || 'Key Portfolio Project',
        project_description: p.project_description || 'Developed and deployed application features with modern web and backend technologies.',
        project_technologies: p.project_technologies && p.project_technologies.length > 0 ? p.project_technologies : ['TypeScript', 'React'],
        project_role: p.project_role || 'Developer',
        project_outcomes: p.project_outcomes || [],
        portfolio_url: p.portfolio_url || null,
      };
    })
    .filter((p) => !isHumanName(p.project_name, knownCandidateNames));

  const career: CareerPreferences = {
    ...defaultCareerPreferences(),
    target_job_roles: rawCareer.target_job_roles && rawCareer.target_job_roles.length > 0 ? rawCareer.target_job_roles : [],
    preferred_industries: rawCareer.preferred_industries && rawCareer.preferred_industries.length > 0 ? rawCareer.preferred_industries : [personal.industry || 'Technology'],
    preferred_work_location: rawCareer.preferred_work_location && rawCareer.preferred_work_location.length > 0
      ? rawCareer.preferred_work_location
      : (personal.location ? [personal.location] : ['Kuala Lumpur, Malaysia']),
    preferred_work_mode: (rawCareer.preferred_work_mode as WorkMode) || 'hybrid',
    career_goals: rawCareer.career_goals || 'Aspiring to contribute as an impactful software professional, building scalable products and driving innovation.',
    career_interests: [],
  }

  return {
    personal,
    education,
    skills,
    work_experience,
    projects,
    career,
  }
}

export {
  isSupportedResumeFile,
  looksLikeResume,
  classifyResumeSections,
  formatClassifiedSections,
  extractProjectDetails,
  extractStructuredResume,
  detectLocation,
  detectGitHubUrl,
  detectLinkedInUrl,
  detectPortfolioUrl,
  detectCurrentJobTitle,
  isLikelyJobTitle,
  classifySkillTitle,
}
