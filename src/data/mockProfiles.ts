import type { CareerProfile } from '../types/careerProfile'

export interface MockProfileConfig {
  id: string
  name: string
  subtitle: string
  description: string
  expectedQuestionIds: string[]
  profile: CareerProfile
}

export const mockProfileA: MockProfileConfig = {
  id: 'student_cs',
  name: 'Alex Chen',
  subtitle: 'Computer Science Student',
  description:
    'Undergraduate with academic Python and SQL skills. Target roles and learning capacity are missing; experience context is ambiguous.',
  expectedQuestionIds: ['target_roles', 'experience_context', 'work_preference', 'learning_hours'],
  profile: {
    id: 'profile_student_cs',
    candidateName: 'Alex Chen',
    careerStage: 'student_or_recent_grad',
    experienceContext: null,
    skills: [
      {
        name: 'Python',
        proficiency: 'intermediate',
        source: 'cv',
        evidence: [
          {
            description: 'Coursework assignments and data structures lab exercises',
            source: 'cv',
          },
        ],
      },
      {
        name: 'SQL',
        proficiency: 'beginner',
        source: 'cv',
        evidence: [
          {
            description: 'Database Systems module project using PostgreSQL',
            source: 'cv',
          },
        ],
      },
    ],
    education: [
      {
        qualification: 'Bachelor of Computing in Computer Science',
        field: 'Computer Science',
        institution: 'National University of Singapore',
        year: 'Expected 2026',
      },
    ],
    projects: [
      {
        name: 'Library Book Reservation System',
        technologies: ['Python', 'Flask', 'SQLite'],
        responsibilities: [
          'Implemented user authentication and book availability search',
          'Created relational database schema for reservation transactions',
        ],
        context: 'Academic term project',
      },
    ],
    experience: [],
    certifications: [],
    careerPreferences: {
      targetRoles: [],
      workInterests: [],
    },
    learningPreferences: {
      hoursPerWeekRange: null,
      timelineMonths: null,
      timelinePreference: null,
      willingnessToLearn: null,
    },
  },
}

export const mockProfileB: MockProfileConfig = {
  id: 'software_grad',
  name: 'Marcus Vance',
  subtitle: 'Recent Software Graduate',
  description:
    'Graduate with documented React, Node.js, and TypeScript project experience. Target role and interests are clearly established.',
  expectedQuestionIds: ['learning_hours', 'career_timeline'],
  profile: {
    id: 'profile_software_grad',
    candidateName: 'Marcus Vance',
    careerStage: 'student_or_recent_grad',
    experienceContext: 'team_projects',
    skills: [
      {
        name: 'JavaScript',
        proficiency: 'intermediate',
        source: 'cv',
        evidence: [
          {
            description: 'Core language in 3 web development projects and hackathon submissions',
            source: 'cv',
          },
        ],
      },
      {
        name: 'React',
        proficiency: 'intermediate',
        source: 'cv',
        evidence: [
          {
            description: 'Built responsive single-page web applications with React Hooks & Router',
            source: 'cv',
          },
        ],
      },
      {
        name: 'Node.js',
        proficiency: 'intermediate',
        source: 'cv',
        evidence: [
          {
            description: 'Developed RESTful APIs with Express and JWT authentication',
            source: 'cv',
          },
        ],
      },
      {
        name: 'TypeScript',
        proficiency: 'beginner',
        source: 'cv',
        evidence: [
          {
            description: 'Integrated typed interfaces into campus marketplace web application',
            source: 'cv',
          },
        ],
      },
    ],
    education: [
      {
        qualification: 'B.Sc. in Software Engineering',
        field: 'Software Engineering',
        institution: 'Melbourne Institute of Technology',
        year: '2025',
      },
    ],
    projects: [
      {
        name: 'Campus Marketplace Hub',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
        responsibilities: [
          'Engineered item listing, filtering, and real-time chat with Socket.io',
          'Collaborated with 3 peers using Git version control and pull request reviews',
        ],
        context: 'Final year capstone team project',
      },
      {
        name: 'DevLog Micro-Blogging Platform',
        technologies: ['TypeScript', 'Express', 'MongoDB'],
        responsibilities: [
          'Built REST API with rate limiting and automated Jest integration tests',
        ],
        context: 'Personal open-source project',
      },
    ],
    experience: [],
    certifications: ['AWS Certified Cloud Practitioner'],
    careerPreferences: {
      targetRoles: ['software_backend', 'frontend_fullstack'],
      workInterests: ['build_software'],
    },
    learningPreferences: {
      hoursPerWeekRange: null,
      timelineMonths: null,
      timelinePreference: null,
      willingnessToLearn: null,
    },
  },
}

