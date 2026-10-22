import { useState } from 'react'
import { Header } from './components/Header'
import { VideoBackground } from './components/VideoBackground'
import { HeroText } from './components/HeroText'
import { AuthModal, type UserProfile } from './components/auth/AuthModal'

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    setCurrentUser(null)
  }

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
