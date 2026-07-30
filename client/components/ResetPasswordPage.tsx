import { useState, FormEvent } from 'react'
import api from '../api'

interface ResetPasswordPageProps {
  token: string
  onSwitchToLogin: () => void
}

function ResetPasswordPage({ token, onSwitchToLogin }: ResetPasswordPageProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await api.post('/api/auth/reset-password', {
        token,
        new_password: newPassword,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      const msg =
        axiosErr.response?.data?.detail || 'Failed to reset password. The link may have expired.'
      setError(msg)
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
          <p className="text-slate-500 mt-2">Set a new password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          {success ? (
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-800">
                Password reset successful!
              </h2>
              <p className="text-sm text-slate-500">
                Your password has been updated. You can now sign in with your
                new password.
              </p>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="mt-4 w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition"
              >
                Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <p className="text-center text-sm text-slate-500">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-slate-800 font-semibold hover:underline"
                >
                  Back to Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
