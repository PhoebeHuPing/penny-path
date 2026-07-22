import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import api from '../api'
import { triggerToast } from './appSlice'
import type { AppDispatch } from '../store'

export interface User {
  id: number
  email: string
  username: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

function getStoredToken(): string | null {
  try {
    return localStorage.getItem('token')
  } catch {
    return null
  }
}

const initialState: AuthState = {
  user: null,
  token: getStoredToken(),
  loading: false,
  error: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem('token')
    },
  },
})

export const { setCredentials, setUser, setLoading, setError, logout } =
  authSlice.actions

// --- Async actions ---

export const registerUser =
  (email: string, username: string, password: string) =>
  async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      const res = await api.post('/api/auth/register', {
        email,
        username,
        password,
      })
      const { token, user } = res.data
      localStorage.setItem('token', token)
      dispatch(setCredentials({ user, token }))
      dispatch(triggerToast('Account created successfully!', 'success'))
      return true
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>
      const msg =
        axiosError.response?.data?.detail || 'Registration failed'
      dispatch(setError(msg))
      dispatch(triggerToast(msg, 'error'))
      return false
    } finally {
      dispatch(setLoading(false))
    }
  }

export const loginUser =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      const res = await api.post('/api/auth/login', { email, password })
      const { token, user } = res.data
      localStorage.setItem('token', token)
      dispatch(setCredentials({ user, token }))
      return true
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>
      const msg =
        axiosError.response?.data?.detail || 'Login failed'
      dispatch(setError(msg))
      dispatch(triggerToast(msg, 'error'))
      return false
    } finally {
      dispatch(setLoading(false))
    }
  }

export const fetchCurrentUser = () => async (dispatch: AppDispatch) => {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const res = await api.get('/api/auth/me')
    dispatch(setUser(res.data))
  } catch {
    // Token invalid, clear it
    dispatch(logout())
  }
}

export const logoutUser = () => (dispatch: AppDispatch) => {
  dispatch(logout())
  dispatch(triggerToast('Logged out', 'info'))
}

export default authSlice.reducer
