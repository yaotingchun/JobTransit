import React, { useState } from 'react'
import { X, CheckCircle2, Sparkles } from 'lucide-react'
import logoImg from '../../assets/JobTransitLogo.png'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

export interface UserProfile {
  name: string
  email: string
}

interface AuthModalProps {
  isOpen: boolean
  initialMode?: 'login' | 'signup'
  onClose: () => void
  onAuthSuccess: (user: UserProfile) => void
}

const AuthDialogContent: React.FC<{
  initialMode: 'login' | 'signup'
  onClose: () => void
  onAuthSuccess: (user: UserProfile) => void
}> = ({ initialMode, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(null)

  const handleSuccess = (user: UserProfile) => {
    setAuthenticatedUser(user)
    onAuthSuccess(user)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Blurred dark overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Glassmorphic Modal Card */}
      <div className="relative w-full max-w-[430px] my-auto rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 sm:p-8 text-slate-900 z-10 transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 select-none">
            <img src={logoImg} alt="JobTransit Logo" className="w-6 h-6 object-contain drop-shadow-sm" />
            <span className="font-hero text-base font-bold tracking-tight text-slate-950">
              JobTransit
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/40 border border-white/30 text-slate-800 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!authenticatedUser ? (
          <div>
            {/* Glassmorphic Segmented Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/30 border border-white/40 backdrop-blur-md mb-5 relative">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-800 hover:text-slate-950'
                }`}
              >
                Log In
              </button>

              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-800 hover:text-slate-950'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form View with neat hierarchy */}
            {mode === 'login' ? (
              <LoginForm
                onSuccess={handleSuccess}
                onSwitchToSignup={() => setMode('signup')}
              />
            ) : (
              <SignupForm
                onSuccess={handleSuccess}
                onSwitchToLogin={() => setMode('login')}
              />
            )}
          </div>
        ) : (
          /* Authentication Verified Screen */
          <div className="text-center py-6 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-800 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/30 border border-white/40 text-slate-900 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Authentication Verified</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-slate-950 font-hero mb-2">
              Welcome, {authenticatedUser.name}!
            </h3>

            <p className="text-sm text-slate-800/90 mb-6 max-w-xs mx-auto leading-relaxed">
              Signed in as <span className="font-semibold text-slate-950">{authenticatedUser.email}</span>. Your workspace is ready.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white text-sm font-semibold shadow-lg transition-all cursor-pointer active:scale-[0.98]"
            >
              Continue to Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onAuthSuccess,
}) => {
  if (!isOpen) return null

  return (
    <AuthDialogContent
      key={initialMode}
      initialMode={initialMode}
      onClose={onClose}
      onAuthSuccess={onAuthSuccess}
    />
  )
}
