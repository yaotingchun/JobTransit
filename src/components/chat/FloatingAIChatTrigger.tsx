import React from 'react'
import aiMascotImg from '../../assets/ai-mascot.png'

interface FloatingAIChatTriggerProps {
  isOpen: boolean
  onClick: () => void
  unreadCount?: number
}

export const FloatingAIChatTrigger: React.FC<FloatingAIChatTriggerProps> = ({
  isOpen,
  onClick,
}) => {
  if (isOpen) return null

  return (
    <aside aria-label="JobTransit AI Navigator shortcut" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center group">
      {/* Tooltip on hover on desktop */}
      <div className="hidden md:flex items-center mr-2 px-3 py-1 rounded-full bg-stone-900/90 text-white text-[11px] font-mono-board font-bold shadow-lg border border-stone-700/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 pointer-events-none">
        <span>Ask AI Navigator</span>
      </div>

      {/* Main Floating Button: PURE MASCOT ONLY (NO CIRCLE / NO CONTAINER) */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Open JobTransit AI Navigator"
        className="relative group/btn cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] hover:drop-shadow-[0_16px_32px_rgba(245,158,11,0.5)] focus:outline-hidden"
      >
        <img
          src={aiMascotImg}
          alt="JobTransit AI Mascot"
          className="w-18 h-18 sm:w-22 sm:h-22 object-contain transition-transform duration-300 group-hover/btn:-translate-y-1.5 group-hover/btn:rotate-3 select-none pointer-events-auto"
        />

        {/* Live pulsing online indicator dot positioned neatly on mascot */}
        <span className="absolute top-1 right-2 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-500/40 animate-pulse shadow-xs" />
      </button>
    </aside>
  )
}
