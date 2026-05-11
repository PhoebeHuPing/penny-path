import React, { useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { postExpense } from '../modules/expenseSlice'

const ExpenseForm: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [location, setLocation] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const dateRef = useRef<HTMLInputElement>(null)
  const locationRef = useRef<HTMLInputElement>(null)
  const amountRef = useRef<HTMLInputElement>(null)
  const categoryRef = useRef<HTMLSelectElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)

  const { categoryList } = useAppSelector((state) => state.category)
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

    if (!date || !location || !amount || !categoryId) {
      alert('Please fill in all fields')
      return
    }

    dispatch(
      postExpense({
        date,
        location,
        amount: parseFloat(amount),
        category_id: parseInt(categoryId),
      }),
    )

    // Reset form
    setLocation('')
    setAmount('')
    setCategoryId('')

    // Focus back to date after submit
    dateRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Date</label>
        <input
          ref={dateRef}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, locationRef)}
          className="input-field bg-slate-800 border-slate-700 text-white focus:border-brand"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Location</label>
        <input
          ref={locationRef}
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, amountRef)}
          placeholder="e.g. Starbucks"
          className="input-field bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-brand"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">¥</span>
            <input
              ref={amountRef}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, categoryRef)}
              placeholder="0.00"
              step="0.01"
              className="input-field pl-8 bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-brand"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Category</label>
          <select
            ref={categoryRef}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, submitRef)}
            className="input-field bg-slate-800 border-slate-700 text-white focus:border-brand appearance-none"
          >
            <option value="" className="bg-slate-900">Select</option>
            {categoryList.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-slate-900">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        ref={submitRef}
        type="submit"
        className="w-full bg-brand hover:bg-blue-600 text-white font-black py-3 rounded-xl shadow-lg shadow-brand/20 transition-all active:scale-[0.98] cursor-pointer"
      >
        Record Transaction
      </button>
    </form>
  )
}

export default ExpenseForm

