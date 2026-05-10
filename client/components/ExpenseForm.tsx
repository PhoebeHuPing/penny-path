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
    <form onSubmit={handleSubmit} className="expense-form">
      <div className="form-group">
        <label>Date</label>
        <input
          ref={dateRef}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, locationRef)}
        />
      </div>

      <div className="form-group">
        <label>Location</label>
        <input
          ref={locationRef}
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, amountRef)}
          placeholder="e.g. Starbucks"
        />
      </div>

      <div className="form-group">
        <label>Amount ($)</label>
        <input
          ref={amountRef}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, categoryRef)}
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <select
          ref={categoryRef}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, submitRef)}
        >
          <option value="">Select Category</option>
          {categoryList.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <button ref={submitRef} type="submit" className="submit-btn">
        Add Expense
      </button>
    </form>
  )
}

export default ExpenseForm
