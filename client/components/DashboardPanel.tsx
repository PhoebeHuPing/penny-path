import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchDashboardSummary } from '../modules/dashboardSlice'

const DashboardPanel: React.FC = () => {
  const dispatch = useAppDispatch()
  const { summary, loading } = useAppSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardSummary())
  }, [dispatch])

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 animate-pulse">
            <div className="h-3 bg-slate-200 rounded w-20 mb-3" />
            <div className="h-7 bg-slate-200 rounded w-24" />
          </div>
        ))}
      </div>
    )
  }

  const formatCurrency = (val: number) =>
    `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const formatPct = (val: number | null) => {
    if (val === null) return 'N/A'
    const sign = val > 0 ? '+' : ''
    return `${sign}${val}%`
  }

  const getPctColor = (val: number | null) => {
    if (val === null) return 'text-slate-400'
    if (val > 0) return 'text-red-600'  // spending up = red
    if (val < 0) return 'text-emerald-600'  // spending down = green
    return 'text-slate-500'
  }

  const getBudgetColor = () => {
    if (summary.budget_usage_pct === null) return 'text-slate-400'
    if (summary.budget_usage_pct >= 100) return 'text-red-600'
    if (summary.budget_usage_pct >= 80) return 'text-amber-600'
    return 'text-emerald-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {/* Monthly Total */}
      <div className="bg-gradient-to-br from-brand/5 to-brand/10 p-5 rounded-2xl border border-brand/10">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
          This Month
        </p>
        <p className="text-2xl font-black text-slate-800">
          {formatCurrency(summary.current_month_total)}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Day {summary.days_elapsed}/{summary.days_in_month}
        </p>
      </div>

      {/* Daily Average */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
          Daily Avg
        </p>
        <p className="text-2xl font-black text-slate-800">
          {formatCurrency(summary.daily_average)}
        </p>
        <p className="text-xs text-slate-400 mt-1">per day</p>
      </div>

      {/* Month-over-Month (环比) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
          vs Last Month
        </p>
        <p className={`text-2xl font-black ${getPctColor(summary.mom_change_pct)}`}>
          {formatPct(summary.mom_change_pct)}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {formatCurrency(summary.last_month_total)} prev
        </p>
      </div>

      {/* Year-over-Year (同比) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
          vs Last Year
        </p>
        <p className={`text-2xl font-black ${getPctColor(summary.yoy_change_pct)}`}>
          {formatPct(summary.yoy_change_pct)}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {formatCurrency(summary.same_month_last_year_total)} prev
        </p>
      </div>

      {/* Budget Remaining */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
          Budget Left
        </p>
        {summary.budget_total !== null ? (
          <>
            <p className={`text-2xl font-black ${getBudgetColor()}`}>
              {formatCurrency(summary.budget_remaining!)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {summary.budget_usage_pct}% used of {formatCurrency(summary.budget_total)}
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-black text-slate-300">—</p>
            <p className="text-xs text-slate-400 mt-1">No budget set</p>
          </>
        )}
      </div>
    </div>
  )
}

export default DashboardPanel
