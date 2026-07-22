import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchCategoryList } from '../modules/categorySlice'
import { fetchExpenses, fetchAllExpensesForChart } from '../modules/expenseSlice'
import { fetchCurrentUser, logoutUser } from '../modules/authSlice'
import { useEffect, useState } from 'react'
import ExpenseForm from './ExpenseForm'
import Toast from './Toast'
import SpendingCharts from './SpendingCharts'
import StatsPanel from './StatsPanel'
import TransactionList from './TransactionList'
import CategoryPanel from './CategoryPanel'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'

function App() {
  const dispatch = useAppDispatch()
  const { token, user } = useAppSelector((state) => state.auth)
  const [authView, setAuthView] = useState<'login' | 'register'>('login')

  // On mount, try to fetch current user if we have a token
  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, token])

  // Once authenticated, fetch data
  useEffect(() => {
    if (token && user) {
      dispatch(fetchCategoryList())
      dispatch(fetchExpenses(1))
      dispatch(fetchAllExpensesForChart())
    }
  }, [dispatch, token, user])

  // Not authenticated - show login/register
  if (!token) {
    return (
      <>
        <Toast />
        {authView === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
        )}
      </>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Toast />

      <header className="text-center mb-12 relative">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
          PennyPath
        </h1>
        <p className="text-slate-500 font-medium">
          Track your wealth, one penny at a time.
        </p>
        {user && (
          <div className="absolute top-0 right-0 flex items-center gap-3">
            <span className="text-sm text-slate-600">
              Hi, <span className="font-semibold">{user.username}</span>
            </span>
            <button
              onClick={() => dispatch(logoutUser())}
              className="text-sm px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
            >
              Logout
            </button>
          </div>
        )}
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
