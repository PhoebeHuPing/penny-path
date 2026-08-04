import React, { useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { postIncome, fetchIncomes, removeIncome, updateIncome, Income } from '../modules/incomeSlice'
import { triggerToast } from '../modules/appSlice'
import { fetchDashboardSummary } from '../modules/dashboardSlice'

interface EditingIncome {
  id: number
  date: string
  source: string
  amount: string
}

const IncomeForm: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [source, setSource] = useState('')
  const [amount, setAmount] = useState('')
  const [editingItem, setEditingItem] = useState<EditingIncome | null>(null)

  const dateRef = useRef<HTMLInputElement>(null)
  const sourceRef = useRef<HTMLInputElement>(null)
  const amountRef = useRef<HTMLInputElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)

  const { incomes, loading, totalCount, page } = useAppSelector((state) => state.income)
  const dispatch = useAppDispatch()

  const handleKeyDown = (
    e: React.KeyboardEvent,
    nextRef: React.RefObject<HTMLElement>,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      nextRef.current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !source || !amount) {
      dispatch(triggerToast('Please fill in all fields', 'error'))
      return
    }

    const numAmount = parseFloat(amount)
    if (numAmount <= 0) {
      dispatch(triggerToast('Amount must be positive', 'error'))
      return
    }

    dispatch(postIncome({ date, source, amount: numAmount }))
    dispatch(fetchDashboardSummary())

    // Reset form
    setSource('')
    setAmount('')
    dateRef.current?.focus()
  }

  const handleDelete = (id: number) => {
    dispatch(removeIncome(id))
    dispatch(fetchDashboardSummary())
  }

  const startEditIncome = (income: Income) => {
    setEditingItem({
      id: income.id,
      date: income.date,
      source: income.source,
      amount: String(income.amount),
    })
  }

  const cancelEditIncome = () => {
    setEditingItem(null)
  }

  const saveEditIncome = () => {
    if (!editingItem) return
    const numAmount = parseFloat(editingItem.amount)
    if (isNaN(numAmount) || numAmount <= 0) return
    if (!editingItem.source.trim()) return

    dispatch(
      updateIncome(editingItem.id, {
        date: editingItem.date,
        source: editingItem.source.trim(),
        amount: numAmount,
      }),
    )
    dispatch(fetchDashboardSummary())
    setEditingItem(null)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEditIncome()
    } else if (e.key === 'Escape') {
      cancelEditIncome()
    }
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="income-date" className="text-xs font-black uppercase tracking-widest text-slate-400">
            Date
          </label>
          <input
            id="income-date"
            ref={dateRef}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, sourceRef)}
            className="input-field bg-slate-800 border-slate-700 text-white focus:border-green-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="income-source" className="text-xs font-black uppercase tracking-widest text-slate-400">
            Source
          </label>
          <input
            id="income-source"
            ref={sourceRef}
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, amountRef)}
            placeholder="e.g. Salary, Freelance"
            className="input-field bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-green-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="income-amount" className="text-xs font-black uppercase tracking-widest text-slate-400">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold" aria-hidden="true">
              $
            </span>
            <input
              id="income-amount"
              ref={amountRef}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, submitRef)}
              placeholder="0.00"
              step="0.01"
              className="input-field pl-8 bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-green-500"
            />
          </div>
        </div>

        <button
          ref={submitRef}
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          Record Income
        </button>
      </form>

      {/* Recent incomes list */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
          Recent Income ({totalCount})
        </h3>

        {loading && <p className="text-slate-500 text-sm">Loading...</p>}

        {!loading && incomes.length === 0 && (
          <p className="text-slate-500 text-sm">No income records yet.</p>
        )}

        <ul className="space-y-2" aria-label="Income list">
          {incomes.map((income: Income) => (
            <li
              key={income.id}
              className="bg-slate-800/50 rounded-lg px-4 py-3"
            >
              {editingItem?.id === income.id ? (
                /* Inline Edit Form */
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editingItem.source}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, source: e.target.value })
                      }
                      onKeyDown={handleEditKeyDown}
                      className="px-2 py-1.5 text-sm bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-green-500"
                      placeholder="Source"
                      autoFocus
                      aria-label="Edit income source"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={editingItem.amount}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, amount: e.target.value })
                      }
                      onKeyDown={handleEditKeyDown}
                      className="px-2 py-1.5 text-sm bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-green-500"
                      placeholder="Amount"
                      aria-label="Edit income amount"
                    />
                  </div>
                  <input
                    type="date"
                    value={editingItem.date}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, date: e.target.value })
                    }
                    onKeyDown={handleEditKeyDown}
                    className="w-full px-2 py-1.5 text-sm bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-green-500"
                    aria-label="Edit income date"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEditIncome}
                      className="px-2 py-1 text-xs font-medium text-slate-300 bg-slate-700 rounded hover:bg-slate-600 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEditIncome}
                      className="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Display */
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{income.source}</p>
                    <p className="text-slate-500 text-xs">{income.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold text-sm">
                      +${income.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => startEditIncome(income)}
                      className="text-slate-500 hover:text-green-400 transition-colors"
                      aria-label={`Edit income: ${income.source}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(income.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                      aria-label={`Delete income: ${income.source}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Pagination */}
        {totalCount > 10 && (
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => dispatch(fetchIncomes(page - 1))}
              disabled={page <= 1}
              className="px-3 py-1 text-xs rounded bg-slate-700 text-slate-300 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-xs text-slate-400">
              Page {page}
            </span>
            <button
              onClick={() => dispatch(fetchIncomes(page + 1))}
              disabled={page * 10 >= totalCount}
              className="px-3 py-1 text-xs rounded bg-slate-700 text-slate-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default IncomeForm
