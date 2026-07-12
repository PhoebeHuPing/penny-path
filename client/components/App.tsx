import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchCategoryList, addCategory } from '../modules/categorySlice'
import { fetchExpenses, fetchAllExpensesForChart, removeExpense, PAGE_SIZE } from '../modules/expenseSlice'
import { useEffect, useState } from 'react'
import ExpenseForm from './ExpenseForm'
import Toast from './Toast'
import SpendingCharts from './SpendingCharts'

function App() {
  const { categoryList } = useAppSelector((state) => state.category)
  const { expenses, loading, page, totalCount } = useAppSelector((state) => state.expenses)
  const dispatch = useAppDispatch()

  const [newCategory, setNewCategory] = useState('')
  const [showCatInput, setShowCatInput] = useState(false)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  useEffect(() => {
    dispatch(fetchCategoryList())
    dispatch(fetchExpenses(1))
    dispatch(fetchAllExpensesForChart())
  }, [dispatch])

  const getCategoryName = (id: number) => {
    return categoryList.find((c) => c.id === id)?.name || 'Unknown'
  }

  // Dashboard stats — use totalCount for record count, allExpenses for amounts
  const { allExpenses } = useAppSelector((state) => state.expenses)
  const totalSpent = allExpenses.reduce((acc, curr) => acc + curr.amount, 0)
  const averageSpend = allExpenses.length > 0 ? totalSpent / allExpenses.length : 0

  const categorySpending = allExpenses.reduce((acc: Record<number, number>, curr) => {
    acc[curr.category_id] = (acc[curr.category_id] || 0) + curr.amount
    return acc
  }, {})

  let topCategoryId = -1
  let maxSpend = 0
  Object.entries(categorySpending).forEach(([catIdStr, spend]) => {
    if (spend > maxSpend) {
      maxSpend = spend
      topCategoryId = parseInt(catIdStr)
    }
  })
  const topCategoryName = topCategoryId !== -1 ? getCategoryName(topCategoryId) : 'None'

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    dispatch(addCategory(newCategory))
    setNewCategory('')
    setShowCatInput(false)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    dispatch(fetchExpenses(newPage))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Toast />

      <header className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
          PennyPath
        </h1>
        <p className="text-slate-500 font-medium">Track your wealth, one penny at a time.</p>
      </header>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-brand/5 to-brand/10 p-6 rounded-2xl border border-brand/10">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Total Spent</p>
          <p className="text-3xl font-black text-slate-800">
            ¥{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Average / Transaction</p>
          <p className="text-3xl font-black text-slate-800">
            ¥{averageSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Top Category</p>
          <p className="text-3xl font-black text-brand">
            {topCategoryName}
          </p>
        </div>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Transaction List + Charts */}
        <div className="lg:col-span-2 space-y-6">
          <section className="expense-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Recent Transactions</h2>
              <span className="text-sm font-semibold text-brand bg-brand/10 px-3 py-1 rounded-full">
                {totalCount} Records
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-12">
                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-medium">Syncing data...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">💸</div>
                <p className="text-slate-400 font-medium">No records yet. Start tracking!</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <ul className="divide-y divide-slate-100">
                  {expenses.map((exp) => (
                    <li
                      key={exp.id}
                      className="group flex items-center justify-between py-4 transition-all hover:px-2 hover:bg-slate-50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg group-hover:bg-white transition-colors">
                          {getCategoryName(exp.category_id).charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{exp.location}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              {exp.date}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-xs font-bold text-brand uppercase tracking-wider">
                              {getCategoryName(exp.category_id)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-black text-slate-800">
                          ¥{exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => dispatch(removeExpense(exp.id))}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all cursor-pointer"
                          title="Delete transaction"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-4">
                    <p className="text-xs font-semibold text-slate-400">
                      Page {page} of {totalPages} · {totalCount} total
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show pages centered around current page
                        let startPage = Math.max(1, page - 2)
                        const endPage = Math.min(totalPages, startPage + 4)
                        startPage = Math.max(1, endPage - 4)
                        return startPage + i
                      })
                        .filter((p) => p >= 1 && p <= totalPages)
                        .map((p) => (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                              p === page
                                ? 'bg-brand text-white shadow-sm shadow-brand/30'
                                : 'border border-slate-200 text-slate-500 hover:border-brand hover:text-brand'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Analytics Charts */}
          <SpendingCharts />
        </div>

        {/* Right Panel: Add Form and Categories */}
        <div className="space-y-8">
          <section className="expense-card bg-slate-900 border-none shadow-xl shadow-slate-200">
            <h2 className="text-xl font-bold text-white mb-6">Add Transaction</h2>
            <ExpenseForm />
          </section>

          {/* Categories Card */}
          <section className="expense-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Spending Breakdown</h2>
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
                        ¥{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({percent.toFixed(0)}%)
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

            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">All Categories</h3>
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
                    autoFocus
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
                      onClick={() => { setShowCatInput(false); setNewCategory('') }}
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Category
                </button>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
