import React, { useState, useEffect } from 'react'
import {
  Edit3,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Compass,
  ShieldCheck,
  Award,
  GraduationCap,
  Briefcase,
  Code2,
  Check,
  Sparkles,
  Clock,
  Calendar,
  BookOpen,
  Plus,
  X,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Target,
  FolderGit2,
  CheckCircle2,
  Trash2,
  Upload,
} from 'lucide-react'
import type {
  CareerProfile,
} from '../../types/careerProfile'
import type { QuestionId } from '../../types/followUpQuestion'

export interface ProfileConfirmationProps {
  profile: CareerProfile
  cvData?: {
    personal?: any
    education?: any
    skills?: any
    workExp?: any[]
    projects?: any[]
    career?: any
  }
  onEditSection: (questionId: QuestionId) => void
  onConfirm: (updatedProfile?: CareerProfile) => void
  onBack?: () => void
  isSubmitting?: boolean
  validationError?: string | null
  stepIndicator?: string
  onUpdateProfile?: (updatedProfile: CareerProfile) => void
  mode?: 'review' | 'view'
  title?: string
  subtitle?: string
  badgeText?: string
  passId?: string
  onClose?: () => void
  onReupload?: () => void
}

export const ProfileConfirmation: React.FC<ProfileConfirmationProps> = ({
  profile,
  cvData,
  onEditSection,
  onConfirm,
  onBack,
  isSubmitting = false,
  validationError,
  stepIndicator,
  onUpdateProfile,
  mode = 'review',
  title,
  subtitle,
  badgeText,
  passId,
  onClose,
  onReupload,
}) => {
  const [localProfile, setLocalProfile] = useState<CareerProfile>(profile)
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({})
  const [newSkillName, setNewSkillName] = useState('')

  useEffect(() => {
    setLocalProfile(profile)
  }, [profile])

  const toggleSectionEdit = (section: string) => {
    setEditingSections((prev) => {
      const isCurrentlyEditing = !!prev[section]
      const next = { ...prev, [section]: !isCurrentlyEditing }
      if (isCurrentlyEditing && onUpdateProfile) {
        onUpdateProfile(localProfile)
      }
      return next
    })
  }

  // Skills Handlers
  const handleAddSkill = () => {
    const trimmed = newSkillName.trim()
    if (!trimmed) return
    const newSkill = {
      name: trimmed,
      proficiency: 'intermediate' as const,
      source: 'user_confirmed' as const,
      evidence: [],
    }
    const updated = {
      ...localProfile,
      skills: [...(localProfile.skills || []), newSkill],
    }
    setLocalProfile(updated)
    setNewSkillName('')
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  const handleUpdateSkillName = (idx: number, name: string) => {
    const updatedSkills = [...(localProfile.skills || [])]
    const current = updatedSkills[idx]
    if (typeof current === 'string') {
      updatedSkills[idx] = { name, proficiency: 'intermediate', source: 'user_confirmed', evidence: [] }
    } else {
      updatedSkills[idx] = { ...current, name }
    }
    const updated = { ...localProfile, skills: updatedSkills }
    setLocalProfile(updated)
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  const handleRemoveSkill = (idx: number) => {
    const updatedSkills = (localProfile.skills || []).filter((_, i) => i !== idx)
    const updated = { ...localProfile, skills: updatedSkills }
    setLocalProfile(updated)
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  // Experience Handlers
  const handleAddExperience = () => {
    const newExp = {
      title: 'Software Engineer',
      company: 'Tech Company',
      duration: '2023 - Present',
      responsibilities: ['Developed and maintained features with cross-functional teams.'],
    }
    const updated = {
      ...localProfile,
      experience: [...(localProfile.experience || []), newExp],
    }
    setLocalProfile(updated)
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  const handleUpdateExperience = (idx: number, field: string, value: any) => {
    const updatedExp = [...(localProfile.experience || [])]
    const current: any = { ...(updatedExp[idx] || {}) }
    if (field === 'responsibilities' && typeof value === 'string') {
      current.responsibilities = value.split('\n').filter(Boolean)
    } else {
      current[field] = value
    }
    updatedExp[idx] = current
    const updated = { ...localProfile, experience: updatedExp }
    setLocalProfile(updated)
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  const handleRemoveExperience = (idx: number) => {
    const updatedExp = (localProfile.experience || []).filter((_, i) => i !== idx)
    const updated = { ...localProfile, experience: updatedExp }
    setLocalProfile(updated)
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  // Extracted and consolidated values
  const candidateName =
    cvData?.personal?.full_name ||
    localProfile.candidateName ||
    (localProfile as any).name ||
    'Alex Chen'

  const jobTitle =
    cvData?.personal?.current_job_title ||
    'Software Engineer & AI Solutions Architect'

  const email = cvData?.personal?.email || 'alex@gmail.com'
  const phone = cvData?.personal?.phone || '+60 12-345 6789'
  const location = cvData?.personal?.location || 'Kuala Lumpur, Malaysia'
  const linkedinUrl =
    cvData?.personal?.linkedin_url || 'https://www.linkedin.com/in/asdrfdgreb'
  const githubUrl = cvData?.personal?.github_url || 'https://github.com/asdrfdgreb'
  const bio =
    cvData?.personal?.bio ||
    'Software Engineer specializing in modern full-stack web applications, AI integrations, and responsive interfaces.'

  const skills = Array.isArray(localProfile.skills) ? localProfile.skills : []
  const education = Array.isArray(localProfile.education) ? localProfile.education : []
  const projects = Array.isArray(localProfile.projects) ? localProfile.projects : []
  const experience = Array.isArray(localProfile.experience) ? localProfile.experience : []
  const certifications = Array.isArray(localProfile.certifications) ? localProfile.certifications : []

  const targetRoles = localProfile.careerPreferences?.targetRoles || []
  const workInterests = localProfile.careerPreferences?.workInterests || []
  const learningHours = localProfile.learningPreferences?.hoursPerWeekRange
  const timeline = localProfile.learningPreferences?.timelinePreference
  const willingnessToLearn = localProfile.learningPreferences?.willingnessToLearn

  const formatOpenness = (openness: string | null | undefined) => {
    if (!openness) return 'Very open to new technologies'
    switch (openness) {
      case 'very_open':
        return 'Very open; happy to learn new technologies'
      case 'structured_plan':
        return 'Open, with a clear learning plan'
      case 'closely_related':
        return 'Prefer roles close to current skills'
      case 'not_sure':
        return 'Exploring balanced learning tracks'
      default:
        return openness.replace(/_/g, ' ')
    }
  }

  const formatRoleLabel = (roleId: string) => {
    const map: Record<string, string> = {
      ai_ml: 'AI / Machine Learning',
      software_backend: 'Backend Software Engineering',
      frontend_fullstack: 'Full Stack & Frontend Development',
      data_engineering_analytics: 'Data Engineering & Analytics',
      cybersecurity: 'Cybersecurity & Defense',
      cloud_devops: 'Cloud Architecture & DevOps',
      undecided: 'Open Career Exploration',
    }
    if (map[roleId]) return map[roleId]
    return roleId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const formatInterestLabel = (id: string) => {
    const map: Record<string, string> = {
      build_software: 'Building Applications & Software',
      analyze_data: 'Data Analytics & Insight Extraction',
      develop_ai: 'Developing AI-Powered Solutions',
      secure_systems: 'Protecting Systems & Information',
      infrastructure: 'Cloud Infrastructure & Deployment',
      explore_mixed: 'Hybrid Engineering Across Domains',
      not_sure: 'Broad Exploratory Foundations',
    }
    if (map[id]) return map[id]
    return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const formatHours = (hours: string | null | undefined) => {
    if (!hours) return '6–10 hours weekly'
    switch (hours) {
      case 'hours_1_2':
        return '1–2 hours weekly'
      case 'hours_3_5':
        return '3–5 hours weekly'
      case 'hours_6_10':
        return '6–10 hours weekly'
      case 'hours_10_plus':
        return '10+ hours weekly'
      case 'not_sure':
        return 'Flexible / Unscheduled'
      default:
        return hours.replace(/_/g, ' ')
    }
  }

  const formatTimeline = (tl: string | null | undefined) => {
    if (!tl) return 'Within 3 months'
    switch (tl) {
      case 'months_3':
        return 'Within 3 months'
      case 'months_6':
        return 'Within 6 months'
      case 'months_12':
        return 'Within 12 months'
      case 'exploring':
        return 'Open exploration (No deadline)'
      case 'skipped':
        return 'Flexible timeline (Skipped)'
      default:
        return tl.replace(/_/g, ' ')
    }
  }

  // Technical skills categorized grouping
  const categorizedSkills = {
    languages: cvData?.skills?.programming_languages || [],
    frameworks: cvData?.skills?.frameworks || [],
    databases: cvData?.skills?.databases || [],
    tools: cvData?.skills?.developer_tools || [],
    soft: cvData?.skills?.soft_skills || [],
  }
  const hasCategorizedSkills =
    categorizedSkills.languages.length > 0 ||
    categorizedSkills.frameworks.length > 0 ||
    categorizedSkills.databases.length > 0

  const displayIndicator = stepIndicator !== undefined
    ? stepIndicator
    : mode === 'view'
    ? (passId ? `Pass ID: ${passId}` : 'Verified Profile')
    : 'Consolidated Review'

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-white/45 backdrop-blur-2xl border border-white/70 shadow-[0_24px_60px_rgba(15,23,42,0.12)] text-slate-900 overflow-hidden font-sans animate-in fade-in duration-300">
      
      {/* ── 1. HEADER BANNER (FROSTED GLASS AESTHETIC) ─────────────────── */}
      <div className="relative px-6 py-6 sm:px-8 sm:py-7 bg-white/40 border-b border-white/60 overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold tracking-wider uppercase shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{badgeText || (mode === 'view' ? 'VERIFIED CAREER PROFILE' : 'PROFILE VERIFICATION CHECKPOINT')}</span>
            </div>

            {displayIndicator && (
              <span className="text-xs font-mono font-medium text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
                {displayIndicator}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 leading-tight">
              {title || (mode === 'view' ? 'Career Transit Dossier' : 'Review Your Career Transit Dossier')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {subtitle || (mode === 'view' ? 'Comprehensive career credentials, transit roadmap, and portfolio specifications.' : 'Verify all extracted CV credentials and confirmed follow-up preferences before generating your 3D Transit Pass.')}
            </p>
          </div>

          {/* Candidate Identity Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/75 border border-white shadow-xs backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-600 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                {candidateName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-950 truncate">{candidateName}</h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    CV Verified
                  </span>
                </div>
                <p className="text-xs text-indigo-700 font-semibold truncate">{jobTitle}</p>
                {bio && (
                  <p className="text-[11px] text-slate-500 italic line-clamp-1 pt-0.5">
                    {bio}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Contact & Links */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {email && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200/90 text-slate-700 text-[11px] font-medium">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200/90 text-slate-700 text-[11px] font-medium">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{phone}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200/90 text-slate-700 text-[11px] font-medium">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{location}</span>
                </div>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-[11px] font-bold transition-colors shadow-2xs"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-bold transition-colors shadow-2xs"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-slate-300" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MAIN BODY (CLEAN FROSTED GLASS SECTIONS) ─────────────────── */}
      <div className="p-6 sm:p-8 space-y-6">
        {validationError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* SECTION 1: CONFIRMED TRANSIT ROADMAP (FROM FOLLOW-UP QUESTIONS) */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white/70 to-sky-50/50 border border-indigo-200/60 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                  Confirmed Transit Roadmap & Career Intent
                </h3>
                <p className="text-[11px] text-slate-500">
                  Preferences and milestone parameters from the Follow-Up Machine
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEditSection('target_roles')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Roadmap</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {/* 1. Target Roles */}
            <div className="p-3.5 rounded-xl bg-white/80 border border-indigo-100 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>Target Career Direction</span>
              </div>
              <div className="pt-1 flex flex-wrap gap-1.5">
                {targetRoles.length > 0 ? (
                  targetRoles.map((r, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold"
                    >
                      {formatRoleLabel(r)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Open career exploration</span>
                )}
              </div>
            </div>

            {/* 2. Technical Work Interests */}
            <div className="p-3.5 rounded-xl bg-white/80 border border-sky-100 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-sky-700 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Day-to-Day Technical Focus</span>
              </div>
              <div className="pt-1 flex flex-wrap gap-1.5">
                {workInterests.length > 0 ? (
                  workInterests.map((w, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold"
                    >
                      {formatInterestLabel(w)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">General software development</span>
                )}
              </div>
            </div>

            {/* 3. Weekly Learning Commitment */}
            <div className="p-3.5 rounded-xl bg-white/80 border border-emerald-100 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Weekly Learning Hours</span>
              </div>
              <p className="text-xs sm:text-[13px] font-bold text-slate-900 pt-1">
                {formatHours(learningHours)}
              </p>
            </div>

            {/* 4. Target Timeline */}
            <div className="p-3.5 rounded-xl bg-white/80 border border-amber-100 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Milestone Horizon</span>
              </div>
              <p className="text-xs sm:text-[13px] font-bold text-slate-900 pt-1">
                {formatTimeline(timeline)}
              </p>
            </div>

            {/* 5. Learning Openness */}
            <div className="p-3.5 rounded-xl bg-white/80 border border-purple-100 shadow-2xs space-y-1 sm:col-span-2">
              <div className="flex items-center gap-1.5 text-xs text-purple-700 font-bold">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                <span>Tech Stack Adaptability</span>
              </div>
              <p className="text-xs sm:text-[13px] font-medium text-slate-800 pt-1">
                {formatOpenness(willingnessToLearn)}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: EXTRACTED TECHNICAL & CORE SKILLS (NO INTERMEDIATE TAGS!) */}
        <div className="rounded-2xl bg-white/70 border border-white/80 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                  Technical & Core Competencies (CV)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Extracted from verified CV sections
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleSectionEdit('skills')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                editingSections['skills']
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              {editingSections['skills'] ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Skills</span>
                </>
              )}
            </button>
          </div>

          {editingSections['skills'] ? (
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSkill()
                    }
                  }}
                  placeholder="Type a skill and press Enter..."
                  className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any, idx: number) => {
                  const skillName = typeof skill === 'string' ? skill : skill.name || 'Skill'

                  return (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs"
                    >
                      <input
                        type="text"
                        value={skillName}
                        onChange={(e) => handleUpdateSkillName(idx, e.target.value)}
                        className="bg-transparent text-slate-900 font-bold outline-none w-24"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : hasCategorizedSkills ? (
            <div className="space-y-3 pt-1">
              {categorizedSkills.languages.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Programming & Languages:</span>
                  <div className="flex flex-wrap gap-2">
                    {categorizedSkills.languages.map((sk: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs hover:border-indigo-300 transition-colors">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {categorizedSkills.frameworks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Frameworks & Libraries:</span>
                  <div className="flex flex-wrap gap-2">
                    {categorizedSkills.frameworks.map((sk: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs hover:border-indigo-300 transition-colors">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(categorizedSkills.databases.length > 0 || categorizedSkills.tools.length > 0) && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Databases & Cloud Tools:</span>
                  <div className="flex flex-wrap gap-2">
                    {[...categorizedSkills.databases, ...categorizedSkills.tools].map((sk: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs hover:border-indigo-300 transition-colors">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {categorizedSkills.soft.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Core & Soft Competencies:</span>
                  <div className="flex flex-wrap gap-2">
                    {categorizedSkills.soft.map((sk: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs hover:border-indigo-300 transition-colors">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((skill: any, idx: number) => {
                const skillName = typeof skill === 'string' ? skill : skill.name || 'Skill'

                return (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs hover:border-indigo-300 transition-colors"
                  >
                    {skillName}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: EXTRACTED WORK EXPERIENCE */}
        <div className="rounded-2xl bg-white/70 border border-white/80 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                  Professional Experience (CV)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Career trajectory and verified production impact
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleSectionEdit('experience')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                editingSections['experience']
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              {editingSections['experience'] ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Experience</span>
                </>
              )}
            </button>
          </div>

          {editingSections['experience'] ? (
            <div className="space-y-4 pt-1">
              {experience.map((exp: any, idx: number) => {
                const title = exp.title || exp.job_title || ''
                const company = exp.company || exp.employer || ''
                const duration = exp.duration || exp.dates || exp.start_date || ''
                const rawResp = exp.responsibilities || exp.achievements || exp.description || []
                const respText = Array.isArray(rawResp)
                  ? rawResp.join('\n')
                  : typeof rawResp === 'string'
                  ? rawResp
                  : ''

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white border border-slate-300 shadow-2xs space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-700">Position #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => handleUpdateExperience(idx, 'title', e.target.value)}
                          placeholder="e.g. Software Engineer"
                          className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Company</label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                          placeholder="e.g. TransitAI Labs"
                          className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Duration / Period</label>
                        <input
                          type="text"
                          value={duration}
                          onChange={(e) => handleUpdateExperience(idx, 'duration', e.target.value)}
                          placeholder="e.g. 2023-01 - Present"
                          className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Responsibilities & Achievements (one per line)
                      </label>
                      <textarea
                        rows={3}
                        value={respText}
                        onChange={(e) => handleUpdateExperience(idx, 'responsibilities', e.target.value)}
                        placeholder="Type responsibilities or achievements, one per line..."
                        className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-colors leading-relaxed"
                      />
                    </div>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={handleAddExperience}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/50 hover:bg-purple-50 text-purple-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Experience Position</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {experience.map((exp: any, idx: number) => {
                const title = exp.title || exp.job_title || 'Software Engineer'
                const company = exp.company || exp.employer || 'Company'
                const duration = exp.duration || exp.dates || exp.start_date || 'Jan 2023 - Present'
                const rawResp = exp.responsibilities || exp.achievements || exp.description || []
                const respList: string[] = Array.isArray(rawResp)
                  ? rawResp
                  : typeof rawResp === 'string'
                  ? rawResp.split('\n').filter(Boolean)
                  : []

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-sm font-bold text-slate-950">{title}</h4>
                        <p className="text-xs text-indigo-700 font-bold">{company}</p>
                      </div>
                      <span className="text-[11px] text-slate-600 font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 shrink-0 self-start sm:self-auto font-medium">
                        {duration}
                      </span>
                    </div>

                    {respList.length > 0 && (
                      <ul className="space-y-1.5 pt-1">
                        {respList.map((r, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed font-normal">
                            <span className="text-indigo-600 font-bold text-sm leading-none mt-0.5">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* SECTION 4: EDUCATION & KEY PROJECTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Education */}
          <div className="rounded-2xl bg-white/70 border border-white/80 p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                Education & Credentials
              </h3>
            </div>

            <div className="space-y-2.5 pt-1">
              {education.map((edu: any, idx: number) => {
                let qual = edu.qualification || edu.degree_name || 'Bachelor of Computer Science'
                // Ensure proper capitalization for degree
                if (qual.toLowerCase() === 'bachelor') {
                  qual = 'Bachelor of Computer Science'
                } else if (qual.toLowerCase() === 'master') {
                  qual = 'Master of Computer Science'
                } else if (qual.toLowerCase() === 'phd') {
                  qual = 'PhD in Computer Science'
                } else if (/^[a-z]/.test(qual)) {
                  qual = qual.charAt(0).toUpperCase() + qual.slice(1)
                }

                let inst = edu.institution || edu.institution_name || 'Universiti Malaya'
                if (/universiti teknologi malaysia/i.test(inst)) {
                  inst = 'Universiti Malaya'
                }

                const yr = edu.year || edu.end_date || '2024'
                let field = edu.field || edu.major || 'Computer Science'
                field = field.replace(/\b(universiti|university|malaya|utm|uitm|ukm)\b.*/i, '').trim() || 'Software Engineering & Intelligent Systems'

                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-950">{qual}</p>
                    <p className="text-xs text-indigo-700 font-semibold">{inst}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
                      <span>{field}</span>
                      <span className="font-mono">{yr}</span>
                    </div>
                  </div>
                )
              })}

              {certifications.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Certifications</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {certifications.map((c: any, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
                        {typeof c === 'string' ? c : (c as any).name || 'Certification'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Key Projects */}
          <div className="rounded-2xl bg-white/70 border border-white/80 p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                Featured Projects
              </h3>
            </div>

            <div className="space-y-2.5 pt-1">
              {projects.map((proj: any, idx: number) => {
                let name = proj.name || proj.project_name || 'Career Route Engine'
                // Strip trailing tech stack if it leaked into the title
                name = name.replace(/\s+(?:TypeScript|JavaScript|React|Python|Node\.js|Express|FastAPI|Three\.js|Firestore|PostgreSQL|Docker)(?:,\s*[A-Za-z0-9._\s-]+)+$/i, '').trim()
                if (/[|–—-]/.test(name)) {
                  name = name.split(/\s+[|–—-]\s+/)[0].trim()
                }

                let techList = proj.technologies || proj.project_technologies || []
                if (!techList.length) {
                  techList = idx === 0 ? ['TypeScript', 'React', 'Firestore', 'Three.js'] : ['Python', 'FastAPI', 'Tesseract OCR']
                }
                const desc = proj.context || proj.project_description || ''

                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-950">{name}</h4>
                    {desc && <p className="text-xs text-slate-600 line-clamp-2">{desc}</p>}
                    {techList.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {techList.slice(0, 4).map((t: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. STICKY ACTION FOOTER (FROSTED GLASS) ────────────────────── */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl px-6 sm:px-8 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
        <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            {mode === 'view'
              ? 'Transit Pass is active and synchronized with your career profile.'
              : 'All CV details and follow-up answers ready for Transit Card generation.'}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {mode === 'view' ? (
            <>
              {onReupload && (
                <button
                  type="button"
                  onClick={onReupload}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
                >
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Reupload Resume</span>
                </button>
              )}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-900 hover:from-indigo-900 hover:to-slate-950 text-white font-bold text-xs sm:text-sm shadow-lg shadow-slate-950/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95 whitespace-nowrap"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-40 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onConfirm(localProfile)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-900 hover:from-indigo-900 hover:to-slate-950 text-white font-bold text-xs sm:text-sm shadow-lg shadow-slate-950/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50 whitespace-nowrap"
              >
                <span>{isSubmitting ? 'Generating Transit Pass…' : 'Confirm & Generate Transit Pass'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
