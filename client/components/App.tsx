import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchCategoryList } from '../modules/categorySlice'
import { fetchExpenses, fetchAllExpensesForChart } from '../modules/expenseSlice'
import { fetchIncomes } from '../modules/incomeSlice'
import { fetchDashboardSummary } from '../modules/dashboardSlice'
import { fetchCurrentUser, logoutUser } from '../modules/authSlice'
import { useEffect, useState } from 'react'
import ExpenseForm from './ExpenseForm'
import IncomeForm from './IncomeForm'
import Toast from './Toast'
import SpendingCharts from './SpendingCharts'
import DashboardPanel from './DashboardPanel'
import TransactionList from './TransactionList'
import CategoryPanel from './CategoryPanel'
import BudgetPanel from './BudgetPanel'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'

function App() {
  const dispatch = useAppDispatch()
  const { token, user } = useAppSelector((state) => state.auth)
  const [authView, setAuthView] = useState<'login' | 'register'>('login')
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')

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
      dispatch(fetchIncomes(1))
      dispatch(fetchDashboardSummary())
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

      {/* Dashboard Summary Panel */}
      <DashboardPanel />

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Transaction List + Charts */}
        <div className="lg:col-span-2 space-y-6">
          <TransactionList />
          <SpendingCharts />
        </div>

        {/* Right Panel: Add Form and Categories */}
        <div className="space-y-8">
          <section className="expense-card bg-slate-900 border-none shadow-xl shadow-slate-200">
            {/* Tab switcher */}
            <div className="flex mb-6 bg-slate-800 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('expense')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'expense'
                    ? 'bg-brand text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expense
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'income'
                    ? 'bg-green-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Income
              </button>
            </div>

            {activeTab === 'expense' ? <ExpenseForm /> : <IncomeForm />}
          </section>

          <CategoryPanel />
          <BudgetPanel />
        </div>
      </main>
    </div>
  )
}

export default App
