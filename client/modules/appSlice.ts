import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ToastInfo {
  message: string
  type: 'success' | 'error' | 'info'
}

interface AppState {
  initialized: boolean
  toast: ToastInfo | null
}

const initialState: AppState = {
  initialized: false,
  toast: null,
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload
    },
    setToast: (state, action: PayloadAction<ToastInfo | null>) => {
      state.toast = action.payload
    },
  },
})

export const { setInitialized, setToast } = appSlice.actions

export const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => (dispatch: any) => {
  dispatch(setToast({ message, type }))
  setTimeout(() => {
    dispatch(setToast(null))
  }, 3000)
}

export default appSlice.reducer
