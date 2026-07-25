import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import api from '../api'
import { triggerToast } from './appSlice'
import type { AppDispatch } from '../store'

export interface Budget {
  id: number
  user_id: number
  category_id: number | null
  amount: number
  month: number
  year: number
}

export interface BudgetWithStatus {
  id: number
  category_id: number | null
  category_name: string | null
  amount: number
  month: number
  year: number
  spent: number
  remaining: number
  is_over_budget: boolean
}

interface BudgetState {
  budgets: Budget[]
  budgetStatus: BudgetWithStatus[]
  loading: boolean
  selectedMonth: number
  selectedYear: number
}

const now = new Date()

const initialState: BudgetState = {
  budgets: [],
  budgetStatus: [],
  loading: false,
  selectedMonth: now.getMonth() + 1,
  selectedYear: now.getFullYear(),
}

export const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.budgets = action.payload
    },
    setBudgetStatus: (state, action: PayloadAction<BudgetWithStatus[]>) => {
      state.budgetStatus = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setSelectedMonth: (state, action: PayloadAction<number>) => {
      state.selectedMonth = action.payload
    },
    setSelectedYear: (state, action: PayloadAction<number>) => {
      state.selectedYear = action.payload
    },
    removeBudgetFromState: (state, action: PayloadAction<number>) => {
      state.budgets = state.budgets.filter((b) => b.id !== action.payload)
      state.budgetStatus = state.budgetStatus.filter((b) => b.id !== action.payload)
    },
  },
})

export const {
  setBudgets,
  setBudgetStatus,
  setLoading,
  setSelectedMonth,
  setSelectedYear,
  removeBudgetFromState,
} = budgetSlice.actions

// Async actions
export const fetchBudgets =
  (month: number, year: number) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    try {
      const res = await api.get(`/api/budgets?month=${month}&year=${year}`)
      dispatch(setBudgets(res.data))
    } catch (error) {
      console.error('Failed to fetch budgets:', error)
    } finally {
      dispatch(setLoading(false))
    }
  }

export const fetchBudgetStatus =
  (month: number, year: number) => async (dispatch: AppDispatch) => {
    try {
      const res = await api.get(`/api/budgets/status?month=${month}&year=${year}`)
      dispatch(setBudgetStatus(res.data.budgets))
    } catch (error) {
      console.error('Failed to fetch budget status:', error)
    }
  }

export const saveBudget =
  (data: { category_id: number | null; amount: number; month: number; year: number }) =>
  async (dispatch: AppDispatch) => {
    try {
      await api.post('/api/budgets', data)
      dispatch(triggerToast('Budget saved!', 'success'))
      // Refresh both budgets and status
      dispatch(fetchBudgets(data.month, data.year))
      dispatch(fetchBudgetStatus(data.month, data.year))
    } catch (error) {
      console.error('Failed to save budget:', error)
      dispatch(triggerToast('Failed to save budget', 'error'))
    }
  }

export const deleteBudget =
  (id: number, month: number, year: number) => async (dispatch: AppDispatch) => {
    try {
      await api.delete(`/api/budgets/${id}`)
      dispatch(removeBudgetFromState(id))
      dispatch(triggerToast('Budget deleted.', 'info'))
    } catch (error) {
      console.error('Failed to delete budget:', error)
      dispatch(triggerToast('Failed to delete budget', 'error'))
    }
  }

export default budgetSlice.reducer
