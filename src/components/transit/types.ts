export type CardTheme = 'creative-license' | 'metro-taipei' | 'jobtransit-obsidian' | 'emerald-line'

export interface CardPassData {
  // Common & Core Fields
  passId: string
  holderName: string
  firstName: string
  occupation: string
  roleTitle: string
  industry: string
  hours: number
  tier: string
  routeLine: string
  validity: string
  skills: string[]
  // Gauges & Pulse
  matchScore: number
  careerPrefScore?: number
  aiMarketScore?: number
  stationsUnlocked: string
  issueDate: string
  serialNumber: string

  // Creative License Specific Fields (Matching User Reference Image)
  licenseNumber: string
  dob: string
  nationality: string
  roleBadge: string
  expertise: string
  photoUrl?: string
  subBadgeTitle: string
  subBadgeSub: string
  softwareList: string[]
  phone: string
  email: string
  instagram: string
  github?: string
  linkedin?: string
  quote: string
  quoteAuthor: string
}

export const DEFAULT_PASS_DATA: CardPassData = {
  passId: 'JT-DYYAQX-2026',
  licenseNumber: '8618',
  holderName: 'Alexander J. Mercer',
  firstName: 'ALEXANDER',
  occupation: 'SOFTWARE PROFESSIONAL',
  roleTitle: 'Software Professional',
  industry: 'TECHNOLOGY',
  dob: '15/09/2005',
  nationality: 'JOHOR',
  roleBadge: 'SOFTWARE PROFESSIONAL',
  expertise: 'TECHNOLOGY',
  photoUrl: '',
  subBadgeTitle: 'VERIFIED PASS 🌐',
  subBadgeSub: 'JobTransit Network',
  hours: 48,
  tier: 'Transit Pass ID-1',
  routeLine: 'Career Route • Active Path',
  validity: "VALID UNTIL IT DOESN'T",
  skills: [
    'System Architecture',
    'Problem Solving',
    'Technical Execution',
    'Strategic Planning',
    'Team Leadership',
  ],
  softwareList: [
    'VS Code',
    'Git',
    'Docker',
    'Postman',
    'Figma',
  ],
  phone: '',
  email: 'user@jobtransit.ai',
  instagram: '@transit_user',
  github: '',
  linkedin: '',
  quote: 'Creativity takes courage.',
  quoteAuthor: 'Henri Matisse',
  matchScore: 98,
  careerPrefScore: 88,
  aiMarketScore: 94,
  stationsUnlocked: 'Career Core Certified',
  issueDate: new Date().toISOString().slice(0, 10),
  serialNumber: 'JT-PASS-1001',
}
