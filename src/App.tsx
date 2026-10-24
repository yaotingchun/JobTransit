import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { VideoBackground } from './components/VideoBackground'
import { HeroText } from './components/HeroText'
import { AuthModal, type UserProfile } from './components/auth/AuthModal'
import { Homepage } from './components/Homepage'
import { FollowUpPage } from './components/followUp/FollowUpPage'

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
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('jobtransit_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user)
    try {
      localStorage.setItem('jobtransit_user', JSON.stringify(user))
    } catch (e) {
      console.error(e)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    try {
      localStorage.removeItem('jobtransit_user')
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

  // After login, redirect to Homepage with the glassmorphism navbar on top
  if (currentUser) {
    return <Homepage currentUser={currentUser} onLogout={handleLogout} />
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
    </main>
  )
}
