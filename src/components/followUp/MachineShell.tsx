import React from 'react'

interface MachineShellProps {
  children: React.ReactNode
  headerNode?: React.ReactNode
}

export const MachineShell: React.FC<MachineShellProps> = ({ children, headerNode }) => {
  return (
    <div className="relative h-screen w-full bg-[#f8fafc] text-slate-900 font-sans overflow-y-auto overflow-x-hidden custom-scrollbar selection:bg-blue-500/20 selection:text-blue-900">
      {/* Ambient Glassmorphic Background Elements (Identical to Homepage) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full bg-gradient-to-br from-blue-300/35 via-sky-200/25 to-transparent blur-[130px]" />
        <div className="absolute top-12 right-0 w-[620px] h-[620px] rounded-full bg-gradient-to-bl from-teal-200/35 via-sky-100/30 to-indigo-100/20 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[680px] h-[680px] rounded-full bg-gradient-to-bl from-teal-200/30 via-cyan-100/25 to-transparent blur-[140px]" />
        <div className="absolute -bottom-40 left-1/4 w-[740px] h-[740px] rounded-full bg-gradient-to-tr from-sky-200/20 via-blue-100/15 to-transparent blur-[150px]" />

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

      {/* Top Navbar */}
      {headerNode}

      {/* Main Container */}
      <main className="relative z-10 pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        {/* Compact Page Introduction (Left-aligned) */}
        <div className="space-y-1 max-w-2xl text-left">
          <h1 className="font-hero text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 leading-tight">
            Build Your Transit Card
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-normal max-w-xl">
            A few quick questions to personalize your career route.
          </p>
        </div>

        {/* Main Workspace Slot */}
        {children}
      </main>
    </div>
  )
}
