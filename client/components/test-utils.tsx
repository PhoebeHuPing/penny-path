import React from 'react'
import { render } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import appReducer from '../modules/appSlice'
import authReducer from '../modules/authSlice'
import categoryReducer from '../modules/categorySlice'
import expenseReducer from '../modules/expenseSlice'
import incomeReducer from '../modules/incomeSlice'
import budgetReducer from '../modules/budgetSlice'
import dashboardReducer from '../modules/dashboardSlice'
import userSettingsReducer from '../modules/userSettingsSlice'
import type { RootState } from '../store'

export function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      app: appReducer,
      auth: authReducer,
      category: categoryReducer,
      expenses: expenseReducer,
      income: incomeReducer,
      budget: budgetReducer,
      dashboard: dashboardReducer,
      userSettings: userSettingsReducer,
    },
    preloadedState: preloadedState as RootState,
  })
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    initialEntries = ['/'],
    ...renderOptions
  }: {
    preloadedState?: Partial<RootState>
    store?: ReturnType<typeof createTestStore>
    initialEntries?: string[]
  } & Omit<Parameters<typeof render>[1], 'wrapper'> = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </Provider>
    )
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
