import { ArrowUpRight, LogOut } from 'lucide-react'
import logoImg from '../assets/JobTransitLogo.png'

interface UserProfile {
  name: string
  email: string
}

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'signup') => void
  currentUser?: UserProfile | null
  onLogout?: () => void
  onDemoLogin?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  currentUser = null,
  onLogout,
  onDemoLogin,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-6 sm:px-10 lg:px-16 pt-6 sm:pt-8 flex items-center justify-between pointer-events-none">
      {/* Brand Logo & Name - Clean, without any surrounding glass container */}
      <div className="pointer-events-auto flex items-center gap-3 select-none transition-transform duration-300 hover:scale-[1.02]">
        <img
          src={logoImg}
          alt="JobTransit Logo"
          className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
        />
        <span className="font-hero text-lg sm:text-2xl font-bold tracking-tight text-[#111827]">
          JobTransit
        </span>
      </div>

      {/* Top Right Actions */}
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
        {currentUser ? (
          /* Logged In User Pill */
          <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full glass-panel border border-white/40 shadow-sm backdrop-blur-md">
            <div className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs font-bold">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-900 pr-1">
              {currentUser.name}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="p-1 rounded-full hover:bg-white/40 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            {/* Quick 3D Pass Experience Button */}
            <button
              type="button"
              onClick={onDemoLogin}
              className="group inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold text-orange-950 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 hover:brightness-105 border border-orange-300/80 shadow-[0_4px_16px_rgba(249,115,22,0.3)] cursor-pointer transition-all duration-300 active:scale-95"
              aria-label="3D Travel Pass"
            >
              <span>3D Travel Pass 🚀</span>
            </button>

            {/* Get Started Glassmorphism Button */}
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="group relative inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-base font-semibold text-slate-900 glass-btn cursor-pointer transition-all duration-300"
              aria-label="Get Started"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-4 h-4 text-slate-800 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/25 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
