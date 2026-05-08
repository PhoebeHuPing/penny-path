import { describe, it, expect } from 'vitest'
import reducer, { addExpense, deleteExpense, Expense } from './expenseSlice'

describe('expenseSlice', () => {
  const initialState = {
    expenses: [],
  }

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle adding an expense', () => {
    const newExpense: Expense = {
      id: '1',
      description: 'Coffee',
      amount: 4.5,
    }
    const actual = reducer(initialState, addExpense(newExpense))
    expect(actual.expenses).toHaveLength(1)
    expect(actual.expenses[0]).toEqual(newExpense)
  })

  it('should handle deleting an expense', () => {
    const stateWithExpense = {
      expenses: [
        { id: '1', description: 'Coffee', amount: 4.5 },
        { id: '2', description: 'Lunch', amount: 15.0 },
      ],
    }
    const actual = reducer(stateWithExpense, deleteExpense('1'))
    expect(actual.expenses).toHaveLength(1)
    expect(actual.expenses[0].id).toBe('2')
  })
})
