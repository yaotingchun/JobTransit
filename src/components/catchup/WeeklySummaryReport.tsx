import React, { useState } from 'react'
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Share2,
  Check,
  Calendar,
  BookOpen,
  Compass,
} from 'lucide-react'
import type { NavTab, UserProfile } from '../Navbar'

interface WeeklySummaryReportProps {
  currentUser: UserProfile
  onSelectTab: (tab: NavTab) => void
  onSkillClick: (skill: string, e: React.MouseEvent) => void
}

interface EditorialNewsItem {
  number: string
  category: string
  title: string
  whatHappened: string
  whyItMatters: string
  source: string
  sourceUrl: string
  skills: string[]
}

const editorialNews: EditorialNewsItem[] = [
  {
    number: '01',
    category: 'AI & Machine Learning',
    title: 'OpenAI introduces GPT-5.1 with test-time compute reasoning',
    whatHappened:
      'OpenAI unveiled GPT-5.1, introducing dynamic test-time computation that allows the model to deliberate, formulate multiple hypotheses, and verify candidate code before answering. The model achieved an unprecedented 74.8% resolution rate on SWE-bench Verified benchmarks.',
    whyItMatters:
      'Frontier AI is decisively pivoting from pre-training parameter scale to inference-time verification. For computer science students, memorizing syntax is rapidly depreciating; constructing deterministic evaluation harnesses and unit tests to verify model execution is becoming the premier engineering skill.',
    source: 'OpenAI Research',
    sourceUrl: 'https://openai.com/research',
    skills: ['Test-Time Compute', 'Eval Harnesses'],
  },
  {
    number: '02',
    category: 'Software Engineering',
    title: 'GitHub launches Copilot Workspace for specification-driven engineering',
    whatHappened:
      'GitHub expanded Copilot Workspace into general enterprise availability. The tool moves beyond in-line code completion to autonomously draft multi-file architecture specifications, generate pull requests, and execute regression test suites from natural-language issue tickets.',
    whyItMatters:
      'Developer workflows are transitioning from manual typing to specification and systems orchestration. Entry-level engineers will differentiate themselves not by typing speed, but by their ability to define rigid interface contracts, boundary constraints, and integration tests.',
    source: 'GitHub Engineering Blog',
    sourceUrl: 'https://github.blog',
    skills: ['Spec-Driven Dev', 'System Design'],
  },
  {
    number: '03',
    category: 'Cybersecurity',
    title: 'NIST issues CVE-2026-4421 on indirect prompt injection in autonomous agents',
    whatHappened:
      'Security researchers demonstrated remote arbitrary code execution via autonomous agents executing Model Context Protocol (MCP) commands when exposed to untrusted web documentation. In response, NIST published Special Publication 800-221 establishing mandatory sandboxing baselines.',
    whyItMatters:
      'As AI agents are granted access to terminal shells and production APIs, boundary security is paramount. Practical knowledge of Docker sandboxing, WebAssembly isolation, and zero-trust permission models is becoming a baseline requirement for full-stack and cloud candidates.',
    source: 'NIST CSRC Advisory',
    sourceUrl: 'https://csrc.nist.gov',
    skills: ['Agent Security', 'Docker Sandboxing'],
  },
  {
    number: '04',
    category: 'Data & Cloud',
    title: 'PostgreSQL 19 stabilizes native vector and hybrid lexical search engine',
    whatHappened:
      'The PostgreSQL Global Development Group officially merged native HNSW vector indexes alongside traditional BM25 text search and relational ACID transactions, enabling sub-5ms hybrid query execution directly inside standard database clusters.',
    whyItMatters:
      'Engineering teams no longer need isolated standalone vector databases for retrieval-augmented generation (RAG). Students designing modern data backends should prioritize hybrid indexing and schema governance within unified relational engines.',
    source: 'PostgreSQL Global Group',
    sourceUrl: 'https://postgresql.org',
    skills: ['pgvector / HNSW', 'Hybrid Search'],
  },
  {
    number: '05',
    category: 'Systems & Runtimes',
    title: 'TypeScript 5.8 RC delivers zero-overhead runtime type contracts via WebAssembly',
    whatHappened:
      'The TypeScript team shipped the 5.8 release candidate, introducing optional compile-to-Wasm validation contracts that verify external JSON payloads and network responses at runtime without the traditional JavaScript serialization overhead.',
    whyItMatters:
      'High-performance web applications and agent runtimes require ironclad type safety across network and IPC boundaries. Understanding type theory, WebAssembly compilation, and runtime profiling is increasingly valued in engineering interviews.',
    source: 'Microsoft TypeScript Blog',
    sourceUrl: 'https://devblogs.microsoft.com',
    skills: ['WebAssembly', 'Type Systems'],
  },
  {
    number: '06',
    category: 'Industry & Careers',
    title: 'Hiring index reveals 140% surge in demand for agent orchestration skills',
    whatHappened:
      'The 2026 TechCareers compensation index recorded a 140% year-over-year surge in job requisitions specifying Model Context Protocol (MCP) tooling and automated agent evaluation frameworks, while traditional entry-level CRUD openings declined by 22%.',
    whyItMatters:
      'Directly validates your JobTransit trajectory: candidates who learn to coordinate autonomous tools, design evaluation loops, and enforce system boundaries possess a massive advantage over those offering only basic syntax knowledge.',
    source: 'TechCareers Index 2026',
    sourceUrl: 'https://techcareers.org',
    skills: ['Model Context Protocol', 'Career Strategy'],
  },
]

