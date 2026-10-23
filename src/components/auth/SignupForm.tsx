import React, { useState } from 'react'
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, AlertCircle } from 'lucide-react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../../lib/firebase'

interface SignupFormProps {
  onSuccess: (user: { name: string; email: string }) => void
  onSwitchToLogin: () => void
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPasswordStrength = () => {
    if (!password) return 0
    let score = 0
    if (password.length >= 6) score += 1
    if (password.length >= 10) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9!@#$%^&*]/.test(password)) score += 1
    return score
  }

  const strength = getPasswordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Create user in Firebase Authentication
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)

      // Store the display name on the Firebase user profile
      await updateProfile(credential.user, { displayName: name.trim() })

      onSuccess({ name: name.trim(), email: credential.user.email ?? email.trim() })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try signing in instead.')
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-hero">
          Start Your Journey!
        </h2>
        <p className="text-xs sm:text-sm text-slate-800/90 mt-1">
          Join thousands of transit leaders, engineers, and operators.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-red-500/15 border border-red-400/30 text-red-900 text-xs font-medium">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Full Name */}
        <div>
          <label htmlFor="signup-name" className="block text-xs font-semibold text-slate-900 mb-1">
            Full name
          </label>
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-slate-600 absolute left-3.5 pointer-events-none" />
            <input
              id="signup-name"
              type="text"
              required
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null) }}
              placeholder="Alex Morgan"
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white/40 border border-white/50 text-slate-950 placeholder:text-slate-600 focus:outline-none focus:bg-white/60 focus:border-white/80 focus:ring-2 focus:ring-orange-500/40 backdrop-blur-md text-sm transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-900 mb-1">
            Email address
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 pointer-events-none" />
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null) }}
              placeholder="alex@example.com"
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white/40 border border-white/50 text-slate-950 placeholder:text-slate-600 focus:outline-none focus:bg-white/60 focus:border-white/80 focus:ring-2 focus:ring-orange-500/40 backdrop-blur-md text-sm transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-900 mb-1">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 pointer-events-none" />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              placeholder="At least 6 characters"
              className="w-full h-11 pl-10 pr-10 rounded-2xl bg-white/40 border border-white/50 text-slate-950 placeholder:text-slate-600 focus:outline-none focus:bg-white/60 focus:border-white/80 focus:ring-2 focus:ring-orange-500/40 backdrop-blur-md text-sm transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password strength */}
          {password.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1">
              <div
                className={`h-1 flex-1 rounded-full transition-all ${
                  strength >= 1 ? 'bg-orange-500' : 'bg-white/40'
                }`}
              />
              <div
                className={`h-1 flex-1 rounded-full transition-all ${
                  strength >= 2 ? 'bg-orange-500' : 'bg-white/40'
                }`}
              />
              <div
                className={`h-1 flex-1 rounded-full transition-all ${
                  strength >= 3 ? 'bg-emerald-500' : 'bg-white/40'
                }`}
              />
              <div
                className={`h-1 flex-1 rounded-full transition-all ${
                  strength >= 4 ? 'bg-emerald-500' : 'bg-white/40'
                }`}
              />
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2 pt-0.5">
          <input
            id="terms"
            type="checkbox"
            required
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900"
          />
          <label htmlFor="terms" className="text-xs text-slate-800 leading-snug cursor-pointer select-none">
            I agree to the{' '}
            <span className="font-semibold text-slate-950 hover:underline">Terms</span> and{' '}
            <span className="font-semibold text-slate-950 hover:underline">Privacy Policy</span>.
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !agreed}
          className="w-full h-11 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-medium text-sm transition-all duration-150 shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-1"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <p className="text-center text-xs text-slate-800 pt-0.5">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-bold text-slate-950 hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}
