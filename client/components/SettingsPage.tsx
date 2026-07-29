import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { changePassword, updateProfile } from '../modules/userSettingsSlice'

const SUPPORTED_CURRENCIES = [
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'JPY', label: 'Japanese Yen (¥)' },
  { code: 'CNY', label: 'Chinese Yuan (¥)' },
  { code: 'AUD', label: 'Australian Dollar (A$)' },
  { code: 'CAD', label: 'Canadian Dollar (C$)' },
  { code: 'CHF', label: 'Swiss Franc (CHF)' },
  { code: 'NZD', label: 'New Zealand Dollar (NZ$)' },
  { code: 'SGD', label: 'Singapore Dollar (S$)' },
  { code: 'HKD', label: 'Hong Kong Dollar (HK$)' },
  { code: 'KRW', label: 'Korean Won (₩)' },
  { code: 'TWD', label: 'Taiwan Dollar (NT$)' },
  { code: 'INR', label: 'Indian Rupee (₹)' },
  { code: 'BRL', label: 'Brazilian Real (R$)' },
  { code: 'MXN', label: 'Mexican Peso (MX$)' },
]

interface SettingsPageProps {
  onBack: () => void
}

function SettingsPage({ onBack }: SettingsPageProps) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { loading } = useAppSelector((state) => state.userSettings)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Profile form state
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')
  const [currency, setCurrency] = useState(user?.currency || 'USD')

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    const success = await dispatch(changePassword(currentPassword, newPassword))
    if (success) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await dispatch(
      updateProfile({
        display_name: displayName || null,
        avatar_url: avatarUrl || null,
        currency,
      }),
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="text-sm px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
          aria-label="Back to dashboard"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Settings
        </h1>
      </div>

      {/* Profile Section */}
      <section className="expense-card mb-6" aria-labelledby="profile-heading">
        <h2
          id="profile-heading"
          className="text-lg font-bold text-slate-800 mb-4"
        >
          Profile
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-semibold text-slate-600 mb-1"
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={user?.username || 'Enter display name'}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm"
              maxLength={50}
            />
          </div>

          <div>
            <label
              htmlFor="avatarUrl"
              className="block text-sm font-semibold text-slate-600 mb-1"
            >
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm"
            />
            {avatarUrl && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <span className="text-xs text-slate-400">Preview</span>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-semibold text-slate-600 mb-1"
            >
              Currency Preference
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm bg-white"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </section>

      {/* Change Password Section */}
      <section
        className="expense-card"
        aria-labelledby="password-heading"
      >
        <h2
          id="password-heading"
          className="text-lg font-bold text-slate-800 mb-4"
        >
          Change Password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-semibold text-slate-600 mb-1"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-semibold text-slate-600 mb-1"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-slate-600 mb-1"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm"
              autoComplete="new-password"
            />
          </div>

          {passwordError && (
            <p className="text-sm text-red-500 font-medium" role="alert">
              {passwordError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default SettingsPage
