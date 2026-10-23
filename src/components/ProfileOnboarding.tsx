import React, { useState, useRef, useCallback } from 'react'
import {
  CreditCard, Upload, CheckCircle2, ArrowRight, FileText,
  User, Mail, Briefcase, Code2, GraduationCap, MapPin, Phone,
  Sparkles, Star, Zap, X, ChevronRight, RefreshCw, Plus, Trash2,
  Target, Globe, Building2, BookOpen, Award, Languages, Brain,
  Wrench, Heart, ChevronDown, Save, Loader2, AlertCircle, Layers,
  Image as ImageIcon, Presentation,
} from 'lucide-react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { UserProfile } from './Navbar'
import type {
  UserProfileData, PersonalInfo, Education, SkillsProfile,
  WorkExperienceEntry, Project, CareerPreferences,
  EmploymentStatus, EducationLevel, WorkMode,
} from '../types/profile'
import {
  defaultPersonal, defaultEducation, defaultSkills, defaultCareerPreferences,
} from '../types/profile'
import { Realistic3DCard } from './transit/Realistic3DCard'
import type { CardTheme } from './transit/types'
import { profileToCardData } from '../lib/cardFirebase'
import {
  extractTextFromAnyFile, parseStructuredResume, type ExtractionProgress,
} from '../lib/cvParser'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProfileOnboardingProps {
  currentUser: UserProfile
  onClose?: () => void
}

// ─── Wizard steps ─────────────────────────────────────────────────────────────

type Step = 'welcome' | 'upload' | 'personal' | 'education' | 'skills' | 'experience' | 'projects' | 'career' | 'pass'

export const STEP_ORDER: Step[] = ['welcome', 'upload', 'personal', 'education', 'skills', 'experience', 'projects', 'career', 'pass']

