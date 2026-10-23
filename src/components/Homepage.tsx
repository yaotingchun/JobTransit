import React, { useState } from 'react'
import {
  Navbar,
  type NavTab,
  type UserProfile,
} from './Navbar'

interface HomepageProps {
  currentUser: UserProfile
  onLogout: () => void
}

export const Homepage: React.FC<HomepageProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('home')

  return (
    <div className="relative h-screen w-full bg-slate-100 text-slate-900 font-sans overflow-y-auto overflow-x-hidden custom-scrollbar selection:bg-orange-500/20 selection:text-orange-900">
      {/* Ambient Glassmorphic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-300/30 via-indigo-200/20 to-transparent blur-[120px]" />
        <div className="absolute top-1/4 -right-40 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-cyan-200/35 via-teal-100/20 to-transparent blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-orange-200/25 via-amber-100/15 to-transparent blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #0f172a 1px, transparent 1px)',
            backgroundSize: '24px 24px',
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

      {/* Main Content Area - Kept Empty */}
      <main className="relative z-10 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto custom-scrollbar">
        {/* Tab content currently empty as requested */}
      </main>
    </div>
  )
}
