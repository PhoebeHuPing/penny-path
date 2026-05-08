import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { postExpense } from '../modules/expenseSlice'

const ExpenseForm: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [location, setLocation] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  
  const { categoryList } = useAppSelector((state) => state.category)
  const dispatch = useAppDispatch()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date || !location || !amount || !categoryId) {
      alert('Please fill in all fields')
      return
    }

    dispatch(postExpense({
      date,
      location,
      amount: parseFloat(amount),
      category_id: parseInt(categoryId),
    }))
    
    // Reset form
    setLocation('')
    setAmount('')
    setCategoryId('')
  }

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <div className="form-group">
        <label>Date</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label>Location</label>
        <input 
          type="text" 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          placeholder="e.g. Starbucks"
        />
      </div>
      
      <div className="form-group">
        <label>Amount (¥)</label>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select Category</option>
          {categoryList.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="submit-btn">Add Expense</button>
    </form>
  )
}

export default ExpenseForm
