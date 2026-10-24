import React, { useState, useEffect } from 'react'
import {
  Edit3,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  FileText,
  Compass,
  ShieldCheck,
  Award,
  GraduationCap,
  Briefcase,
  Code2,
  BadgeCheck,
  Check,
  Layers,
  Sparkles,
  Clock,
  Calendar,
  BookOpen,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import type {
  CareerProfile,
  SkillProficiency,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
} from '../../types/careerProfile'
import type { QuestionId } from '../../types/followUpQuestion'

interface ProfileConfirmationProps {
  profile: CareerProfile
  onEditSection: (questionId: QuestionId) => void
  onConfirm: (updatedProfile?: CareerProfile) => void
  onBack?: () => void
  isSubmitting?: boolean
  validationError?: string | null
  stepIndicator?: string
  onUpdateProfile?: (updatedProfile: CareerProfile) => void
}

type ActiveProfileTab = 'cv' | 'preferences'

export const ProfileConfirmation: React.FC<ProfileConfirmationProps> = ({
  profile,
  onEditSection,
  onConfirm,
  onBack,
  isSubmitting = false,
  validationError,
  stepIndicator = 'Final Step',
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveProfileTab>('cv')
  const [localProfile, setLocalProfile] = useState<CareerProfile>(profile)
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({})
  const [newSkillName, setNewSkillName] = useState('')
  const [newCertName, setNewCertName] = useState('')

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
      proficiency: 'intermediate' as SkillProficiency,
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

  const handleCycleSkillProficiency = (idx: number) => {
    const updatedSkills = [...(localProfile.skills || [])]
    const current = updatedSkills[idx]
    const prof = typeof current === 'object' && current.proficiency ? current.proficiency : 'intermediate'
    const nextProf: SkillProficiency =
      prof === 'beginner' ? 'intermediate' : prof === 'intermediate' ? 'advanced' : 'beginner'

    if (typeof current === 'string') {
      updatedSkills[idx] = { name: current, proficiency: nextProf, source: 'user_confirmed', evidence: [] }
    } else {
      updatedSkills[idx] = { ...current, proficiency: nextProf }
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

  // Education Handlers
  const handleAddEducation = () => {
    const newEdu: EducationEntry = {
      qualification: '',
      institution: '',
      year: '',
      field: '',
    }
    const updated = {
      ...localProfile,
      education: [...(localProfile.education || []), newEdu],
    }
    setLocalProfile(updated)
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  const handleUpdateEducation = (idx: number, field: keyof EducationEntry, val: string) => {
    const updatedEdu = [...(localProfile.education || [])]
    updatedEdu[idx] = { ...updatedEdu[idx], [field]: val }
    const updated = { ...localProfile, education: updatedEdu }
    setLocalProfile(updated)
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  const handleRemoveEducation = (idx: number) => {
    const updatedEdu = (localProfile.education || []).filter((_, i) => i !== idx)
    const updated = { ...localProfile, education: updatedEdu }
    setLocalProfile(updated)
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  // Experience Handlers
  const handleAddExperience = () => {
    const newExp: ExperienceEntry = {
      title: '',
      company: '',
      duration: '',
      responsibilities: [],
    }
    const updated = {
      ...localProfile,
      experience: [...(localProfile.experience || []), newExp],
    }
    setLocalProfile(updated)
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  const handleUpdateExperience = (idx: number, field: keyof ExperienceEntry, val: any) => {
    const updatedExp = [...(localProfile.experience || [])]
    updatedExp[idx] = { ...updatedExp[idx], [field]: val }
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

  // Projects Handlers
  const handleAddProject = () => {
    const newProj: ProjectEntry = {
      name: '',
      context: 'Academic term project',
      technologies: [],
      responsibilities: [],
    }
    const updated = {
      ...localProfile,
      projects: [...(localProfile.projects || []), newProj],
    }
    setLocalProfile(updated)
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  const handleUpdateProject = (idx: number, field: keyof ProjectEntry, val: any) => {
    const updatedProjects = [...(localProfile.projects || [])]
    updatedProjects[idx] = { ...updatedProjects[idx], [field]: val }
    const updated = { ...localProfile, projects: updatedProjects }
    setLocalProfile(updated)
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  const handleRemoveProject = (idx: number) => {
    const updatedProjects = (localProfile.projects || []).filter((_, i) => i !== idx)
    const updated = { ...localProfile, projects: updatedProjects }
    setLocalProfile(updated)
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  // Certifications Handlers
  const handleAddCertification = () => {
    const trimmed = newCertName.trim()
    if (!trimmed) return
    const updated = {
      ...localProfile,
      certifications: [...(localProfile.certifications || []), trimmed],
    }
    setLocalProfile(updated)
    setNewCertName('')
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  const handleUpdateCertification = (idx: number, val: string) => {
    const updatedCerts = [...(localProfile.certifications || [])]
    updatedCerts[idx] = val
    const updated = { ...localProfile, certifications: updatedCerts }
    setLocalProfile(updated)
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  const handleRemoveCertification = (idx: number) => {
    const updatedCerts = (localProfile.certifications || []).filter((_, i) => i !== idx)
    const updated = { ...localProfile, certifications: updatedCerts }
    setLocalProfile(updated)
    if (onUpdateProfile) onUpdateProfile(updated)
  }

  const candidateName =
    localProfile.candidateName || (localProfile as any).name || (localProfile as any).fullName || 'Alex Chen'
  const careerStage = localProfile.careerStage
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

  const formatStage = (stage: string | null | undefined) => {
    if (!stage) return 'Computer Science, NUS'
    const map: Record<string, string> = {
      student_or_recent_grad: 'Computer Science, NUS',
      employed_tech: 'Working in Tech',
      employed_non_tech: 'Career Switcher',
      first_job: 'First Tech Role Search',
      career_change: 'Career Switcher',
      prefer_not_to_say: 'Tech Candidate',
    }
    if (map[stage]) return map[stage]
    return stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const formatOpenness = (openness: string | null | undefined) => {
    if (!openness) return 'Flexible'
    switch (openness) {
      case 'willing_foundations':
        return 'Willing to learn foundational theory & prerequisites'
      case 'prefer_hands_on':
        return 'Prefer applied hands-on building without heavy theory'
      case 'advanced_only':
        return 'Focused solely on advanced and specialist concepts'
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
      undecided: 'Your next role',
    }
    if (map[roleId]) return map[roleId]
    return roleId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const formatInterestLabel = (id: string) => {
    const map: Record<string, string> = {
      build_software: 'Building Applications & Software',
      analyze_data: 'Data Analytics & Insight Extraction',
      develop_ai: 'AI-Powered Solutions & Model Tooling',
      secure_systems: 'System Hardening & Security',
      infrastructure: 'Cloud Systems & Automation',
      explore_mixed: 'Hybrid Engineering Across Domains',
      not_sure: 'Broad Exploratory Foundations',
    }
    if (map[id]) return map[id]
    return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const formatHours = (hours: string | null | undefined) => {
    if (!hours) return 'Not specified'
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
    if (!tl) return 'Not specified'
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

  // 3-segment bar filled in accent colour with text label
  const renderSkillSegments = (proficiency: string | undefined) => {
    const level = proficiency === 'advanced' ? 3 : proficiency === 'beginner' ? 1 : 2
    const label =
      proficiency === 'advanced' ? 'Advanced' : proficiency === 'beginner' ? 'Beginner' : 'Intermediate'

    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="flex items-center gap-0.5">
          <span className={`w-2 h-1 rounded-full ${level >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          <span className={`w-2 h-1 rounded-full ${level >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          <span className={`w-2 h-1 rounded-full ${level >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        </div>
        <span className="text-[11px] text-slate-500 font-medium">{label}</span>
      </div>
    )
  }

  // Header Subtitle: Candidate education and target role headline
  const primaryEdu = education[0]
  const headlineEducation = primaryEdu
    ? [primaryEdu.field || primaryEdu.qualification, primaryEdu.institution].filter(Boolean).join(', ')
    : formatStage(careerStage)

  const headlineTarget = targetRoles.length > 0 ? formatRoleLabel(targetRoles[0]) : 'your next role'

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl bg-white border border-slate-200/80 shadow-[0_12px_40px_rgba(15,23,42,0.08)] animate-in fade-in duration-200 overflow-hidden relative font-sans">
      {/* 1. DARK HERO HEADER */}
      <div className="relative px-7 py-6 sm:px-8 sm:py-6.5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10.5px] font-bold tracking-wider uppercase backdrop-blur-md">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Profile Verification Checkpoint</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
              <span>{stepIndicator}</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
            Review Your Career Transit Card
          </h1>

          <p className="text-xs sm:text-[13px] text-slate-300 flex flex-wrap items-center gap-1.5 font-normal">
            <span className="font-semibold text-white">{candidateName}</span>
            <span className="text-slate-500">·</span>
            <span>{headlineEducation}</span>
            <span className="text-indigo-400 font-bold">→</span>
            <span className="text-indigo-200 font-medium">{headlineTarget}</span>
          </p>

          <div className="pt-0.5">
            <div className="w-full h-1 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full w-full rounded-full bg-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-6 sm:p-7 space-y-3.5">
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* 3. TAB NAVIGATION */}
        <div className="flex items-center gap-6 border-b border-slate-200/80 pt-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('cv')}
            className={`relative pb-2.5 text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 bg-transparent border-0 outline-none select-none ${
              activeTab === 'cv' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 ${activeTab === 'cv' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>CV Information</span>
            {activeTab === 'cv' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full pointer-events-none" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`relative pb-2.5 text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 bg-transparent border-0 outline-none select-none ${
              activeTab === 'preferences' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${activeTab === 'preferences' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Confirmed Preferences</span>
            {activeTab === 'preferences' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full pointer-events-none" />
            )}
          </button>
        </div>

        {/* 4. ROUTE MAP */}
        {activeTab === 'cv' && (
          <div className="space-y-3 pt-1">
            <div className="relative pl-6 sm:pl-6.5 space-y-3">
              {/* Left Transit Track Line */}
              <div className="absolute left-[8px] top-4.5 bottom-4.5 w-[2px] bg-indigo-100 pointer-events-none" />

              {/* STATION 1: SKILLS */}
              <div className="relative">
                <div className="absolute -left-[19px] top-[18px] w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-600 shadow-2xs z-10" />

                <div className="bg-slate-50/90 rounded-xl py-2.5 px-3.5 sm:px-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Award className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-[13.5px] sm:text-[14px] font-bold text-slate-900 tracking-tight">
                        Skills
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSectionEdit('skills')}
                      className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors rounded ${
                        editingSections['skills']
                          ? 'bg-indigo-600 text-white px-2 py-0.5 hover:bg-indigo-700 shadow-2xs'
                          : 'text-indigo-600 hover:text-indigo-800 hover:underline px-1.5 py-0.5'
                      }`}
                    >
                      {editingSections['skills'] ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Skills Display & Inline Edit */}
                  {editingSections['skills'] ? (
                    <div className="space-y-2.5 pt-1">
                      {/* Add skill input */}
                      <div className="flex items-center gap-1.5">
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
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>

                      {/* Current skill chips editable */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {skills.map((skill: any, idx: number) => {
                          const skillName = typeof skill === 'string' ? skill : skill.name || skill.skill || 'Skill'
                          const proficiency =
                            typeof skill === 'object' && skill.proficiency ? skill.proficiency : 'intermediate'

                          return (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-1.5 h-8 pl-2.5 pr-1.5 rounded-lg bg-white border border-slate-300 shadow-2xs group"
                            >
                              <input
                                type="text"
                                value={skillName}
                                onChange={(e) => handleUpdateSkillName(idx, e.target.value)}
                                className="text-xs sm:text-[13px] font-medium text-slate-800 bg-transparent border-0 outline-none w-20 sm:w-24 focus:w-28 transition-all"
                              />
                              <span className="w-px h-3.5 bg-slate-200" />
                              <button
                                type="button"
                                onClick={() => handleCycleSkillProficiency(idx)}
                                title="Click to cycle proficiency"
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                              >
                                {renderSkillSegments(proficiency)}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(idx)}
                                title="Remove skill"
                                className="p-0.5 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {skills.map((skill: any, idx: number) => {
                        const skillName = typeof skill === 'string' ? skill : skill.name || skill.skill || 'Skill'
                        const proficiency =
                          typeof skill === 'object' && skill.proficiency ? skill.proficiency : 'intermediate'
                        const evidenceText =
                          typeof skill === 'object'
                            ? skill.evidence?.[0]?.description || skill.description || skill.proof
                            : undefined

                        return (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-2.5 h-8 px-3 rounded-lg bg-white border border-slate-200/80 shadow-2xs group relative"
                            title={evidenceText}
                          >
                            <span className="text-xs sm:text-[13px] font-medium text-slate-800">
                              {skillName}
                            </span>
                            <span className="w-px h-3.5 bg-slate-200" />
                            {renderSkillSegments(proficiency)}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No skills listed</p>
                  )}
                </div>
              </div>

              {/* STATION 2: EDUCATION */}
              <div className="relative">
                <div className="absolute -left-[19px] top-[18px] w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-600 shadow-2xs z-10" />

                <div className="bg-slate-50/90 rounded-xl py-2.5 px-3.5 sm:px-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-[13.5px] sm:text-[14px] font-bold text-slate-900 tracking-tight">
                        Education
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSectionEdit('education')}
                      className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors rounded ${
                        editingSections['education']
                          ? 'bg-indigo-600 text-white px-2 py-0.5 hover:bg-indigo-700 shadow-2xs'
                          : 'text-indigo-600 hover:text-indigo-800 hover:underline px-1.5 py-0.5'
                      }`}
                    >
                      {editingSections['education'] ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </>
                      )}
                    </button>
                  </div>

                  {editingSections['education'] ? (
                    <div className="space-y-3 pt-1">
                      {education.map((edu: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(idx)}
                            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                            title="Remove education"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div>
                            <label className="text-[10px] text-slate-400 font-medium block">Degree / Qualification</label>
                            <input
                              type="text"
                              value={edu.qualification || ''}
                              onChange={(e) => handleUpdateEducation(idx, 'qualification', e.target.value)}
                              placeholder="e.g. Bachelor of Computing in Computer Science"
                              className="w-full text-xs font-semibold text-slate-900 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 font-medium block">Institution</label>
                              <input
                                type="text"
                                value={edu.institution || ''}
                                onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                                placeholder="e.g. National University of Singapore"
                                className="w-full text-xs text-slate-700 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 font-medium block">Year / Period</label>
                              <input
                                type="text"
                                value={edu.year || ''}
                                onChange={(e) => handleUpdateEducation(idx, 'year', e.target.value)}
                                placeholder="e.g. Expected 2026 or 2021"
                                className="w-full text-xs text-slate-700 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 font-medium block">Major / Specialization</label>
                            <input
                              type="text"
                              value={edu.field || ''}
                              onChange={(e) => handleUpdateEducation(idx, 'field', e.target.value)}
                              placeholder="e.g. Computer Science"
                              className="w-full text-xs text-slate-700 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddEducation}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer pt-0.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Education</span>
                      </button>
                    </div>
                  ) : education.length > 0 ? (
                    <div className="space-y-1 pt-0.5">
                      {education.map((edu: any, idx: number) => {
                        const qualification = edu.qualification || edu.degree || edu.title || 'Degree'
                        const institution = edu.institution || edu.school || edu.university || ''
                        const year = edu.year || edu.graduationYear || edu.dates || ''
                        const field = edu.field || edu.major || edu.fieldOfStudy || ''
                        const subline = [institution, year].filter(Boolean).join(' · ')

                        return (
                          <div key={idx} className="space-y-0.5">
                            <p className="text-[13.5px] sm:text-[14px] font-semibold text-slate-900 leading-snug">
                              {qualification}
                            </p>
                            {subline && <p className="text-xs text-slate-600 font-normal">{subline}</p>}
                            {field && <p className="text-[11.5px] text-slate-500 font-normal">Major: {field}</p>}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No formal education entries extracted</p>
                  )}
                </div>
              </div>

              {/* STATION 3: EXPERIENCE */}
              <div className="relative">
                <div className="absolute -left-[19px] top-[18px] w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-600 shadow-2xs z-10" />

                <div className="bg-slate-50/90 rounded-xl py-2.5 px-3.5 sm:px-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-[13.5px] sm:text-[14px] font-bold text-slate-900 tracking-tight">
                        Experience
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSectionEdit('experience')}
                      className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors rounded ${
                        editingSections['experience']
                          ? 'bg-indigo-600 text-white px-2 py-0.5 hover:bg-indigo-700 shadow-2xs'
                          : 'text-indigo-600 hover:text-indigo-800 hover:underline px-1.5 py-0.5'
                      }`}
                    >
                      {editingSections['experience'] ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </>
                      )}
                    </button>
                  </div>

                  {editingSections['experience'] ? (
                    <div className="space-y-3 pt-1">
                      {experience.map((exp: any, idx: number) => {
                        const rawResp = exp.responsibilities || exp.highlights || exp.description || []
                        const respText = Array.isArray(rawResp)
                          ? rawResp.join('\n')
                          : typeof rawResp === 'string'
                          ? rawResp
                          : ''

                        return (
                          <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 relative">
                            <button
                              type="button"
                              onClick={() => handleRemoveExperience(idx)}
                              className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                              title="Remove experience"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-400 font-medium block">Job Title / Role</label>
                                <input
                                  type="text"
                                  value={exp.title || ''}
                                  onChange={(e) => handleUpdateExperience(idx, 'title', e.target.value)}
                                  placeholder="e.g. Backend Software Engineer"
                                  className="w-full text-xs font-semibold text-slate-900 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 font-medium block">Company</label>
                                <input
                                  type="text"
                                  value={exp.company || ''}
                                  onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                                  placeholder="e.g. NovaPay Global Technologies"
                                  className="w-full text-xs text-slate-700 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400 font-medium block">Duration / Dates</label>
                              <input
                                type="text"
                                value={exp.duration || ''}
                                onChange={(e) => handleUpdateExperience(idx, 'duration', e.target.value)}
                                placeholder="e.g. 2022 - Present"
                                className="w-full text-xs text-slate-700 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400 font-medium block">
                                Responsibilities (one per line)
                              </label>
                              <textarea
                                rows={3}
                                value={respText}
                                onChange={(e) =>
                                  handleUpdateExperience(
                                    idx,
                                    'responsibilities',
                                    e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                                  )
                                }
                                placeholder="Engineered microservices in Python&#10;Mentored junior engineers"
                                className="w-full text-xs text-slate-700 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500 leading-normal"
                              />
                            </div>
                          </div>
                        )
                      })}

                      <button
                        type="button"
                        onClick={handleAddExperience}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer pt-0.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Work Experience</span>
                      </button>
                    </div>
                  ) : experience.length > 0 ? (
                    <div className="space-y-1.5 pt-0.5">
                      {experience.map((exp: any, idx: number) => {
                        const title = exp.title || exp.role || exp.position || 'Role'
                        const company = exp.company || exp.organization || exp.employer || ''
                        const duration = exp.duration || exp.dates || exp.period || ''
                        const rawResp = exp.responsibilities || exp.highlights || exp.description || []
                        const respList: string[] = Array.isArray(rawResp)
                          ? rawResp
                          : typeof rawResp === 'string'
                          ? rawResp
                              .split('\n')
                              .map((s: string) => s.replace(/^[•\-*]\s*/, '').trim())
                              .filter(Boolean)
                          : []

                        const roleCompany = [title, company].filter(Boolean).join(' at ')

                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="text-[13.5px] sm:text-[14px] font-semibold text-slate-900">{roleCompany}</p>
                              {duration && <span className="text-[11.5px] text-slate-500 shrink-0 font-medium">{duration}</span>}
                            </div>
                            {respList.length > 0 && (
                              <ul className="space-y-0.5 pt-0.5">
                                {respList.map((resp: string, rIdx: number) => (
                                  <li key={rIdx} className="flex items-start gap-1.5 text-xs sm:text-[12.5px] text-slate-600 leading-normal">
                                    <Check className="w-3 h-3 text-indigo-600 mt-0.5 shrink-0" />
                                    <span>{resp}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-dashed border-slate-300 bg-white/70 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <Briefcase className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-xs text-slate-600 leading-normal">
                          <span className="font-semibold text-slate-900">No roles yet.</span> We&apos;ll weight your projects more.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          toggleSectionEdit('experience')
                          handleAddExperience()
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* STATION 4: PROJECTS */}
              <div className="relative">
                <div className="absolute -left-[19px] top-[18px] w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-600 shadow-2xs z-10" />

                <div className="bg-slate-50/90 rounded-xl py-2.5 px-3.5 sm:px-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Code2 className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-[13.5px] sm:text-[14px] font-bold text-slate-950 tracking-tight">
                        Projects
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSectionEdit('projects')}
                      className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors rounded ${
                        editingSections['projects']
                          ? 'bg-indigo-600 text-white px-2 py-0.5 hover:bg-indigo-700 shadow-2xs'
                          : 'text-indigo-600 hover:text-indigo-800 hover:underline px-1.5 py-0.5'
                      }`}
                    >
                      {editingSections['projects'] ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </>
                      )}
                    </button>
                  </div>

                  {editingSections['projects'] ? (
                    <div className="space-y-3 pt-1">
                      {projects.map((proj: any, idx: number) => {
                        const rawTech = proj.technologies || proj.techStack || proj.tools || []
                        const techStr = Array.isArray(rawTech)
                          ? rawTech.join(', ')
                          : typeof rawTech === 'string'
                          ? rawTech
                          : ''
                        const rawResp = proj.responsibilities || proj.highlights || proj.description || []
                        const respStr = Array.isArray(rawResp)
                          ? rawResp.join('\n')
                          : typeof rawResp === 'string'
                          ? rawResp
                          : ''

                        return (
                          <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 relative">
                            <button
                              type="button"
                              onClick={() => handleRemoveProject(idx)}
                              className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                              title="Remove project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-400 font-medium block">Project Name</label>
                                <input
                                  type="text"
                                  value={proj.name || ''}
                                  onChange={(e) => handleUpdateProject(idx, 'name', e.target.value)}
                                  placeholder="e.g. Payment Ingestion Engine"
                                  className="w-full text-xs font-semibold text-slate-900 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 font-medium block">Context / Type</label>
                                <input
                                  type="text"
                                  value={proj.context || ''}
                                  onChange={(e) => handleUpdateProject(idx, 'context', e.target.value)}
                                  placeholder="e.g. Production fintech platform, Academic"
                                  className="w-full text-xs text-slate-700 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400 font-medium block">
                                Technologies (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={techStr}
                                onChange={(e) =>
                                  handleUpdateProject(
                                    idx,
                                    'technologies',
                                    e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                                  )
                                }
                                placeholder="e.g. Python, Kafka, FastAPI, Redis"
                                className="w-full text-xs text-slate-700 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400 font-medium block">
                                Bullet Points / Highlights (one per line)
                              </label>
                              <textarea
                                rows={3}
                                value={respStr}
                                onChange={(e) =>
                                  handleUpdateProject(
                                    idx,
                                    'responsibilities',
                                    e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                                  )
                                }
                                placeholder="Processed over 12,000 webhook events per minute&#10;Refactored synchronous calls to async Redis pipelines"
                                className="w-full text-xs text-slate-700 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500 leading-normal"
                              />
                            </div>
                          </div>
                        )
                      })}

                      <button
                        type="button"
                        onClick={handleAddProject}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer pt-0.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Project</span>
                      </button>
                    </div>
                  ) : projects.length > 0 ? (
                    <div className="space-y-2 pt-0.5">
                      {projects.map((proj: any, idx: number) => {
                        const name = proj.name || proj.title || 'Project'
                        const context = proj.context || proj.type || 'Academic term project'
                        const rawTech = proj.technologies || proj.techStack || proj.tools || []
                        const techList: string[] = Array.isArray(rawTech)
                          ? rawTech
                          : typeof rawTech === 'string'
                          ? rawTech.split(',').map((t) => t.trim()).filter(Boolean)
                          : []
                        const rawResp = proj.responsibilities || proj.highlights || proj.description || []
                        const respList: string[] = Array.isArray(rawResp)
                          ? rawResp
                          : typeof rawResp === 'string'
                          ? rawResp
                              .split('\n')
                              .map((s: string) => s.replace(/^[•\-*]\s*/, '').trim())
                              .filter(Boolean)
                          : []

                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-[13.5px] sm:text-[14px] font-semibold text-slate-900">
                                {name}
                              </h4>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 shrink-0">
                                {context}
                              </span>
                            </div>

                            {techList.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {techList.map((tech: string, tIdx: number) => (
                                  <span
                                    key={tIdx}
                                    className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}

                            {respList.length > 0 && (
                              <ul className="space-y-0.5 pt-0.5">
                                {respList.map((resp: string, rIdx: number) => (
                                  <li key={rIdx} className="flex items-start gap-1.5 text-xs sm:text-[12.5px] text-slate-600 leading-normal">
                                    <Check className="w-3 h-3 text-indigo-600 mt-0.5 shrink-0" />
                                    <span>{resp}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-dashed border-slate-300 bg-white/70 flex items-center justify-between gap-2.5">
                      <p className="text-xs text-slate-400 italic">No projects listed</p>
                      <button
                        type="button"
                        onClick={() => {
                          toggleSectionEdit('projects')
                          handleAddProject()
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Project</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* STATION 5: CERTIFICATIONS */}
              <div className="relative">
                <div className="absolute -left-[19px] top-[18px] w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-600 shadow-2xs z-10" />

                <div className="bg-slate-50/90 rounded-xl py-2.5 px-3.5 sm:px-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <BadgeCheck className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-[13.5px] sm:text-[14px] font-bold text-slate-950 tracking-tight">
                        Certifications
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSectionEdit('certifications')}
                      className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors rounded ${
                        editingSections['certifications']
                          ? 'bg-indigo-600 text-white px-2 py-0.5 hover:bg-indigo-700 shadow-2xs'
                          : 'text-indigo-600 hover:text-indigo-800 hover:underline px-1.5 py-0.5'
                      }`}
                    >
                      {editingSections['certifications'] ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </>
                      )}
                    </button>
                  </div>

                  {editingSections['certifications'] ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newCertName}
                          onChange={(e) => setNewCertName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddCertification()
                            }
                          }}
                          placeholder="Type certification name and press Enter..."
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={handleAddCertification}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {certifications.map((cert: any, cIdx: number) => {
                          const certName = typeof cert === 'string' ? cert : cert.name || cert.title || String(cert)
                          return (
                            <div key={cIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={certName}
                                onChange={(e) => handleUpdateCertification(cIdx, e.target.value)}
                                className="flex-1 text-xs font-medium text-slate-900 border border-slate-200 rounded px-2.5 py-1 outline-none focus:border-indigo-500 bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveCertification(cIdx)}
                                className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                                title="Remove certification"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : certifications.length > 0 ? (
                    <div className="space-y-1 pt-0.5">
                      {certifications.map((cert: any, cIdx: number) => {
                        const certName = typeof cert === 'string' ? cert : cert.name || cert.title || String(cert)
                        return (
                          <p key={cIdx} className="text-xs sm:text-[13px] font-medium text-slate-900 flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span>{certName}</span>
                          </p>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No certifications listed</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONFIRMED PREFERENCES */}
        {activeTab === 'preferences' && (
          <div className="space-y-3 pt-1">
            <div className="relative pl-6 sm:pl-6.5 space-y-3">
              <div className="absolute left-[8px] top-4.5 bottom-4.5 w-[2px] bg-indigo-100 pointer-events-none" />

              {/* Target Career Track */}
              <div className="relative">
                <div className="absolute -left-[19px] top-[18px] w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-600 shadow-2xs z-10" />

                <div className="bg-slate-50/90 rounded-xl py-2.5 px-3.5 sm:px-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block font-normal">Target Track</span>
                        <h3 className="text-[13.5px] sm:text-[14px] font-bold text-slate-900 tracking-tight">
                          {targetRoles.length > 0 ? targetRoles.map(formatRoleLabel).join(' · ') : 'Open Explorer (Flexible)'}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onEditSection('target_roles')}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors px-1.5 py-0.5 rounded focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Career Stage */}
              <div className="relative">
                <div className="absolute -left-[19px] top-[18px] w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-600 shadow-2xs z-10" />

                <div className="bg-slate-50/90 rounded-xl py-2.5 px-3.5 sm:px-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block font-normal">Career Stage</span>
                        <h3 className="text-[13.5px] sm:text-[14px] font-bold text-slate-900 tracking-tight">
                          {formatStage(careerStage)}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onEditSection('career_stage')}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors px-1.5 py-0.5 rounded focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Work Interests */}
              <div className="relative">
                <div className="absolute -left-[19px] top-[18px] w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-600 shadow-2xs z-10" />

                <div className="bg-slate-50/90 rounded-xl py-2.5 px-3.5 sm:px-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block font-normal">Technical Work Interests</span>
                        <h3 className="text-[13.5px] sm:text-[14px] font-bold text-slate-900 tracking-tight">
                          {workInterests.length > 0 ? workInterests.map(formatInterestLabel).join(' · ') : 'Not specified'}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onEditSection('work_preference')}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors px-1.5 py-0.5 rounded focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Weekly Availability */}
              <div className="relative">
                <div className="absolute -left-[19px] top-[18px] w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-600 shadow-2xs z-10" />

                <div className="bg-slate-50/90 rounded-xl py-2.5 px-3.5 sm:px-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block font-normal">Weekly Learning Availability</span>
                        <h3 className="text-[13.5px] sm:text-[14px] font-bold text-slate-900 tracking-tight">
                          {formatHours(learningHours)}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onEditSection('learning_hours')}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors px-1.5 py-0.5 rounded focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Timeline Milestone */}
              <div className="relative">
                <div className="absolute -left-[19px] top-[18px] w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-600 shadow-2xs z-10" />

                <div className="bg-slate-50/90 rounded-xl py-2.5 px-3.5 sm:px-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block font-normal">Timeline Milestone</span>
                        <h3 className="text-[13.5px] sm:text-[14px] font-bold text-slate-900 tracking-tight">
                          {formatTimeline(timeline)}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onEditSection('career_timeline')}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors px-1.5 py-0.5 rounded focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional: Foundations Openness */}
              {willingnessToLearn && (
                <div className="relative">
                  <div className="absolute -left-[19px] top-[18px] w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-600 shadow-2xs z-10" />

                  <div className="bg-slate-50/90 rounded-xl py-2.5 px-3.5 sm:px-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block font-normal">Foundations Openness</span>
                          <h3 className="text-[13.5px] sm:text-[14px] font-bold text-slate-900 tracking-tight">
                            {formatOpenness(willingnessToLearn)}
                          </h3>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onEditSection('learning_openness')}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors px-1.5 py-0.5 rounded focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 10. STICKY POLISHED FOOTER */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 sm:px-7 py-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
        <div className="text-xs text-slate-500 font-normal">
          You can change this later.
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 font-semibold text-xs sm:text-[13px] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onConfirm(localProfile)}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs sm:text-[13px] shadow-[0_10px_25px_-5px_rgba(15,23,42,0.3)] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <span>{isSubmitting ? 'Validating...' : 'Confirm Transit Card'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