export const STEP_LABELS: Record<Step, string> = {
  welcome:    'Welcome',
  upload:     'Upload CV',
  personal:   'Personal Info',
  education:  'Education',
  skills:     'Skills',
  experience: 'Experience',
  projects:   'Projects',
  career:     'Career Goals',
  pass:       'Transit Pass',
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const inputCls = 'w-full h-10 px-3 rounded-xl bg-white/50 border border-white/70 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white/80 transition-all placeholder:text-slate-400'
const textareaCls = 'w-full px-3 py-2.5 rounded-xl bg-white/50 border border-white/70 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white/80 transition-all placeholder:text-slate-400 resize-none'
const labelCls = 'block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1'
const selectCls = 'w-full h-10 px-3 rounded-xl bg-white/50 border border-white/70 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all appearance-none cursor-pointer'

// Tag input: enter comma or press Enter
const TagInput: React.FC<{
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}> = ({ tags, onChange, placeholder = 'Type and press Enter…' }) => {
  const [val, setVal] = useState('')
  const add = () => {
    const t = val.trim()
    if (t && !tags.includes(t)) onChange([...tags, t])
    setVal('')
  }
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          className={inputCls + ' flex-1'}
        />
        <button type="button" onClick={add} className="px-3 h-10 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors cursor-pointer flex items-center gap-1 shrink-0">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-semibold">
              {tag}
              <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="ml-0.5 cursor-pointer text-indigo-400 hover:text-indigo-700"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}



// ─── Main Component ───────────────────────────────────────────────────────────

export const ProfileOnboarding: React.FC<ProfileOnboardingProps> = ({ currentUser, onClose }) => {
  const [step, setStep] = useState<Step>('welcome')
  const [hasExistingProfile, setHasExistingProfile] = useState(false)
  const [isCheckingExisting, setIsCheckingExisting] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [rawText, setRawText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [passId, setPassId] = useState(() => `JT-${Math.random().toString(36).slice(2,8).toUpperCase()}-${new Date().getFullYear()}`)
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress>({ stage: 'Extracting text…', percent: 10 })

  // ── Form state ──
  const [personal, setPersonal] = useState<PersonalInfo>({ ...defaultPersonal(), full_name: currentUser.name, email: currentUser.email })
  const [education, setEducation] = useState<Education>(defaultEducation())
  const [skills, setSkills] = useState<SkillsProfile>(defaultSkills())
  const [workExp, setWorkExp] = useState<WorkExperienceEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [career, setCareer] = useState<CareerPreferences>(defaultCareerPreferences())
  const [cardTheme, setCardTheme] = useState<CardTheme>('creative-license')
  const [section4Tab, setSection4Tab] = useState<'experience' | 'projects' | 'career' | 'all'>('experience')
  const [isBrochureFolded, setIsBrochureFolded] = useState(true)

  // Auto-open 3-fold brochure animation when entering this page
  React.useEffect(() => {
    if (step === 'personal' || step === 'education' || step === 'skills' || step === 'experience' || step === 'projects' || step === 'career') {
      setIsBrochureFolded(true)
      const timer = setTimeout(() => {
        setIsBrochureFolded(false)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [step])

  // ── Check if database already has information on mount ──
  React.useEffect(() => {
    let isMounted = true

    const checkDatabaseProfile = async () => {
      try {
        const uid = auth.currentUser?.uid || currentUser.email.replace(/[.@]/g, '_')
        if (!uid) {
          if (isMounted) setIsCheckingExisting(false)
          return
        }

        let profileData: any = null

        // 1. Check Cloud Firestore users/{uid}/profile/main
        try {
          const profileRef = doc(db, 'users', uid, 'profile', 'main')
          const snap = await getDoc(profileRef)
          if (snap.exists()) {
            profileData = snap.data()
          }
        } catch (err) {
          console.warn('Firestore profile read warning:', err)
        }

        // 2. Check localStorage fallback
        if (!profileData) {
          try {
            const saved = localStorage.getItem(`jobtransit_profile_${uid}`)
            if (saved) profileData = JSON.parse(saved)
          } catch {
            // ignore
          }
        }

        // 3. Check Firestore card document as fallback
        if (!profileData) {
          try {
            const cardRef = doc(db, 'users', uid, 'card', 'main')
            const cSnap = await getDoc(cardRef)
            if (cSnap.exists()) {
              const cData = cSnap.data()
              if (cData && (cData.holderName || cData.passId)) {
                profileData = {
                  personal: {
                    full_name: cData.holderName || currentUser.name,
                    email: cData.email || currentUser.email,
                    phone_number: cData.phone || '',
                    current_job_title: cData.occupation || '',
                    current_employment_status: 'employed',
                    years_of_experience: 1,
                    industry: '',
                    location: '',
                  },
                  pass_id: cData.passId,
                }
              }
            }
          } catch (err) {
            console.warn('Firestore card read warning:', err)
          }
        }

        // 4. If information exists, populate state and jump directly to 'pass'
        if (
          profileData &&
          (profileData.personal?.full_name ||
            profileData.personal?.current_job_title ||
            profileData.pass_id)
        ) {
          if (profileData.personal) setPersonal(profileData.personal)
          if (profileData.education) setEducation(profileData.education)
          if (profileData.skills) setSkills(profileData.skills)
          if (profileData.work_experience?.length) setWorkExp(profileData.work_experience)
          if (profileData.projects?.length) setProjects(profileData.projects)
          if (profileData.career_preferences) setCareer(profileData.career_preferences)
          if (profileData.cv_raw_text) setRawText(profileData.cv_raw_text)
          if (profileData.pass_id) setPassId(profileData.pass_id)

          if (isMounted) {
            setHasExistingProfile(true)
            setStep('pass') // Directly show the card without re-uploading resume!
            setIsCheckingExisting(false)
          }
          return
        }
      } catch (e) {
        console.warn('Profile existence check failed:', e)
      }

      if (isMounted) {
        setIsCheckingExisting(false)
      }
    }

    checkDatabaseProfile()

    return () => {
      isMounted = false
    }
  }, [currentUser])

  // ── Multi-Format File Handling (Word, PDF, PPTX, Images with OCR) ──
  const handleFileSelect = useCallback(async (file: File) => {
    setUploadedFile(file)
    setIsProcessing(true)
    setExtractionProgress({ stage: `Preparing ${file.name}…`, percent: 12 })
    setStep('upload')

    try {
      const text = await extractTextFromAnyFile(file, p => {
        setExtractionProgress(p)
      })
      setRawText(text)

      setExtractionProgress({ stage: 'Structuring profile data & career goals…', percent: 92 })
      await new Promise(r => setTimeout(r, 280))

      const parsed = parseStructuredResume(text, currentUser)
      setPersonal(parsed.personal)
      setEducation(parsed.education)
      setSkills(parsed.skills)
      if (parsed.work_experience?.length) setWorkExp(parsed.work_experience)
      if (parsed.projects?.length) setProjects(parsed.projects)
      if (parsed.career) setCareer(parsed.career)
    } catch (err) {
      console.error('Error during multi-format CV extraction:', err)
    } finally {
      setIsProcessing(false)
      setStep('personal')
    }
  }, [currentUser])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  // ── Firestore save ──
  const cleanForFirestore = (obj: any): any => {
    if (obj === undefined) return null
    if (obj === null || typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(cleanForFirestore)
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = cleanForFirestore(value)
      }
    }
    return result
  }

  const handleSaveToFirestore = async (): Promise<boolean> => {
    const uid = auth.currentUser?.uid || currentUser.email.replace(/[.@]/g, '_')
    if (!uid) { setSaveError('Not signed in.'); return false }
    setIsSaving(true); setSaveError(null)
    const now = new Date().toISOString()
    const profileData: UserProfileData = {
      uid, personal, education, skills,
      work_experience: workExp, projects,
      career_preferences: career,
      cv_raw_text: rawText,
      pass_id: passId,
      created_at: now,
      updated_at: now,
    }

    const sanitized = cleanForFirestore(profileData)

    // 1. Always save to local device storage first
    try {
      localStorage.setItem(`jobtransit_profile_${uid}`, JSON.stringify(sanitized))
    } catch (e) {
      console.warn('localStorage backup warning:', e)
    }

    // 2. Sync to Cloud Firestore
    try {
      await setDoc(doc(db, 'users', uid, 'profile', 'main'), sanitized)

      // Also sync full card document in Firestore matching profile data with unique license number
      const cardPayload = profileToCardData(profileData, uid, currentUser)
      await setDoc(doc(db, 'users', uid, 'card', 'main'), cardPayload)

      setIsSaving(false)
      return true
    } catch (err: any) {
      console.error('Firestore save failed:', err)
      const isPermissionDenied = err?.code === 'permission-denied' || String(err?.message || '').includes('permission-denied')
      if (isPermissionDenied) {
        setSaveError('Firebase permission-denied: Firestore rules deny write access for this user. Your profile is saved locally on this device.')
      } else {
        setSaveError(`Cloud sync error (${err?.code || 'unknown'}): ${err?.message || 'Failed to save'}. Data saved locally.`)
      }
      setIsSaving(false)
      return false
    }
  }

  const handleFinish = async () => {
    const ok = await handleSaveToFirestore()
    if (ok) {
      setHasExistingProfile(true)
      setStep('pass')
    }
  }

  // ── Work experience helpers ──
  const addJob = () => setWorkExp(prev => [...prev, { job_title:'', company_name:'', employment_start_date:'', employment_end_date:null, job_responsibilities:[], achievements:[], skills_used:[] }])
  const updateJob = (i: number, patch: Partial<WorkExperienceEntry>) => setWorkExp(prev => prev.map((j,idx) => idx===i ? {...j,...patch} : j))
  const removeJob = (i: number) => setWorkExp(prev => prev.filter((_,idx) => idx!==i))

  // ── Project helpers ──
  const addProject = () => setProjects(prev => [...prev, { project_name:'', project_description:'', project_technologies:[], project_role:'', project_outcomes:[], portfolio_url:null }])
  const updateProject = (i: number, patch: Partial<Project>) => setProjects(prev => prev.map((p,idx) => idx===i ? {...p,...patch} : p))
  const removeProject = (i: number) => setProjects(prev => prev.filter((_,idx) => idx!==i))

  const panelCls = 'relative rounded-3xl bg-white/35 backdrop-blur-2xl border border-white/55 shadow-[0_24px_60px_rgba(15,23,42,0.12)] p-6 sm:p-8 flex flex-col gap-5'

  if (isCheckingExisting) {
    return (
      <div className="w-full min-h-[460px] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/60 border border-white/80 shadow-md backdrop-blur-md flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-slate-500 font-mono">
          Loading your Transit Pass…
        </p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-full flex flex-col items-center justify-center px-4 py-8">

      {/* ── WELCOME ──────────────────────────────────────────────────── */}
      {step === 'welcome' && (
        <div className="w-full max-w-lg mx-auto text-center animate-in fade-in zoom-in-95 duration-500">
          <div className={panelCls + ' items-center'}>
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center shadow-[0_16px_40px_rgba(15,23,42,0.35)] border border-white/10">
                <CreditCard className="w-10 h-10 text-sky-300" />
              </div>
              <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg border-2 border-white">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-500">Hey, {currentUser.name} 👋</p>
              <h2 className="font-hero text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">Are you ready?</h2>
              <h3 className="font-hero text-2xl sm:text-3xl font-bold text-indigo-700">Grab your Transit Pass 🚀</h3>
              <p className="text-slate-600 text-sm leading-relaxed max-w-xs mx-auto pt-1">
                Upload your CV and we'll walk you through a quick profile setup to craft your personalised <strong className="text-slate-900">Career Transit Pass</strong>.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full">
              {[
                { icon: FileText,     label: 'CV Upload',    color: 'text-sky-600',     bg: 'bg-sky-50/80 border-sky-200/60' },
                { icon: CheckCircle2, label: 'Fill Profile', color: 'text-emerald-600', bg: 'bg-emerald-50/80 border-emerald-200/60' },
                { icon: CreditCard,   label: 'Get Pass',     color: 'text-indigo-600',  bg: 'bg-indigo-50/80 border-indigo-200/60' },
              ].map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-xs font-semibold text-slate-700">{label}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep('upload')}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-slate-950 to-indigo-900 hover:from-indigo-900 hover:to-slate-950 text-white font-bold text-base shadow-[0_12px_30px_rgba(15,23,42,0.3)] transition-all duration-300 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
              <span>Letsgooo! 🎉</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── UPLOAD ───────────────────────────────────────────────────── */}
      {step === 'upload' && (
        <div className="w-full max-w-lg mx-auto animate-in fade-in slide-in-from-right-4 duration-400">
          <div className={panelCls}>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-200/60 mb-4">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700 tracking-wide uppercase">Step 1 — Upload CV</span>
              </div>
              <h2 className="font-hero text-2xl sm:text-3xl font-extrabold text-slate-950">Upload Your CV</h2>
              <p className="text-slate-500 text-sm mt-1">We'll extract your info automatically. You can edit everything next.</p>
            </div>

            {!isProcessing && (
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-10 flex flex-col items-center gap-4 transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01]' : 'border-slate-300/70 hover:border-indigo-400 hover:bg-indigo-50/30 bg-white/40'}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.pptx,.ppt,.png,.jpg,.jpeg,.webp,.txt,.rtf"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
                />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isDragging ? 'bg-indigo-100 scale-110 shadow-sm' : 'bg-slate-100/90'}`}>
                  <Upload className={`w-7 h-7 ${isDragging ? 'text-indigo-600' : 'text-slate-500'}`} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 text-base">{isDragging ? 'Drop it right here!' : 'Drag & drop your Resume / CV'}</p>
                  <p className="text-xs text-slate-500 mt-1">or click to browse from your device</p>
                </div>

                {/* Multi-Format Badges */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 border-t border-slate-200/60 w-full max-w-sm">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/60 text-[11px] font-semibold">
                    <FileText className="w-3 h-3" /> PDF (Native & Scanned)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 text-[11px] font-semibold">
                    <FileText className="w-3 h-3" /> Word (.docx, .doc)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60 text-[11px] font-semibold">
                    <Presentation className="w-3 h-3" /> PPT (.pptx)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-semibold">
                    <ImageIcon className="w-3 h-3" /> Images OCR (.png, .jpg)
                  </span>
                </div>
              </div>
            )}

            {isProcessing && uploadedFile && (
              <div className="flex flex-col items-center gap-5 py-6 px-4 animate-in fade-in duration-300">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-indigo-600 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="font-bold text-slate-900 text-sm">{uploadedFile.name}</p>
                  <p className="text-indigo-600 text-xs font-semibold animate-pulse">
                    {extractionProgress.stage || 'Extracting text & parsing fields with OCR…'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Extracting skills, experience, education & career objectives
                  </p>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(10, Math.min(100, extractionProgress.percent ?? 50))}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => (hasExistingProfile ? setStep('pass') : setStep('welcome'))}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                ← {hasExistingProfile ? 'Cancel & Back to Transit Pass' : 'Back'}
              </button>
              <button
                type="button"
                onClick={() => setStep('personal')}
                className="ml-auto text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
              >
                {hasExistingProfile ? 'Edit Details Manually →' : 'Skip — fill manually →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3-FOLD PAPER PROFILE REVIEW (ALL 3 SECTIONS ON PAPER • AUTO-OPEN) ── */}
      {(step === 'personal' || step === 'education' || step === 'skills' || step === 'experience' || step === 'projects' || step === 'career') && (
        <div className="w-full max-w-[1580px] mx-auto animate-in fade-in duration-500">
          
          {/* Top Control & Navigation Bar */}
          <div className="relative rounded-2xl bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_12px_36px_rgba(15,23,42,0.06)] p-5 sm:p-6 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3-Fold Career Paper Document
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                  {isBrochureFolded ? '📄 Paper Folded (Right on Top • Left on Bottom)' : '📄 Paper Unfolded (Open Flat)'}
                </span>
              </div>
              <h2 className="font-hero text-2xl sm:text-3xl font-extrabold text-slate-950">
                Verify Your Career Information
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Presented on a 3-fold paper document. Panel 1 (Personal & Education), Panel 2 (Skills & Tools), and Panel 3 (Experience & Goals).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
              {/* Interactive Toggle for Auto-Open Animation */}
              <button
                type="button"
                onClick={() => {
                  setIsBrochureFolded(true)
                  setTimeout(() => setIsBrochureFolded(false), 450)
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer active:scale-95"
                title="Replay the paper unfolding animation"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Replay Unfold</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBrochureFolded(prev => !prev)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isBrochureFolded ? 'Unfold Paper Document' : 'Fold Paper (Right on Top)'}</span>
              </button>

              {hasExistingProfile && (
                <button
                  type="button"
                  onClick={() => setStep('pass')}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Back to Transit Pass</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => { setUploadedFile(null); setStep('upload'); }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Reupload CV</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSaving}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-900 hover:from-indigo-900 hover:to-slate-950 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group active:scale-95"
              >
                {isSaving ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin"/> Saving…</>
                ) : (
                  <><Save className="w-3.5 h-3.5"/> Save & View Pass <Zap className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform"/></>
                )}
              </button>
            </div>
          </div>

          {/* ── 3-FOLD PAPER SHEET CONTAINER WITH 3D PERSPECTIVE ── */}
          <div
            className="relative w-full py-4"
            style={{ perspective: '2800px' }}
          >
            {/* The 3-panel paper sheet (Clean paper aesthetic, NO green background) */}
            <div
              className="relative flex flex-col lg:flex-row items-stretch justify-center rounded-xl bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08),0_1px_3px_rgba(0,0,0,0.04)] border border-slate-200/90"
              style={{ transformStyle: 'preserve-3d' }}
            >

              {/* ─────────────────────────────────────────────────────────────
                  PANEL 1 (LEFT FLAP): SECTION 1 — PERSONAL & EDUCATION
                  (When folded, left flap is underneath / bottom of the fold)
              ───────────────────────────────────────────────────────────── */}
              <div
                className="flex-1 min-w-[320px] max-w-full lg:max-w-[500px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200/80 p-5 sm:p-6 flex flex-col relative origin-right rounded-t-xl lg:rounded-tr-none lg:rounded-l-xl"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isBrochureFolded ? 'rotateY(64deg)' : 'rotateY(0deg)',
                  zIndex: isBrochureFolded ? 20 : 10,
                  transition: isBrochureFolded
                    ? 'transform 950ms cubic-bezier(0.16,1,0.3,1), box-shadow 950ms ease'
                    : 'transform 1050ms cubic-bezier(0.16,1,0.3,1) 120ms, box-shadow 1050ms ease',
                  boxShadow: isBrochureFolded ? 'inset -12px 0 20px rgba(0,0,0,0.08), 8px 0 24px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {/* Subtle Paper Registration Marks */}
                <div className="absolute top-2.5 left-2.5 text-slate-300 pointer-events-none select-none text-[11px] leading-none">✦</div>
                <div className="absolute top-2.5 right-2.5 text-slate-300 pointer-events-none select-none text-[11px] leading-none">✦</div>
                <div className="absolute bottom-2.5 left-2.5 text-slate-300 pointer-events-none select-none text-[11px] leading-none">✦</div>
                <div className="absolute bottom-2.5 right-2.5 text-slate-300 pointer-events-none select-none text-[11px] leading-none">✦</div>

                {/* Section Header */}
                <div className="pb-3 mb-3 border-b border-slate-200/70 relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-hero text-base sm:text-lg font-bold text-slate-900 leading-tight">
                        1. Personal & Education
                      </h3>
                      <p className="text-[11px] text-slate-500">Contact, identity & academics</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shrink-0">
                    Fold 1 • Left (Bottom Layer)
                  </span>
                </div>

                {/* Scrollable Content Container */}
                <div className="flex flex-col gap-5 max-h-[660px] overflow-y-auto pr-2 custom-scrollbar relative z-10">

                  {/* 1A. Personal Info */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Personal & Professional Info
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Full Name *</label>
                        <input className={inputCls} value={personal.full_name} onChange={e => setPersonal({...personal, full_name: e.target.value})} placeholder="Alex Morgan" />
                      </div>
                      <div>
                        <label className={labelCls}>Email</label>
                        <input className={inputCls} type="email" value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} placeholder="alex@example.com" />
                      </div>
                      <div>
                        <label className={labelCls}>Phone Number</label>
                        <input className={inputCls} value={personal.phone_number} onChange={e => setPersonal({...personal, phone_number: e.target.value})} placeholder="+60 12-345 6789" />
                      </div>
                      <div>
                        <label className={labelCls}>Location / Country</label>
                        <input className={inputCls} value={personal.location} onChange={e => setPersonal({...personal, location: e.target.value})} placeholder="Kuala Lumpur, Malaysia" />
                      </div>
                      <div>
                        <label className={labelCls}>Current Job Title</label>
                        <input className={inputCls} value={personal.current_job_title} onChange={e => setPersonal({...personal, current_job_title: e.target.value})} placeholder="Software Engineer" />
                      </div>
                      <div>
                        <label className={labelCls}>Years of Experience</label>
                        <input className={inputCls} type="number" min={0} max={60} value={personal.years_of_experience} onChange={e => setPersonal({...personal, years_of_experience: Number(e.target.value)})} />
                      </div>
                      <div>
                        <label className={labelCls}>Industry</label>
                        <input className={inputCls} value={personal.industry} onChange={e => setPersonal({...personal, industry: e.target.value})} placeholder="Technology, Finance…" />
                      </div>
                      <div>
                        <label className={labelCls}>Employment Status</label>
                        <div className="relative">
                          <select className={selectCls} value={personal.current_employment_status} onChange={e => setPersonal({...personal, current_employment_status: e.target.value as EmploymentStatus})}>
                            <option value="employed">Employed</option>
                            <option value="student">Student</option>
                            <option value="unemployed">Unemployed</option>
                            <option value="freelancer">Freelancer</option>
                            <option value="career_changer">Career Changer</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1B. Education */}
                  <div className="space-y-3.5 pt-4 border-t border-slate-200/70">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Education & Academic Background
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Education Level</label>
                        <div className="relative">
                          <select className={selectCls} value={education.education_level} onChange={e => setEducation({...education, education_level: e.target.value as EducationLevel})}>
                            <option value="diploma">Diploma</option>
                            <option value="bachelor">Bachelor's</option>
                            <option value="master">Master's</option>
                            <option value="phd">PhD</option>
                            <option value="certificate">Certificate</option>
                            <option value="other">Other</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Field of Study / Major</label>
                        <input className={inputCls} value={education.field_of_study} onChange={e => setEducation({...education, field_of_study: e.target.value})} placeholder="Computer Science" />
                      </div>
                      <div>
                        <label className={labelCls}>Institution Name</label>
                        <input className={inputCls} value={education.institution_name} onChange={e => setEducation({...education, institution_name: e.target.value})} placeholder="Universiti Malaya / UTM" />
                      </div>
                      <div>
                        <label className={labelCls}>Graduation Year</label>
                        <input className={inputCls} type="number" min={1980} max={2040} value={education.graduation_year} onChange={e => setEducation({...education, graduation_year: Number(e.target.value)})} />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Academic Achievements</label>
                      <TagInput tags={education.academic_achievements} onChange={v => setEducation({...education, academic_achievements: v})} placeholder="Dean's List, First Class…" />
                    </div>

                    <div>
                      <label className={labelCls}>Relevant Coursework</label>
                      <TagInput tags={education.relevant_coursework} onChange={v => setEducation({...education, relevant_coursework: v})} placeholder="Machine Learning, Algorithms…" />
                    </div>
                  </div>

                </div>

                {/* Right Fold Seam Crease Shadow */}
                <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-r from-transparent to-black/[0.04] pointer-events-none" />
              </div>

              {/* Fold Crease 1 (Physical Scored Paper Line) */}
              <div className="hidden lg:block w-[2px] bg-gradient-to-b from-slate-200/50 via-slate-300 to-slate-200/50 relative z-20 shrink-0">
                <div className="absolute inset-y-0 -left-1.5 w-1.5 bg-gradient-to-r from-transparent to-slate-900/[0.05] pointer-events-none" />
                <div className="absolute inset-y-0 -right-1.5 w-1.5 bg-gradient-to-l from-transparent to-white pointer-events-none" />
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  PANEL 2 (CENTER BASE): SECTION 2 — SKILLS & COMPETENCIES
                  (Fixed central base panel of the 3-fold paper)
              ───────────────────────────────────────────────────────────── */}
              <div
                className="flex-1 min-w-[320px] max-w-full lg:max-w-[500px] bg-[#fafaf8] p-5 sm:p-6 flex flex-col relative z-10"
                style={{
                  boxShadow: isBrochureFolded
                    ? 'inset 16px 0 24px -8px rgba(0,0,0,0.08), inset -16px 0 24px -8px rgba(0,0,0,0.08)'
                    : 'inset 4px 0 10px -4px rgba(0,0,0,0.02), inset -4px 0 10px -4px rgba(0,0,0,0.02)',
                  transition: 'box-shadow 950ms ease',
                }}
              >
                {/* Subtle Paper Registration Marks */}
                <div className="absolute top-2.5 left-2.5 text-slate-300 pointer-events-none select-none text-[11px] leading-none">✦</div>
                <div className="absolute top-2.5 right-2.5 text-slate-300 pointer-events-none select-none text-[11px] leading-none">✦</div>
                <div className="absolute bottom-2.5 left-2.5 text-slate-300 pointer-events-none select-none text-[11px] leading-none">✦</div>
                <div className="absolute bottom-2.5 right-2.5 text-slate-300 pointer-events-none select-none text-[11px] leading-none">✦</div>

                {/* Section Header */}
                <div className="pb-3 mb-3 border-b border-slate-200/70 relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs shadow-xs">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-hero text-base sm:text-lg font-bold text-slate-900 leading-tight">
                        2. Skills & Competencies
                      </h3>
                      <p className="text-[11px] text-slate-500">Core technologies, tools & abilities</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60 shrink-0">
                    Fold 2 • Center Base
                  </span>
                </div>

                {/* Scrollable Content Container */}
                <div className="flex flex-col gap-4 max-h-[660px] overflow-y-auto pr-2 custom-scrollbar relative z-10">

                  <div>
                    <label className={labelCls + ' flex items-center gap-1'}><Code2 className="w-3 h-3 text-indigo-600"/>Technical Skills</label>
                    <TagInput tags={skills.technical_skills} onChange={v => setSkills({...skills, technical_skills: v})} placeholder="React, Python, SQL…" />
                  </div>

                  <div>
                    <label className={labelCls + ' flex items-center gap-1'}><Sparkles className="w-3 h-3 text-amber-500"/>AI / ML Skills</label>
                    <TagInput tags={skills.ai_skills} onChange={v => setSkills({...skills, ai_skills: v})} placeholder="Prompt Engineering, PyTorch…" />
                  </div>

                  <div>
                    <label className={labelCls + ' flex items-center gap-1'}><Wrench className="w-3 h-3 text-sky-600"/>Tools & Technologies</label>
                    <TagInput tags={skills.tools_and_technologies} onChange={v => setSkills({...skills, tools_and_technologies: v})} placeholder="AWS, Docker, Power BI…" />
                  </div>

                  <div>
                    <label className={labelCls + ' flex items-center gap-1'}><Heart className="w-3 h-3 text-rose-500"/>Soft Skills</label>
                    <TagInput tags={skills.soft_skills} onChange={v => setSkills({...skills, soft_skills: v})} placeholder="Leadership, Communication…" />
                  </div>

                  {/* Certifications & Languages side-by-side */}
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {/* Certifications */}
                    <div className="bg-white/80 rounded-xl p-3 border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <label className={labelCls + ' flex items-center gap-1 mb-0'}><Award className="w-3 h-3 text-amber-600"/>Certifications</label>
                        <button type="button" onClick={() => setSkills({...skills, certifications:[...skills.certifications,{name:'',issuing_organisation:'',date:''}]})} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                          <Plus className="w-3.5 h-3.5"/>Add
                        </button>
                      </div>
                      {skills.certifications.length === 0 && <p className="text-xs text-slate-400 italic">No certifications listed.</p>}
                      <div className="space-y-2">
                        {skills.certifications.map((cert, i) => (
                          <div key={i} className="flex flex-col gap-1.5 bg-slate-50/70 rounded-lg p-2 border border-slate-200/50">
                            <input className={inputCls + ' h-8 text-xs bg-white'} value={cert.name} onChange={e => { const c=[...skills.certifications]; c[i]={...c[i],name:e.target.value}; setSkills({...skills,certifications:c}) }} placeholder="Certificate name" />
                            <div className="flex gap-1.5 items-center">
                              <input className={inputCls + ' h-8 text-xs flex-1 bg-white'} value={cert.issuing_organisation} onChange={e => { const c=[...skills.certifications]; c[i]={...c[i],issuing_organisation:e.target.value}; setSkills({...skills,certifications:c}) }} placeholder="Issuing Org" />
                              <input className={inputCls + ' h-8 text-xs w-28 bg-white'} type="month" value={cert.date} onChange={e => { const c=[...skills.certifications]; c[i]={...c[i],date:e.target.value}; setSkills({...skills,certifications:c}) }} />
                              <button type="button" onClick={() => setSkills({...skills,certifications:skills.certifications.filter((_,j)=>j!==i)})} className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 cursor-pointer shrink-0"><Trash2 className="w-3.5 h-3.5"/></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="bg-white/80 rounded-xl p-3 border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <label className={labelCls + ' flex items-center gap-1 mb-0'}><Languages className="w-3 h-3 text-indigo-600"/>Languages</label>
                        <button type="button" onClick={() => setSkills({...skills, languages:[...skills.languages,{language:'',proficiency:''}]})} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                          <Plus className="w-3.5 h-3.5"/>Add
                        </button>
                      </div>
                      {skills.languages.length === 0 && <p className="text-xs text-slate-400 italic">No languages listed.</p>}
                      <div className="space-y-2">
                        {skills.languages.map((lang, i) => (
                          <div key={i} className="flex gap-1.5 items-center bg-slate-50/70 rounded-lg p-2 border border-slate-200/50">
                            <input className={inputCls + ' h-8 text-xs flex-1 bg-white'} value={lang.language} onChange={e => { const l=[...skills.languages]; l[i]={...l[i],language:e.target.value}; setSkills({...skills,languages:l}) }} placeholder="English" />
                            <input className={inputCls + ' h-8 text-xs flex-1 bg-white'} value={lang.proficiency} onChange={e => { const l=[...skills.languages]; l[i]={...l[i],proficiency:e.target.value}; setSkills({...skills,languages:l}) }} placeholder="Fluent, Native" />
                            <button type="button" onClick={() => setSkills({...skills,languages:skills.languages.filter((_,j)=>j!==i)})} className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 cursor-pointer shrink-0"><Trash2 className="w-3.5 h-3.5"/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Fold Crease 2 (Physical Scored Paper Line) */}
              <div className="hidden lg:block w-[2px] bg-gradient-to-b from-slate-200/50 via-slate-300 to-slate-200/50 relative z-20 shrink-0">
                <div className="absolute inset-y-0 -left-1.5 w-1.5 bg-gradient-to-r from-transparent to-white pointer-events-none" />
                <div className="absolute inset-y-0 -right-1.5 w-1.5 bg-gradient-to-l from-transparent to-slate-900/[0.05] pointer-events-none" />
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  PANEL 3 (RIGHT FLAP): SECTION 3 — EXPERIENCE & GOALS
                  (When folded, right flap is ON TOP of the left flap)
              ───────────────────────────────────────────────────────────── */}
              <div
                className="flex-1 min-w-[320px] max-w-full lg:max-w-[500px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200/80 p-5 sm:p-6 flex flex-col relative origin-left rounded-b-xl lg:rounded-bl-none lg:rounded-r-xl"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isBrochureFolded ? 'rotateY(-76deg)' : 'rotateY(0deg)',
                  zIndex: isBrochureFolded ? 30 : 10,
                  transition: isBrochureFolded
                    ? 'transform 1000ms cubic-bezier(0.16,1,0.3,1) 80ms, box-shadow 1000ms ease'
                    : 'transform 950ms cubic-bezier(0.16,1,0.3,1), box-shadow 950ms ease',
                  boxShadow: isBrochureFolded
                    ? '-20px 0 35px -5px rgba(15,23,42,0.24), -4px 0 10px -2px rgba(15,23,42,0.12)'
                    : 'none',
                }}
              >
                {/* Subtle Paper Registration Marks */}
                <div className="absolute top-2.5 left-2.5 text-slate-300 pointer-events-none select-none text-[11px] leading-none">✦</div>
                <div className="absolute top-2.5 right-2.5 text-slate-300 pointer-events-none select-none text-[11px] leading-none">✦</div>
                <div className="absolute bottom-2.5 left-2.5 text-slate-300 pointer-events-none select-none text-[11px] leading-none">✦</div>
                <div className="absolute bottom-2.5 right-2.5 text-slate-300 pointer-events-none select-none text-[11px] leading-none">✦</div>

                {/* Section Header */}
                <div className="pb-3 mb-3 border-b border-slate-200/70 relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center text-xs shadow-xs">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-hero text-base sm:text-lg font-bold text-slate-900 leading-tight">
                        3. Experience & Goals
                      </h3>
                      <p className="text-[11px] text-slate-500">History, projects & preferences</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/60 shrink-0">
                    Fold 3 • Right (Top Flap)
                  </span>
                </div>

                {/* Sub-Tabs Selector */}
                <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl gap-1 text-[11px] mb-3 relative z-10">
                  <button
                    type="button"
                    onClick={() => setSection4Tab('experience')}
                    className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
                      section4Tab === 'experience'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Jobs ({workExp.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSection4Tab('projects')}
                    className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
                      section4Tab === 'projects'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Projects ({projects.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSection4Tab('career')}
                    className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
                      section4Tab === 'career'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Goals
                  </button>
                  <button
                    type="button"
                    onClick={() => setSection4Tab('all')}
                    className={`py-1.5 px-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                      section4Tab === 'all'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                </div>

                {/* Scrollable Content Container */}
                <div className="flex flex-col gap-4 max-h-[615px] overflow-y-auto pr-2 custom-scrollbar relative z-10">

                  {/* 3A: Work Experience */}
                  {(section4Tab === 'experience' || section4Tab === 'all') && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                          Work Experience ({workExp.length})
                        </span>
                        <button
                          type="button"
                          onClick={addJob}
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />Add Job
                        </button>
                      </div>

                      {workExp.length === 0 && (
                        <div className="rounded-2xl border-2 border-dashed border-slate-300/60 p-4 text-center">
                          <p className="text-xs text-slate-400">No work experience entries yet.</p>
                          <button
                            type="button"
                            onClick={addJob}
                            className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            + Add first job
                          </button>
                        </div>
                      )}

                      {workExp.map((job, i) => (
                        <div key={i} className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-3.5 flex flex-col gap-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                              Job #{i + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeJob(i)}
                              className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className={labelCls}>Job Title</label>
                              <input className={inputCls + ' h-8 text-xs bg-white'} value={job.job_title} onChange={e => updateJob(i,{job_title:e.target.value})} placeholder="Software Engineer" />
                            </div>
                            <div>
                              <label className={labelCls}>Company Name</label>
                              <input className={inputCls + ' h-8 text-xs bg-white'} value={job.company_name} onChange={e => updateJob(i,{company_name:e.target.value})} placeholder="TechCorp" />
                            </div>
                            <div>
                              <label className={labelCls}>Start Date</label>
                              <input className={inputCls + ' h-8 text-xs bg-white'} type="month" value={job.employment_start_date} onChange={e => updateJob(i,{employment_start_date:e.target.value})} />
                            </div>
                            <div>
                              <label className={labelCls}>End Date</label>
                              <input className={inputCls + ' h-8 text-xs bg-white'} type="month" value={job.employment_end_date ?? ''} onChange={e => updateJob(i,{employment_end_date:e.target.value||null})} />
                            </div>
                          </div>
                          <div>
                            <label className={labelCls}>Responsibilities</label>
                            <TagInput tags={job.job_responsibilities} onChange={v => updateJob(i,{job_responsibilities:v})} placeholder="Responsibilities…" />
                          </div>
                          <div>
                            <label className={labelCls}>Achievements</label>
                            <TagInput tags={job.achievements} onChange={v => updateJob(i,{achievements:v})} placeholder="Key achievements…" />
                          </div>
                          <div>
                            <label className={labelCls}>Skills Used</label>
                            <TagInput tags={job.skills_used} onChange={v => updateJob(i,{skills_used:v})} placeholder="React, Node.js…" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3B: Projects */}
                  {(section4Tab === 'projects' || section4Tab === 'all') && (
                    <div className="flex flex-col gap-3 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                          Projects ({projects.length})
                        </span>
                        <button
                          type="button"
                          onClick={addProject}
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />Add Project
                        </button>
                      </div>

                      {projects.length === 0 && (
                        <div className="rounded-2xl border-2 border-dashed border-slate-300/60 p-4 text-center">
                          <p className="text-xs text-slate-400">No project entries yet.</p>
                          <button
                            type="button"
                            onClick={addProject}
                            className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            + Add first project
                          </button>
                        </div>
                      )}

                      {projects.map((proj, i) => (
                        <div key={i} className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-3.5 flex flex-col gap-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                              Project #{i + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeProject(i)}
                              className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className={labelCls}>Project Name</label>
                              <input className={inputCls + ' h-8 text-xs bg-white'} value={proj.project_name} onChange={e => updateProject(i,{project_name:e.target.value})} placeholder="Project title" />
                            </div>
                            <div>
                              <label className={labelCls}>Your Role</label>
                              <input className={inputCls + ' h-8 text-xs bg-white'} value={proj.project_role} onChange={e => updateProject(i,{project_role:e.target.value})} placeholder="Lead Developer" />
                            </div>
                          </div>
                          <div>
                            <label className={labelCls}>Description</label>
                            <textarea className={textareaCls + ' text-xs bg-white'} rows={2} value={proj.project_description} onChange={e => updateProject(i,{project_description:e.target.value})} placeholder="Brief project summary…" />
                          </div>
                          <div>
                            <label className={labelCls}>Technologies</label>
                            <TagInput tags={proj.project_technologies} onChange={v => updateProject(i,{project_technologies:v})} placeholder="React, Python…" />
                          </div>
                          <div>
                            <label className={labelCls}>Outcomes / Impact</label>
                            <TagInput tags={proj.project_outcomes} onChange={v => updateProject(i,{project_outcomes:v})} placeholder="Metrics, users…" />
                          </div>
                          <div>
                            <label className={labelCls}>Portfolio / Repo URL</label>
                            <input className={inputCls + ' h-8 text-xs bg-white'} value={proj.portfolio_url ?? ''} onChange={e => updateProject(i,{portfolio_url:e.target.value||null})} placeholder="https://github.com/…" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3C: Career Goals */}
                  {(section4Tab === 'career' || section4Tab === 'all') && (
                    <div className="flex flex-col gap-3 pt-2 border-t border-slate-200/60">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-rose-600" />
                        Career Preferences & Goals
                      </span>

                      <div>
                        <label className={labelCls}>Preferred Work Mode</label>
                        <div className="flex gap-1.5">
                          {(['on-site','hybrid','remote'] as WorkMode[]).map(mode => (
                            <button
                              key={mode} type="button"
                              onClick={() => setCareer({...career, preferred_work_mode:mode})}
                              className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${career.preferred_work_mode===mode ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >{mode}</button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={labelCls + ' flex items-center gap-1'}><Heart className="w-3 h-3 text-rose-500"/>Career Interests</label>
                        <TagInput tags={career.career_interests} onChange={v => setCareer({...career, career_interests:v})} placeholder="AI, FinTech, Web3…" />
                      </div>

                      <div>
                        <label className={labelCls + ' flex items-center gap-1'}><Target className="w-3 h-3 text-indigo-600"/>Target Job Roles</label>
                        <TagInput tags={career.target_job_roles} onChange={v => setCareer({...career, target_job_roles:v})} placeholder="ML Engineer, Architect…" />
                      </div>

                      <div>
                        <label className={labelCls + ' flex items-center gap-1'}><Building2 className="w-3 h-3 text-amber-600"/>Preferred Industries</label>
                        <TagInput tags={career.preferred_industries} onChange={v => setCareer({...career, preferred_industries:v})} placeholder="Technology, Finance…" />
                      </div>

                      <div>
                        <label className={labelCls + ' flex items-center gap-1'}><Globe className="w-3 h-3 text-sky-600"/>Preferred Locations</label>
                        <TagInput tags={career.preferred_work_location} onChange={v => setCareer({...career, preferred_work_location:v})} placeholder="Kuala Lumpur, Remote…" />
                      </div>

                      <div>
                        <label className={labelCls}>Career Goals</label>
                        <textarea
                          className={textareaCls + ' text-xs bg-white'} rows={3}
                          value={career.career_goals}
                          onChange={e => setCareer({...career, career_goals:e.target.value})}
                          placeholder="Your short-term and long-term career objectives…"
                        />
                      </div>
                    </div>
                  )}

                </div>

                {/* Left Fold Seam Crease Shadow */}
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-l from-transparent to-black/[0.04] pointer-events-none" />
              </div>

            </div>
          </div>

          {/* Cloud Sync Notice if Save Failed */}
          {saveError && (
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Cloud Sync Notice</p>
                  <p className="text-slate-600 mt-0.5">{saveError}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHasExistingProfile(true)
                    setStep('pass')
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  View Transit Pass anyway →
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-700 font-semibold text-xs border border-slate-300 transition-colors cursor-pointer"
                >
                  Retry Cloud Save
                </button>
              </div>
            </div>
          )}

          {/* Bottom Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-200/60 mt-4">
            <button
              type="button"
              onClick={() => (hasExistingProfile ? setStep('pass') : setStep('upload'))}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer font-medium"
            >
              ← {hasExistingProfile ? 'Cancel & Return to Transit Pass' : 'Back to CV Upload'}
            </button>

            <button
              type="button"
              onClick={handleFinish}
              disabled={isSaving}
              className="w-full sm:w-auto min-w-[280px] h-12 px-7 rounded-2xl bg-gradient-to-r from-slate-950 to-indigo-900 hover:from-indigo-900 hover:to-slate-950 text-white font-bold text-sm shadow-[0_12px_30px_rgba(15,23,42,0.25)] transition-all duration-300 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2.5 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin"/>Saving Profile Details…</>
              ) : hasExistingProfile ? (
                <><Save className="w-4 h-4"/>Save Changes & View Transit Pass <Zap className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform"/></>
              ) : (
                <><Save className="w-4 h-4"/>Save & Generate Transit Pass <Zap className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform"/></>
              )}
            </button>
          </div>

        </div>
      )}

      {/* ── TRANSIT PASS ─────────────────────────────────────────────── */}
      {step === 'pass' && (
        <div className="w-full max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center gap-7">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/60 mb-3">
              <Star className="w-3.5 h-3.5 text-emerald-600"/>
              <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">
                {hasExistingProfile ? 'Transit Pass Active' : 'Transit Pass Generated!'}
              </span>
            </div>
            <h2 className="font-hero text-3xl sm:text-4xl font-extrabold text-slate-950">Your Career Transit Pass 🎉</h2>
            <p className="text-slate-500 text-sm mt-1.5">
              {hasExistingProfile
                ? 'Your transit pass is loaded and synced with your database profile.'
                : 'Profile saved to your account. Your career journey starts now.'}
            </p>
          </div>

          <div className="w-full">
            <div className="space-y-4">
              <Realistic3DCard
                data={profileToCardData(
                  {
                    personal,
                    education,
                    skills,
                    work_experience: workExp,
                    projects,
                    career_preferences: career,
                    pass_id: passId,
                  },
                  auth.currentUser?.uid || 'user',
                  currentUser
                )}
                theme={cardTheme}
              />

              {/* Theme Selector Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {(['creative-license', 'metro-taipei', 'jobtransit-obsidian', 'emerald-line'] as CardTheme[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCardTheme(t)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                      cardTheme === t
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white/60 text-slate-600 border-slate-200 hover:bg-white'
                    }`}
                  >
                    {t === 'creative-license'
                      ? 'Transit Pass'
                      : t === 'metro-taipei'
                      ? 'Taipei 48H'
                      : t === 'jobtransit-obsidian'
                      ? 'Cyber Obsidian'
                      : 'Emerald Line'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary info tiles */}
          <div className="w-full rounded-3xl bg-white/35 backdrop-blur-2xl border border-white/55 shadow-[0_16px_40px_rgba(15,23,42,0.08)] p-5 sm:p-6 grid grid-cols-2 gap-3">
            {[
              { icon: Mail,          label: 'Email',       value: personal.email },
              { icon: Phone,         label: 'Phone',       value: personal.phone_number || '—' },
              { icon: MapPin,        label: 'Location',    value: personal.location || '—' },
              { icon: GraduationCap, label: 'Education',   value: education.institution_name || '—' },
              { icon: Briefcase,     label: 'Experience',  value: `${personal.years_of_experience} yr${personal.years_of_experience===1?'':'s'}` },
              { icon: Target,        label: 'Work Mode',   value: career.preferred_work_mode },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/40 border border-white/50">
                <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0"/>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="text-xs font-semibold text-slate-800 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => setStep('personal')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/70 hover:bg-white border border-white text-slate-800 font-semibold text-sm shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-indigo-600"/>
              <span>Change Details</span>
            </button>
            <button
              type="button"
              onClick={() => { setUploadedFile(null); setStep('upload'); }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/70 hover:bg-white border border-white text-slate-800 font-semibold text-sm shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4 text-indigo-600"/>
              <span>Reupload Resume</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 h-12 rounded-2xl bg-gradient-to-r from-slate-950 to-indigo-900 hover:from-indigo-900 hover:to-slate-950 text-white font-bold text-sm shadow-[0_12px_30px_rgba(15,23,42,0.25)] transition-all duration-300 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <span>Go to Dashboard</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5"/>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


