import React, { useState } from 'react'
import { ArrowRight, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'
import { DEMO_USER } from '../../lib/cardFirebase'

interface LoginFormProps {
  onSuccess: (user: { name: string; email: string }) => void
  onSwitchToSignup: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup }) => {
  const [email, setEmail] = useState('alex@gmail.com')
  const [password, setPassword] = useState('123456')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    setTimeout(() => {
      setIsLoading(false)
      onSuccess(DEMO_USER)
    }, 150)
  }

  return (
    <div className="space-y-4">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-hero">
          Welcome back!
        </h2>
        <p className="text-xs sm:text-sm text-slate-800/90 mt-1">
          Access your transit dashboard, applications, and saved routes.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-red-500/15 border border-red-400/30 text-red-900 text-xs font-medium">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Email Field */}
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-slate-900 mb-1.5">
            Email address
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 pointer-events-none" />
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null) }}
              placeholder="name@example.com"
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white/40 border border-white/50 text-slate-950 placeholder:text-slate-600 focus:outline-none focus:bg-white/60 focus:border-white/80 focus:ring-2 focus:ring-orange-500/40 backdrop-blur-md text-sm transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-900">
              Password
            </label>
            <button
              type="button"
              onClick={() => alert('Password reset instructions sent to your email.')}
              className="text-xs font-medium text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 pointer-events-none" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              placeholder="Enter your password"
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
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900"
          />
          <label htmlFor="remember-me" className="text-xs text-slate-800 cursor-pointer select-none">
            Keep me signed in on this device
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-medium text-sm transition-all duration-150 shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-1"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Use Demo Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Signup */}
      <p className="text-center text-xs text-slate-800 pt-1">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-bold text-slate-950 hover:underline cursor-pointer"
        >
          Create account
        </button>
      </p>
    </div>
  )
}
