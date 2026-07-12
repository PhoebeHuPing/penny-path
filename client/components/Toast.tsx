import React from 'react'
import { useAppSelector } from '../hooks'

const Toast: React.FC = () => {
  const toast = useAppSelector((state) => state.app.toast)

  if (!toast) return null

  const getStyleAndIcon = () => {
    switch (toast.type) {
      case 'success':
        return {
          bgColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
        }
      case 'error':
        return {
          bgColor: 'bg-rose-500/10 border-rose-500/20 text-rose-600',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        }
      case 'info':
      default:
        return {
          bgColor: 'bg-sky-500/10 border-sky-500/20 text-sky-600',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        }
    }
  }

  const { bgColor, icon } = getStyleAndIcon()

  return (
    <div className="fixed top-6 right-6 z-50 toast-animate">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg ${bgColor}`}>
        <div className="flex-shrink-0">{icon}</div>
        <span className="text-sm font-extrabold tracking-tight">{toast.message}</span>
      </div>
    </div>
  )
}

export default Toast
