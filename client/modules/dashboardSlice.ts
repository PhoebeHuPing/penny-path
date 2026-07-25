import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import api from '../api'
import type { AppDispatch } from '../store'

export interface DashboardSummary {
  current_month_total: number
  daily_average: number
  days_elapsed: number
  days_in_month: number
  last_month_total: number
  mom_change_pct: number | null
  same_month_last_year_total: number
  yoy_change_pct: number | null
  budget_total: number | null
  budget_remaining: number | null
  budget_usage_pct: number | null
}

interface DashboardState {
  summary: DashboardSummary | null
  loading: boolean
}

const initialState: DashboardState = {
  summary: null,
  loading: false,
}

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSummary: (state, action: PayloadAction<DashboardSummary>) => {
      state.summary = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setSummary, setLoading } = dashboardSlice.actions

export const fetchDashboardSummary =
  (month?: number, year?: number) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    try {
      const params = new URLSearchParams()
      if (month) params.append('month', String(month))
      if (year) params.append('year', String(year))
      const qs = params.toString()
      const res = await api.get(`/api/dashboard/summary${qs ? '?' + qs : ''}`)
      dispatch(setSummary(res.data))
    } catch (error) {
      console.error('Failed to fetch dashboard summary:', error)
    } finally {
      dispatch(setLoading(false))
    }
  }

export default dashboardSlice.reducer
