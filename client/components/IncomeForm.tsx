import React, { useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { postIncome, fetchIncomes, removeIncome, Income } from '../modules/incomeSlice'
import { triggerToast } from '../modules/appSlice'
import { fetchDashboardSummary } from '../modules/dashboardSlice'

const IncomeForm: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [source, setSource] = useState('')
  const [amount, setAmount] = useState('')

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
              className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{income.source}</p>
                <p className="text-slate-500 text-xs">{income.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400 font-bold text-sm">
                  +${income.amount.toFixed(2)}
                </span>
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
