import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchCategoryList } from '../modules/categorySlice'
import { fetchExpenses, removeExpense } from '../modules/expenseSlice'
import { useEffect } from 'react'
import ExpenseForm from './ExpenseForm'

function App() {
  const { categoryList } = useAppSelector((state) => state.category)
  const { expenses, loading } = useAppSelector((state) => state.expenses)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchCategoryList())
    dispatch(fetchExpenses())
  }, [dispatch])

  const getCategoryName = (id: number) => {
    return categoryList.find((c) => c.id === id)?.name || 'Unknown'
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
          PennyPath
        </h1>
        <p className="text-slate-500 font-medium">Track your wealth, one penny at a time.</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: List */}
        <div className="lg:col-span-2 space-y-6">
          <section className="expense-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Recent Transactions</h2>
              <span className="text-sm font-semibold text-brand bg-brand/10 px-3 py-1 rounded-full">
                {expenses.length} Records
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
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* Right Panel: Add Form and Categories */}
        <div className="space-y-8">
          <section className="expense-card bg-slate-900 border-none shadow-xl shadow-slate-200">
            <h2 className="text-xl font-bold text-white mb-6">Add Transaction</h2>
            <ExpenseForm />
          </section>

          <section className="expense-card">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categoryList.map((item) => (
                <span
                  key={item.id}
                  className="px-4 py-2 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl border border-slate-100 hover:border-brand hover:text-brand transition-all cursor-default"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App