export const mockProfileC: MockProfileConfig = {
  id: 'experienced_dev_ai',
  name: 'Elena Rostova',
  subtitle: 'Experienced Backend Developer Exploring AI',
  description:
    '3.5 years in backend engineering (Python/Django). CV mentions interest in AI, but specific AI experience is unproven; learning openness and availability need validation.',
  expectedQuestionIds: ['target_roles', 'learning_openness', 'learning_hours'],
  profile: {
    id: 'profile_experienced_dev_ai',
    candidateName: 'Elena Rostova',
    careerStage: 'employed_tech',
    experienceContext: 'professional_work',
    skills: [
      {
        name: 'Python',
        proficiency: 'advanced',
        source: 'cv',
        evidence: [
          {
            description: '3+ years production backend service development in Python/Django & FastAPI',
            source: 'cv',
          },
        ],
      },
      {
        name: 'PostgreSQL',
        proficiency: 'intermediate',
        source: 'cv',
        evidence: [
          {
            description: 'Database schema optimization and query performance tuning in production',
            source: 'cv',
          },
        ],
      },
      {
        name: 'Docker',
        proficiency: 'intermediate',
        source: 'cv',
        evidence: [
          {
            description: 'Containerized microservices for Kubernetes deployment pipelines',
            source: 'cv',
          },
        ],
      },
    ],
    education: [
      {
        qualification: 'B.Eng. in Information Systems',
        field: 'Information Systems',
        institution: 'University of Waterloo',
        year: '2021',
      },
    ],
    projects: [
      {
        name: 'High-Throughput Payment Ingestion Engine',
        technologies: ['Python', 'Kafka', 'FastAPI', 'Redis'],
        responsibilities: [
          'Processed over 12,000 webhook events per minute with 99.98% uptime',
          'Refactored legacy synchronous calls to async Redis pipelines',
        ],
        context: 'Production fintech platform',
      },
    ],
    experience: [
      {
        title: 'Backend Software Engineer',
        company: 'NovaPay Global Technologies',
        responsibilities: [
          'Engineered financial compliance transaction microservices in Python',
          'Mentored junior engineers and conducted architecture code reviews',
        ],
        duration: '2022 - Present',
      },
    ],
    certifications: ['Certified Kubernetes Application Developer (CKAD)'],
    careerPreferences: {
      // Ambiguous: CV summary states "passionate about transitioning into AI engineering"
      // but no concrete AI target role has been officially confirmed
      targetRoles: [],
      workInterests: ['build_software'],
    },
    learningPreferences: {
      hoursPerWeekRange: null,
      timelineMonths: null,
      timelinePreference: null,
      willingnessToLearn: null,
    },
  },
}

export const MOCK_PROFILES: Record<string, MockProfileConfig> = {
  student_cs: mockProfileA,
  software_grad: mockProfileB,
  experienced_dev_ai: mockProfileC,
}

export function getMockProfile(id: string): CareerProfile | null {
  const found = MOCK_PROFILES[id]
  return found ? JSON.parse(JSON.stringify(found.profile)) : null
}
