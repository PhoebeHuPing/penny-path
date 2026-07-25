import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import {
  fetchBudgets,
  fetchBudgetStatus,
  saveBudget,
  deleteBudget,
  setSelectedMonth,
  setSelectedYear,
  BudgetWithStatus,
} from '../modules/budgetSlice'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function BudgetPanel() {
  const dispatch = useAppDispatch()
  const { budgetStatus, loading, selectedMonth, selectedYear } = useAppSelector(
    (state) => state.budget,
  )
  const { categoryList } = useAppSelector((state) => state.category)

  const [showForm, setShowForm] = useState(false)
  const [formCategoryId, setFormCategoryId] = useState<string>('')
  const [formAmount, setFormAmount] = useState('')

  // Fetch budget data when month/year changes
  useEffect(() => {
    dispatch(fetchBudgets(selectedMonth, selectedYear))
    dispatch(fetchBudgetStatus(selectedMonth, selectedYear))
  }, [dispatch, selectedMonth, selectedYear])

  const handleMonthChange = (direction: -1 | 1) => {
    let newMonth = selectedMonth + direction
    let newYear = selectedYear
    if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    } else if (newMonth > 12) {
      newMonth = 1
      newYear += 1
    }
    dispatch(setSelectedMonth(newMonth))
    dispatch(setSelectedYear(newYear))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(formAmount)
    if (isNaN(amount) || amount <= 0) return

    dispatch(
      saveBudget({
        category_id: formCategoryId === '' ? null : parseInt(formCategoryId),
        amount,
        month: selectedMonth,
        year: selectedYear,
      }),
    )
    setFormAmount('')
    setFormCategoryId('')
    setShowForm(false)
  }

  const handleDelete = (id: number) => {
    dispatch(deleteBudget(id, selectedMonth, selectedYear))
  }

  const getProgressColor = (budget: BudgetWithStatus) => {
    const ratio = budget.spent / budget.amount
    if (ratio >= 1) return 'bg-red-500'
    if (ratio >= 0.8) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getProgressWidth = (budget: BudgetWithStatus) => {
    const ratio = Math.min(budget.spent / budget.amount, 1)
    return `${ratio * 100}%`
  }

  const overBudgetItems = budgetStatus.filter((b) => b.is_over_budget)

  return (
    <section className="expense-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Budget</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {/* Month navigator */}
      <div className="flex items-center justify-center gap-3 mb-5">
        <button
          onClick={() => handleMonthChange(-1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
          aria-label="Previous month"
        >
          ←
        </button>
        <span className="text-sm font-semibold text-slate-700 min-w-[100px] text-center">
          {MONTHS[selectedMonth - 1]} {selectedYear}
        </span>
        <button
          onClick={() => handleMonthChange(1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Over-budget warning */}
      {overBudgetItems.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-700 mb-1">⚠️ Over Budget!</p>
          {overBudgetItems.map((b) => (
            <p key={b.id} className="text-xs text-red-600">
              {b.category_name}: ${b.spent.toFixed(2)} / ${b.amount.toFixed(2)}
            </p>
          ))}
        </div>
      )}

      {/* Add budget form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-5 p-3 bg-slate-50 rounded-lg space-y-3">
          <div>
            <label htmlFor="budget-category" className="block text-xs font-medium text-slate-600 mb-1">
              Category
            </label>
            <select
              id="budget-category"
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Overall (All Categories)</option>
              {categoryList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="budget-amount" className="block text-xs font-medium text-slate-600 mb-1">
              Budget Limit ($)
            </label>
            <input
              id="budget-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Save Budget
          </button>
        </form>
      )}

      {/* Budget list */}
      {loading ? (
        <p className="text-sm text-slate-400 text-center py-4">Loading...</p>
      ) : budgetStatus.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">
          No budgets set for this month.
        </p>
      ) : (
        <div className="space-y-3">
          {budgetStatus.map((b) => (
            <div key={b.id} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">
                  {b.category_name}
                </span>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-xs text-slate-400 hover:text-red-500 transition"
                  aria-label={`Delete budget for ${b.category_name}`}
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>
                  ${b.spent.toFixed(2)} / ${b.amount.toFixed(2)}
                </span>
                <span className={b.is_over_budget ? 'text-red-600 font-semibold' : ''}>
                  {b.is_over_budget
                    ? `Over by $${Math.abs(b.remaining).toFixed(2)}`
                    : `$${b.remaining.toFixed(2)} left`}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getProgressColor(b)}`}
                  style={{ width: getProgressWidth(b) }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default BudgetPanel
