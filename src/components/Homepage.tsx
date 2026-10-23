import React, { useState } from 'react'
import {
  Navbar,
  type NavTab,
  type UserProfile,
} from './Navbar'
import {
  ArrowRight,
  CheckCircle2,
  Bot,
  Database,
  Brain,
} from 'lucide-react'

interface HomepageProps {
  currentUser: UserProfile
  onLogout: () => void
}

const topRoles = [
  {
    rank: 1,
    title: 'Agentic AI Engineer',
    matchScore: 78,
    skillsToFill: '3 key skills to fill',
    badgeBg: 'bg-amber-400 text-slate-950',
    icon: Bot,
    iconBg: 'bg-amber-100/60 border-amber-300/50 text-amber-700',
    progressColor: 'bg-amber-500',
    skillsColor: 'text-amber-600',
    isBestMatch: true,
  },
  {
    rank: 2,
    title: 'Data Pipeline Engineer',
    matchScore: 72,
    skillsToFill: '4 key skills to fill',
    badgeBg: 'bg-emerald-500 text-white',
    icon: Database,
    iconBg: 'bg-emerald-100/60 border-emerald-300/50 text-emerald-700',
    progressColor: 'bg-emerald-500',
    skillsColor: 'text-emerald-600',
    isBestMatch: false,
  },
  {
    rank: 3,
    title: 'AI Engineer',
    matchScore: 68,
    skillsToFill: '5 key skills to fill',
    badgeBg: 'bg-purple-500 text-white',
    icon: Brain,
    iconBg: 'bg-purple-100/60 border-purple-300/50 text-purple-700',
    progressColor: 'bg-purple-500',
    skillsColor: 'text-purple-600',
    isBestMatch: false,
  },
]

