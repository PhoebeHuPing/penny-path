import { useState, useMemo, useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { addCategory } from '../modules/categorySlice'

const CategoryPanel: React.FC = () => {
  const { categoryList } = useAppSelector((state) => state.category)
  const { allExpenses } = useAppSelector((state) => state.expenses)
  const dispatch = useAppDispatch()

  const [newCategory, setNewCategory] = useState('')
  const [showCatInput, setShowCatInput] = useState(false)
  const categoryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showCatInput) {
      categoryInputRef.current?.focus()
    }
  }, [showCatInput])

  const { categorySpending, totalSpent } = useMemo(() => {
    const spending = allExpenses.reduce(
      (acc: Record<number, number>, curr) => {
        acc[curr.category_id] = (acc[curr.category_id] || 0) + curr.amount
        return acc
      },
      {},
    )
    const total = allExpenses.reduce((acc, curr) => acc + curr.amount, 0)
    return { categorySpending: spending, totalSpent: total }
  }, [allExpenses])

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    dispatch(addCategory(newCategory))
    setNewCategory('')
    setShowCatInput(false)
  }

  return (
    <section className="expense-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          Spending Breakdown
        </h2>
      </div>

      {/* Visual breakdown progress bars */}
      <div className="space-y-4 mb-6">
        {categoryList.map((item) => {
          const amount = categorySpending[item.id] || 0
          const percent = totalSpent > 0 ? (amount / totalSpent) * 100 : 0
          return (
            <div key={item.id} className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">{item.name}</span>
                <span className="text-slate-500">
                  $
                  {amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}{' '}
                  ({percent.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>

      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        All Categories
      </h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {categoryList.map((item) => (
          <span
            key={item.id}
            className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-100 hover:border-brand hover:text-brand transition-all cursor-default"
          >
            {item.name}
          </span>
        ))}
      </div>

      {/* Add new category section */}
      <div className="border-t border-slate-100 pt-4">
        {showCatInput ? (
          <form onSubmit={handleAddCategorySubmit} className="space-y-2">
            <input
              type="text"
              placeholder="Category name..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              ref={categoryInputRef}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-brand hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-md shadow-brand/10 transition-all active:scale-[0.98] cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCatInput(false)
                  setNewCategory('')
                }}
                className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCatInput(true)}
            className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-200 text-slate-400 text-sm font-bold rounded-xl hover:border-brand hover:text-brand transition-all cursor-pointer group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 group-hover:scale-110 transition-transform"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Category
          </button>
        )}
      </div>
    </section>
  )
}

export default CategoryPanel
