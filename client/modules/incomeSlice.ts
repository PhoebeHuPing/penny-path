import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import api from '../api'
import { triggerToast } from './appSlice'
import type { AppDispatch } from '../store'

export const INCOME_PAGE_SIZE = 10

export interface Income {
  id: number
  date: string
  source: string
  amount: number
}

interface IncomeState {
  incomes: Income[]
  loading: boolean
  page: number
  totalCount: number
}

const initialState: IncomeState = {
  incomes: [],
  loading: false,
  page: 1,
  totalCount: 0,
}

export const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    setIncomes: (state, action: PayloadAction<{ incomes: Income[]; total_count: number }>) => {
      state.incomes = action.payload.incomes
      state.totalCount = action.payload.total_count
    },
    addIncomeSuccess: (state, action: PayloadAction<Income>) => {
      state.incomes.unshift(action.payload)
      state.totalCount += 1
      if (state.incomes.length > INCOME_PAGE_SIZE) {
        state.incomes.pop()
      }
    },
    deleteIncomeSuccess: (state, action: PayloadAction<number>) => {
      state.incomes = state.incomes.filter((i) => i.id !== action.payload)
      state.totalCount -= 1
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
  },
})

export const { setIncomes, addIncomeSuccess, deleteIncomeSuccess, setLoading, setPage } =
  incomeSlice.actions

// Async actions
export const fetchIncomes =
  (page = 1) =>
  async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    dispatch(setPage(page))
    try {
      const skip = (page - 1) * INCOME_PAGE_SIZE
      const res = await api.get(`/api/incomes?skip=${skip}&limit=${INCOME_PAGE_SIZE}`)
      dispatch(
        setIncomes({
          incomes: res.data.data.incomes,
          total_count: res.data.data.total_count,
        }),
      )
    } catch (error) {
      console.error('Failed to fetch incomes:', error)
      dispatch(triggerToast('Failed to fetch incomes', 'error'))
    } finally {
      dispatch(setLoading(false))
    }
  }

export const postIncome =
  (income: Omit<Income, 'id'>) => async (dispatch: AppDispatch) => {
    try {
      const res = await api.post('/api/incomes', income)
      dispatch(addIncomeSuccess(res.data.data.income))
      dispatch(triggerToast('Income recorded successfully!', 'success'))
    } catch (error) {
      console.error('Failed to post income:', error)
      const axiosError = error as AxiosError<{ detail?: string }>
      const errorMsg = axiosError.response?.data?.detail || 'Failed to add income'
      dispatch(triggerToast(errorMsg, 'error'))
    }
  }

export const removeIncome = (id: number) => async (dispatch: AppDispatch) => {
  try {
    await api.delete(`/api/incomes/${id}`)
    dispatch(deleteIncomeSuccess(id))
    dispatch(triggerToast('Income deleted.', 'info'))
  } catch (error) {
    console.error('Failed to delete income:', error)
    dispatch(triggerToast('Failed to delete income', 'error'))
  }
}

export default incomeSlice.reducer
