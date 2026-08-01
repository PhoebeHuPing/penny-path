import { describe, it, expect } from 'vitest'
import reducer, { setSummary, setLoading, DashboardSummary } from './dashboardSlice'

const initialState = {
  summary: null,
  loading: false,
}

describe('dashboardSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setLoading', () => {
    const state = reducer(initialState, setLoading(true))
    expect(state.loading).toBe(true)

    const state2 = reducer(state, setLoading(false))
    expect(state2.loading).toBe(false)
  })

  it('should handle setSummary', () => {
    const summary: DashboardSummary = {
      current_month_total: 1500,
      daily_average: 50,
      days_elapsed: 15,
      days_in_month: 31,
      last_month_total: 1200,
      mom_change_pct: 25.0,
      same_month_last_year_total: 1100,
      yoy_change_pct: 36.36,
      budget_total: 2000,
      budget_remaining: 500,
      budget_usage_pct: 75.0,
      income_total: 5000,
      net_balance: 3500,
    }
    const state = reducer(initialState, setSummary(summary))
    expect(state.summary).toEqual(summary)
  })

  it('should handle setSummary with null optional fields', () => {
    const summary: DashboardSummary = {
      current_month_total: 0,
      daily_average: 0,
      days_elapsed: 1,
      days_in_month: 31,
      last_month_total: 0,
      mom_change_pct: null,
      same_month_last_year_total: 0,
      yoy_change_pct: null,
      budget_total: null,
      budget_remaining: null,
      budget_usage_pct: null,
      income_total: 0,
      net_balance: 0,
    }
    const state = reducer(initialState, setSummary(summary))
    expect(state.summary).toEqual(summary)
    expect(state.summary?.mom_change_pct).toBeNull()
    expect(state.summary?.budget_total).toBeNull()
  })

  it('should replace existing summary', () => {
    const oldSummary: DashboardSummary = {
      current_month_total: 1000,
      daily_average: 33,
      days_elapsed: 30,
      days_in_month: 30,
      last_month_total: 900,
      mom_change_pct: 11.1,
      same_month_last_year_total: 800,
      yoy_change_pct: 25.0,
      budget_total: 1500,
      budget_remaining: 500,
      budget_usage_pct: 66.7,
      income_total: 4000,
      net_balance: 3000,
    }
    const stateWithSummary = { ...initialState, summary: oldSummary }

    const newSummary: DashboardSummary = {
      current_month_total: 2000,
      daily_average: 100,
      days_elapsed: 20,
      days_in_month: 31,
      last_month_total: 1500,
      mom_change_pct: 33.3,
      same_month_last_year_total: 1800,
      yoy_change_pct: 11.1,
      budget_total: 3000,
      budget_remaining: 1000,
      budget_usage_pct: 66.7,
      income_total: 6000,
      net_balance: 4000,
    }
    const state = reducer(stateWithSummary, setSummary(newSummary))
    expect(state.summary).toEqual(newSummary)
    expect(state.summary?.current_month_total).toBe(2000)
  })
})
