import { useState, FormEvent } from 'react'
import api from '../api'

interface ForgotPasswordPageProps {
  onSwitchToLogin: () => void
}

function ForgotPasswordPage({ onSwitchToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.post('/api/auth/forgot-password', { email })
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            PennyPath
          </h1>
          <p className="text-slate-500 mt-2">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-800">
                Check your email
              </h2>
              <p className="text-sm text-slate-500">
                If an account with that email exists, we&apos;ve sent a password
                reset link. Please check your inbox.
              </p>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="mt-4 text-sm text-slate-800 font-semibold hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <p className="text-sm text-slate-500">
                Enter the email address associated with your account and
                we&apos;ll send you a link to reset your password.
              </p>

              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <p className="text-center text-sm text-slate-500">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-slate-800 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
