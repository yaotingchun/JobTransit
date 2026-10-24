import type { FollowUpQuestion, QuestionId } from '../types/followUpQuestion'

export const QUESTION_BANK: Record<QuestionId, FollowUpQuestion> = {
  career_stage: {
    id: 'career_stage',
    fieldKey: 'careerStage',
    prompt: 'Which best describes your current situation?',
    subtitle: 'Helps us tailor transitions and station recommendations to your experience level.',
    selectionType: 'single',
    required: true,
    options: [
      {
        id: 'student_or_recent_grad',
        label: 'Student or recent graduate',
        description: 'Currently enrolled or graduated within the past 12 months',
      },
      {
        id: 'employed_tech',
        label: 'Currently working in a tech role',
        description: 'Full-time, part-time, or contract technical practitioner',
      },
      {
        id: 'employed_non_tech',
        label: 'Working outside tech',
        description: 'Looking to pivot your career into the tech industry',
      },
      {
        id: 'first_job',
        label: 'Looking for my first job',
        description: 'Self-taught or transitioning into junior-level positions',
      },
      {
        id: 'career_change',
        label: 'Changing career direction',
        description: 'Pivoting from one technical domain into another',
      },
      {
        id: 'prefer_not_to_say',
        label: 'Prefer not to say',
        description: 'We will use general recommendations across all transit lines',
      },
    ],
  },

  target_roles: {
    id: 'target_roles',
    fieldKey: 'targetRoles',
    prompt: 'Which career areas would you like to explore?',
    subtitle: 'Select one or more destinations. You can always adjust your route later.',
    selectionType: 'multiple',
    required: true,
    options: [
      {
        id: 'ai_ml',
        label: 'AI / Machine Learning',
        description: 'Agentic AI, LLMs, computer vision, and predictive modeling',
        badge: 'High Trend',
      },
      {
        id: 'software_backend',
        label: 'Backend / Software Engineering',
        description: 'APIs, distributed systems, microservices, and databases',
      },
      {
        id: 'frontend_fullstack',
        label: 'Frontend / Full Stack Development',
        description: 'Modern web applications, interactive UI, and client systems',
      },
      {
        id: 'data_engineering_analytics',
        label: 'Data Engineering / Analytics',
        description: 'Data pipelines, warehousing, ETL, and business intelligence',
      },
      {
        id: 'cybersecurity',
        label: 'Cybersecurity',
        description: 'Application security, threat detection, and compliance',
      },
      {
        id: 'cloud_devops',
        label: 'Cloud / DevOps',
        description: 'CI/CD, container orchestration, Kubernetes, and infrastructure as code',
      },
      {
        id: 'undecided',
        label: "I'm still exploring",
        description: "We'll suggest high-compatibility transit routes based on your skills",
      },
    ],
  },

  experience_context: {
    id: 'experience_context',
    fieldKey: 'experienceContext',
    prompt: 'Where have you applied your technical skills?',
    subtitle: 'Clarifies how hands-on your projects are without discounting any of your work.',
    selectionType: 'single',
    required: true,
    options: [
      {
        id: 'coursework',
        label: 'Coursework or guided tutorials',
        description: 'Academic assignments, online courses, and lab exercises',
      },
      {
        id: 'personal_projects',
        label: 'Personal projects',
        description: 'Independent apps, open-source repositories, and hobby experiments',
      },
      {
        id: 'team_projects',
        label: 'Team projects or hackathons',
        description: 'Collaborative group projects with code reviews and shared repositories',
      },
      {
        id: 'internship',
        label: 'Internship or placement',
        description: 'Industry-supervised work experience in a production setting',
      },
      {
        id: 'professional_work',
        label: 'Professional work',
        description: 'Commercial production software and enterprise system development',
      },
      {
        id: 'mixed_experience',
        label: 'A combination of these',
        description: 'Experience spanning academic, self-driven, and industry environments',
      },
    ],
  },

  work_preference: {
    id: 'work_preference',
    fieldKey: 'workInterests',
    prompt: 'What kind of technical work interests you most?',
    subtitle: 'Helps us recommend roles with the day-to-day challenges you genuinely enjoy.',
    selectionType: 'multiple',
    required: true,
    options: [
      {
        id: 'build_software',
        label: 'Building applications and software',
        description: 'Turning specifications into fast, reliable software features',
      },
      {
        id: 'analyze_data',
        label: 'Working with data and finding insights',
        description: 'Uncovering trends, statistical analysis, and modeling patterns',
      },
      {
        id: 'develop_ai',
        label: 'Developing AI-powered solutions',
        description: 'Prompt engineering, RAG workflows, agent tools, and fine-tuning',
      },
      {
        id: 'secure_systems',
        label: 'Protecting systems and information',
        description: 'Hardening infrastructure, vulnerability management, and crypto',
      },
      {
        id: 'infrastructure',
        label: 'Cloud infrastructure and deployment',
        description: 'Automation, container platforms, reliability, and monitoring',
      },
      {
        id: 'explore_mixed',
        label: 'A mix of different areas',
        description: 'Enjoying breadth across multiple disciplines and hybrid responsibilities',
      },
      {
        id: 'not_sure',
        label: "I'm not sure yet",
        description: 'Focus on versatile foundational pathways first',
      },
    ],
  },

  learning_hours: {
    id: 'learning_hours',
    fieldKey: 'hoursPerWeekRange',
    prompt: 'How much time can you spend learning each week?',
    subtitle: 'We use this to design realistic milestone paces that prevent burnout.',
    selectionType: 'single',
    required: true,
    options: [
      {
        id: 'hours_1_2',
        label: '1–2 hours',
        description: 'Bite-sized micro-learning, newsletters, and weekend reading',
      },
      {
        id: 'hours_3_5',
        label: '3–5 hours',
        description: 'Steady progress: one targeted tutorial or module per week',
      },
      {
        id: 'hours_6_10',
        label: '6–10 hours',
        description: 'Substantial commitment: regular project coding and coursework',
      },
      {
        id: 'hours_10_plus',
        label: 'More than 10 hours',
        description: 'Intensive preparation or full-time career transition study',
      },
      {
        id: 'not_sure',
        label: 'Not sure yet',
        description: 'Flexible roadmap that adapts as your schedule evolves',
      },
    ],
  },

  career_timeline: {
    id: 'career_timeline',
    fieldKey: 'timelinePreference',
    prompt: 'When would you like to reach your next career milestone?',
    subtitle: 'Optional: sets the target arrival time on your Career Transit Map.',
    selectionType: 'single',
    required: false,
    allowSkip: true,
    options: [
      {
        id: 'months_3',
        label: 'Within 3 months',
        description: 'Rapid sprint toward immediate job applications or internal promotion',
      },
      {
        id: 'months_6',
        label: 'Within 6 months',
        description: 'Balanced horizon allowing for 1–2 portfolio project completions',
      },
      {
        id: 'months_12',
        label: 'Within 12 months',
        description: 'Strategic long-term preparation or degree completion timeline',
      },
      {
        id: 'exploring',
        label: "I'm exploring without a fixed timeline",
        description: 'Curiosity-driven learning without deadline pressure',
      },
      {
        id: 'not_sure',
        label: 'Not sure yet',
        description: 'Keep recommendations open-ended',
      },
    ],
  },

  learning_openness: {
    id: 'learning_openness',
    fieldKey: 'willingnessToLearn',
    prompt: 'How open are you to learning new technologies for your next role?',
    subtitle: 'Determines whether we suggest direct lateral moves or ambitious new tracks.',
    selectionType: 'single',
    required: true,
    options: [
      {
        id: 'very_open',
        label: "Very open; I'm happy to learn new technologies",
        description: 'Ready to tackle unfamiliar frameworks, languages, or paradigms',
      },
      {
        id: 'structured_plan',
        label: 'Open, with a clear learning plan',
        description: 'Comfortable with guided step-by-step curriculum with milestones',
      },
      {
        id: 'closely_related',
        label: 'I prefer roles close to my current skills',
        description: 'Prioritize paths leveraging my existing toolkit with minimal friction',
      },
      {
        id: 'not_sure',
        label: "I'm not sure yet",
        description: 'Present balanced options showing both direct and expansive paths',
      },
    ],
  },
}

export function getQuestionById(id: QuestionId): FollowUpQuestion | null {
  return QUESTION_BANK[id] || null
}
