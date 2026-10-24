import React, { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Sparkles,
  Send,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Info,
  TrendingUp,
  GraduationCap,
  Zap,
  ShieldCheck,
  ArrowRight,
  Layers,
  Flame,
} from 'lucide-react'
import type {
  ChatMessage,
  QuickQuestionItem,
} from './types'
import {
  QUICK_QUESTIONS,
  fetchAIChatResponse,
} from './chatKnowledge'
import aiMascotImg from '../../assets/ai-mascot.png'

interface AIChatboxProps {
  isOpen: boolean
  onClose: () => void
  onNavigateTab?: (tab: 'home' | 'transit' | 'catchup' | 'trend' | 'profile') => void
  initialQuery?: string | null
}

export const AIChatbox: React.FC<AIChatboxProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-msg',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Welcome to JobTransit AI Market Intelligence Navigator.\n\nAll responses adhere to strict empirical hardness & data transparency guidelines, grounded in 210,000+ verified active LinkedIn postings.',
        structuredResponse: {
          headline: 'JobTransit AI Empirical Navigator',
          keyTakeaway:
            'Select any of the sample inquiries below, or ask any question about tech hiring trajectories, entry-level access, task automation, and skill replenishment.',
          transparencyAudit: {
            dataSource: '210,000+ Active Global Tech Postings across LinkedIn Indices',
            sampleSize: '210,000 listings benchmarked with live 24h velocity tracking (&f_TPR=r86400)',
            verifiedAt: 'October 2026 Pipeline Ingestion',
            confidenceScore: 94,
            confidenceLevel: 'High',
            methodology: 'Empirical token extraction, 24-hour replenishment velocity calculation, and human-core governance decoupled mapping.',
            knownLimitations: 'Quantifies active open requisitions and hiring intent; does not quantify stealth internal transfers.',
            linkedinVerificationUrl: 'https://www.linkedin.com/jobs/search?keywords=Software%20Engineer&location=Worldwide',
          },
          suggestedFollowUps: [
            'Are software engineering job opportunities increasing or decreasing?',
            'Are entry-level jobs disappearing, or are employers simply becoming more selective?',
            'Which tasks are companies automating with AI?',
          ],
        },
      },
    ]
  })

  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTransparencyModal, setShowTransparencyModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const lastInitialQueryRef = useRef<string | null>(null)

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim()
    if (!text || isTyping) return

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    }

    const historyPayload = messages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text,
    }))

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputValue('')
    setIsTyping(true)

    try {
      const aiResponse = await fetchAIChatResponse(text, historyPayload)
      setMessages((prev) => [...prev, aiResponse])
    } catch (err) {
      console.error('[AIChatbox] Failed to retrieve response:', err)
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'I encountered an issue connecting to the AI model. Please verify your connection or try again.',
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

  // Trigger initialQuery if provided and not yet sent
  useEffect(() => {
    if (isOpen && initialQuery && lastInitialQueryRef.current !== initialQuery) {
      lastInitialQueryRef.current = initialQuery
      handleSendMessage(initialQuery)
    }
  }, [isOpen, initialQuery])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSelectQuickQuestion = (q: QuickQuestionItem) => {
    handleSendMessage(q.question)
  }

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-cleared',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Chat history cleared. Select a quick research question or type below:',
      },
    ])
  }

  const getQuestionIcon = (iconName: QuickQuestionItem['iconName']) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
      case 'GraduationCap':
        return <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
      case 'Bot':
        return <Bot className="w-3.5 h-3.5 text-purple-600" />
      case 'Zap':
        return <Zap className="w-3.5 h-3.5 text-emerald-600" />
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5 text-orange-600" />
      case 'ShieldCheck':
        return <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
      default:
        return <Info className="w-3.5 h-3.5 text-stone-600" />
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop overlay for focus */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Main Chat Drawer / Modal Container */}
      <div
        className={`fixed z-50 transition-all duration-300 flex flex-col overflow-hidden bg-stone-50/95 backdrop-blur-2xl border border-stone-300 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)] ${
          isExpanded
            ? 'inset-3 sm:inset-6 md:inset-10 rounded-3xl'
            : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[500px] md:w-[560px] h-[86vh] sm:h-[700px] max-h-[88vh] rounded-3xl'
        }`}
      >
        {/* ── TOP HEADER BAR ── */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-stone-200 bg-white/70 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center p-0.5 shadow-md overflow-hidden group">
                <img
                  src={aiMascotImg}
                  alt="JobTransit AI Mascot"
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-signage text-base font-black text-stone-900 tracking-tight leading-none">
                  JobTransit AI Navigator
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-board font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  EMPIRICAL V3
                </span>
              </div>
              <p className="text-[11px] font-mono-board text-stone-500 mt-0.5 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Grounded in 210,000+ verified postings • High Transparency
              </p>
            </div>
          </div>

          {/* Action buttons on header */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowTransparencyModal(true)}
              className="p-1.5 rounded-xl hover:bg-stone-200/70 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              title="Inspect AI Guideline & Transparency Standards"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </button>

            <button
              type="button"
              onClick={handleClearChat}
              className="p-1.5 rounded-xl hover:bg-stone-200/70 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              title="Clear chat messages"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden sm:block p-1.5 rounded-xl hover:bg-stone-200/70 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              title={isExpanded ? 'Minimize view' : 'Maximize view'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-rose-100 text-stone-500 hover:text-rose-700 transition-colors cursor-pointer"
              title="Close chatbox"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── AI GUIDELINE & TRANSPARENCY NOTICE BANNER ── */}
        <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border-b border-stone-200 flex items-center justify-between text-[11px] font-mono-board text-stone-700">
          <div className="flex items-center gap-2 truncate">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">
              <strong>AI Guidelines Active:</strong> Hard empirical grounding • Zero ungrounded speculation
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowTransparencyModal(true)}
            className="text-amber-700 hover:text-amber-900 font-bold underline shrink-0 cursor-pointer ml-2"
          >
            Audit Standards
          </button>
        </div>

        {/* ── MESSAGE STREAM AREA ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-gradient-to-b from-stone-50 via-white to-stone-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Sender label and timestamp */}
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {msg.sender === 'ai' && (
                  <img
                    src={aiMascotImg}
                    alt="AI Mascot"
                    className="w-4 h-4 object-contain rounded-full"
                  />
                )}
                <span className="text-[10px] font-mono-board font-bold text-stone-400 uppercase">
                  {msg.sender === 'user' ? 'You' : 'JobTransit AI Navigator'}
                </span>
                <span className="text-[10px] font-mono-board text-stone-400">
                  {msg.timestamp}
                </span>
              </div>

              {/* Message Bubble Container */}
              <div
                className={`max-w-[94%] sm:max-w-[88%] rounded-2xl transition-all shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-stone-900 text-white px-4 py-3 rounded-tr-none'
                    : 'bg-white border-2 border-stone-200 text-stone-800 p-4 sm:p-5 rounded-tl-none space-y-4'
                }`}
              >
                {/* User Message Simple Text */}
                {msg.sender === 'user' && (
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                )}

                {/* AI Structured Grounded Response */}
                {msg.sender === 'ai' && (
                  <>
                    {/* Header & Key Takeaway */}
                    {msg.structuredResponse && (
                      <div className="space-y-2 pb-3 border-b border-stone-200">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-signage text-base sm:text-lg font-black text-stone-900 tracking-tight leading-snug">
                            {msg.structuredResponse.headline}
                          </h4>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyMessage(
                                msg.id,
                                `${msg.structuredResponse?.headline}\n\n${msg.structuredResponse?.keyTakeaway}`
                              )
                            }
                            className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors shrink-0"
                            title="Copy insight"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                          {msg.structuredResponse.keyTakeaway}
                        </p>
                      </div>
                    )}

                    {/* Fallback plain text if no structured response */}
                    {!msg.structuredResponse && (
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                        {msg.text}
                      </p>
                    )}

                    {/* Hardness Metrics Grid (Hard Empirical Data) */}
                    {msg.structuredResponse?.hardnessMetrics && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono-board text-stone-500 font-bold">
                          <span className="flex items-center gap-1 uppercase tracking-wider text-stone-400">
                            <Layers className="w-3 h-3 text-amber-600" />
                            Empirical Hard Metrics
                          </span>
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Verified Data
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {msg.structuredResponse.hardnessMetrics.map((metric, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl bg-stone-50 border border-stone-200 p-2.5 text-center space-y-0.5 shadow-2xs"
                            >
                              <div className="text-[10px] font-mono-board text-stone-500 truncate">
                                {metric.label}
                              </div>
                              <div className="font-signage text-base font-black text-stone-900 tracking-tight">
                                {metric.value}
                              </div>
                              {metric.badge && (
                                <div className="text-[9px] font-mono-board font-bold text-amber-800 bg-amber-100/70 rounded px-1 py-0.2 truncate">
                                  {metric.badge}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Task Breakdown Exposure List */}
                    {msg.structuredResponse?.taskBreakdown && (
                      <div className="space-y-2 pt-1">
                        <div className="text-[10px] font-mono-board font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                          <Bot className="w-3 h-3 text-purple-600" />
                          Task Exposure Taxonomy (Automated vs. Human Core)
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.structuredResponse.taskBreakdown.map((t, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border p-2.5 text-xs space-y-1 bg-stone-50/70 border-stone-200"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-stone-900 truncate">
                                  {t.task}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-mono-board font-bold uppercase shrink-0 ${
                                    t.tier === 'automated'
                                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                      : t.tier === 'assisted'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  }`}
                                >
                                  {t.tier === 'automated'
                                    ? 'Automated'
                                    : t.tier === 'assisted'
                                    ? 'Assisted'
                                    : 'Human Core'}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-600 leading-snug">
                                {t.detail}
                              </p>
                              <div className="text-[9px] font-mono-board text-stone-500 pt-0.5">
                                Gain: <strong>{t.efficiencyGain}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skill Highlights (Surging vs Deprecating) */}
                    {msg.structuredResponse?.skillHighlights && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-mono-board font-bold uppercase">
                            <Flame className="w-3 h-3 text-emerald-600" />
                            Surging & High-Frequency Skills
                          </div>
                          <ul className="space-y-1 text-xs text-emerald-950">
                            {msg.structuredResponse.skillHighlights.surging.map((s, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-xl bg-rose-50/60 border border-rose-200 p-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-rose-800 text-[10px] font-mono-board font-bold uppercase">
                            <X className="w-3 h-3 text-rose-600" />
                            Sunset & Decreasing Frequency
                          </div>
                          <ul className="space-y-1 text-xs text-rose-950">
                            {msg.structuredResponse.skillHighlights.deprecating.map((s, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* AI Transparency & Audit Card (Crucial for Transparency Guidelines) */}
                    {msg.structuredResponse?.transparencyAudit && (
                      <div className="rounded-xl bg-stone-100/90 border border-stone-300 p-3 space-y-2 text-stone-700 text-xs shadow-2xs">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono-board font-bold text-stone-600 uppercase">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Data Provenance & Reliability Audit
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono-board font-bold">
                            {msg.structuredResponse.transparencyAudit.confidenceScore}% Confidence (
                            {msg.structuredResponse.transparencyAudit.confidenceLevel})
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px] leading-relaxed">
                          <div>
                            <strong>Source Base:</strong>{' '}
                            {msg.structuredResponse.transparencyAudit.dataSource}
                          </div>
                          <div>
                            <strong>Sample & Recency:</strong>{' '}
                            {msg.structuredResponse.transparencyAudit.sampleSize} (
                            {msg.structuredResponse.transparencyAudit.verifiedAt})
                          </div>
                          <div>
                            <strong>Methodology:</strong>{' '}
                            {msg.structuredResponse.transparencyAudit.methodology}
                          </div>
                          {msg.structuredResponse.transparencyAudit.knownLimitations && (
                            <div className="text-stone-500 italic pt-0.5">
                              <strong>Caveat:</strong>{' '}
                              {msg.structuredResponse.transparencyAudit.knownLimitations}
                            </div>
                          )}
                        </div>

                        {/* Live Verification Link Button */}
                        {msg.structuredResponse.transparencyAudit.linkedinVerificationUrl && (
                          <div className="pt-1 flex items-center justify-between">
                            <a
                              href={
                                msg.structuredResponse.transparencyAudit
                                  .linkedinVerificationUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-mono-board text-blue-700 hover:text-blue-900 font-bold hover:underline"
                            >
                              <span>Verify live query on LinkedIn</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            {msg.structuredResponse.actionLink && onNavigateTab && (
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigateTab(msg.structuredResponse!.actionLink!.tab)
                                  onClose()
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-black text-white text-[10px] font-mono-board font-bold transition-all cursor-pointer shadow-xs"
                              >
                                <span>{msg.structuredResponse.actionLink.label}</span>
                                <ArrowRight className="w-3 h-3 text-amber-400" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Suggested Follow-Up Chips */}
                    {msg.structuredResponse?.suggestedFollowUps && (
                      <div className="pt-1 space-y-1.5">
                        <div className="text-[10px] font-mono-board font-bold uppercase tracking-wider text-stone-400">
                          Suggested Deep Dives:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.structuredResponse.suggestedFollowUps.map((prompt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSendMessage(prompt)}
                              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 text-[11px] font-medium transition-colors text-left cursor-pointer"
                            >
                              ↳ {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-stone-500 text-xs font-mono-board">
              <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center p-0.5 shadow-xs overflow-hidden shrink-0">
                <img src={aiMascotImg} alt="Mascot Thinking" className="w-full h-full object-contain animate-pulse" />
              </div>
              <span className="flex items-center gap-1">
                Querying empirical 210,000+ posting dataset & computing confidence...
                <span className="inline-flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </span>
              </span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ── BOTTOM INPUT BOX WITH UPPER SAMPLE INQUIRIES ── */}
        <div className="bg-white/95 border-t border-stone-200">
          {/* ── QUICK QUESTIONS HORIZONTAL SELECTOR (UPPER USER INPUT BOX) ── */}
          <div className="px-3 sm:px-4 py-2 border-b border-stone-200/70 bg-stone-100/60 overflow-x-auto scrollbar-none flex items-center gap-2">
            <span className="text-[10px] font-mono-board font-black text-stone-400 uppercase tracking-wider shrink-0 pl-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Sample Inquiries:
            </span>
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuickQuestion(q)}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-900 text-stone-700 hover:text-white border border-stone-300 hover:border-stone-900 text-xs font-mono-board transition-all shrink-0 flex items-center gap-1.5 shadow-2xs group cursor-pointer active:scale-95"
                title={q.question}
              >
                <span className="group-hover:scale-110 transition-transform">
                  {getQuestionIcon(q.iconName)}
                </span>
                <span className="font-semibold">{q.shortTitle}</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -ml-0.5 text-amber-400" />
              </button>
            ))}
          </div>

          <div className="p-3 sm:p-4 space-y-2">
            <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about hiring velocity, skill shifts, or entry barriers..."
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-100 border border-stone-300 focus:border-stone-900 focus:bg-white text-stone-900 placeholder-stone-400 text-xs sm:text-sm font-medium outline-hidden transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`p-2.5 rounded-2xl font-bold transition-all flex items-center justify-center shrink-0 shadow-sm cursor-pointer ${
                inputValue.trim() && !isTyping
                  ? 'bg-stone-900 hover:bg-black text-white hover:scale-105 active:scale-95'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Micro Footer Notice */}
          <div className="flex items-center justify-between text-[10px] font-mono-board text-stone-400 px-1">
            <span>Verified against LinkedIn Live & 24h &f_TPR=r86400 indices</span>
            <button
              type="button"
              onClick={() => setShowTransparencyModal(true)}
              className="text-stone-500 hover:text-stone-800 underline cursor-pointer"
            >
              AI Guideline & Hardness Info
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* ── MODAL: AI GUIDELINES & TRANSPARENCY AUDIT STANDARDS ── */}
      {showTransparencyModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-300 max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowTransparencyModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 text-stone-900">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-signage text-lg font-black text-stone-900 leading-tight">
                  JobTransit AI Transparency & Hardness Standard
                </h3>
                <p className="text-xs font-mono-board text-stone-500">
                  Ethical AI & Evidence-First Architecture
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-1">
                <strong className="text-amber-900 font-bold block">
                  1. Principle of Empirical Hardness
                </strong>
                <p className="text-amber-800">
                  Every trend, growth figure, and skill percentage presented by this chatbox is
                  anchored in quantitative data from our scraping pipeline across 210,000+ postings.
                  The AI is barred from providing ungrounded hype (e.g. "AI will replace all coders by next month").
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 space-y-1">
                <strong className="text-blue-900 font-bold block">
                  2. Full Provenance & Decoupled Classification
                </strong>
                <p className="text-blue-800">
                  We decouple technical maturity from market momentum. A technology is only labeled
                  "surging" if its 24-hour replenishment velocity surpasses the 50.0% benchmark
                  with multiple corroborating events.
                </p>
              </div>

              <div className="rounded-xl bg-stone-50 border border-stone-200 p-3 space-y-1">
                <strong className="text-stone-900 font-bold block">
                  3. Known Limitations & Caveats
                </strong>
                <ul className="list-disc list-inside space-y-1 text-stone-600">
                  <li>
                    <strong>Hiring Intent vs Reality:</strong> Job listings reflect what companies
                    are trying to hire, which includes speculative listings or ghost jobs.
                  </li>
                  <li>
                    <strong>Seniority inflation:</strong> Postings labeled "entry-level" may still
                    require 1-2 years of experience in the description body.
                  </li>
                  <li>
                    <strong>Regional variations:</strong> Global listings aggregate worldwide data,
                    with US, EMEA, and APAC exhibiting ±5% variance in adoption speeds.
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTransparencyModal(false)}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-mono-board font-bold transition-all cursor-pointer shadow-sm"
            >
              I Understand & Acknowledge
            </button>
          </div>
        </div>
      )}
    </>
  )
}
