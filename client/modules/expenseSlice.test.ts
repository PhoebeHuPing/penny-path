import { describe, it, expect } from 'vitest'
import reducer, { addExpenseSuccess, deleteExpenseSuccess, Expense, PAGE_SIZE } from './expenseSlice'

const baseState = {
  expenses: [],
  allExpenses: [],
  loading: false,
  page: 1,
  totalCount: 0,
  filters: {},
}

describe('expenseSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(baseState)
  })

  it('should handle adding an expense', () => {
    const newExpense: Expense = {
      id: 1,
      date: '2026-07-12',
      location: 'Coffee',
      amount: 4.5,
      category_id: 1,
    }
    const actual = reducer(baseState, addExpenseSuccess(newExpense))
    expect(actual.expenses).toHaveLength(1)
    expect(actual.expenses[0]).toEqual(newExpense)
    expect(actual.totalCount).toBe(1)
  })

  it('should handle deleting an expense', () => {
    const stateWithExpenses = {
      ...baseState,
      expenses: [
        { id: 1, date: '2026-07-12', location: 'Coffee', amount: 4.5, category_id: 1 },
        { id: 2, date: '2026-07-12', location: 'Lunch', amount: 15.0, category_id: 2 },
      ],
      allExpenses: [
        { id: 1, date: '2026-07-12', location: 'Coffee', amount: 4.5, category_id: 1 },
        { id: 2, date: '2026-07-12', location: 'Lunch', amount: 15.0, category_id: 2 },
      ],
      totalCount: 2,
    }
    const actual = reducer(stateWithExpenses, deleteExpenseSuccess(1))
    expect(actual.expenses).toHaveLength(1)
    expect(actual.expenses[0].id).toBe(2)
    expect(actual.totalCount).toBe(1)
  })

  it('should not exceed PAGE_SIZE when adding expenses', () => {
    const manyExpenses = Array.from({ length: PAGE_SIZE }, (_, i) => ({
      id: i + 1,
      date: '2026-07-12',
      location: `Item ${i + 1}`,
      amount: 10,
      category_id: 1,
    }))
    const fullState = { ...baseState, expenses: manyExpenses, totalCount: PAGE_SIZE }
    const extra: Expense = { id: PAGE_SIZE + 1, date: '2026-07-13', location: 'Extra', amount: 5, category_id: 1 }
    const actual = reducer(fullState, addExpenseSuccess(extra))
    expect(actual.expenses).toHaveLength(PAGE_SIZE)
    expect(actual.expenses[0].id).toBe(PAGE_SIZE + 1)
  })
})
