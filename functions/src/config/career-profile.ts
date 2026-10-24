import { ArticleCategory } from '../pipeline/types'

export interface CareerProfile {
  targetRoles: string[]
  coreSkills: string[]
  interestCategories: ArticleCategory[]
}

export const CS_STUDENT_PROFILE: CareerProfile = {
  targetRoles: [
    'AI Engineer',
    'Full-Stack Developer',
    'Backend Engineer',
    'Data Engineer',
    'DevOps / Cloud Engineer',
  ],
  coreSkills: [
    'Python',
    'TypeScript',
    'JavaScript',
    'React',
    'Node.js',
    'SQL',
    'PostgreSQL',
    'Go',
    'Rust',
    'Machine Learning',
    'LLM',
    'System Design',
    'Cloud',
    'AWS',
    'Docker',
    'Kubernetes',
    'API Design',
    'Git',
  ],
  interestCategories: ['ai-ml', 'software-engineering', 'data-cloud', 'security'],
}
