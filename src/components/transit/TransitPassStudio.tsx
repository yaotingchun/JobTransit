import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Realistic3DCard,
  type Realistic3DCardRef,
} from './Realistic3DCard'
import {
  type CardPassData,
  type CardTheme,
} from './types'
import type { UserProfile } from '../Navbar'
import {
  ensureFirebaseAuth,
  saveCardDataToFirebase,
  getCardDataFromFirebase,
  subscribeCardDataFromFirebase,
  profileToCardData,
  DEMO_UID,
} from '../../lib/cardFirebase'
import { CareerReceipt } from './CareerReceipt'
import {
  RotateCw,
  Play,
  Square,
  Sparkles,
  Layers,
  Copy,
  Check,
  Wifi,
  Info,
  Sliders,
  CheckCircle2,
  Compass,
  Cloud,
  Save,
  Loader2,
  FileText,
} from 'lucide-react'

interface TransitPassStudioProps {
  currentUser: UserProfile
  onNavigateHome?: () => void
}

export const TransitPassStudio: React.FC<TransitPassStudioProps> = ({
  currentUser,
}) => {
  const cardRef = useRef<Realistic3DCardRef>(null)

  // ── Card State ──
  const theme: CardTheme = 'creative-license'
  const [isFlipped, setIsFlipped] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showGlare, setShowGlare] = useState(true)
  const [copied, setCopied] = useState(false)
  const [nfcTapped, setNfcTapped] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [activeTab, setActiveTab] = useState<'controls' | 'stats' | 'personalize'>('controls')

  // ── Firebase Sync State ──
  const [firebaseStatus, setFirebaseStatus] = useState<'syncing' | 'synced' | 'saving' | 'offline'>('syncing')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [userId, setUserId] = useState<string>('')

  // Card Data state initialized directly from user profile
  const [cardData, setCardData] = useState<CardPassData>(() => {
    return profileToCardData({}, '', currentUser)
  })

  // ── 1. Fetch & Subscribe to Firebase Firestore ──
  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const initFirebase = async () => {
      try {
        setFirebaseStatus('syncing')
        // Ensure user is signed in to Firebase Auth
        const uid = await ensureFirebaseAuth()
        setUserId(uid)

        // Initial fetch from Firestore (merges users/{uid}/profile/main and users/{uid}/card/main)
        const cloudData = await getCardDataFromFirebase(uid, currentUser)
        if (cloudData) {
          setCardData(cloudData)
          // Persist back to Firestore so users/{uid}/card/main is 100% in sync with profile
          await saveCardDataToFirebase(uid, cloudData)
        }
        setFirebaseStatus('synced')

        // Real-time listener for live updates from Firestore
        unsubscribe = subscribeCardDataFromFirebase(uid, (updatedData) => {
          setCardData((prev) => ({
            ...prev,
            ...updatedData,
          }))
          setFirebaseStatus('synced')
        }, currentUser)
      } catch (err) {
        console.warn('Firebase sync warning:', err)
        setFirebaseStatus('offline')
      }
    }

    initFirebase()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [currentUser])

  // ── 2. Save Card Data to Firebase ──
  const handleSaveToCloud = useCallback(async (dataToSave?: CardPassData) => {
    const payload = dataToSave || cardData
    const uid = userId || DEMO_UID
    if (!uid) return

    setFirebaseStatus('saving')
    try {
      await saveCardDataToFirebase(uid, payload)
      setFirebaseStatus('synced')
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch (err) {
      console.error('Failed to save to Firebase:', err)
      setFirebaseStatus('offline')
    }
  }, [cardData, userId])

  // Debounced auto-sync when fields update in personalize tab
  const handleUpdateField = (field: keyof CardPassData, value: any) => {
    setCardData((prev) => {
      const updated = { ...prev, [field]: value }
      // Auto-derive firstName if holderName changes
      if (field === 'holderName') {
        updated.firstName = String(value).split(' ')[0].toUpperCase()
      }
      return updated
    })
  }

  // Simulated NFC Tap feedback
  const handleNfcTap = () => {
    setNfcTapped(true)
    setTimeout(() => setNfcTapped(false), 2400)
  }

  const handleCopyPassId = () => {
    navigator.clipboard?.writeText(cardData.passId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative w-full min-h-screen py-4 sm:py-6 space-y-10">
      {/* ── Studio Header ── */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold tracking-wide uppercase backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Interactive 3D Physical Card Simulation</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="flex items-center gap-1 text-[11px] font-semibold lowercase">
            {firebaseStatus === 'saving' ? (
              <span className="text-amber-600 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> saving to firebase
              </span>
            ) : firebaseStatus === 'synced' ? (
              <span className="text-emerald-700 flex items-center gap-1 font-mono">
                <Cloud className="w-3 h-3 text-emerald-600" /> firebase synced
              </span>
            ) : (
              <span className="text-slate-500">local storage</span>
            )}
          </span>
        </div>

        <h1 className="font-hero text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Your Career & Travel{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-orange-600">
            Pass
          </span>
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Experience our physical 3D card engine with real spatial depth, dual-sided architecture,
          specular reflections, dynamic floor shadows, continuous 360° spin, and real-time Firebase cloud storage.
        </p>
      </div>

      {/* ── Main Stage Area: 3D Card Showcase ── */}
      <div className="relative max-w-4xl mx-auto">
        {/* Ambient Glow behind Card */}
        <div className="absolute inset-0 rounded-3xl blur-[100px] opacity-25 pointer-events-none transition-colors duration-700 bg-gradient-to-tr from-emerald-500 via-orange-400 to-teal-500" />

        {/* NFC Tap Celebration Banner if active */}
        {nfcTapped && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 animate-bounce">
            <div className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 border border-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>LICENSE VERIFIED • FULL TRANSIT ACCESS GRANTED</span>
            </div>
          </div>
        )}

        {/* ── THE 3D CARD ── */}
        <div className="relative z-10">
          <Realistic3DCard
            ref={cardRef}
            data={cardData}
            theme={theme}
            showGlare={showGlare}
            isSpinning={isSpinning}
            onSpinChange={setIsSpinning}
            isFlipped={isFlipped}
            onFlipChange={setIsFlipped}
            onNfcTap={handleNfcTap}
          />
        </div>

        {/* ── Primary Floating 3D User Controls Bar ── */}
        <div className="relative z-20 -mt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4">
          {/* Flip Button */}
          <button
            type="button"
            onClick={() => cardRef.current?.flip()}
            className="px-4 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-slate-800 font-semibold text-xs sm:text-sm border border-slate-200/80 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Flip to opposite face"
          >
            <RotateCw className="w-4 h-4 text-emerald-600" />
            <span>Flip Card ({isFlipped ? 'Back Face' : 'Front Face'})</span>
          </button>

          {/* Spin / Stop Spin Button */}
          <button
            type="button"
            onClick={() => {
              if (isSpinning) {
                cardRef.current?.stopSpin()
              } else {
                cardRef.current?.startSpin()
              }
            }}
            className={`px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm border shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
              isSpinning
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-emerald-500/25'
                : 'bg-white/90 hover:bg-white text-slate-800 border-slate-200/80 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'
            }`}
            title="Start or stop smooth 360-degree rotation"
          >
            {isSpinning ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Spin</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-emerald-600" />
                <span>Spin Card 360°</span>
              </>
            )}
          </button>

          {/* Reset View Button */}
          <button
            type="button"
            onClick={() => cardRef.current?.reset()}
            className="px-3.5 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200/80 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Reset viewing angle to default"
          >
            <Compass className="w-4 h-4 text-slate-500" />
            <span>Reset View</span>
          </button>

          {/* Glare Toggle */}
          <button
            type="button"
            onClick={() => setShowGlare((prev) => !prev)}
            className={`px-3 py-2.5 rounded-2xl font-semibold text-xs border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              showGlare
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white/70 border-slate-200 text-slate-500'
            }`}
            title="Toggle specular plastic glare reflection"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Luster Glare</span>
            <span>{showGlare ? 'ON' : 'OFF'}</span>
          </button>

          {/* Show all Details (Receipt) Button */}
          <button
            type="button"
            onClick={() => setShowReceipt((prev) => !prev)}
            className={`px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs ${
              showReceipt
                ? 'bg-slate-900 text-white border-slate-900 shadow-slate-900/20'
                : 'bg-white/90 hover:bg-white text-slate-800 border-slate-200/80 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'
            }`}
            title="Show all pass credentials in authentic thermal receipt style"
          >
            <FileText className={`w-4 h-4 ${showReceipt ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>{showReceipt ? 'Hide Details' : 'Show all Details'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold uppercase border ${
              showReceipt
                ? 'bg-white/20 text-emerald-300 border-white/30'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
            }`}>
              Receipt
            </span>
          </button>
        </div>

        {/* Receiptify Style Receipt Display */}
        {showReceipt && (
          <div className="relative z-20 max-w-xl mx-auto my-6 px-4">
            <CareerReceipt
              cardData={cardData}
              onClose={() => setShowReceipt(false)}
            />
          </div>
        )}
      </div>

      {/* ── Studio Customizer & Information Dashboard ── */}
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl border border-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] overflow-hidden">
        {/* Navigation Tabs inside Drawer */}
        <div className="flex border-b border-slate-200/80 px-6 pt-4 gap-6 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('controls')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'controls'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Transit Pass Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Card Credentials</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('personalize')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'personalize'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Personalize & Sync</span>
          </button>
        </div>

        {/* Tab 1: Transit Pass Overview */}
        {activeTab === 'controls' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-hero text-base font-bold text-slate-900">
                Official Career Metro Transit Pass
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Unified rapid transit pass verified across all routes, stations, and skill terminals.
              </p>
            </div>

            <div className="max-w-xl">
              <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-400/20 text-left">
                <div className="w-full h-12 rounded-xl bg-amber-400 border border-stone-800 flex items-center justify-between px-3 text-stone-950 mb-3 shadow-inner">
                  <span className="font-signage font-black text-sm text-stone-950 truncate">{cardData.roleTitle || 'CAREER METRO'}</span>
                  <span className="font-mono-board font-black text-xs text-stone-950">ZONE 1 • ALL LINES</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                  <span>Career Metro Pass (Official Edition)</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Official Career Metro design with transit line badges, 10-segment gauges, transparent barcode, dual-sided 3D architecture, and verified credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Card Credentials & Details */}
        {activeTab === 'stats' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  License Number
                </span>
                <span className="font-mono text-sm font-bold text-slate-800 block mt-1 truncate">
                  {cardData.licenseNumber}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Validity Status
                </span>
                <span className="text-xs font-bold text-emerald-700 block mt-1">
                  {cardData.validity}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Cardholder Role
                </span>
                <span className="text-sm font-bold text-slate-800 block mt-1 truncate">
                  {cardData.roleBadge}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Expertise
                </span>
                <span className="text-xs font-bold text-slate-800 block mt-1 truncate">
                  {cardData.expertise}
                </span>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyPassId}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Serial Copied!' : 'Copy Serial Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleNfcTap}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulate Contactless Tap</span>
              </button>

              <div className="ml-auto flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>ISO 7810 ID-1 Standard</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Personalize & Firebase Cloud Sync */}
        {activeTab === 'personalize' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h4 className="font-hero text-sm font-bold text-slate-900">
                  Edit Card Data & Sync with Cloud
                </h4>
                <p className="text-xs text-slate-500">
                  All updates are stored in Firebase Firestore and reflected live on your 3D card.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSaveToCloud()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved to Firebase!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to Firebase</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cardholder Name (Displayed on Card)
                </label>
                <input
                  type="text"
                  value={cardData.holderName}
                  onChange={(e) => handleUpdateField('holderName', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="Alex"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  value={cardData.licenseNumber}
                  onChange={(e) => handleUpdateField('licenseNumber', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="0051"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  value={cardData.occupation}
                  onChange={(e) => handleUpdateField('occupation', e.target.value.toUpperCase())}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="CREATIVE USER"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role Header Badge
                </label>
                <input
                  type="text"
                  value={cardData.roleBadge}
                  onChange={(e) => handleUpdateField('roleBadge', e.target.value.toUpperCase())}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="GRAPHIC USER"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expertise
                </label>
                <input
                  type="text"
                  value={cardData.expertise}
                  onChange={(e) => handleUpdateField('expertise', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="3D ARTIST & VISUAL DESIGNER"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={cardData.nationality}
                  onChange={(e) => handleUpdateField('nationality', e.target.value.toUpperCase())}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="MALAYSIA"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone (Card Back)
                </label>
                <input
                  type="text"
                  value={cardData.phone}
                  onChange={(e) => handleUpdateField('phone', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="+91 94960 33887"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Email (Card Back)
                </label>
                <input
                  type="text"
                  value={cardData.email}
                  onChange={(e) => handleUpdateField('email', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="xyncatalyst51@gmail.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instagram Handle (Card Back)
                </label>
                <input
                  type="text"
                  value={cardData.instagram}
                  onChange={(e) => handleUpdateField('instagram', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="@sreerag_OS"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Changes reflect live on both the front and back surfaces of the 3D card and are persisted to Firebase.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
