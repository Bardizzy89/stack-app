'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, DollarSign, TrendingDown, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { signUp, signIn } from '@/app/actions/auth'

interface AuthScreenProps {
  mode?: 'login' | 'signup'
}

export function AuthScreen({ mode = 'login' }: AuthScreenProps) {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = isLogin ? await signIn(formData) : await signUp(formData)

      if (result.success) {
        // Check if email confirmation is required (signup only)
        if ('requiresEmailConfirmation' in result && result.requiresEmailConfirmation) {
          setSuccessMessage(
            'message' in result && typeof result.message === 'string'
              ? result.message
              : 'Please check your email to confirm your account.'
          )
          setLoading(false)
        } else {
          // Successful authentication - redirect to dashboard
          router.push('/dashboard')
          router.refresh()
          // Keep loading true during redirect for better UX
        }
      } else if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        // Unexpected response format
        setError('An unexpected error occurred')
        setLoading(false)
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-white to-cyan-500/5" />
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr from-cyan-400/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-6xl w-full relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Value Proposition */}
        <div className="animate-fade-in">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              The Stack App
            </h1>
            <p className="text-gray-500 text-lg">Technology Assessment Platform</p>
          </div>

          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Stop Wasting Money on Technology You Don't Actually Use
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed mb-12">
            51% of SaaS spend goes unused according to recent studies. The average SMB pays for 18 software tools but only actively uses 11. We help you identify and eliminate this waste in minutes.
          </p>

          <div className="space-y-6">
            {[
              {
                icon: DollarSign,
                title: 'Recover Wasted Spend',
                description: 'Identify duplicate tools, unused seats, and overlapping capabilities',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: TrendingDown,
                title: 'Reduce Stack Bloat',
                description: 'Automated analysis of your entire tech stack in under 5 minutes',
                color: 'from-red-500 to-pink-500'
              },
              {
                icon: Zap,
                title: 'AI-Powered Insights',
                description: 'Get specific recommendations with ROI calculations and action plans',
                color: 'from-blue-500 to-cyan-500'
              }
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex gap-4 animate-fade-in"
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <benefit.icon className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Auth Form */}
        <Card className="p-10 bg-white/80 backdrop-blur-xl shadow-2xl border-slate-200">
          <div className="flex gap-2 mb-8 p-1.5 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true)
                setError(null)
              }}
              className={`
                flex-1 py-3 rounded-lg transition-all duration-300 font-semibold
                ${isLogin
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-800'
                }
              `}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false)
                setError(null)
              }}
              className={`
                flex-1 py-3 rounded-lg transition-all duration-300 font-semibold
                ${!isLogin
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-800'
                }
              `}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  required
                />
                <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <a href="/terms" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                disabled={(!isLogin && !acceptedTerms) || loading}
              >
                {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
                {!loading && <ArrowRight className="ml-2" size={20} />}
              </Button>
            </div>
          </form>

          {!isLogin && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <p className="text-sm text-slate-600 text-center">
                🔒 Your data is encrypted and never shared. <br className="hidden sm:block" />
                We take security seriously.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
