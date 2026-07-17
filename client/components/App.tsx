import { useAppDispatch } from '../hooks'
import { fetchCategoryList } from '../modules/categorySlice'
import { fetchExpenses, fetchAllExpensesForChart } from '../modules/expenseSlice'
import { useEffect } from 'react'
import ExpenseForm from './ExpenseForm'
import Toast from './Toast'
import SpendingCharts from './SpendingCharts'
import StatsPanel from './StatsPanel'
import TransactionList from './TransactionList'
import CategoryPanel from './CategoryPanel'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchCategoryList())
    dispatch(fetchExpenses(1))
    dispatch(fetchAllExpensesForChart())
  }, [dispatch])

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Toast />

      <header className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
          PennyPath
        </h1>
        <p className="text-slate-500 font-medium">
          Track your wealth, one penny at a time.
        </p>
      </header>

      {/* Stats Summary Panel */}
      <StatsPanel />

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Transaction List + Charts */}
        <div className="lg:col-span-2 space-y-6">
          <TransactionList />
          <SpendingCharts />
        </div>

        {/* Right Panel: Add Form and Categories */}
        <div className="space-y-8">
          <section className="expense-card bg-slate-900 border-none shadow-xl shadow-slate-200">
            <h2 className="text-xl font-bold text-white mb-6">
              Add Transaction
            </h2>
            <ExpenseForm />
          </section>

          <CategoryPanel />
        </div>
      </main>
    </div>
  )
}

export default App
