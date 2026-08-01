import { describe, it, expect } from 'vitest'
import reducer, {
  setBudgets,
  setBudgetStatus,
  setLoading,
  setSelectedMonth,
  setSelectedYear,
  removeBudgetFromState,
  Budget,
  BudgetWithStatus,
} from './budgetSlice'

const now = new Date()

const initialState = {
  budgets: [],
  budgetStatus: [],
  loading: false,
  selectedMonth: now.getMonth() + 1,
  selectedYear: now.getFullYear(),
}

describe('budgetSlice', () => {
  it('should return the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' })
    expect(state.budgets).toEqual([])
    expect(state.budgetStatus).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.selectedMonth).toBe(now.getMonth() + 1)
    expect(state.selectedYear).toBe(now.getFullYear())
  })

  it('should handle setBudgets', () => {
    const budgets: Budget[] = [
      { id: 1, user_id: 1, category_id: 1, amount: 500, month: 7, year: 2026 },
      { id: 2, user_id: 1, category_id: null, amount: 2000, month: 7, year: 2026 },
    ]
    const state = reducer(initialState, setBudgets(budgets))
    expect(state.budgets).toEqual(budgets)
  })

  it('should handle setBudgetStatus', () => {
    const status: BudgetWithStatus[] = [
      {
        id: 1,
        category_id: 1,
        category_name: 'Food',
        amount: 500,
        month: 7,
        year: 2026,
        spent: 320,
        remaining: 180,
        is_over_budget: false,
      },
    ]
    const state = reducer(initialState, setBudgetStatus(status))
    expect(state.budgetStatus).toEqual(status)
  })

  it('should handle setLoading', () => {
    const state = reducer(initialState, setLoading(true))
    expect(state.loading).toBe(true)
  })

  it('should handle setSelectedMonth', () => {
    const state = reducer(initialState, setSelectedMonth(12))
    expect(state.selectedMonth).toBe(12)
  })

  it('should handle setSelectedYear', () => {
    const state = reducer(initialState, setSelectedYear(2025))
    expect(state.selectedYear).toBe(2025)
  })

  it('should handle removeBudgetFromState', () => {
    const stateWithBudgets = {
      ...initialState,
      budgets: [
        { id: 1, user_id: 1, category_id: 1, amount: 500, month: 7, year: 2026 },
        { id: 2, user_id: 1, category_id: null, amount: 2000, month: 7, year: 2026 },
      ],
      budgetStatus: [
        {
          id: 1,
          category_id: 1,
          category_name: 'Food',
          amount: 500,
          month: 7,
          year: 2026,
          spent: 320,
          remaining: 180,
          is_over_budget: false,
        },
        {
          id: 2,
          category_id: null,
          category_name: 'Overall',
          amount: 2000,
          month: 7,
          year: 2026,
          spent: 1500,
          remaining: 500,
          is_over_budget: false,
        },
      ],
    }
    const state = reducer(stateWithBudgets, removeBudgetFromState(1))
    expect(state.budgets).toHaveLength(1)
    expect(state.budgets[0].id).toBe(2)
    expect(state.budgetStatus).toHaveLength(1)
    expect(state.budgetStatus[0].id).toBe(2)
  })
})