export const Homepage: React.FC<HomepageProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('home')
  const [selectedRole, setSelectedRole] = useState<string>('Agentic AI Engineer')

  return (
    <div className="relative h-screen w-full bg-[#f8fafc] text-slate-900 font-sans overflow-y-auto overflow-x-hidden custom-scrollbar selection:bg-orange-500/20 selection:text-orange-900">
      {/* Ambient Glassmorphic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full bg-gradient-to-br from-blue-300/35 via-sky-200/25 to-transparent blur-[130px]" />
        <div className="absolute top-12 right-0 w-[620px] h-[620px] rounded-full bg-gradient-to-bl from-teal-200/35 via-sky-100/30 to-indigo-100/20 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[680px] h-[680px] rounded-full bg-gradient-to-bl from-teal-200/30 via-cyan-100/25 to-transparent blur-[140px]" />
        <div className="absolute -bottom-40 left-1/4 w-[740px] h-[740px] rounded-full bg-gradient-to-tr from-orange-200/20 via-amber-100/15 to-transparent blur-[150px]" />

        {/* Ambient Grid Matrix */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #0f172a 1.2px, transparent 1.2px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Top Glassmorphic Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      {/* Main Container */}
      <main className="relative z-10 pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 custom-scrollbar">
        {activeTab === 'home' && (
          <>
            {/* SECTION 2: HERO SECTION WITH DAILY NEWS CATCHUP ON RIGHT  */}
            <section id="hero" className="relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                
                {/* Left Column: Hero Narrative */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Welcome User Greeting */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/75 border border-white/85 shadow-sm backdrop-blur-md text-xs sm:text-sm font-semibold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Welcome, <span className="font-bold text-slate-950">{currentUser?.name || 'Explorer'}</span>!</span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="font-hero text-3xl sm:text-5xl lg:text-[3.65rem] font-extrabold tracking-tight text-slate-950 leading-[1.08]">
                    Your Next Move <br />
                    <span className="bg-gradient-to-r from-slate-950 via-slate-800 to-indigo-900 bg-clip-text text-transparent">
                      Starts Here.
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="font-hero text-base sm:text-xl font-semibold text-slate-800 leading-snug">
                    The tech industry never stands still. Neither should your career plan.
                  </p>

                  {/* Detailed Description */}
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                    Navigate changing AI trends, discover career paths that fit your skills, and find out what to learn next — all through your personalized Career Transit Map.
                  </p>

                  {/* CTA Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('transit')}
                      className="px-6 sm:px-7 py-3 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm shadow-[0_10px_25px_-5px_rgba(15,23,42,0.3)] transition-all cursor-pointer flex items-center gap-2.5 active:scale-95 group"
                    >
                      <span>Explore Your Transit Map</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('transit')}
                      className="px-6 sm:px-7 py-3 rounded-full bg-white/70 hover:bg-white/90 text-slate-900 font-semibold text-sm border border-white/90 shadow-sm backdrop-blur-md transition-all cursor-pointer active:scale-95"
                    >
                      Build My Transit Card
                    </button>
                  </div>

                  {/* Tagline / Sub-note */}
                  <div className="flex items-center gap-2 pt-1 text-xs font-medium text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your skills. Your next destination. A route that adapts.</span>
                  </div>
                </div>

                {/* Right Column: Daily News Catchup + Top 3 Roles For You */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Daily News Catchup Widget (Glassmorphism matching AuthModal) */}
                  <div className="rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(15,23,42,0.12)] p-5 sm:p-6 flex flex-col justify-between space-y-3.5 transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-1">
                      <span className="font-hero text-xs font-bold tracking-wider uppercase text-slate-600">
                        DAILY NEWS CATCHUP
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('catchup')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        View all
                      </button>
                    </div>

                    {/* Featured Item (Hermes 3 Release) */}
                    <div className="p-3.5 rounded-2xl bg-white/30 border border-white/40 backdrop-blur-md shadow-xs flex flex-col sm:flex-row items-start gap-3.5 hover:bg-white/40 transition-all">
                      {/* Graphic Thumbnail with Green Emerald 'H' */}
                      <div className="w-16 h-20 sm:w-18 sm:h-22 rounded-2xl bg-gradient-to-br from-emerald-100/80 via-teal-50/60 to-white/40 border border-emerald-300/50 backdrop-blur-md flex items-center justify-center shrink-0 relative overflow-hidden shadow-xs">
                        <div className="absolute inset-0 bg-emerald-400/10 blur-sm pointer-events-none" />
                        <span className="font-hero font-extrabold text-2xl sm:text-3xl text-emerald-700 tracking-tighter drop-shadow-sm">
                          H
                        </span>
                      </div>

                      {/* Text content */}
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-600 text-white tracking-wide shadow-xs">
                            NEW
                          </span>
                          <h4 className="font-hero text-xs sm:text-sm font-bold text-slate-950 tracking-tight">
                            HERMES 3 Released
                          </h4>
                        </div>

                        <p className="text-xs text-slate-700 leading-snug">
                          A new open LLM optimized for function calling and tool use in agents.
                        </p>

                        <p className="text-xs text-slate-600 leading-snug">
                          <span className="text-slate-900 font-semibold">Why it matters:</span> Better agent reliability and lower latency for real-world apps.
                        </p>

                        <div className="pt-0.5 text-[11px] text-slate-400">
                          Source: Nous Research Blog • May 18, 2025
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TOP 3 ROLES FOR YOU Widget (Glassmorphism matching AuthModal) */}
                  <div className="rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(15,23,42,0.12)] p-4 sm:p-5 flex flex-col justify-between space-y-3 transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-0.5">
                      <span className="font-hero text-xs font-bold tracking-wider uppercase text-slate-600">
                        TOP 3 ROLES FOR YOU
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('trend')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        View all
                      </button>
                    </div>

                    {/* Roles List with Transit Track */}
                    <div className="relative space-y-2">
                      {/* Transit line connecting numbered station stops */}
                      <div className="absolute left-[9px] top-3.5 bottom-3.5 w-[2px] bg-slate-300/60 pointer-events-none" />

                      {topRoles.map((role) => {
                        const IconComponent = role.icon
                        const isSelected = selectedRole === role.title

                        return (
                          <div
                            key={role.rank}
                            onClick={() => setSelectedRole(role.title)}
                            className={`relative z-10 flex items-center gap-2.5 sm:gap-3 p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white/45 border border-white/50 backdrop-blur-md shadow-xs'
                                : 'border border-transparent hover:bg-white/35 hover:border-white/30 backdrop-blur-xs'
                            }`}
                          >
                            {/* Rank Badge */}
                            <div className="flex items-center justify-center shrink-0">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shadow-xs ${role.badgeBg}`}
                              >
                                {role.rank}
                              </span>
                            </div>

                            {/* Role Icon */}
                            <div
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 backdrop-blur-md shadow-xs ${role.iconBg}`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>

                            {/* Role Details (Compact: Title, Tag & Skills To Fill) */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-hero text-xs sm:text-sm font-bold text-slate-900 truncate">
                                  {role.title}
                                </h4>
                                {role.isBestMatch && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 backdrop-blur-xs shrink-0">
                                    Best Match
                                  </span>
                                )}
                              </div>

                              {/* Skills to fill */}
                              <p className={`text-[11px] sm:text-xs font-medium ${role.skillsColor}`}>
                                {role.skillsToFill}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Footer Action */}
                    <div className="pt-1.5 border-t border-white/40">
                      <button
                        type="button"
                        onClick={() => setActiveTab('trend')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer flex items-center gap-1.5 group"
                      >
                        <span>Compare All Matches</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Global Footer Note */}
            <footer className="pt-10 pb-6 border-t border-slate-200/60 text-center text-xs text-slate-500 space-y-1">
              <p>© 2026 JobTransit Inc. Career navigation built for the AI transformation era.</p>
              <p>Your skills. Your next destination. A route that adapts.</p>
            </footer>
          </>
        )}
      </main>
    </div>
  )
}
