export type InformationSource = 'cv' | 'user_confirmed' | 'derived'

export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'unknown'

export type ProfileFieldStatus =
  | 'known'
  | 'missing'
  | 'ambiguous'
  | 'confirmed'
  | 'unknown'

export interface SkillEvidence {
  description: string
  source: 'cv' | 'user_confirmed'
}

export interface CareerSkill {
  name: string
  evidence: SkillEvidence[]
  proficiency: SkillProficiency
  source: InformationSource
}

export interface EducationEntry {
  qualification?: string
  field?: string
  institution?: string
  year?: string | number
}

export interface ProjectEntry {
  name: string
  technologies?: string[]
  responsibilities?: string[]
  context?: string
}

export interface ExperienceEntry {
  title?: string
  company?: string
  responsibilities?: string[]
  duration?: string
}

export interface CareerPreferences {
  targetRoles: string[]
  workInterests: string[]
}

export interface LearningPreferences {
  hoursPerWeekRange: string | null
  timelineMonths: number | null
  timelinePreference: string | null
  willingnessToLearn: string | null
}

export interface CareerProfile {
  id?: string
  candidateName?: string
  skills: CareerSkill[]
  education: EducationEntry[]
  projects: ProjectEntry[]
  experience: ExperienceEntry[]
  certifications: string[]
  careerStage: string | null
  experienceContext?: string | null
  careerPreferences: CareerPreferences
  learningPreferences: LearningPreferences
  fieldStatuses?: Record<string, ProfileFieldStatus>
  updatedAt?: string
}

export interface InitialProfileInput {
  initialProfile?: Partial<CareerProfile>
  mockProfileId?: string
  source: 'mock' | 'cv_extractor'
}
