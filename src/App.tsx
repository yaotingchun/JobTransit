import { useState } from 'react'
import { Header } from './components/Header'
import { VideoBackground } from './components/VideoBackground'
import { HeroText } from './components/HeroText'
import { AuthModal, type UserProfile } from './components/auth/AuthModal'
import { Homepage } from './components/Homepage'

export default function App() {
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
