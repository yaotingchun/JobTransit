import React from 'react'
import {
  Compass,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react'
import type { CareerProfile } from '../../types/careerProfile'

interface TransitCardPreviewProps {
  profile: CareerProfile
}

export const TransitCardPreview: React.FC<TransitCardPreviewProps> = ({ profile }) => {
  const {
    candidateName = 'Explorer',
    careerStage,
    skills = [],
    careerPreferences,
    learningPreferences,
  } = profile

  const targetRoles = careerPreferences?.targetRoles || []
  const workInterests = careerPreferences?.workInterests || []
  const learningHours = learningPreferences?.hoursPerWeekRange
  const timeline = learningPreferences?.timelinePreference

  // Human-readable labels
  const formatStage = (stage: string | null) => {
    switch (stage) {
      case 'student_or_recent_grad':
        return 'Student / Recent Graduate'
      case 'employed_tech':
        return 'Tech Practitioner'
      case 'employed_non_tech':
        return 'Industry Pivot'
      case 'first_job':
        return 'First Tech Role'
      case 'career_change':
        return 'Career Switcher'
      case 'prefer_not_to_say':
        return 'Open Transit Track'
      default:
        return 'Not specified yet'
    }
  }

  const formatHours = (hours: string | null) => {
    switch (hours) {
      case 'hours_1_2':
        return '1–2 hrs / week'
      case 'hours_3_5':
        return '3–5 hrs / week'
      case 'hours_6_10':
        return '6–10 hrs / week'
      case 'hours_10_plus':
        return '10+ hrs / week'
      case 'not_sure':
        return 'Flexible pace'
      default:
        return 'Not specified yet'
    }
  }

  const formatTimeline = (tl: string | null) => {
    switch (tl) {
      case 'months_3':
        return '3 Months'
      case 'months_6':
        return '6 Months'
      case 'months_12':
        return '12 Months'
      case 'exploring':
        return 'Open exploration'
      case 'skipped':
        return 'Skipped for now'
      default:
        return 'Not specified yet'
    }
  }

  const formatRoleLabel = (roleId: string) => {
    const map: Record<string, string> = {
      ai_ml: 'AI / Machine Learning',
      software_backend: 'Backend Software',
      frontend_fullstack: 'Full Stack / Frontend',
      data_engineering_analytics: 'Data Engineering',
      cybersecurity: 'Cybersecurity',
      cloud_devops: 'Cloud / DevOps',
      undecided: 'Open Explorer',
    }
    return map[roleId] || roleId
  }

  const formatInterestLabel = (id: string) => {
    const map: Record<string, string> = {
      build_software: 'Building Applications',
      analyze_data: 'Data & Analytics',
      develop_ai: 'AI-Powered Solutions',
      secure_systems: 'Security & Hardening',
      infrastructure: 'Cloud Infrastructure',
      explore_mixed: 'Hybrid / Mixed Focus',
      not_sure: 'Exploring Focus',
    }
    return map[id] || id
  }

  // Calculate completeness score
  const totalTrackedFields = 5
  let resolvedCount = 0
  if (careerStage) resolvedCount++
  if (targetRoles.length > 0) resolvedCount++
  if (workInterests.length > 0) resolvedCount++
  if (learningHours) resolvedCount++
  if (timeline) resolvedCount++

  const completenessPercentage = Math.round((resolvedCount / totalTrackedFields) * 100)

  return (
    <div className="rounded-3xl glass-transit-ticket overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-white/90 sticky top-28 transition-all">
      {/* Ticket Header & Magnetic Stripe */}
      <div className="bg-slate-950 text-white p-5 sm:p-6 relative overflow-hidden">
        {/* Holographic foil overlay */}
        <div className="absolute inset-0 glass-holographic-foil pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-bold tracking-wider uppercase text-blue-200 backdrop-blur-md">
              <Compass className="w-3 h-3 text-sky-400" />
              <span>TRANSIT BOARDING PASS</span>
            </div>
            <h3 className="font-hero text-xl font-extrabold tracking-tight text-white">
              {candidateName}
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              {formatStage(careerStage)}
            </p>
          </div>

          {/* Completeness Badge */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              <span>{completenessPercentage}% Mapped</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Live Transit Card</span>
          </div>
        </div>

        {/* Perforated Transit Notch */}
        <div className="absolute -bottom-3 left-0 right-0 flex justify-between px-2">
          <div className="w-6 h-6 rounded-full bg-[#f8fafc] -translate-x-3" />
          <div className="w-6 h-6 rounded-full bg-[#f8fafc] translate-x-3" />
        </div>
      </div>

      {/* Ticket Body Content */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* SECTION 1: SKILLS IDENTIFIED FROM CV */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Skills identified in CV</span>
            </span>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md">
              From CV
            </span>
          </div>

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/80 border border-slate-200/90 text-slate-800 shadow-2xs"
                  title={skill.evidence?.[0]?.description || 'Identified from CV profile'}
                >
                  <span>{skill.name}</span>
                  {skill.proficiency && skill.proficiency !== 'unknown' && (
                    <span className="text-[10px] text-slate-400 uppercase font-normal">
                      • {skill.proficiency}
                    </span>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No CV skills registered yet</p>
          )}
        </div>

        {/* SECTION 2: TARGET CAREER DESTINATIONS */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Target Career Tracks</span>
            </span>
            {targetRoles.length > 0 && (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                <span>You confirmed</span>
              </span>
            )}
          </div>

          {targetRoles.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {targetRoles.map((roleId) => (
                <span
                  key={roleId}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50/90 border border-blue-200/80 text-blue-900 shadow-2xs"
                >
                  {formatRoleLabel(roleId)}
                </span>
              ))}
            </div>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400">
              Not specified yet
            </div>
          )}
        </div>

        {/* SECTION 3: WORK INTERESTS */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Work Interests</span>
            </span>
            {workInterests.length > 0 && (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                <span>You confirmed</span>
              </span>
            )}
          </div>

          {workInterests.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {workInterests.map((interestId) => (
                <span
                  key={interestId}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50/80 border border-emerald-200/70 text-emerald-900"
                >
                  {formatInterestLabel(interestId)}
                </span>
              ))}
            </div>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400">
              Not specified yet
            </div>
          )}
        </div>

        {/* SECTION 4: LEARNING CAPACITY & TIMELINE */}
        <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-3 text-xs">
          {/* Learning Hours */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Weekly Pace</span>
            </span>
            <p
              className={`font-semibold ${
                learningHours ? 'text-slate-900' : 'text-slate-400 italic'
              }`}
            >
              {formatHours(learningHours)}
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Timeline</span>
            </span>
            <p
              className={`font-semibold ${
                timeline ? 'text-slate-900' : 'text-slate-400 italic'
              }`}
            >
              {formatTimeline(timeline)}
            </p>
          </div>
        </div>

        {/* Provenance Legend / Footer */}
        <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400">
          <span>JobTransit Card ID: {profile.id || 'Draft'}</span>
          <span>Adaptive Route Matrix</span>
        </div>
      </div>
    </div>
  )
}
