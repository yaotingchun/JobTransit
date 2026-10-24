import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { VideoBackground } from './components/VideoBackground'
import { HeroText } from './components/HeroText'
import { AuthModal, type UserProfile, type AuthSuccessMeta } from './components/auth/AuthModal'
import { Homepage } from './components/Homepage'
import { FollowUpPage } from './components/followUp/FollowUpPage'
import { AIChatbox } from './components/chat/AIChatbox'
import { FloatingAIChatTrigger } from './components/chat/FloatingAIChatTrigger'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import type { NavTab } from './components/Navbar'

/** Set on sign-up, cleared only when the whole onboarding journey has been completed. */
const ONBOARDING_PENDING_KEY = 'jobtransit_onboarding_pending'

export default function App() {
  const [route, setRoute] = useState<'default' | 'follow-up'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const hash = window.location.hash
      if (path === '/follow-up' || hash === '#follow-up' || window.location.search.includes('page=follow-up')) {
        return 'follow-up'
      }
    }
    return 'default'
  })

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      const hash = window.location.hash
      if (path === '/follow-up' || hash === '#follow-up' || window.location.search.includes('page=follow-up')) {
        setRoute('follow-up')
      } else {
        setRoute('default')
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [isLandingAIChatOpen, setIsLandingAIChatOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('jobtransit_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ONBOARDING_PENDING_KEY) === '1'
    } catch {
      return false
    }
  })
  const [homeInitialTab, setHomeInitialTab] = useState<NavTab>('home')

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  const handleAuthSuccess = (user: UserProfile, meta?: AuthSuccessMeta) => {
    setCurrentUser(user)
    try {
      localStorage.setItem('jobtransit_user', JSON.stringify(user))
      if (meta?.isNewUser) localStorage.setItem(ONBOARDING_PENDING_KEY, '1')
    } catch (e) {
      console.error(e)
    }
    if (meta?.isNewUser) {
      setHomeInitialTab('home')
      setNeedsOnboarding(true)
    }
  }

  const handleOnboardingComplete = () => {
    try {
      localStorage.removeItem(ONBOARDING_PENDING_KEY)
    } catch (e) {
      console.error(e)
    }
    // The journey ends on the Transit tab — the freshly created Career Metro.
    window.location.hash = '#transit'
    setHomeInitialTab('transit')
    setNeedsOnboarding(false)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setNeedsOnboarding(false)
    try {
      localStorage.removeItem('jobtransit_user')
      localStorage.removeItem(ONBOARDING_PENDING_KEY)
    } catch (e) {
      console.error(e)
    }
  }

  // Follow-up route: standalone direct access
  if (route === 'follow-up') {
    return (
      <FollowUpPage
        currentUser={currentUser || { name: 'Explorer', email: 'explorer@jobtransit.io' }}
        onLogout={handleLogout}
        onNavigateTab={(tab) => {
          if (tab === 'home') {
            window.history.pushState({}, '', '/')
          } else {
            window.history.pushState({}, '', `/?tab=${tab}`)
          }
          setRoute('default')
        }}
      />
    )
  }
  // New riders go through the full onboarding journey first (welcome → ... → transit map)
  if (currentUser && needsOnboarding) {
    return (
      <OnboardingFlow
        currentUser={currentUser}
        onComplete={handleOnboardingComplete}
        onLogout={handleLogout}
      />
    )
  }
  // After login, redirect to Homepage with the glassmorphism navbar on top
  if (currentUser) {
    return <Homepage currentUser={currentUser} onLogout={handleLogout} initialTab={homeInitialTab} />
  }

  // Landing page before login
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-900 font-sans">
      {/* Background Looping Video */}
      <VideoBackground />

      {/* Top Header Navigation with Login & Get Started Buttons */}
      <Header
        onOpenAuth={handleOpenAuth}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Hero Text at Exact Location */}
      <HeroText />

      {/* Login & Signup Glassmorphism Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Landing Floating AI Navigator Trigger & Chatbox */}
      <FloatingAIChatTrigger
        isOpen={isLandingAIChatOpen}
        onClick={() => setIsLandingAIChatOpen(true)}
      />

      <AIChatbox
        isOpen={isLandingAIChatOpen}
        onClose={() => setIsLandingAIChatOpen(false)}
        onNavigateTab={() => handleOpenAuth('signup')}
      />
    </main>
  )
}
