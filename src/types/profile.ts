// ─── Enums ───────────────────────────────────────────────────────────────────

export type EmploymentStatus = 'student' | 'employed' | 'unemployed' | 'freelancer' | 'career_changer'
export type EducationLevel = 'diploma' | 'bachelor' | 'master' | 'phd' | 'certificate' | 'other'
export type WorkMode = 'on-site' | 'hybrid' | 'remote'
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert'

// ─── A. Personal & Professional ──────────────────────────────────────────────

export interface PersonalInfo {
  full_name: string
  email: string
  phone_number: string
  current_job_title: string
  current_employment_status: EmploymentStatus
  years_of_experience: number
  industry: string
  location: string
  github_url?: string
  linkedin_url?: string
  portfolio_url?: string
}

// ─── B. Education ─────────────────────────────────────────────────────────────

export interface Education {
  education_level: EducationLevel
  field_of_study: string
  institution_name: string
  graduation_year: number
  academic_achievements: string[]
  relevant_coursework: string[]
}

// ─── C. Skills & Competencies ─────────────────────────────────────────────────

export interface Certification {
  name: string
  issuing_organisation: string
  date: string
}

export interface Language {
  language: string
  proficiency: string
}

export interface SkillsProfile {
  technical_skills: string[]
  soft_skills: string[]
  ai_skills: string[]
  tools_and_technologies: string[]
  other_skills?: string[]
  skill_proficiency: Record<string, SkillProficiency>
  skill_evidence: Record<string, string>
  certifications: Certification[]
  languages: Language[]
}

// ─── D. Work Experience ───────────────────────────────────────────────────────

export interface WorkExperienceEntry {
  job_title: string
  company_name: string
  employment_start_date: string
  employment_end_date: string | null
  job_responsibilities: string[]
  achievements: string[]
  skills_used: string[]
}

// ─── E. Projects & Practical Experience ──────────────────────────────────────

export interface Project {
  project_name: string
  project_description: string
  project_technologies: string[]
  project_role: string
  project_outcomes: string[]
  portfolio_url: string | null
}

// ─── F. Career Preferences ────────────────────────────────────────────────────

export interface CareerPreferences {
  career_interests: string[]
  target_job_roles: string[]
  preferred_industries: string[]
  preferred_work_location: string[]
  preferred_work_mode: WorkMode
  career_goals: string
}

// ─── Master Profile (Firestore document) ──────────────────────────────────────

export interface UserProfileData {
  uid: string
  personal: PersonalInfo
  education: Education
  skills: SkillsProfile
  work_experience: WorkExperienceEntry[]
  projects: Project[]
  career_preferences: CareerPreferences
  cv_raw_text: string
  pass_id: string
  created_at: string
  updated_at: string
}

// ─── Default / blank factories ────────────────────────────────────────────────

export const defaultPersonal = (): PersonalInfo => ({
  full_name: '',
  email: '',
  phone_number: '',
  current_job_title: '',
  current_employment_status: 'employed',
  years_of_experience: 0,
  industry: '',
  location: '',
  github_url: '',
  linkedin_url: '',
  portfolio_url: '',
})

export const defaultEducation = (): Education => ({
  education_level: 'bachelor',
  field_of_study: '',
  institution_name: '',
  graduation_year: new Date().getFullYear(),
  academic_achievements: [],
  relevant_coursework: [],
})

export const defaultSkills = (): SkillsProfile => ({
  technical_skills: [],
  soft_skills: [],
  ai_skills: [],
  tools_and_technologies: [],
  other_skills: [],
  skill_proficiency: {},
  skill_evidence: {},
  certifications: [],
  languages: [],
})

export const defaultCareerPreferences = (): CareerPreferences => ({
  career_interests: [],
  target_job_roles: [],
  preferred_industries: [],
  preferred_work_location: [],
  preferred_work_mode: 'hybrid',
  career_goals: '',
})
