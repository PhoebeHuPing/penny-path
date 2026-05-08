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
    return categoryList.find(c => c.id === id)?.name || 'Unknown'
  }

  return (
    <div className="app-container">
      <h1>PennyPath Expense Tracker</h1>
      
      <div className="main-content">
        {/* Left Panel: List and Stats */}
        <div className="left-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <section className="expense-list">
            <h2>Recent Expenses</h2>
            {loading ? (
              <p style={{ textAlign: 'center' }}>Loading...</p>
            ) : expenses.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No records yet. Start tracking!</p>
            ) : (
              <ul>
                {expenses.map((exp) => (
                  <li key={exp.id} className="expense-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>{exp.date}</span>
                      <span className="category-tag" style={{ fontSize: '0.7rem' }}>{getCategoryName(exp.category_id)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <div className="exp-info">
                        <strong className="exp-location">{exp.location}</strong>
                      </div>
                      <div className="exp-actions">
                        <span className="expense-amount">¥{exp.amount.toFixed(2)}</span>
                        <button 
                          onClick={() => dispatch(removeExpense(exp.id))}
                          style={{ marginLeft: '15px', color: '#999', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right Panel: Add Form and Categories */}
        <div className="right-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <section className="add-expense">
            <h2>Add New</h2>
            <ExpenseForm />
          </section>

          <section className="categories">
            <h2>Categories</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categoryList.map((item) => (
                <span key={item.id} className="category-tag">{item.name}</span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default App