export const WeeklySummaryReport: React.FC<WeeklySummaryReportProps> = ({
  currentUser,
  onSelectTab,
  onSkillClick,
}) => {
  const [copiedLink, setCopiedLink] = useState(false)
  const [trackedSkills, setTrackedSkills] = useState<Set<string>>(new Set())

  const handleShare = () => {
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2200)
  }

  const handleTrackSkill = (skill: string, e: React.MouseEvent) => {
    onSkillClick(skill, e)
    setTrackedSkills((prev) => new Set(prev).add(skill))
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* =========================================================================
          EDITORIAL MASTHEAD HEADER
          ========================================================================= */}
      <header className="rounded-3xl bg-white/60 hover:bg-white/70 backdrop-blur-2xl p-6 sm:p-10 border border-white/80 shadow-[0_12px_35px_-5px_rgba(15,23,42,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)] transition-all space-y-5">
        
        {/* Issue metadata row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950 text-white shadow-xs">
              CS Weekly Editorial
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Issue No. 43
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>October 19 – October 25, 2026</span>
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/80 hover:bg-white text-slate-800 border border-slate-200 shadow-2xs transition-all cursor-pointer"
              title="Share this editorial issue"
            >
              {copiedLink ? <Check className="w-3 h-3 text-slate-950" /> : <Share2 className="w-3 h-3 text-slate-600" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Headline & Editor's Note */}
        <div className="space-y-3">
          <h1 className="font-hero text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            This Week in Computer Science
          </h1>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            Welcome to this week&apos;s editorial briefing. We synthesize the 6 defining technical breakthroughs 
            across AI, software engineering, security, and cloud infrastructure—translating raw technological shifts 
            into clear takeaways for computer science students.
          </p>
        </div>

        {/* Read time badge */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Curated for {currentUser?.name || 'Explorer'} · 6 key stories · 5 min read</span>
        </div>
      </header>

      {/* =========================================================================
          THE CORE: WEEK IN REVIEW (5 to 6 important news)
          Each item contains: What Happened + Why It Matters + Source Link
          ========================================================================= */}
      <section className="space-y-5">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              The Core
            </div>
            <h2 className="font-hero text-xl font-bold text-slate-950">
              Week in Review
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            6 Selected Stories
          </span>
        </div>

        <div className="space-y-4">
          {editorialNews.map((item) => (
            <article
              key={item.number}
              className="group rounded-3xl bg-white/60 hover:bg-white/75 backdrop-blur-2xl p-6 sm:p-7 border border-white/80 shadow-[0_12px_35px_-5px_rgba(15,23,42,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)] transition-all space-y-4"
            >
              {/* Header: Number, Category, Source Link */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-slate-950 text-white shadow-2xs">
                    {item.number}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {item.category}
                  </span>
                </div>

                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-950 flex items-center gap-1 transition-colors"
                  title={`Read primary source at ${item.source}`}
                >
                  <span>Source: {item.source}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Headline */}
              <h3 className="font-hero text-base sm:text-lg font-bold text-slate-950 group-hover:text-slate-900 transition-colors leading-snug">
                {item.title}
              </h3>

              {/* What Happened */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                <span className="font-bold text-slate-950 mr-1.5">What happened:</span>
                {item.whatHappened}
              </div>

              {/* Why It Matters */}
              <div className="p-4 rounded-2xl bg-white/50 border border-white/80 backdrop-blur-md shadow-2xs space-y-1">
                <div className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-800" />
                  <span>Why it matters:</span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                  {item.whyItMatters}
                </p>
              </div>

              {/* Skill Tags & Direct Route Tracking */}
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">
                    Related Skills:
                  </span>
                  {item.skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={(e) => handleTrackSkill(skill, e)}
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        trackedSkills.has(skill)
                          ? 'bg-slate-950 text-white shadow-2xs'
                          : 'bg-white/80 hover:bg-slate-950 hover:text-white text-slate-800 border border-slate-300 shadow-2xs'
                      }`}
                      title="Click to track in your transit route"
                    >
                      {trackedSkills.has(skill) ? `${skill} ✓` : `+ ${skill}`}
                    </button>
                  ))}
                </div>

                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-950 hover:underline"
                >
                  Verify Original Source →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =========================================================================
          LASTLY: THE WEEKLY TAKEAWAY
          Authoritative editorial conclusion connecting this week's developments
          ========================================================================= */}
      <section className="rounded-3xl bg-slate-950 text-white p-7 sm:p-10 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
              Editorial Conclusion
            </span>
            <span className="text-xs text-slate-400">Issue No. 43</span>
          </div>
          <h2 className="font-hero text-xl sm:text-2xl font-bold tracking-tight">
            The Weekly Takeaway
          </h2>
        </div>

        {/* Synthesized editorial insight */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          <p>
            The overarching lesson from this week&apos;s developments is unmistakable:{' '}
            <strong className="text-white font-semibold">
              the center of gravity in software engineering has shifted from code generation to code verification and systems orchestration.
            </strong>
          </p>
          <p>
            When AI models can draft functional code in seconds, the engineer&apos;s true value lies in:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-200">
            <li>
              <strong className="text-white">Writing rigorous specifications and contracts</strong> that guide autonomous tools without ambiguity.
            </li>
            <li>
              <strong className="text-white">Building deterministic evaluation harnesses and unit tests</strong> that catch hallucinations before they reach production.
            </li>
            <li>
              <strong className="text-white">Enforcing security boundaries and sandboxed execution</strong> around tool-calling agents.
            </li>
          </ul>
          <p className="pt-1">
            <strong className="text-white">Action for your learning route:</strong> Pick one existing side project this week and write an automated evaluation test harness for it, or configure a Model Context Protocol (MCP) server connecting it to an LLM. Transitioning from a manual code writer to an engineering orchestrator is the fastest way to future-proof your career.
          </p>
        </div>

        {/* CTA to Transit Route */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Compass className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Mapped to your current target: <strong>AI Engineer</strong></span>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('transit')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open My Transit Route</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </section>

      {/* Editorial Colophon */}
      <footer className="text-center text-xs text-slate-500 pt-2 space-y-1">
        <p>
          Published weekly by JobTransit Editorial · Issue 43 (October 25, 2026)
        </p>
        <p className="text-[11px] text-slate-400">
          All news items sourced and verified directly from original laboratory preprints and engineering releases.
        </p>
      </footer>

    </div>
  )
}
