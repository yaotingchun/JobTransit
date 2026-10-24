import React, { useState, useRef, useLayoutEffect } from 'react'
import {
  Home,
  Route,
  Sparkles,
  TrendingUp,
  Bell,
  LogOut,
  Menu,
  X,
  Compass,
} from 'lucide-react'
import logoImg from '../assets/JobTransitLogo.png'

export type NavTab = 'home' | 'transit' | 'catchup' | 'trend' | 'profile'

export interface UserProfile {
  name: string
  email: string
}

export interface NavbarProps {
  activeTab?: NavTab | null | string
  onSelectTab: (tab: NavTab) => void
  currentUser: UserProfile
  onLogout: () => void
}

interface NavItemConfig {
  id: NavTab
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  badgeType?: 'count' | 'pulse' | 'sparkle'
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dockRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number
    top: number
    width: number
    height: number
    ready: boolean
  }>({ left: 0, top: 0, width: 0, height: 0, ready: false })

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const currentTabEl = activeTab ? tabRefs.current[activeTab] : null
      const dockEl = dockRef.current
      if (currentTabEl && dockEl) {
        const dockRect = dockEl.getBoundingClientRect()
        const tabRect = currentTabEl.getBoundingClientRect()
        setIndicatorStyle({
          left: tabRect.left - dockRect.left,
          top: tabRect.top - dockRect.top,
          width: tabRect.width,
          height: tabRect.height,
          ready: true,
        })
      }
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeTab])

  const navItems: NavItemConfig[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'transit',
      label: 'Transit',
      icon: Route,
    },
    {
      id: 'catchup',
      label: 'Updates',
      icon: Sparkles,
      badge: '3',
      badgeType: 'count',
    },
    {
      id: 'trend',
      label: 'Trend',
      icon: TrendingUp,
      badgeType: 'pulse',
    },
  ]

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
      {/* Floating Glassmorphic Top Navbar Container */}
      <nav className="max-w-7xl mx-auto rounded-3xl glass-nav-bar px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
        {/* Left: Brand Identity */}
        <div
          onClick={() => handleTabClick('home')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group transition-transform duration-200 hover:scale-[1.02]"
        >
          <div className="relative">
            <img
              src={logoImg}
              alt="JobTransit Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-sm transition-transform duration-300 group-hover:rotate-6"
            />
            {/* Live activity indicator dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/30" />
          </div>

          <div className="flex flex-col">
            <span className="font-hero text-lg sm:text-xl font-bold tracking-tight text-slate-950 leading-none">
              JobTransit
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 mt-0.5 flex items-center gap-1">
              <Compass className="w-2.5 h-2.5 text-blue-600" />
              Career Navigator
            </span>
          </div>
        </div>

        {/* Center: Glass Segmented Navigation Pill Dock (Desktop & Tablet) */}
        <div className="hidden md:flex items-center">
          <div
            ref={dockRef}
            className="glass-pill-dock p-1.5 rounded-full flex items-center gap-1 shadow-inner relative"
          >
            {/* Sliding Active Pill Background */}
            <div
              className={`absolute top-0 left-0 rounded-full glass-pill-active pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                indicatorStyle.ready ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: `translate3d(${indicatorStyle.left}px, ${indicatorStyle.top}px, 0)`,
                width: `${indicatorStyle.width}px`,
                height: `${indicatorStyle.height}px`,
              }}
            >
              {/* Active highlight reflection glow */}
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-slate-950/40" />
            </div>

            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    tabRefs.current[item.id] = el
                  }}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`group relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer select-none ${
                    isActive
                      ? 'text-slate-950 font-bold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/25'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isActive
                        ? 'text-slate-950 stroke-[2.3]'
                        : 'text-slate-500 group-hover:text-slate-900 group-hover:scale-110'
                    }`}
                  />
                  <span>{item.label}</span>

                  {/* Badges */}
                  {item.badgeType === 'count' && item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-tighter transition-colors duration-200 ${
                        isActive
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-100 text-amber-800 border border-amber-300/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.badgeType === 'pulse' && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Notifications, User Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">


          {/* Notifications Glass Button */}
          <button
            type="button"
            onClick={() => handleTabClick('catchup')}
            className="relative p-2 rounded-full bg-white/30 hover:bg-white/60 border border-white/50 text-slate-700 hover:text-slate-950 transition-all cursor-pointer backdrop-blur-md active:scale-95"
            title="3 new skill updates"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
          </button>

          {/* User Profile Pill */}
          <button
            type="button"
            onClick={() => handleTabClick('profile')}
            className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full transition-all cursor-pointer select-none border backdrop-blur-md active:scale-98 ${
              activeTab === 'profile'
                ? 'bg-white/90 border-slate-950/20 shadow-sm'
                : 'bg-white/40 hover:bg-white/70 border-white/60 text-slate-800'
            }`}
            title="View Profile"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-950 via-slate-800 to-indigo-950 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-950 leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-medium text-slate-500 leading-none">
                Transit Pro
              </span>
            </div>
          </button>

          {/* Sign Out Glass Button */}
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-full bg-white/30 hover:bg-rose-50 border border-white/50 hover:border-rose-200 text-slate-600 hover:text-rose-600 transition-all cursor-pointer backdrop-blur-md active:scale-95"
            title="Log Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-white/30 hover:bg-white/60 border border-white/50 text-slate-800 transition-all cursor-pointer backdrop-blur-md active:scale-95"
            aria-label="Toggle mobile navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Glassmorphic Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto rounded-3xl glass-nav-bar p-3 shadow-2xl border border-white/70 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-1.5 p-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'glass-pill-active text-slate-950 shadow-sm'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-white/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-800" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs font-bold">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-slate-900">{currentUser.name}</span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
